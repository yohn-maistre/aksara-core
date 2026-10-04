import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { createModels } from '@earendil-works/pi-ai/models';
import { createRegistry, defineExtension, defineTask, Harness } from '@earendil-works/pi-durable';
import { openNodeSqliteDatabase } from '@earendil-works/pi-durable/storage/sqlite/node';
import { SqliteStorage } from '@earendil-works/pi-durable/storage/sqlite';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const context = BACKGROUND_CONTEXT;

export class KernelClient {
  constructor({ url = 'http://127.0.0.1:7341', token, lane }) {
    const u = new URL(url);
    if (u.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(u.hostname) || u.username || u.password || u.pathname !== '/') throw Error('Development runtime requires a loopback kernel origin');
    if (!token || !lane) throw Error('Individual token and lane are required');
    this.url = u.origin; this.token = token; this.lane = lane;
  }
  async call(operation, input, query = {}) {
    const r = await fetch(`${this.url}/api/${operation}?${new URLSearchParams(query)}`, {
      method: input === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'X-Aksara-Lane': this.lane, 'X-Aksara-Purpose': 'knowledge', 'Content-Type': 'application/json' },
      body: input === undefined ? undefined : JSON.stringify(input), redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    const data = await r.json(); if (!r.ok) throw Error(`${r.status}: ${data.error}`); return data;
  }
}

/** ResidentRuntimePort. Pi owns task checkpoints; the kernel owns all work/effects.
 * The offline task performs retrieval and prepares a candidate, never approval.
 * No built-in Pi shell, filesystem, memory or network tools are installed.
 */
export class PiResidentRuntime {
  static async open({ path, client, onCheckpoint = () => {} }) {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const actor = await client.call('me');
    if (!actor.id || !actor.institution_id || !client.lane) throw Error('Runtime requires an identified actor and lane');
    const scope = createHash('sha256').update(JSON.stringify([actor.institution_id, actor.id, client.lane, 'knowledge'])).digest('hex');
    const database = await openNodeSqliteDatabase(path);
    let storage;
    try {
      // Upstream defaults to NORMAL; institutional development uses FULL.
      await database.exec('PRAGMA synchronous = FULL');
      await database.exec('CREATE TABLE IF NOT EXISTS aksara_runtime_scope(id INTEGER PRIMARY KEY CHECK(id=1), scope TEXT NOT NULL)');
      await database.transaction(async tx => {
        const old = await tx.get('SELECT scope FROM aksara_runtime_scope WHERE id=1');
        if (old && old.scope !== scope) throw Error('Runtime storage belongs to a different actor or lane');
        if (!old) await tx.run('INSERT INTO aksara_runtime_scope VALUES(1,?)', scope);
      });
      storage = await SqliteStorage.open(database);
    } catch (error) { await database.close(); throw error; }
    const Lookup = defineTask({
      name: 'aksara.library-task', version: 1,
      initial: () => ({ phase: 'lookup' }),
      phases: {
        lookup: async (task, runtime, ctx) => {
          const work = await client.call('thread', undefined, { id: task.input.work_id });
          if (work.revision !== task.input.revision || work.generation !== task.input.generation || ['CANCELLED','COMPLETED','FAILED'].includes(work.state)) throw Error('Kernel work is fenced or terminal');
          await client.call('runtime-attach', { id:work.id,revision:work.revision,generation:work.generation,runtime_ref:`pi:${task.id}` });
          const hits = await client.call('search', undefined, {query:work.request,limit:5});
          await runtime.commit(() => ({status:'running',checkpoint:{phase:'prepare',work,hits}}),ctx);
          await onCheckpoint('after_lookup', task);
        },
        prepare: async (task, runtime, ctx) => {
          const { work, hits } = task.state.checkpoint;
          // Recheck authoritative work before using durable cached context.
          const current = await client.call('thread',undefined,{id:work.id});
          if(current.revision!==work.revision || current.generation!==work.generation) throw Error('Kernel work was revised or cancelled');
          const proposal = await client.call('prepare', {
            work_id:work.id,revision:work.revision,generation:work.generation,
            idempotency_key:`runtime:artifact:${work.id}:${work.revision}:${work.generation}`,capability:'artifact.create',
            args:{title:[...work.request.trim()].slice(0,64).join(''),content:hits.length ? hits.map(h=>`[${h.block_id}] ${h.text}`).join('\n\n') : 'No authorized matching sources were found. Further input is required.',visibility:work.audience.length===1 ? 'private':'institution',source_ids:[...new Set(hits.map(h=>h.artifact_id))]},
          });
          await onCheckpoint('after_prepare',task);
          await runtime.commit(() => ({status:'terminal',outcome:{status:'completed',result:{proposal_id:proposal.id,work_id:work.id,status:'AWAITING_APPROVAL'}}}),ctx);
        },
      },
      abort: async (_task, runtime, ctx) => {
        await runtime.commit(() => ({status:'terminal',outcome:{status:'aborted'}}),ctx);
      },
    });
    const registry = createRegistry(); registry.install(defineExtension({name:'aksara',tasks:[Lookup]}));
    const harness = await Harness.open(storage, {models:createModels(),registry},context);
    const root = await harness.root(context, {agent:{tools:[],extensions:[]}});
    return new PiResidentRuntime({harness,root,Lookup,client});
  }
  constructor(options) { Object.assign(this,options); }
  async submit(envelope) {
    const work = await this.client.call('thread',undefined,{id:envelope.work_id});
    if(work.revision!==envelope.revision || work.generation!==envelope.generation) throw Error('Stale delegation envelope');
    return this.root.commit(async tx => {
      const { items } = await tx.scanTasks({conversationId:this.root.id,kind:'aksara.library-task'},1000);
      const existing = items.find(t=>t.input.work_id===envelope.work_id && t.input.revision===envelope.revision && t.input.generation===envelope.generation);
      if(existing) return existing.id;
      if(items.length>=1000) throw Error('Runtime task ceiling; rotate this development storage');
      return tx.createTask(this.Lookup,envelope,{ownership:{kind:'conversation'}});
    },context);
  }
  async wait(id) { return this.harness.waitForTask(id,context); }
  async watch() { return this.root.watch(context); }
  async inspect() { return this.harness.inspect(context); }
  async steer(workId,revision,request) {
    const work = await this.client.call('steer',{id:workId,revision,request});
    return this.submit({work_id:work.id,revision:work.revision,generation:work.generation});
  }
  async cancel(workId,taskId) {
    await this.client.call('cancel',{id:workId}); // durable institutional fence comes first
    if(taskId) await this.harness.abortTask(taskId,context);
  }
  async fork() { throw Error('Institutional fork mapping is not implemented; use a new delegated WorkObject'); }
  async spawn() { throw Error('ChildRun authority/budget mapping is not implemented'); }
  async configure() { throw Error('Model execution and egress policy are not configured in the offline profile'); }
  resume() { this.harness.resume(); }
  async close() { await this.harness.close(context); }
}

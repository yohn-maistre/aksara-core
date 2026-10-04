import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { KernelClient, PiResidentRuntime } from './adapter.mjs';

class AuthorityFixture {
  constructor() { this.lane='lane-1'; this.actor={id:'person-1',institution_id:'institution-1'}; this.work = {id:'work-1',revision:1,generation:1,state:'HEARD',request:'water',audience:['person-1','person-2']}; this.effects=new Map(); this.calls=[]; }
  async call(op,input) {
    this.calls.push(op);
    if(op==='me') return this.actor;
    if(op==='thread') return structuredClone(this.work);
    if(op==='runtime-attach') { this.work.runtime_ref=input.runtime_ref; return structuredClone(this.work); }
    if(op==='search') return [{artifact_id:'source-1',block_id:'block-1',text:'Water continuity evidence'}];
    if(op==='prepare') {
      assert.equal(input.revision,this.work.revision); assert.equal(input.generation,this.work.generation);
      assert.deepEqual(input.args.source_ids,['source-1']);
      assert.equal(input.capability,'artifact.create');
      assert.ok(Buffer.byteLength(input.args.title,'utf8') <= 256, 'kernel title byte ceiling');
      if(!this.effects.has(input.idempotency_key)) this.effects.set(input.idempotency_key,{id:'effect-1',status:'PREPARED'});
      return this.effects.get(input.idempotency_key);
    }
    if(op==='cancel') {this.work.state='CANCELLED';this.work.generation++;return this.work;}
    throw Error(`unexpected operation ${op}`);
  }
}

test('real Pi durable task survives reopen and deduplicates institutional work', async () => {
  const dir=await mkdtemp(join(tmpdir(),'aksara-pi-'));const client=new AuthorityFixture();let runtime;
  client.work.request='   '+ '🫶🏽'.repeat(100) + ' water';
  try {
    const path=join(dir,'pi.sqlite');runtime=await PiResidentRuntime.open({path,client});
    const envelope={work_id:'work-1',revision:1,generation:1};const id=await runtime.submit(envelope);
    const result=await runtime.wait(id);
    assert.equal(result.state.outcome.status,'completed');
    assert.equal(result.state.outcome.result.status,'AWAITING_APPROVAL');
    assert.equal(client.effects.size,1);
    assert.equal(client.calls.includes('approve'),false);
    assert.equal(client.calls.includes('execute'),false);
    await runtime.close();runtime=await PiResidentRuntime.open({path,client});
    assert.equal(await runtime.submit(envelope),id);
    assert.equal((await runtime.wait(id)).state.outcome.status,'completed');
    assert.equal(client.effects.size,1);
    await runtime.close();runtime=null;
    client.actor={id:'person-2',institution_id:'institution-1'};
    await assert.rejects(PiResidentRuntime.open({path,client}),/different actor or lane/);
  } finally {if(runtime) await runtime.close();await rm(dir,{recursive:true,force:true});}
});

test('runtime rejects stale work, and unsupported authority mappings fail explicitly', async () => {
  const dir=await mkdtemp(join(tmpdir(),'aksara-pi-'));const client=new AuthorityFixture();let runtime;
  try {
    runtime=await PiResidentRuntime.open({path:join(dir,'pi.sqlite'),client});
    await assert.rejects(runtime.submit({work_id:'work-1',revision:0,generation:1}),/Stale/);
    await assert.rejects(runtime.fork(),/not implemented/);
    await assert.rejects(runtime.spawn(),/not implemented/);
    await assert.rejects(runtime.configure(),/not configured/);
    await runtime.cancel('work-1');
    assert.equal(client.work.state,'CANCELLED');assert.equal(client.work.generation,2);
  } finally {if(runtime) await runtime.close();await rm(dir,{recursive:true,force:true});}
});

test('runtime network origin cannot carry remote or ambient authority', () => {
  for(const url of ['https://example.com','http://example.com','http://admin@127.0.0.1','http://127.0.0.1/other']) {
    assert.throws(()=>new KernelClient({url,token:'one-person',lane:'one-lane'}),/loopback/);
  }
});

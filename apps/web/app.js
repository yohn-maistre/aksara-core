const $ = id => document.getElementById(id);
let accessToken = '', actor = null, lane = '', deviceState = null, scopeEpoch = 0;
async function api(op, input, query = {}) {
  const epoch = scopeEpoch;
  const response = await fetch(`/api/${op}?${new URLSearchParams(query)}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'X-Aksara-Lane': lane, 'X-Aksara-Purpose': 'knowledge', 'Content-Type': 'application/json' },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
  const data = await response.json();
  if (epoch !== scopeEpoch) throw Error('Audience changed; refresh this view.');
  if (!response.ok) throw Error(data.error || `Request failed (${response.status})`); return data;
}
function node(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function button(text, action, cls) { const b = node('button', text, cls); b.onclick = () => run(action); return b; }
async function run(action) { try { $('status').textContent = ''; await action(); } catch (e) { $('status').textContent = e.message; } }
function say(text) { $('status').textContent = text; }
function clearDrafts() { for(const id of ['title','content','query','request']) $(id).value=''; deviceState=null; }
$('connect').onclick = () => run(async () => {
  scopeEpoch++; lane = ''; accessToken = $('token').value.trim(); actor = await api('me'); const lanes = await api('lanes');
  $('lane').replaceChildren(...lanes.map(l => { const o = node('option', `${l.audience.length === 1 ? 'Private' : 'Shared'} · ${l.id.slice(-8)}`); o.value = l.id; return o; }));
  lane = $('lane').value; $('who').textContent = `${actor.name} · ${actor.role}`; $('token').value = ''; $('login').hidden = true; $('workspace').hidden = false; await refreshThreads();
});
$('logout').onclick = () => { scopeEpoch++; accessToken = ''; actor = null; lane = ''; clearDrafts(); $('workspace').hidden = true; $('login').hidden = false; for (const id of ['thread-list','search-results','ingest-result','memory-list','device-list','activity-list']) $(id).replaceChildren(); };
$('lane').onchange = () => run(async () => { scopeEpoch++; lane = $('lane').value; clearDrafts(); for (const id of ['thread-list','search-results','ingest-result','memory-list','device-list','activity-list']) $(id).replaceChildren(); await refreshThreads(); });
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => run(async () => { for (const id of ['threads','library','memory','hardware','activity']) $(id).hidden = id !== b.dataset.tab; if (b.dataset.tab === 'hardware') await refreshDevices(); if (b.dataset.tab === 'memory') await refreshMemory(); }));
$('delegate').onclick = () => run(async () => { await api('delegate', { request: $('request').value, idempotency_key: crypto.randomUUID() }); $('request').value = ''; await refreshThreads(); });
$('refresh').onclick = () => run(refreshThreads);
async function refreshThreads() {
  const works = await api('threads'); $('thread-list').replaceChildren();
  for (const w of works) {
    const card = node('div', undefined, 'card'); card.append(node('span', w.state, 'pill'), node('h3', w.request), node('p', w.display_safe_summary), node('small', w.id));
    if (w.owner === actor.id && !['COMPLETED','CANCELLED','FAILED'].includes(w.state)) {
      card.append(button('Prepare cited artifact', async () => {
        const hits = await api('search', undefined, { query: w.request, limit: 5 });
        const content = hits.length ? hits.map(h => `[${h.block_id}] ${h.text}`).join('\n\n') : 'No authorized matching sources were found. This is a candidate result for review.';
        await api('prepare', { work_id: w.id, revision: w.revision, generation: w.generation, idempotency_key: `artifact:${w.revision}`, capability: 'artifact.create', args: { title: [...w.request.trim()].slice(0,64).join(''), content, visibility: $('lane').selectedOptions[0].textContent.startsWith('Private') ? 'private' : 'institution', source_ids: [...new Set(hits.map(h => h.artifact_id))] } }); await refreshThreads();
      }));
      card.append(button('Cancel', async () => { await api('cancel', {id:w.id}); await refreshThreads(); }, 'danger'));
    }
    const effects = await api('effects', undefined, {work_id:w.id});
    for (const e of effects) {
      const p = e.prepared; card.append(node('p', `${p.capability} · ${p.status}`), node('pre', JSON.stringify(e.args, null, 2)));
      if (p.status === 'PREPARED' && actor.role === 'operator') card.append(button('Approve exact proposal', async () => { await api('approve', {id:p.id,args_hash:p.args_hash}); await refreshThreads(); }));
      if (p.status === 'AUTHORIZED' && w.owner === actor.id) card.append(button('Execute approved effect', async () => {
        const current = await api('prepare', { work_id:w.id,revision:w.revision,generation:w.generation,idempotency_key:e.idempotency_key,capability:p.capability,args:e.args });
        await api(p.capability === 'artifact.create' ? 'execute' : 'device-execute', {id:p.id,lease:current.lease}); await refreshThreads();
      }));
      if (['INTENT_COMMITTED','OUTCOME_UNKNOWN'].includes(p.status)) card.append(button('Reconcile device receipt', async () => { await api('device-reconcile',{id:p.id,work_id:w.id}); await refreshThreads(); }));
      if (e.receipt) card.append(node('pre',JSON.stringify(e.receipt,null,2)));
    }
    $('thread-list').append(card);
  }
  if (!works.length) $('thread-list').append(node('p','No work in this lane yet.','muted'));
}
$('ingest').onclick = () => run(async () => { const a = await api('ingest',{title:$('title').value,content:$('content').value,visibility:$('visibility').value,purpose:'knowledge',provenance:'local web upload'}); $('ingest-result').replaceChildren(node('pre',JSON.stringify(a,null,2))); say('Original source preserved.'); });
$('search').onclick = () => run(async () => {
  const hits = await api('search', undefined, {query:$('query').value,limit:10}); $('search-results').replaceChildren();
  for (const h of hits) { const c = node('div',undefined,'card'); c.append(node('h3',h.title),node('p',h.text,'source'),node('small',h.block_id));
    c.append(button('Propose memory excerpt',async () => { const m = await api('memory-candidate',{text:h.text,source_artifact_id:h.artifact_id,visibility:$('lane').selectedOptions[0].textContent.startsWith('Private') ? 'private' : 'institution',purpose:'knowledge',kind:'procedural',evidence_kind:'source_fact',retention_seconds:86400*30}); say(`Memory candidate created for review: ${m.id}`); })); $('search-results').append(c); }
  if(!hits.length) $('search-results').append(node('p','No authorized matching sources.','muted'));
});
async function refreshMemory() {
  const rows = await api('memories'); const pending = await api('memory-candidates');
  $('memory-list').replaceChildren(...[...pending,...rows].map(m => {
    const c=node('div',undefined,'card'); c.append(node('p',m.text),node('small',`${m.state} · source ${m.source_artifact_id}`));
    if(m.state==='CANDIDATE' && actor.role==='operator') c.append(button('Approve cited memory',async()=>{await api('memory-approve',{id:m.id});await refreshMemory();}));
    return c;
  }));
}
$('memory-refresh').onclick = () => run(refreshMemory);
async function refreshDevices() {
  deviceState = await api('simulator-status'); $('device-list').replaceChildren();
  for(const [name,s] of Object.entries(deviceState.devices)) { const c=node('div',undefined,`card device ${name==='information'?'information':''}`); c.append(node('h3',name),node('span',s.state,'pill'),node('p',`Privacy ${deviceState.privacy ? 'ON':'OFF'} · Stop ${deviceState.stopped ? 'ON':'OFF'}`),node('p',`Linux ${deviceState.linux_connected ? 'connected':'offline'} · WAN ${deviceState.wan ? 'online':'offline'}`)); $('device-list').append(c); }
}
$('hardware-refresh').onclick = () => run(refreshDevices);
document.querySelectorAll('[data-physical]').forEach(b => b.onclick = () => run(async () => { await api('simulator-input',{event:b.dataset.physical}); await refreshDevices(); }));
$('device-propose').onclick = () => run(async () => { const s=await api('simulator-status');const w = await api('delegate',{request:'Indicate working on Presence Surface',idempotency_key:crypto.randomUUID()}); await api('prepare',{work_id:w.id,revision:w.revision,generation:w.generation,idempotency_key:`device:${w.revision}`,capability:'device.indicate',args:{device:'presence',state:'working',controller_generation:s.generation}}); say('Device proposal ready in Threads.'); await refreshThreads(); });
$('activity-refresh').onclick = () => run(async () => { const rows=await api('events',undefined,{after:0,limit:100}); $('activity-list').replaceChildren(...rows.map(v=>node('p',`${v.seq} · ${v.event.kind} · ${v.event.object_id}`))); });

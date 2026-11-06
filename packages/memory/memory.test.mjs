import {test} from "node:test";
import assert from "node:assert/strict";
import {createMemoryService,MEMORY_ENGINE} from "./index.mjs";
const view=()=>({protocol:"aksara.memory/1",scope:{institution_id:"community",principal_id:"person",lane_id:"room",purpose:"knowledge",policy_epoch:1},reviewed:[{id:"memory_1",source_artifact_id:"source_1",state:"APPROVED",text:"The community meeting is at the village hall on Friday."}],drafts:[{kind:"procedure",artifact:{id:"procedure_1",title:"Procedure draft: Prepare a meeting"},excerpt:"First confirm the venue, then send invitations.",review:"unreviewed working material"}]});
test("actual LongMemory ranks cited authorized originals and keeps procedures provisional",async()=>{
 let reads=0;const service=createMemoryService({load:async()=>{reads++;return view();}});
 try{
  const r=await service.recall({query:"community meeting venue",limit:2});
  assert.equal(r.engine.id,"longmemory");assert.equal(r.engine.external_inference,false);
  assert.equal(r.indexed_records,2);assert.ok(r.results.some(x=>x.source_id==="source_1"));
  assert.ok(r.results.every(x=>["source_1","procedure_1"].includes(x.source_id)));
  assert.equal(reads,2);assert.equal(r.public_release_enabled,false);
  const overview=await service.recall();assert.equal(overview.results.find(x=>x.kind==="procedure").review,"unreviewed working material");
 }finally{await service.close();}
});
test("withdrawal, audience changes and errors fence results before disclosure",async()=>{
 for(const change of [v=>{v.reviewed=[];return v;},v=>{v.scope.policy_epoch++;return v;},()=>{throw Error("HIDDEN_SOURCE_SENTINEL");}]){
  let n=0;const service=createMemoryService({load:async()=>++n===1?view():change(view())});
  try{await assert.rejects(service.recall({query:"meeting"}),e=>e.message==="Memory unavailable in this context");}finally{await service.close();}
 }
});
test("different principals and fresh requests never share a donor corpus; invalid modes fail closed",async()=>{
 let current=view();const service=createMemoryService({load:async()=>structuredClone(current)});
 await service.recall({query:"meeting"});current={...view(),scope:{...view().scope,principal_id:"other-person"},reviewed:[],drafts:[]};
 const r=await service.recall({query:"meeting"});assert.deepEqual(r.results,[]);assert.equal(r.indexed_records,0);
 await assert.rejects(service.recall({mode:"admin"}));await assert.rejects(service.recall({query:"x".repeat(1001)}));
 await service.close();await assert.rejects(service.recall());assert.equal(MEMORY_ENGINE.persistence,"canonical-rust-sqlite");
});

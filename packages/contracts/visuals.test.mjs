import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VisualSpec,parseVisual} from './visuals.mjs';
import {residentTools} from '../runtime-mastra/tools.mjs';
test('visual contracts reject code, links, invalid references and unbounded data',()=>{
 const spec={protocol:'aksara.visual/1',kind:'diagram',nodes:[{id:'a',label:'Clinic',x:0,y:0}],edges:[]};
 assert.equal(VisualSpec.parse(spec).nodes[0].shape,'rectangle');
 assert.equal(parseVisual(JSON.stringify({...spec,script:'alert(1)'})),null);
 assert.equal(parseVisual(JSON.stringify({...spec,edges:[{from:'a',to:'missing'}]})),null);
 assert.equal(parseVisual(JSON.stringify({protocol:'aksara.visual/1',kind:'bar-chart',data:[{label:'A',value:-1}]})),null);
});
test('agent visuals use the existing artifact and lineage port under current-authority checks',async()=>{
 let checks=0,saved;
 const tools=residentTools({assertCurrent:async()=>checks++,document:async input=>(saved=input,{id:'artifact_1'})});
 const input={title:'Water deliveries',visual:{protocol:'aksara.visual/1',kind:'bar-chart',unit:'visits',data:[{label:'Monday',value:4}]}};
 const result=await tools.save_visual.execute(input,{});
 assert.equal(result.id,'artifact_1');assert.equal(checks,2);assert.deepEqual(parseVisual(saved.content),input.visual);
});

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const fixture=JSON.parse(await readFile(process.argv[2],'utf8'));
const browser=await chromium.launch({headless:true});
const checks=[];
function check(name,condition=true){assert.ok(condition,name);checks.push(name);console.log(`PASS ${name}`);}
const pages=[];
async function login(person){
  const ctx=await browser.newContext({viewport:{width:360,height:800}});const page=await ctx.newPage();pages.push(page);
  await page.goto(fixture.url);await page.locator('#token').fill(fixture.dev.people[person].token);
  await page.getByRole('button',{name:'Connect',exact:true}).click();await page.locator('#workspace').waitFor({state:'visible'});
  await page.locator('#lane').selectOption(fixture.dev.lanes[0].lane.id);return page;
}
async function tab(page,name){await page.getByRole('button',{name,exact:true}).click();}
async function ingest(page,title,content,visibility){
  await page.locator('#title').fill(title);await page.locator('#content').fill(content);await page.locator('#visibility').selectOption(visibility);
  const response=page.waitForResponse(r=>r.url().includes('/api/ingest') && r.request().method()==='POST');
  await page.getByRole('button',{name:'Preserve source'}).click();assert.equal((await response).status(),200);
  await page.waitForFunction(()=>document.querySelector('#status').textContent==='Original source preserved.');
}
async function delegate(page,request){
  await tab(page,'Threads');await page.locator('#request').fill(request);
  const response=page.waitForResponse(r=>r.url().includes('/api/delegate') && r.request().method()==='POST');
  await page.getByRole('button',{name:'Delegate',exact:true}).click();return (await response).json();
}
function card(page,id){return page.locator('#thread-list > .card').filter({hasText:id});}
async function refresh(page){await page.locator('#refresh').click();}
async function effectState(page,work,status){
  await page.waitForFunction(([id,status])=>[...document.querySelectorAll('#thread-list > .card')].some(c=>c.textContent.includes(id)&&c.textContent.includes(status)),[work.id,status]);
}
try{
  const maria=await login(1);const operator=await login(0);
  await maria.locator('#lane').selectOption(fixture.dev.lanes[2].lane.id);await tab(maria,'Library');
  await ingest(maria,'Private record','PRIVATESEED patient record water continuity','private');
  // Deliver a private response after a lane change and prove the browser drops it.
  let release;let fetched;const pending=new Promise(resolve=>{fetched=resolve;});const gate=new Promise(resolve=>{release=resolve;});
  await maria.route('**/api/search?*',async route=>{const response=await route.fetch();fetched();await gate;await route.fulfill({response});});
  await maria.locator('#query').fill('PRIVATESEED');await maria.getByRole('button',{name:'Search',exact:true}).click();await pending;
  await maria.locator('#lane').selectOption(fixture.dev.lanes[0].lane.id);release();
  await maria.waitForFunction(()=>document.querySelector('#status').textContent.includes('Audience changed'));
  check('late private response is discarded after a lane change',!(await maria.locator('#search-results').textContent()).includes('PRIVATESEED'));
  check('lane changes clear private source drafts',await maria.locator('#content').inputValue()==='');
  await maria.unroute('**/api/search?*');
  await ingest(maria,'Water continuity','water continuity reviewed operational plan','institution');
  const work=await delegate(maria,'water continuity');
  await card(maria,work.id).getByRole('button',{name:'Prepare cited artifact'}).click();await effectState(maria,work,'PREPARED');
  await refresh(operator);await card(operator,work.id).getByRole('button',{name:'Approve exact proposal'}).click();await effectState(operator,work,'AUTHORIZED');
  await refresh(maria);await card(maria,work.id).getByRole('button',{name:'Execute approved effect'}).click();await effectState(maria,work,'COMPLETED');
  check('browser initiator/Operator approval produces a verified artifact receipt',(await card(maria,work.id).textContent()).includes('VERIFIED'));
  await tab(maria,'Library');await maria.locator('#query').fill('water');await maria.getByRole('button',{name:'Search',exact:true}).click();
  await maria.locator('#search-results .card').first().getByRole('button',{name:'Propose memory excerpt'}).click();
  await tab(maria,'Memory');await maria.getByText('CANDIDATE · source',{exact:false}).waitFor();
  await tab(operator,'Memory');await operator.getByRole('button',{name:'Approve cited memory'}).click();await operator.getByText('APPROVED · source',{exact:false}).waitFor();
  await maria.getByRole('button',{name:'Refresh memory'}).click();await maria.getByText('APPROVED · source',{exact:false}).waitFor();
  check('memory candidate remains separate until explicit Operator review');
  await tab(operator,'Devices');await operator.getByRole('button',{name:'Physical stop',exact:true}).click();await operator.getByRole('button',{name:'Release stop',exact:true}).click();
  await tab(maria,'Devices');await maria.getByRole('button',{name:'Propose Presence: working'}).click();
  await tab(operator,'Threads');await refresh(operator);await operator.getByRole('button',{name:'Approve exact proposal'}).click();
  await tab(maria,'Threads');await refresh(maria);await maria.getByRole('button',{name:'Execute approved effect'}).click();
  await tab(maria,'Devices');await maria.locator('#hardware-refresh').click();
  await maria.waitForFunction(()=>[...document.querySelectorAll('#device-list .card')].some(c=>c.textContent.includes('presence')&&c.textContent.includes('working')));
  check('approved semantic device command appears in the independent simulator');
  const piWork=await delegate(maria,'water continuity Pi checkpoint');
  const worker=spawnSync('node',['packages/runtime-pi/worker.mjs',piWork.id],{cwd:fixture.root,env:{...process.env,AKSARA_URL:fixture.url,AKSARA_TOKEN:fixture.dev.people[1].token,AKSARA_LANE:fixture.dev.lanes[0].lane.id,AKSARA_RUNTIME_DB:join(fixture.directory,'browser-pi.sqlite')},timeout:30000,encoding:'utf8'});
  assert.equal(worker.status,0,worker.stderr);
  await refresh(operator);await card(operator,piWork.id).getByRole('button',{name:'Approve exact proposal'}).click();await effectState(operator,piWork,'AUTHORIZED');
  await refresh(maria);await card(maria,piWork.id).getByRole('button',{name:'Execute approved effect'}).click();await effectState(maria,piWork,'COMPLETED');
  check('Pi-created proposal executes through the same web approval path');
  check('phone viewport has no horizontal document overflow',await maria.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await maria.locator('#logout').click();
  check('disconnect clears credentials and scoped data from visible UI',await maria.locator('#token').inputValue()==='' && await maria.locator('#thread-list').textContent()==='');
  console.log(JSON.stringify({browser_checks_passed:checks.length,checks}));
}finally{await browser.close();}

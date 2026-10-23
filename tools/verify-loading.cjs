const path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'..'),path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const url=process.env.GAME_URL||'http://127.0.0.1:8098/';
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const results=[];
 for(const scenario of ['transient-image','transient-json','permanent-image','stalled-json','script-failure']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[];let requests=0,blocked=true;
  page.on('pageerror',e=>errors.push(e.message));
  // Accelerate only the loader timeout in the stalled-request scenario, preserving game clocks.
  if(scenario==='stalled-json')await context.addInitScript(()=>{const native=setTimeout;window.setTimeout=(fn,ms,...args)=>native(fn,ms===45000?1200:ms,...args);});
  const resource=scenario.includes('json')?'ryu/animations.json':scenario==='script-failure'?'ryu.js':'actors.png';
  await page.route('**/'+resource+'*',async route=>{
   requests++;
   if(!blocked)return route.continue();
   if(scenario.startsWith('transient')&&requests>1)return route.continue();
   if(scenario==='stalled-json')return; // No response: the loader must abort and finish with an error.
   return route.abort();
  });
  await page.goto(url,{waitUntil:'domcontentloaded'});
  if(scenario.startsWith('transient')){
   await page.waitForFunction(()=>typeof ready!=='undefined'&&ready,{timeout:60000});assert.equal(requests,2);
   assert.equal(await page.locator('#start').isEnabled(),true);
   assert.equal(await page.locator('#load-retry').isVisible(),false);
   assert.deepEqual(errors,[]);
  }else{
   await page.locator('#load-retry').waitFor({state:'visible',timeout:30000});
   assert.equal(await page.locator('#start').isEnabled(),false);
   assert.match(await page.locator('#load').innerText(),/失敗/);
   if(scenario!=='script-failure'){assert.equal(requests,3);assert.deepEqual(errors,[]);}
   await page.evaluate(()=>localStorage.setItem('loading-test-save','preserved'));
   blocked=false;await page.locator('#load-retry').click();await page.waitForFunction(()=>typeof ready!=='undefined'&&ready,{timeout:60000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('loading-test-save')),'preserved');
  }
  results.push({scenario,passed:true});await context.close();
 }
 console.log(JSON.stringify(results));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

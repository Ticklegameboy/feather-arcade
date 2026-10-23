'use strict';
// Collection and prison scenes share the existing binding sprites/contact logic.
// Battle objects and clocks remain in place and are never advanced here.
const Dungeon=(()=>{
 const storageKey='feather-arcade.dungeon.v1';
 const isVisible=record=>typeof EnemyRoster==='undefined'?record.kind==='ryu':EnemyRoster.isEnabled(record.kind);
 const visibleRecords=()=>records.filter(isVisible);
 let records=[],selected=null,prisoner=null,time=0,returnPaused=false,particles=[],captions=[],guideSeen=false;
 const gallery=$('#dungeon-gallery'),track=$('#dungeon-cells'),viewport=$('#dungeon-viewport');
 let drag=null,suppressClick=false,portraits=[];
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
  guideSeen=saved?.guideSeen===true||(saved?.guideSeen===undefined&&saved?.enemies?.length>0);
  if(saved?.version===1&&Array.isArray(saved.enemies))records=saved.enemies.filter(r=>r&&typeof r.id==='string'&&(r.kind==='ryu'||(typeof EnemyRoster!=='undefined'&&EnemyRoster.get(r.kind)))).map(r=>({id:r.id,kind:r.kind,shirtless:r.kind==='ryu'&&r.shirtless===true,bindVariant:[0,1,2].includes(r.bindVariant)?r.bindVariant:0,mummyUnhelmet:r.kind==='red-ranger'&&r.mummyUnhelmet===true,mummyFootwear:['boots','socks','bare'].includes(r.mummyFootwear)?r.mummyFootwear:'boots'}));
 }catch{}
 // One collection entry per character; retain the first existing Ryu/outfit.
 const unique=new Set();records=records.filter(r=>!unique.has(r.kind)&&unique.add(r.kind));save();
 function save(){try{localStorage.setItem(storageKey,JSON.stringify({version:1,enemies:records,guideSeen}));}catch{}}
 function acknowledgeTutorial(){guideSeen=true;save();}
 function resetProgress(){records=[];selected=prisoner=null;particles=[];captions=[];portraits=[];time=0;guideSeen=false;save();}
 function capture(e){
  if(e.dungeonRecorded||e.captive||!isVisible(e))return;
  e.dungeonRecorded=true;
  if(records.some(r=>r.kind===(e.kind||'ryu')))return;
  records.push({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,kind:e.kind||'ryu',shirtless:!newEnemy(e)&&!!e.shirtless,bindVariant:0,mummyUnhelmet:e.kind==='red-ranger'&&e.mummyUnhelmet===true,mummyFootwear:e.mummyFootwear||'boots'});
  save();floatText(tr('已收錄地牢'),e.x,207,'#f2d59e');syncUI();
 }
 function savePrisoner(){if(gameMode!=='prison'||!prisoner||!selected)return;selected.shirtless=prisoner.shirtless;selected.bindVariant=0;selected.mummyFootwear=prisoner.mummyFootwear||'boots';selected.mummyUnhelmet=prisoner.kind==='red-ranger'&&prisoner.mummyUnhelmet===true;save();}
 function clearInput(){keys.clear();mouseFeather.inside=false;mouseFeather.hover=false;mouseFeather.angle=mouseFeather.lift=0;for(const e of enemies)setFeatherContact(e,false,true);if(prisoner)setFeatherContact(prisoner,false,true);RyuAudio.stopAll();}
 function syncUI(){
  const battle=gameMode==='battle';
  $('.screen').classList.toggle('dungeon-mode',!battle);
  document.querySelectorAll('.controls,.touch,.ticker,footer').forEach(el=>el.hidden=!battle);
  $('#dungeon-open').hidden=!ready||!battle||!running;
  $('#dungeon-open').textContent=tr('地牢')+(visibleRecords().length?` · ${visibleRecords().length}`:'');
  $('#dungeon-back').hidden=battle;$('#dungeon-back').textContent=tr(gameMode==='prison'?'返回地牢':'返回戰鬥');
  gallery.hidden=gameMode!=='collection';
  $('#prison-controls').hidden=gameMode!=='prison';
  $('#prison-break').hidden=gameMode!=='prison';
  if(gameMode==='collection')syncScroll();
  $('#overlay').hidden=!battle||running;
  $('#paused').hidden=!paused||(gameMode!=='battle'&&gameMode!=='prison');
  $('#pause').hidden=gameMode==='collection';
  $('#restart').hidden=!battle;
  $('#dungeon-heading').textContent=tr('地牢囚徒');
  $('#dungeon-count').textContent=tr('已收錄 {count} 位敵人',{count:visibleRecords().length});
  $('#dungeon-hint').textContent=tr(visibleRecords().length>3?'左右拖曳查看其他監獄':'擊敗敵人後，將在這裡收錄');
  $('#dungeon-prev').hidden=$('#dungeon-next').hidden=visibleRecords().length<=3;
  $('#dungeon-prev').setAttribute('aria-label',tr('上一組監獄'));$('#dungeon-next').setAttribute('aria-label',tr('下一組監獄'));
  $('#pause').textContent=tr(paused?'▶ 繼續':'Ⅱ 暫停');
  $('#scene-title').textContent=tr(battle?'CHAPTER 01 · 都市夜巷':'地下牢 · 永久禁錮');
  updateInteraction();
 }
 function enter(){
  if(!ready||!running||gameMode!=='battle'||(typeof MagicShop!=='undefined'&&MagicShop.isOpen))return;
  if(typeof Onboarding!=='undefined'){if(Onboarding.active&&Onboarding.active!=='dungeon')return;Onboarding.complete('dungeon');}
  if(visibleRecords().length)acknowledgeTutorial();
  returnPaused=paused;clearInput();paused=false;gameMode='collection';accumulator=0;
  if(sound)audio?.resume().catch(()=>{});
  renderGallery();syncUI();$('#dungeon-back').focus();
 }
 function visit(id){
  const record=records.find(r=>r.id===id);if(!record||!isVisible(record)||gameMode!=='collection'||(typeof MagicShop!=='undefined'&&MagicShop.isOpen))return;
  clearInput();selected=record;prisoner=Object.assign(enemy(camera+480,record.kind),{captive:true,hp:100,breakDamage:0,face:-1,state:'bound',bind:Infinity,bindVariant:0,shirtless:record.shirtless,mummyUnhelmet:record.mummyUnhelmet===true,mummyFootwear:record.mummyFootwear||'boots'});
  prisoner.y=bindingY(prisoner);particles=[];captions=[];gameMode='prison';paused=false;accumulator=0;
  unlockGameAudio();
  syncUI();canvas.focus();playBindingVoice(prisoner);
 }
 function back(){
  if(gameMode==='battle'||(typeof MagicShop!=='undefined'&&MagicShop.isOpen))return;
  savePrisoner();clearInput();particles=[];captions=[];accumulator=0;
  if(gameMode==='prison'){
   prisoner=null;selected=null;gameMode='collection';paused=false;if(sound)audio?.resume().catch(()=>{});renderGallery();syncUI();$('#dungeon-back').focus();
  }else{
   gameMode='battle';paused=returnPaused;syncUI();if(paused)audio?.suspend().catch(()=>{});else if(sound)audio?.resume().catch(()=>{});canvas.focus();
  }
 }
 function portrait(c,record){
  const sequence=[0,1,2,1,0,3,2,3],index=sequence[Math.floor(time*5)%sequence.length];
  if(c.dataset.frame===String(index))return;
  c.dataset.frame=String(index);c.dataset.binding='default';c.dataset.facing='-1';
  if(c.width!==180||c.height!==232){c.width=180;c.height=232;}
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,180,232);
  const sprite=(newEnemy(record)?EnemyRoster.get(record).binding:record.shirtless?bareBindingFrames:bindingFrames)[index];
  if(!sprite)return;
  const scale=Math.min(164/sprite.width,216/sprite.height),w=sprite.width*scale,h=sprite.height*scale;
  g.save();g.translate(180,0);g.scale(-1,1);
  g.drawImage(sprite,Math.round((180-w)/2),Math.round(224-h),Math.round(w),Math.round(h));g.restore();
 }
 function renderGallery(){
  track.replaceChildren();portraits=[];viewport.classList.toggle('can-scroll',visibleRecords().length>3);
  for(let i=0;i<Math.max(3,visibleRecords().length);i++){
   const record=visibleRecords()[i],cell=document.createElement(record?'button':'div');cell.className='prison-card'+(record?'':' empty-cell');
   const number=document.createElement('span');number.className='cell-number';number.textContent=tr('監獄 {number}',{number:String(i+1).padStart(2,'0')});cell.append(number);
   const space=document.createElement('div');space.className='cell-room';
   if(record){const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');portrait(c,record);portraits.push({canvas:c,record});space.append(c);}
   const bars=document.createElement('div');bars.className='cell-bars';space.append(bars);cell.append(space);
   const name=document.createElement('strong');name.textContent=record?enemyName(record):tr('空監獄');cell.append(name);
   const caption=document.createElement('span');caption.className='cell-caption';caption.textContent=tr(record?'點選進入':'尚未收錄');cell.append(caption);
   if(record){cell.type='button';cell.dataset.prisonId=record.id;cell.setAttribute('aria-label',tr('進入監獄 {number}',{number:i+1}));cell.onclick=()=>{if(!suppressClick)visit(record.id);};}
   track.append(cell);
  }
  syncScroll();
 }
 function syncScroll(){const max=viewport.scrollWidth-viewport.clientWidth;$('#dungeon-prev').disabled=viewport.scrollLeft<=1;$('#dungeon-next').disabled=viewport.scrollLeft>=max-1;}
 viewport.addEventListener('scroll',syncScroll);
 viewport.addEventListener('pointerdown',e=>{
  suppressClick=false;
  if(visibleRecords().length<=3||e.pointerType==='touch'||e.button!==0)return;
  drag={id:e.pointerId,start:e.clientX,scroll:viewport.scrollLeft,moved:false};
 });
 viewport.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const delta=e.clientX-drag.start;
  if(Math.abs(delta)>6){drag.moved=true;suppressClick=true;viewport.setPointerCapture(e.pointerId);e.preventDefault();}
  if(drag.moved)viewport.scrollLeft=drag.scroll-delta;
 });
 function endDrag(e){if(drag&&drag.id===e.pointerId){if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);drag=null;}}
 viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
 $('#dungeon-prev').onclick=()=>viewport.scrollBy({left:-viewport.clientWidth,behavior:'smooth'});
 $('#dungeon-next').onclick=()=>viewport.scrollBy({left:viewport.clientWidth,behavior:'smooth'});
 // Original code-drawn 320x180 pixel room; no external asset dependency.
 function makeRoom(){
  const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');
  g.fillStyle='#17151f';g.fillRect(0,0,320,180);
  const colors=['#35303d','#302c38','#3b3340','#332e3a'];
  for(let row=0;row<9;row++)for(let col=-1;col<11;col++){
   const x=col*34+(row%2)*17,y=row*16;
   g.fillStyle=colors[(row*7+col*col+11)%4];g.fillRect(x+1,y+1,32,14);
   g.fillStyle='#49404c';g.fillRect(x+2,y+1,30,1);g.fillStyle='#24212d';g.fillRect(x+2,y+13,30,2);
  }
  for(const x of [27,282]){g.fillStyle='#24212b';g.fillRect(x,0,13,144);for(let y=4;y<143;y+=19){g.fillStyle='#514453';g.fillRect(x-3,y,19,5);g.fillStyle='#443b4a';g.fillRect(x,y+5,13,12);}}
  g.fillStyle='#24202d';g.fillRect(0,139,320,41);
  for(let row=0;row<3;row++)for(let col=-1;col<8;col++){g.fillStyle=(row+col)%2?'#39313e':'#332c39';g.fillRect(col*54+(row%2)*27,142+row*15,52,13);}
  for(const x of [60,260]){g.fillStyle='#15131c';g.fillRect(x-3,61,6,17);g.fillRect(x-7,68,14,4);g.fillStyle='#86512d';g.fillRect(x-2,56,4,13);g.fillStyle='#ed9c50';g.fillRect(x-4,49,8,10);g.fillStyle='#ffd381';g.fillRect(x-2,46,4,9);}
  for(const x of [79,239])for(let y=7;y<59;y+=6){g.strokeStyle='#706272';g.strokeRect(x,y,3,4);}
  return c;
 }
 const room=makeRoom();
 function setVariant(variant){
  if(gameMode!=='prison'||!enemySupportsBinding(prisoner,variant)||paused||!Laughter.owns(variant)||prisoner.bindVariant===variant)return;
  prisoner.bindVariant=variant;prisoner.y=bindingY(prisoner);updateMouseFeather(0,true);playBindingVoice(prisoner);savePrisoner();updateControls();canvas.focus();
 }
 function updateControls(){
  if(gameMode!=='prison'||!prisoner)return;
  $('#prison-controls-title').textContent=tr('禁錮魔法');
  $('#prison-controls').classList.toggle('default-only',newEnemy(prisoner)&&!enemySupportsBinding(prisoner,1));
  document.querySelectorAll('[data-prison-binding]').forEach(button=>{
   const variant=Number(button.dataset.prisonBinding);button.textContent=tr(['預設','木乃伊','藤蔓'][variant]);
   button.setAttribute('aria-pressed',String(prisoner.bindVariant===variant));button.disabled=paused||!Laughter.owns(variant)||!enemySupportsBinding(prisoner,variant);button.hidden=!Laughter.owns(variant)||!enemySupportsBinding(prisoner,variant);
  });
  const footwear=$('#dungeon-footwear');footwear.hidden=!canCycleFootwear(prisoner);footwear.disabled=paused;if(canCycleFootwear(prisoner))footwear.textContent=footwearButtonText(prisoner);
  const helmet=$('#dungeon-helmet');helmet.hidden=!canToggleHelmet(prisoner);helmet.disabled=paused;helmet.textContent=helmetButtonText(prisoner);helmet.setAttribute('aria-pressed',String(prisoner.mummyUnhelmet===true));
  const outfit=$('#dungeon-wardrobe');outfit.hidden=newEnemy(prisoner)||prisoner.bindVariant!==0;outfit.disabled=paused;
  outfit.textContent=tr(prisoner.shirtless?'恢復上衣 · E':'切換無上衣 · E');
  updateBreakGauge();
 }
 function updateBreakGauge(){
  const value=Math.max(0,Math.min(100,prisoner?.breakDamage||0));
  const color=value>80?'#ef82b5':value>50?'#efd05c':'#52c878';
  $('#prison-break-label').textContent=tr('破防');
  const meter=$('#prison-break-meter');meter.setAttribute('aria-label',tr('破防'));meter.setAttribute('aria-valuenow',String(Math.floor(value)));
  $('#prison-break-fill').style.height=value+'%';$('#prison-break-fill').style.backgroundColor=color;
  $('#prison-break-value').textContent=Math.floor(value)+'%';
 }
 document.querySelectorAll('[data-prison-binding]').forEach(button=>button.onclick=()=>setVariant(Number(button.dataset.prisonBinding)));
 $('#dungeon-wardrobe').onclick=toggleWardrobe;
 $('#dungeon-footwear').onclick=cycleMummyFootwear;
 $('#dungeon-helmet').onclick=toggleMummyHelmet;
 function update(dt){
  time+=dt;if(gameMode==='collection'){for(const p of portraits)portrait(p.canvas,p.record);return;}if(gameMode!=='prison'||!prisoner)return;
  updateMouseFeather(dt);
  const previousQuiet=prisoner.lastHit;prisoner.lastHit+=dt;
  if(!prisoner.featherHit)prisoner.breakDamage=Math.max(0,prisoner.breakDamage-3*(Math.max(0,prisoner.lastHit-3)-Math.max(0,previousQuiet-3)));
  updateBreakGauge();
  prisoner.bindElapsed+=dt;prisoner.y=bindingY(prisoner);prisoner.featherTextCooldown=Math.max(0,(prisoner.featherTextCooldown||0)-dt);
  if(prisoner.featherHit)prisoner.bindLaughElapsed+=dt*bindingLaughSpeed(prisoner);
  updateBoundDialogue(prisoner,dt);updateFeatherRecovery(prisoner);
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
  for(const t of captions)advanceCaption(t,dt);captions=captions.filter(t=>t.life>0);
 }
 function draw(){
  ctx.clearRect(0,0,960,540);ctx.drawImage(room,0,0,960,540);
  for(const x of [180,780]){ctx.globalAlpha=.06+.025*Math.sin(time*7+x);ctx.fillStyle='#ffc278';ctx.fillRect(x-45,112,90,170);}ctx.globalAlpha=1;
  if(gameMode!=='prison'||!prisoner)return;
  text(enemyName(prisoner),480,29,16,'#eee0c9','center');
  drawEnemy(prisoner);
  for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-camera,p.y,3,3);}
  for(const t of captions)drawCaption(t);ctx.globalAlpha=1;
  text(tr('羽毛接觸互動 · 永久禁錮'),22,516,12,'#c6b7cc');
 }
 function addText(t,x,y,color,style={}){captions.push({t,x,y,color,life:1.15,...style});}
 function spark(x,y,color,count){for(let i=0;i<count;i++)particles.push({x,y,color,vx:(Math.random()-.5)*150,vy:-Math.random()*110,life:.5});}
 $('#dungeon-open').onclick=enter;$('#dungeon-back').onclick=back;
 function refresh(){if(gameMode==='collection')renderGallery();syncUI();}
 syncUI();
 return {capture,enter,back,visit,update,draw,savePrisoner,setVariant,updateControls,addText,spark,refresh,resetProgress,acknowledgeTutorial,get tutorialPending(){return visibleRecords().length>0&&!guideSeen;},get prisoner(){return prisoner;},get time(){return time;},get count(){return visibleRecords().length;}};
})();

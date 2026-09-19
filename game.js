'use strict';
const tr=I18n.t;
let loadFailed=false,ended=false;
let gameMode='battle';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s),featherCursor=document.querySelector('#feather-cursor');
ctx.imageSmoothingEnabled=false;
const keys=new Set(),sprites=[],bg=new Image(),sheet=new Image(),bindingSheet=new Image(),bindingFrames=[],bindingLaughSheet=new Image(),bindingLaughFrames=[],mummySheet=new Image(),mummyFrames=[],mummyLaughSheet=new Image(),mummyLaughFrames=[],vineSheet=new Image(),vineFrames=[],vineLaughSheet=new Image(),vineLaughFrames=[],normalHitSheet=new Image(),normalHitFrames=[],bareBindingSheet=new Image(),bareBindingFrames=[],bareLaughSheet=new Image(),bareLaughFrames=[],bareHitSheet=new Image(),bareHitFrames=[],meleeSheet=new Image(),meleeFrames=[];
const alleyLoop=new Image();
let mummyLaughLayout,mummyBindingLayout,vineBindingLayout,vineLaughLayout;
let ready=false,running=false,paused=false,sound=true,audio,clock=0,last=0,camera=0,spawnAt=1080;
let enemies=[],shots=[],bindingShots=[],enemyShots=[],effects=[],texts=[],kills=0,world=0,combo=0,comboTime=0,shake=0;
const FLOOR=440, BIND_DURATION=20, BIND_HEIGHT=280, BIND_LAUGH_DURATION=1.15, DEFEAT_FALL_DURATION=.65, MELEE_REACH=92, MELEE_HOLD=.48, MELEE_BEAT=.24, INTERACT_REACH=115;
const MUMMY_HEIGHT=220,VINE_HEIGHT=344, BIND_RING_SPEED=620, BIND_RING_REACH=650, BIND_RING_RADIUS=22;
function bindingHeight(e){return e.bindVariant===1?MUMMY_HEIGHT:e.bindVariant===2?VINE_HEIGHT:BIND_HEIGHT;}
function bindingScale(e){return e.captive?(e.bindVariant===2?2.2:e.bindVariant===1?2:1.6):1;}
// Frame the vine's limbs, allowing the rooted trunk to continue below the view.
function bindingY(e){if(e.captive)return e.bindVariant===2?264:65+Math.sin(e.bindElapsed*2.8)*2;return e.bindVariant===2?0:-38+Math.sin(e.bindElapsed*2.8)*3;}
const player={x:220,hp:100,face:1,cast:0,inv:0,dash:0,cd:[0,0,0],moving:false,melee:0,meleeElapsed:0,meleeNextHit:.14};
const mouseFeather={x:0,y:0,inside:false,hover:false,beat:0,nextHit:0};
// Upper vane in the 36x44 SVG: the bare quill and lower root cannot attack.
const FEATHER_ATTACK_POLYGON=[[7,24],[9,18],[14,11],[22,6],[32,3],[31,12],[27,21],[20,28],[14,29]];
function syncFeatherMetrics(){
 const r=canvas.getBoundingClientRect?.();
 mouseFeather.scaleX=r?.width>0?960/r.width:1;mouseFeather.scaleY=r?.height>0?540/r.height:1;
}
function featherAttackPolygon(wx,wy){
 const angle=(mouseFeather.angle||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 return FEATHER_ATTACK_POLYGON.map(([x,y])=>{
  x-=18;y-=22;
  return [wx+(x*c-y*s)*(mouseFeather.facing||1)*(mouseFeather.scaleX||1),wy+(x*s+y*c+(mouseFeather.lift||0))*(mouseFeather.scaleY||1)];
 });
}
function featherIntersectsRect(polygon,[left,top,right,bottom]){
 const rectangle=[[left,top],[right,top],[right,bottom],[left,bottom]],axes=[[1,0],[0,1]];
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length];axes.push([a[1]-b[1],b[0]-a[0]]);
 }
 return axes.every(([ax,ay])=>{
  const p=polygon.map(([x,y])=>x*ax+y*ay),r=rectangle.map(([x,y])=>x*ax+y*ay);
  return Math.max(...p)>=Math.min(...r)&&Math.max(...r)>=Math.min(...p);
 });
}
const crops=[[40,140,220,400],[333,140,265,400],[632,145,302,395],[965,140,270,400],[20,715,235,385],[286,715,357,385],[693,714,207,386],[967,860,275,240]];
const MOVES={
 jab:{label:'輕拳',damage:6,windup:.15}, straight:{label:'直拳',damage:8,windup:.18},
 heavyPunch:{label:'重拳',damage:12,windup:.25}, hook:{label:'勾拳',damage:10,windup:.2},
 lightKick:{label:'輕踢',damage:7,windup:.18}, sideKick:{label:'側踢',damage:10,windup:.22},
 roundhouse:{label:'迴旋踢',damage:12,windup:.27}, highKick:{label:'高踢',damage:11,windup:.28},
 crouchPunch:{label:'蹲拳',damage:6,windup:.17},lowKick:{label:'低踢',damage:9,windup:.22},
 sweep:{label:'掃腿',damage:12,windup:.3},jumpKick:{label:'跳躍踢',damage:12,windup:.22},
 hadouken:{label:'波動拳',damage:10,windup:.3},shoryuken:{label:'升龍拳',damage:15,windup:.32},
 tatsu:{label:'旋風腿',damage:13,windup:.32}
};
function loadImage(im,url){return new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error(tr('影象載入失敗')));im.src=RyuAssets.assetURL(url);});}
function prepareWizard(){
 for(const [x,y,w,h] of crops){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');g.drawImage(sheet,x,y,w,h,0,0,w,h);
  const d=g.getImageData(0,0,w,h);
  for(let i=0;i<d.data.length;i+=4){const r=d.data[i],v=d.data[i+1],b=d.data[i+2];if(r>150&&b>140&&v<100&&r>v*1.7&&b>v*1.7)d.data[i+3]=0;}
  g.putImageData(d,0,0);sprites.push(c);
 }
}
function prepareBinding(source=bindingSheet,frames=bindingFrames){
 const cellW=Math.floor(source.naturalWidth/2),cellH=Math.floor(source.naturalHeight/2);
 const cells=[];let left=cellW,top=cellH,right=0,bottom=0;
 for(let i=0;i<4;i++){
  const c=document.createElement('canvas');c.width=cellW;c.height=cellH;
  const g=c.getContext('2d');g.drawImage(source,(i%2)*cellW,Math.floor(i/2)*cellH,cellW,cellH,0,0,cellW,cellH);
  const d=g.getImageData(0,0,cellW,cellH);
  for(let j=0;j<d.data.length;j+=4){
   const r=d.data[j],green=d.data[j+1],b=d.data[j+2];
   if(green>105&&green>r*1.4&&green>b*1.4){d.data[j+3]=0;}
   else if(d.data[j+3]>0){const pixel=j/4,x=pixel%cellW,y=Math.floor(pixel/cellW);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  }
  g.putImageData(d,0,0);cells.push(c);
 }
 for(const cell of cells){const c=document.createElement('canvas');c.width=right-left+1;c.height=bottom-top+1;c.getContext('2d').drawImage(cell,left,top,c.width,c.height,0,0,c.width,c.height);frames.push(c);}
}
function prepareMummy(source=mummySheet,frames=mummyFrames,layout=null){
 const cellW=Math.floor(source.naturalWidth/4),cellH=Math.floor(source.naturalHeight/2);
 if(layout&&(source.naturalWidth!==layout.sourceSize[0]||source.naturalHeight!==layout.sourceSize[1]))throw Error('Mummy frame layout does not match its image');
 for(let i=0;i<8;i++){
  const [sx,sy,sw,sh,dx,dy]=layout?layout.frames[i]:[(i%4)*cellW,Math.floor(i/4)*cellH,cellW,cellH,0,0];
  const c=document.createElement('canvas');c.width=layout?layout.frameSize[0]:cellW;c.height=layout?layout.frameSize[1]:cellH;
  c.getContext('2d').drawImage(source,sx,sy,sw,sh,dx,dy,sw,sh);
  frames.push(c);
 }
}
// Keep the native SF3 pivot (64,112) in every 128px cell so reactions
// retain the same size and ground contact as the imported combat sprites.
function prepareNormalHit(source=normalHitSheet,frames=normalHitFrames){
 const cw=source.naturalWidth/2,ch=source.naturalHeight/2;
 const pixelsPerUnit=source===bareHitSheet?4:1;
 for(let i=0;i<4;i++){
  const c=document.createElement('canvas');c.width=c.height=128*pixelsPerUnit;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(source,(i%2)*cw,Math.floor(i/2)*ch,cw,ch,0,0,c.width,c.height);
  const pixels=g.getImageData(0,0,c.width,c.height);
  if(source!==bareHitSheet)for(let j=0;j<pixels.data.length;j+=4){const r=pixels.data[j],green=pixels.data[j+1],b=pixels.data[j+2];if(green>105&&green>r*1.4&&green>b*1.4)pixels.data[j+3]=0;}
  g.putImageData(pixels,0,0);frames.push(c);
 }
}
function prepareMelee(){
 const w=meleeSheet.naturalWidth/2,h=meleeSheet.naturalHeight/2;
 for(let i=0;i<4;i++){
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(meleeSheet,i%2*w,Math.floor(i/2)*h,w,h,0,0,256,256);const d=g.getImageData(0,0,256,256);
  for(let j=0;j<d.data.length;j+=4){const r=d.data[j],v=d.data[j+1],b=d.data[j+2];if(r>150&&b>140&&v<100&&r>v*1.7&&b>v*1.7)d.data[j+3]=0;}
  g.putImageData(d,0,0);meleeFrames.push(c);
 }
}
const assetsReady=Promise.all([fetch('ryu--mummy--binding-layout.json?v='+RyuAssets.assetRevision).then(r=>{if(!r.ok)throw Error('Mummy layout failed');return r.json();}).then(layout=>{mummyBindingLayout=layout;}),fetch('ryu--mummy--binding-laugh-layout.json?v='+RyuAssets.assetRevision).then(r=>{if(!r.ok)throw Error('Mummy laugh layout failed');return r.json();}).then(layout=>{mummyLaughLayout=layout;}),fetch('ryu--mummy-vine--binding-layout.json?v='+RyuAssets.assetRevision).then(r=>{if(!r.ok)throw Error('Vine layout failed');return r.json();}).then(layout=>{vineBindingLayout=layout;}),fetch('ryu--mummy-vine--binding-laugh-layout.json?v='+RyuAssets.assetRevision).then(r=>{if(!r.ok)throw Error('Vine laugh layout failed');return r.json();}).then(layout=>{vineLaughLayout=layout;}),loadImage(sheet,'actors.png'),loadImage(bg,'background--extended--entrance.png'),loadImage(alleyLoop,'background--extended--loop.png'),loadImage(bindingSheet,'ryu--binding.png'),loadImage(bindingLaughSheet,'ryu--binding-laugh.png'),loadImage(mummySheet,'ryu--mummy--binding.png'),loadImage(mummyLaughSheet,'ryu--mummy--binding-laugh.png'),loadImage(vineSheet,'ryu--mummy-vine--binding.png'),loadImage(vineLaughSheet,'ryu--mummy-vine--binding-laugh.png'),loadImage(normalHitSheet,'ryu--hit-smile.png'),loadImage(bareBindingSheet,'ryu--shirtless--binding.png'),loadImage(bareLaughSheet,'ryu--shirtless--binding-laugh.png'),loadImage(bareHitSheet,'ryu--shirtless--hit-smile.png'),loadImage(meleeSheet,'wizard-melee.png'),RyuAssets.load()]).then(()=>{
 prepareWizard();prepareBinding();prepareBinding(bindingLaughSheet,bindingLaughFrames);prepareMummy(mummySheet,mummyFrames,mummyBindingLayout);prepareMummy(mummyLaughSheet,mummyLaughFrames,mummyLaughLayout);prepareMummy(vineSheet,vineFrames,vineBindingLayout);prepareMummy(vineLaughSheet,vineLaughFrames,vineLaughLayout);prepareNormalHit();prepareBinding(bareBindingSheet,bareBindingFrames);prepareBinding(bareLaughSheet,bareLaughFrames);prepareNormalHit(bareHitSheet,bareHitFrames);prepareMelee();ready=true;$('#start').disabled=false;
 $('#load').textContent=tr('隆的戰鬥動作已就緒 · 按 Enter 開始');if(typeof Dungeon!=='undefined')Dungeon.refresh();
}).catch(error=>{console.error(error);loadFailed=true;$('#load').textContent=tr('素材載入失敗，請重新整理重試');});
$('#start').disabled=true;
function tone(f=440,t=.09,type='sine',vol=.06){
 if(!sound)return;
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*.55,audio.currentTime+t);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+t);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+t);}catch{}
}
function unlockGameAudio(){
 if(!sound)return;
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(!paused)audio.resume().catch(()=>{});RyuAudio.init(audio,RyuAssets.assetRevision);RyuAudio.setEnabled(true);}catch{}
}
function enemy(x){return {x,y:0,hp:100,shirtless:false,bindVariant:0,face:-1,state:'intro',anim:'intro',t:0,stateLength:1.05,stun:0,bind:0,bindElapsed:0,bindLaugh:0,bindLaughElapsed:0,hands:0,dead:0,defeatStartY:0,cool:.8,special:2,reaction:.3,decision:.4,hitDone:false,lastHit:0,featherHit:false,featherRecoveryPending:false,castDone:false,balance:0,hitFlash:0,posture:'idle',variation:Math.random(),move:null};}
function reset(){
 RyuAudio.stopAll();
 Object.assign(player,{x:220,hp:100,face:1,cast:0,inv:0,dash:0,cd:[0,0,0],moving:false,melee:0,meleeElapsed:0,meleeNextHit:.14});
 enemies=[enemy(690)];shots=[];bindingShots=[];enemyShots=[];effects=[];texts=[];camera=0;kills=0;combo=0;clock=0;world=0;spawnAt=1130;shake=0;
}
function start(){if(typeof Onboarding!=='undefined'&&Onboarding.active)return;if(typeof MagicShop!=='undefined'&&MagicShop.isOpen)return;if(!ready||gameMode!=='battle')return;ended=false;reset();running=true;paused=false;unlockGameAudio();$('#overlay').hidden=true;$('#paused').hidden=true;$('#pause').textContent=tr('Ⅱ 暫停');canvas.focus();tone(600,.2);}
function newGame(){if(!ready||running||gameMode!=='battle')return;Laughter.resetProgress();Dungeon.resetProgress();start();Dungeon.refresh();MagicShop.tick();}
function pause(){if(typeof Onboarding!=='undefined'&&Onboarding.active)return;if(typeof MagicShop!=='undefined'&&MagicShop.isOpen)return;if(gameMode==='collection'||(!running&&gameMode!=='prison'))return;paused=!paused;$('#paused').hidden=!paused;$('#pause').textContent=paused?tr('▶ 繼續'):tr('Ⅱ 暫停');keys.clear();if(audio){if(paused)audio.suspend().catch(()=>{});else if(sound)audio.resume().catch(()=>{});}}
function floatText(t,x,y,color='#e9d7ff',style={}){if(gameMode==='prison'){Dungeon.addText(t,x,y,color,style);return;}texts.push({t,x,y,life:1.15,color,...style});}
function advanceCaption(t,dt){t.life-=dt;t.x+=(t.vx||0)*dt;t.y+=(t.vy??-25)*dt;}
function drawCaption(t){
 ctx.save();ctx.globalAlpha=Math.min(1,t.life*2);ctx.font=`${t.weight||700} ${t.size||14}px "Microsoft YaHei", sans-serif`;ctx.textAlign='center';
 const width=Math.min(t.maxWidth||380,ctx.measureText(t.t).width),margin=width/2+12;
 const x=Math.max(margin,Math.min(960-margin,t.x-camera)),y=Math.max(52,Math.min(490,t.y));
 ctx.strokeStyle=t.weight===900?'#48122f':'#201629';ctx.lineWidth=t.weight===900?3:2;ctx.lineJoin='round';ctx.strokeText(t.t,x,y,t.maxWidth||380);ctx.fillStyle=t.color;ctx.fillText(t.t,x,y,t.maxWidth||380);ctx.restore();
}
const RYU_DIALOGUE={
 "bound": [
  "放開我！堂堂正正地較量！",
  "這是什麼招式……身體動不了！",
  "別小看武者的意志！",
  "可惡……必須穩住呼吸。",
  "你究竟想做什麼？"
 ],
 "laugh": [
  "哈哈哈！",
  "哈哈哈，停下！",
  "哈哈……別得意！",
  "哈哈哈！這算什麼較量！",
  "哈、哈哈！我還沒認輸！"
 ],
 "strong": [
  "哈哈哈哈",
  "哈哈哈哈哈哈！！",
  "哈哈哈哈！有本事正面交手！",
  "哈哈哈哈！可惡的傢伙！",
  "哈哈哈哈……呼吸亂了！",
  "哈哈哈哈！別以為我會屈服！"
 ],
 "plea": [
  "哈哈哈哈哈哈！！先、先停一下！",
  "哈哈哈哈……讓我喘口氣！",
  "哈哈哈哈！夠了……拜託！",
  "哈哈哈哈……休息一下，再較量！",
  "停！停！我認輸了！",
  "我認輸！！我認輸！！",
  "夠了，混蛋……求你了！",
  "喘不過氣了……歇一下！",
  "別碰那裡！拜託！",
  "他媽的……我真受不了了！",
  "行了行了！算你贏！",
  "哈哈哈哈！認輸！我認輸！",
  "哈哈哈哈！別撓腳了！求你！",
  "哈啊哈哈！混蛋，慢一點啊！",
  "哈哈哈哈！我錯了，停手！",
  "哈哈哈哈！不打了！真不打了！",
  "哈哈哈哈！饒了我這回吧！"
 ],
 "pureLaugh": [
  "哈哈哈！",
  "哈、哈哈哈！",
  "哈哈，哈哈！",
  "哈哈哈哈！",
  "哈啊哈哈！"
 ],
 "pureStrong": [
  "哈哈哈哈",
  "哈哈哈哈哈哈！！",
  "哈啊哈哈哈哈！",
  "哈哈哈哈、哈哈哈！",
  "啊哈哈哈哈哈！",
  "哈哈、哈哈哈哈！！"
 ],
 "pureDesperate": [
  "哈哈哈哈哈哈！！",
  "啊哈哈哈哈哈哈！！",
  "哈、哈啊哈哈哈哈！！",
  "哈哈哈哈！哈哈哈哈！！",
  "哈哈哈哈哈哈哈——！",
  "啊哈、哈哈哈哈哈！！",
  "哈哈哈、哈啊哈哈！！",
  "哈啊啊哈哈哈哈！！"
 ]
};
const RYU_BINDING_DIALOGUE={
 "default": {
  "bound": [
   "這是……魔法嗎？",
   "喂！把這些光圈弄開！",
   "手腳都被鎖住了……見鬼！"
  ],
  "laugh": [
   "哈哈哈！鬆開光圈，混蛋！",
   "哈哈哈！有種先放我下來！",
   "哈、哈哈！別碰我的腳！"
  ],
  "plea": [
   "哈哈哈哈！放我下來！求你了！",
   "先把光圈鬆開……我不打了！"
  ]
 },
 "shirtless": {
  "bound": [
   "難道你喜歡我的肌肉？",
   "看夠了沒？把衣服還我！",
   "沒了上衣，我照樣能打！"
  ],
  "laugh": [
   "哈哈哈！肌肉不是給你撓的！",
   "哈、哈哈！別撓肚子，混蛋！",
   "哈哈哈！把上衣還我啊！"
  ],
  "plea": [
   "哈哈哈哈！別撓了！衣服給你行了吧！",
   "肚子受不了了……停一下，拜託！"
  ]
 },
 "mummy": {
  "bound": [
   "可惡，完全動不了！",
   "喂！把這破布拆了！",
   "綁成這樣，還怎麼打！"
  ],
  "laugh": [
   "哈哈哈！腳也躲不開，混蛋！",
   "哈、哈哈！別趁我被綁著！",
   "哈哈哈！這破布怎麼扯不開！"
  ],
  "plea": [
   "哈哈哈哈！拆一點！讓我動一下！",
   "他媽的……求你把腳放開！"
  ]
 },
 "vine": {
  "bound": [
   "這些是什麼鬼東西！！",
   "可惡，這些東西的力氣真大！！",
   "別纏了！給我鬆開！"
  ],
  "laugh": [
   "哈哈哈！這鬼東西還會動！",
   "哈、哈哈！別把我的腳撐開！",
   "哈哈哈！混蛋，叫它們鬆手！"
  ],
  "plea": [
   "哈哈哈哈！收回去！快收回去！",
   "這些藤蔓……放鬆點，求你了！"
  ]
 }
};
const RYU_PURE_LAUGHTER=new Set([...RYU_DIALOGUE.pureLaugh,...RYU_DIALOGUE.pureStrong,...RYU_DIALOGUE.pureDesperate]);
function ryuBindingDialogueKey(e){return e.bind>0?(e.bindVariant===2?'vine':e.bindVariant===1?'mummy':e.shirtless?'shirtless':'default'):null;}
function chooseRyuDialogue(e,laughing,level){
 const context=RYU_BINDING_DIALOGUE[ryuBindingDialogueKey(e)];
 let pool;
 if(!laughing)pool=context&&Math.random()<.65?context.bound:RYU_DIALOGUE.bound;
 else {
  // Never put two spoken captions together: every one earns a pure laugh
  // before another can play. Additional pure laughs keep the mix varied.
  const pure=!e.lastCaptionWasPure||Math.random()<(level===2?.4:.25);
  if(pure)pool=level===2?RYU_DIALOGUE.pureDesperate:level===1?RYU_DIALOGUE.pureStrong:RYU_DIALOGUE.pureLaugh;
  else if(level===2&&Math.random()<.65)pool=[...RYU_DIALOGUE.plea,...(context?.plea||[])];
  else if(context&&Math.random()<.6)pool=context.laugh;
  else pool=(level>0?RYU_DIALOGUE.strong:RYU_DIALOGUE.laugh).filter(line=>!RYU_PURE_LAUGHTER.has(line));
 }
 const eligible=line=>!(e.dialogueHistory||[]).includes(line)&&
  (RYU_PURE_LAUGHTER.has(line)||line!==e.lastSpokenDialogue)&&
  (!line.includes('腳')||(laughing&&e.featherHit&&e.featherWeakness===2))&&
  (level<2||!line.includes('還沒認輸'));
 let choices=pool.filter(eligible);
 // Narrow form pools can be exhausted by contact/history filtering. Use
 // other applicable lines rather than repeating the previous spoken line.
 if(!choices.length)choices=(laughing?
  [...(level===2?RYU_DIALOGUE.plea:level===1?RYU_DIALOGUE.strong:RYU_DIALOGUE.laugh),...(context?.laugh||[])].filter(line=>!RYU_PURE_LAUGHTER.has(line)):
  [...RYU_DIALOGUE.bound,...(context?.bound||[])]).filter(eligible);
 const source=choices[Math.floor(Math.random()*choices.length)];
 if(!RYU_PURE_LAUGHTER.has(source))e.lastSpokenDialogue=source;
 if(laughing)e.lastCaptionWasPure=RYU_PURE_LAUGHTER.has(source);
 return source;
}
function ryuDialogueLevel(e){return e.captive?(e.breakDamage>80?2:e.breakDamage>50?1:0):0;}
function emitRyuDialogue(e,laughing=true){
 if(laughing&&e.featherTextCooldown>0)return null;
 const level=ryuDialogueLevel(e),source=chooseRyuDialogue(e,laughing,level);
 e.dialogueHistory=[...(e.dialogueHistory||[]),source].slice(-2);
 const style={size:level===2&&laughing?17:14,weight:level===2&&laughing?900:700,maxWidth:e.captive?340:300};
 let x=e.x,y=e.bind>0?boundLaughTextY(e):FLOOR+e.y-190;
 if(level>0&&laughing){
  // Each line travels away from the speaker on its own side, with a
  // smaller vertical variation; it never returns toward the face.
  e.dialogueSide=e.dialogueSide===1?-1:1;x+=e.dialogueSide*185;
  style.vx=e.dialogueSide*(44+Math.random()*18);style.vy=(Math.random()-.5)*44;
  y=Math.max(80,y-24)+(e.dialogueSide===1?18:0);style.maxWidth=275;
 }
 floatText(tr(source),x,y,laughing?(level===2?'#ec55b2':'#f3cbff'):'#e6d3ac',style);
 // Classify the source key before translation so all three languages share
 // the same reading pause. Pure laughter retains its original cadence.
 if(laughing){const pureLaughter=RYU_PURE_LAUGHTER.has(source);e.featherTextCooldown=pureLaughter?(level===2?.65:.9):(level===2?1.6:2);}
 return source;
}
function updateBoundDialogue(e,dt){
 if(e.hp<=0||e.bind<=0)return;
 if(e.featherHit||e.bindLaugh>0||e.hands>0){e.boundDialogueCooldown=2.5;return;}
 e.boundDialogueCooldown=(e.boundDialogueCooldown??1.2)-dt;
 if(e.boundDialogueCooldown<=0){emitRyuDialogue(e,false);e.boundDialogueCooldown=3.5+Math.random()*2;}
}

// Precise feather contact regions for the suspended pose. Coordinates are
// relative to the character's feet (the binding sprite is BIND_HEIGHT tall)
// and mirrored with the character's facing direction.
const VINE_HURT_POLYGONS=[
 [[133,107],[163,105],[192,106],[210,111],[234,105],[246,111],[258,126],[254,140],[238,151],[229,171],[228,196],[224,209],[209,215],[177,214],[151,209],[150,193],[142,173],[132,157],[123,136],[123,120]],
 [[49,203],[63,211],[71,229],[78,248],[91,273],[106,302],[108,326],[100,340],[83,347],[67,346],[52,334],[33,310],[14,286],[7,267],[8,246],[18,225],[33,208]],
 [[326,205],[340,213],[359,228],[376,244],[378,267],[365,288],[346,309],[329,339],[307,342],[288,336],[281,324],[284,301],[298,274],[305,250],[316,223]]
].map(points=>points.map(([x,y])=>[(x-190)*VINE_HEIGHT/512,(y-482)*VINE_HEIGHT/512]));
// General polygon intersection keeps the curved soles/waist out of the old rectangles' empty corners.
function featherIntersectsPolygon(a,b){
 const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
 const on=(p,q,r)=>Math.abs(cross(p,q,r))<1e-8&&r[0]>=Math.min(p[0],q[0])-1e-8&&r[0]<=Math.max(p[0],q[0])+1e-8&&r[1]>=Math.min(p[1],q[1])-1e-8&&r[1]<=Math.max(p[1],q[1])+1e-8;
 const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const u=poly[j],v=poly[i];if(on(u,v,p))return true;if((u[1]>p[1])!==(v[1]>p[1])&&p[0]<(v[0]-u[0])*(p[1]-u[1])/(v[1]-u[1])+u[0])yes=!yes;}return yes;};
 if(a.some(p=>inside(p,b))||b.some(p=>inside(p,a)))return true;
 return a.some((p,i)=>b.some((r,j)=>{const q=a[(i+1)%a.length],s=b[(j+1)%b.length];return (cross(p,q,r)*cross(p,q,s)<0&&cross(r,s,p)*cross(r,s,q)<0)||on(p,q,r)||on(p,q,s)||on(r,s,p)||on(r,s,q);}));
}
function boundFeatherRegion(e,wx,wy,polygon=featherAttackPolygon(wx,wy)){return boundFeatherWeakness(e,wx,wy,polygon)>0;}
function boundFeatherWeakness(e,wx,wy,polygon=featherAttackPolygon(wx,wy)){
 if(e.hp<=0||e.bind<=0)return 0;
 const scale=bindingScale(e);
 const localPolygon=polygon.map(([x,y])=>[(x-e.x)*(e.bindVariant?1:e.face)/scale,(y-(FLOOR+e.y))/scale]);
 if(e.bindVariant===2){if(VINE_HURT_POLYGONS.slice(1).some(region=>featherIntersectsPolygon(localPolygon,region)))return 2;return featherIntersectsPolygon(localPolygon,VINE_HURT_POLYGONS[0])?1:0;}
 // User's green rectangle encloses both exposed soles, with a small margin
 // around the toes and heels. Mummy sprites are not mirrored with facing.
 const mummyScale=MUMMY_HEIGHT/220;
 const regions=e.bindVariant===1?[[-34*mummyScale,-65*mummyScale,36*mummyScale,0]]:e.shirtless?
  [[-43,-203,43,-128],[-32,-35,32,18]]:
  [[-52,-195,-27,-126],[27,-195,52,-126],[-32,-35,32,18]];
 if(featherIntersectsRect(localPolygon,regions[regions.length-1]))return 2;
 return regions.slice(0,-1).some(rect=>featherIntersectsRect(localPolygon,rect))?1:0;
}
function bindingLaughSpeed(e){return e.captive?(e.breakDamage>80?(e.bindVariant===0?1.5:2):e.breakDamage>50?1.5:1):1;}
function boundLaughTextY(e){return FLOOR+e.y+(-bindingHeight(e)+(e.bindVariant===2?48:e.bindVariant?-8:70))*bindingScale(e);}
const bindingVoiceHistory=[];
function playBindingVoice(e){
 const choices=[1,2,3,4,5,6].filter(id=>!bindingVoiceHistory.includes(id)),id=choices[Math.floor(Math.random()*choices.length)];
 if(RyuAudio.play('hit-'+id,{owner:e,channel:'voice',volume:.5,onEnded:()=>{if(e.hp<=0&&paused&&![...RyuAudio.active].some(a=>a.owner?.state==='defeated'&&a.channel==='voice'))audio?.suspend().catch(()=>{});}})){bindingVoiceHistory.push(id);if(bindingVoiceHistory.length>2)bindingVoiceHistory.shift();}
}
function updateFeatherRecovery(e){
 if(RyuAudio.hasLaughClips()){
  if(paused)return;
  RyuAudio.setLaughing(e,e.hp>0&&(e.featherHit||e.bindLaugh>0||e.hands>0||e.state==='laugh'),e.featherHit&&e.featherWeakness===2?'super':'normal');
  e.featherRecoveryPending=false;return;
 }
 if(!e.featherRecoveryPending||(!running&&gameMode!=='prison')||paused)return;
 if(e.hp<=0||e.bind<=0){e.featherRecoveryPending=false;return;}
 if(e.featherHit||e.bindLaugh>0||e.hands>0)return;
 e.featherRecoveryPending=false;
 RyuAudio.play('dizzy',{owner:e,channel:'voice',volume:.5});
}
function setFeatherContact(e,contact,silent=false){
 const previous=e.featherHit;e.featherHit=contact;
 if(contact){e.featherRecoveryPending=false;RyuAudio.stopSound(e,'dizzy');}
 else if(previous&&!silent)e.featherRecoveryPending=true;
 if(silent)e.featherRecoveryPending=false;
 else updateFeatherRecovery(e);
}
function updateMouseFeather(dt,silent=false){
 const targets=gameMode==='prison'?[Dungeon.prisoner].filter(Boolean):gameMode==='battle'?enemies:[];
 const active=(gameMode==='prison'||(gameMode==='battle'&&running))&&!paused&&mouseFeather.inside;
 if(featherCursor)featherCursor.hidden=!active;
 if(!active){mouseFeather.hover=false;if(!paused)for(const e of targets)setFeatherContact(e,false,silent||(!running&&gameMode!=='prison'));return;}
 const wx=mouseFeather.x+camera,wy=mouseFeather.y;
 const nearby=targets.filter(e=>e.hp>0).sort((a,b)=>Math.abs(wx-a.x)-Math.abs(wx-b.x))[0];
 mouseFeather.facing=nearby&&wx<nearby.x?1:-1;
 const flutter=mouseFeather.hover?Math.sin((gameMode==='prison'?Dungeon.time:clock)*Math.PI*2/.8):0;
 mouseFeather.angle=flutter*12;mouseFeather.lift=flutter*4;
 const attackPolygon=featherAttackPolygon(wx,wy);
 const target=targets.find(e=>boundFeatherRegion(e,wx,wy,attackPolygon));
 for(const e of targets){e.featherWeakness=e===target?boundFeatherWeakness(e,wx,wy,attackPolygon):0;setFeatherContact(e,e===target,silent);}
 mouseFeather.hover=!!target;
 if(featherCursor){featherCursor.style.left=(mouseFeather.x/960*100)+'%';featherCursor.style.top=(mouseFeather.y/540*100)+'%';featherCursor.style.setProperty('--feather-facing',String(mouseFeather.facing));featherCursor.style.setProperty('--feather-angle',mouseFeather.angle+'deg');featherCursor.style.setProperty('--feather-lift',mouseFeather.lift+'px');}
 if(target){target.featherHit=true;if(dt>0){if(!(target.featherTextCooldown>0)){emitRyuDialogue(target);}hit(target,(target.featherWeakness===2?4:2)*dt,{continuous:true,feather:true});}}
}
function spark(x,y,color='#e9c7ff',count=8){if(gameMode==='prison'){Dungeon.spark(x,y,color,count);return;}for(let i=0;i<count;i++)effects.push({x,y,vx:(Math.random()-.5)*150,vy:-Math.random()*110,life:.5,color});}
function changeState(e,state,anim=state,duration=0){if(e.state==='attack'&&state!=='idle')RyuAudio.stopOwner(e);e.state=state;e.anim=anim;e.t=0;e.stateLength=duration;e.move=null;e.y=0;}
function idle(e){changeState(e,'idle');e.decision=.14+Math.random()*.2;}
function defeat(e){
 if(e.captive||e.state==='defeated')return;
 if(typeof Dungeon!=='undefined')Dungeon.capture(e);
 const startY=e.y;
 RyuAudio.stopOwner(e);e.featherRecoveryPending=false;e.featherHit=false;
 e.hp=0;e.dead=4.5;e.hands=e.bind=e.stun=0;e.bindElapsed=e.bindLaugh=e.bindLaughElapsed=0;changeState(e,'defeated','fall');
 e.defeatStartY=startY;e.y=startY;playBindingVoice(e);
 if(kills===0)spawnAt=Math.max(spawnAt,player.x+550);
 kills++;player.hp=Math.min(100,player.hp+12);floatText(tr('體力耗盡 · 倒地昏迷'),e.x,245,'#ffdc99');
}
function hit(e,n,{continuous=false,ignoreGuard=false,melee=false,feather=false}={}){
 if(e.hp<=0||!Number.isFinite(n)||n<=0||(feather&&e.bind<=0))return;
 RyuAudio.stopSound(e,'dizzy');
 e.lastHit=0;
 // Captives remain available permanently; feather damage generates the same
 // laughter amount without exhausting their HP.
 if(e.captive){e.breakDamage=Math.min(100,(e.breakDamage||0)+n);Laughter.add(n);return;}
 if(!ignoreGuard&&!continuous&&(e.state==='guard'||e.state==='crouchGuard')&&e.bind<=0){
  Laughter.add(Math.min(e.hp,n*.25));e.hp=Math.max(0,e.hp-n*.25);changeState(e,'guardHit','guardHit',.28);
  spark(e.x+e.face*35,FLOOR-110,'#a4dbe8');floatText(tr('格擋'),e.x,260,'#a4dbe8');tone(350,.08,'triangle');
  if(e.hp<=0)defeat(e);return;
 }
 Laughter.add(Math.min(e.hp,n));e.hp=Math.max(0,e.hp-n);
 if(!continuous){
  combo++;comboTime=2.2;if(!melee)e.balance++;e.hitFlash=.13;
  if(!feather)tone(760,.07,'triangle',.04);spark(e.x,FLOOR-100);
 }
 if(e.hp===0){defeat(e);return;}
 if(feather)return;
 if(e.bind>0){
  if(e.bindLaugh<=0)e.bindLaughElapsed=0;
  e.bindLaugh=Math.max(e.bindLaugh,continuous?.2:BIND_LAUGH_DURATION);
  if(!continuous)emitRyuDialogue(e);
  return;
 }
 // Normal reactions use the SF3 hit poses with a restrained smile.
 if(!continuous){
  if(e.balance>=3&&!e.hands&&!melee){e.balance=0;e.stun=0;changeState(e,'knockdown','fall',.55);}
  else {e.stun=Math.max(e.stun,.7);changeState(e,'laugh','hit');if(!(e.featherTextCooldown>0))emitRyuDialogue(e);}
 }else if(e.state!=='laugh'){changeState(e,'laugh','stagger');}
}
// Repeated clicks extend this gesture; they never reset its clock or hit beat.
function meleeAttack(){
 if(gameMode!=='battle'||!ready||!running||paused||player.hp<=0)return;
 if(player.melee<=0){player.meleeElapsed=0;player.meleeNextHit=.14;}
 player.melee=Math.max(player.melee,MELEE_HOLD);canvas.focus();
}
function updateMelee(dt){
 if(player.melee<=0)return;
 const activeDt=Math.min(dt,player.melee);player.meleeElapsed+=activeDt;player.melee=Math.max(0,player.melee-dt);
 while(player.meleeElapsed+1e-8>=player.meleeNextHit){
  player.meleeNextHit+=MELEE_BEAT;
  const e=enemies.filter(e=>e.hp>0&&(e.x-player.x)*player.face>=0&&(e.x-player.x)*player.face<=MELEE_REACH&&e.y>-85&&!['down','knockdown'].includes(e.state)).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
  if(e){hit(e,5,{melee:true});spark(player.x+player.face*58,FLOOR-112,'#e5c4ff',3);}
 }
}
function wardrobeTarget(){
 if(gameMode==='prison')return paused?null:Dungeon.prisoner;
 if(gameMode!=='battle')return null;
 if(!running||paused)return null;
 return enemies.filter(e=>e.hp>0&&e.bind>0).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0]||null;
}
function toggleWardrobe(){
 const e=wardrobeTarget();if(!e||e.bindVariant!==0)return;
 e.shirtless=!e.shirtless;spark(e.x,FLOOR+e.y-150,'#dcb0ff',12);canvas.focus();updateInteraction();
 updateMouseFeather(0,true);
 if(gameMode==='prison')Dungeon.savePrisoner();
}
function toggleBindingVariant(){
 if(!Laughter.owns(1))return;
 const e=wardrobeTarget();if(!e)return;
 e.bindVariant=e.bindVariant===1?0:1;e.y=bindingY(e);spark(e.x,FLOOR+e.y-150,'#9b8cff',14);canvas.focus();updateInteraction();
 updateMouseFeather(0,true);playBindingVoice(e);
 if(gameMode==='prison')Dungeon.savePrisoner();
}
function toggleVineBinding(){
 if(gameMode!=='prison'||!Laughter.owns(2))return;
 const e=wardrobeTarget();if(!e)return;
 e.bindVariant=e.bindVariant===2?0:2;e.y=bindingY(e);spark(e.x,FLOOR+e.y-190,'#9b8cff',18);canvas.focus();updateInteraction();
 updateMouseFeather(0,true);playBindingVoice(e);
 if(gameMode==='prison')Dungeon.savePrisoner();
}
function updateInteraction(){
 const title=gameMode==='battle'&&!running;
 $('#laughter-bank').hidden=title;$('#laughter-bank').disabled=title;
 $('#dungeon-open').hidden=title||!ready||gameMode!=='battle';$('#dungeon-open').disabled=title;
 $('#new-game').disabled=!ready;
 if(title){$('#magic-available').hidden=true;$('#shop-guide-arrow').hidden=true;}
 const button=$('#wardrobe'),variantButton=$('#binding-variant'),vineButton=$('#binding-vine'),e=wardrobeTarget();
 button.hidden=!e||gameMode!=='battle'||e.bindVariant!==0;
 if(variantButton)variantButton.hidden=!e||gameMode!=='battle'||!Laughter.owns(1);
 if(vineButton)vineButton.hidden=true;
 if(gameMode==='prison'){Dungeon.updateControls();return;}
 if(!e)return;
 button.textContent=e.shirtless?tr('恢復上衣 · E'):tr('切換無上衣 · E');
 button.style.left=Math.min(88,Math.max(12,(e.x-camera)/960*100))+'%';
 // Stack from the bottom in CSS pixels so the third button stays reachable
 // even when the canvas is scaled down. Do not follow the character's bob.
 const controls=[button,variantButton].filter(control=>control&&!control.hidden);
 let bottom=8;
 for(let i=controls.length-1;i>=0;i--){const control=controls[i];control.style.left=button.style.left;control.style.top='auto';control.style.bottom=bottom+'px';control.style.transform='translateX(-50%)';bottom+=(control.getBoundingClientRect?.().height||40)+6;}
 if(variantButton)variantButton.textContent=e.bindVariant===1?tr('恢復普通禁錮'):tr('切換木乃伊禁錮');
 if(vineButton)vineButton.textContent=e.bindVariant===2?tr('恢復普通禁錮'):tr('切換藤蔓禁錮');
}
function bindEnemy(e){
 if(e.hp<=0||e.bind>0)return;
 changeState(e,'bound','idle');e.bind=BIND_DURATION;e.bindElapsed=0;e.bindLaugh=e.bindLaughElapsed=0;e.y=bindingY(e);
 e.featherRecoveryPending=false;e.boundDialogueCooldown=1.2;playBindingVoice(e);
 spark(e.x,FLOOR-100,'#bd82ff',15);
}
function bindingHurtboxes(e){
 if(e.bind>0)return [[e.x-(e.bindVariant===2?78:e.bindVariant?40:52),FLOOR+e.y-bindingHeight(e),e.x+(e.bindVariant===2?78:e.bindVariant?40:52),FLOOR+e.y]];
 if(e.state==='laugh')return [[e.x-32,FLOOR+e.y-170,e.x+32,FLOOR+e.y]];
 const boxes=RyuAssets.boxes(e.anim,e.state==='attack'?Math.max(0,e.t-MOVES[e.move].windup):e.t,e.x,FLOOR+e.y,e.face,'hurt',e.state==='idle');
 // Intro/recovery AIR frames may omit combat boxes but still accept magic.
 return boxes.length?boxes:[[e.x-32,FLOOR+e.y-170,e.x+32,FLOOR+e.y]];
}
function updateBindingShots(dt){
 if(!running||paused||dt<=0)return;
 for(const p of bindingShots){
  const distance=Math.min(BIND_RING_SPEED*dt,p.remaining),end=p.x+p.dir*distance;
  let target=null,first=Infinity;
  // Sweep the whole flight segment, selecting the first geometric contact,
  // independent of enemy array order; one ring stops at one enemy.
  for(const e of enemies){
   if(e.hp<=0)continue;
   for(const b of bindingHurtboxes(e)){
    if(p.y+BIND_RING_RADIUS<b[1]||p.y-BIND_RING_RADIUS>b[3])continue;
    const near=p.dir>0?b[0]-BIND_RING_RADIUS:b[2]+BIND_RING_RADIUS;
    const far=p.dir>0?b[2]+BIND_RING_RADIUS:b[0]-BIND_RING_RADIUS;
    const entry=Math.max(0,(near-p.x)*p.dir);
    if((far-p.x)*p.dir>=0&&entry<=distance&&entry<first){first=entry;target=e;}
   }
  }
  p.t+=dt;p.remaining-=distance;
  if(target){p.x+=p.dir*first;bindEnemy(target);spark(p.x,p.y,'#dcc2ff',10);p.remaining=0;}
  else p.x=end;
 }
 bindingShots=bindingShots.filter(p=>p.remaining>0);
}
function cast(i,aimX=null){
 if(gameMode!=='battle'||!running||paused||player.cd[i]>0)return;
 if(i===1&&Number.isFinite(aimX)&&aimX!==player.x)player.face=aimX<player.x?-1:1;
 player.cast=.4;player.cd[i]=[.48,0,4][i];tone([850,180,450][i],.2,i===1?'triangle':'sine');
 if(i===1){
  bindingShots.push({x:player.x+player.face*32,y:FLOOR-104,dir:player.face,remaining:BIND_RING_REACH-32,t:0});
  return;
 }
 if(i===0){shots.push({x:player.x+player.face*40,y:FLOOR-104,dir:player.face,life:1.3});return;}
 let found=false;
 for(const e of enemies){const dx=e.x-player.x;
  if(e.hp<=0||Math.abs(dx)>=190||dx*player.face<-30||e.y<-85)continue;
  found=true;
  e.hands=2.8;e.stun=2.8;
  if(e.bind<=0)changeState(e,'laugh','stagger');
  emitRyuDialogue(e);
 }
 if(!found)floatText(tr('靠近並面向對手'),player.x,270,'#bba9d1');
}
function dash(){if(gameMode==='battle'&&player.dash<=0&&running&&!paused){player.dash=1.3;player.inv=.42;player.x=Math.max(70,player.x+player.face*138);tone(210,.1);}}
function hurtPlayer(amount){
 if(player.inv>0||!running)return false;
 player.hp=Math.max(0,player.hp-amount);player.inv=.85;shake=.16;
 spark(player.x,FLOOR-105,'#ffba98');tone(95,.16,'sawtooth');
 if(player.hp<=0)gameover();return true;
}
function gameover(){
 RyuAudio.stopAll();
 ended=true;running=false;keys.clear();$('#overlay').hidden=false;
 $('#overlay h1').innerHTML=tr('魔力需要<br><em>休息一下。</em>');
 $('#overlay p').textContent=tr('本次探索 {meters} 米 · 擊敗 {kills} 位對手',{meters:Math.floor(world/10),kills});
 $('#start').innerHTML=tr('再來一次 <span>↵</span>');$('#load').textContent=tr('用禁錮打斷起手；看到波動拳時，閃避穿過。');
 for(const e of enemies)if(e.hp>0)changeState(e,'victory','victory');
}
function beginMove(e,name){
 changeState(e,'attack',name);e.move=name;e.face=player.x<e.x?-1:1;e.hitDone=e.castDone=false;
 e.attackVoiceDone=e.attackSwingDone=false;
 const frames=RyuAssets.clips[name].frames;let ticks=0;e.attackSwingAt=0;
 for(const frame of frames){if(frame.hit?.length){e.attackSwingAt=ticks/60;break;}ticks+=frame.ticks;}
 e.cool=.48+Math.random()*.42;
 if(['hadouken','shoryuken','tatsu'].includes(name))e.special=3.1+Math.random()*1.8;
}
function pick(values){return values[Math.floor(Math.random()*values.length)];}
function chooseAction(e){
 const dist=Math.abs(player.x-e.x);e.face=player.x<e.x?-1:1;
 const busy=enemies.some(o=>o!==e&&o.hp>0&&o.state==='attack'&&Math.abs(o.x-player.x)<220);
 const incoming=shots.find(p=>p.dir*(e.x-p.x)>0&&Math.abs(e.x-p.x)<230);
 if(incoming&&e.reaction<=0){
  e.reaction=1.25;const roll=Math.random();
  if(roll<.42){changeState(e,Math.random()<.35?'crouchGuard':'guard',undefined,.65);return;}
  if(roll<.67){changeState(e,'backdash','backdash',.45);return;}
  if(roll<.82&&dist<340&&!busy){beginMove(e,'jumpKick');return;}
 }
 if(e.decision>0)return;
 e.decision=.3+Math.random()*.28;
 if(dist>410){changeState(e,'dash','dash',.5);return;}
 if(dist>210){
  if(!busy&&e.special<=0&&Math.random()<.5){beginMove(e,'hadouken');return;}
  if(!busy&&e.cool<=0&&Math.random()<.3){beginMove(e,'jumpKick');return;}
  e.posture='walk';return;
 }
 if(dist>135){
  if(!busy&&e.cool<=0){
   if(e.special<=0&&Math.random()<.35)beginMove(e,'tatsu');
   else if(dist<172)beginMove(e,pick(['sideKick','roundhouse','highKick','sweep']));
   else {changeState(e,'dash','dash',.3);}
  }else e.posture='walk';return;
 }
 if(!busy&&e.cool<=0){
  if(e.special<=0&&dist<100&&Math.random()<.28)beginMove(e,'shoryuken');
  else beginMove(e,dist>100?pick(['sideKick','roundhouse','heavyPunch','lowKick']):pick(['jab','straight','heavyPunch','hook','lightKick','crouchPunch','lowKick','sweep']));
  return;
 }
 const roll=Math.random();
 if(dist<66&&roll<.5){changeState(e,'backdash','backdash',.4);return;}
 if(roll<.3){changeState(e,'guard','guard',.45);return;}
 if(roll<.48){changeState(e,'crouchGuard','crouchGuard',.45);return;}
 e.posture=dist<90?'back':dist>110?'walk':'idle';
}
function intersects(a,b){return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];}
function updateEnemy(e,dt){
 if(e.hp<=0){
  e.dead-=dt;e.t+=dt;
  const u=Math.min(1,e.t/DEFEAT_FALL_DURATION);
  e.y=e.defeatStartY*(1-u)-Math.sin(u*Math.PI)*18;
  if(u===1){e.y=0;e.anim='down';}
  return;
 }
 e.cool-=dt;e.special-=dt;e.reaction-=dt;e.decision-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.bindLaugh=Math.max(0,e.bindLaugh-dt);
 e.featherTextCooldown=Math.max(0,(e.featherTextCooldown||0)-dt);
 const previousQuiet=e.lastHit;e.lastHit+=dt;
 if(!e.featherHit&&e.hands<=0)e.hp=Math.min(100,e.hp+3*(Math.max(0,e.lastHit-3)-Math.max(0,previousQuiet-3)));
 if(e.hands>0){
  e.hands=Math.max(0,e.hands-dt);hit(e,dt*20,{continuous:true,ignoreGuard:true});
  if(e.hp<=0)return;
  if(!(e.featherTextCooldown>0))emitRyuDialogue(e);
 }
 if(e.bind>0){
  e.bind=Math.max(0,e.bind-dt);e.bindElapsed+=dt;if(e.bindLaugh>0||e.featherHit)e.bindLaughElapsed+=dt;e.stun=Math.max(0,e.stun-dt);
  e.y=bindingY(e);
  if(e.bind<1e-6){
   RyuAudio.stopOwner(e);e.featherRecoveryPending=false;e.featherHit=false;
   e.bind=0;e.bindElapsed=e.bindLaugh=e.bindLaughElapsed=0;spark(e.x,FLOOR-85,'#bd82ff');
   if(e.hands>0)changeState(e,'laugh','stagger');else changeState(e,'recover','stagger',.26);
   RyuAudio.play('dizzy',{owner:e,channel:'voice',volume:.5});
  }
  updateBoundDialogue(e,dt);updateFeatherRecovery(e);return;
 }
 e.t+=dt;e.stun=Math.max(0,e.stun-dt);
 if(e.state==='laugh'){
  e.anim=e.t<.18?'hit':'stagger';
  if(e.stun<=0&&e.hands<=0){changeState(e,'recover','stagger',.26);e.cool=.35;}
  return;
 }
 if(e.state==='knockdown'){
  e.y=-Math.sin(Math.min(1,e.t/.55)*Math.PI)*30;
  if(e.t>=.55)changeState(e,'down','down',.28);return;
 }
 if(e.state==='down'){if(e.t>=e.stateLength)changeState(e,'recover','getup',RyuAssets.duration('getup'));return;}
 if(e.state==='attack'){
  const m=MOVES[e.move],at=e.t-m.windup,duration=RyuAssets.duration(e.move);
  if(at<0)return;
  const attackSound=RYU_ATTACK_AUDIO[e.move];
  if(!e.attackVoiceDone){
   e.attackVoiceDone=true;
   if(attackSound)RyuAudio.play(attackSound.voice||'grunt-'+Math.floor(Math.random()*3),{owner:e,channel:'voice',volume:attackSound.voice ? .5 : .25});
  }
  if(!e.attackSwingDone&&at>=e.attackSwingAt){
   e.attackSwingDone=true;if(attackSound?.swing)RyuAudio.play('swing-'+attackSound.swing,{owner:e,volume:.24});
  }
  if(e.move==='jumpKick'){
   const u=Math.min(1,at/duration);e.y=-Math.sin(u*Math.PI)*115;e.x+=e.face*205*dt;
  }else if(e.move==='shoryuken'){
   const u=Math.min(1,at/duration);e.y=-Math.sin(u*Math.PI)*80;e.x+=e.face*65*dt;
  }else if(e.move==='tatsu'){
   const u=Math.min(1,at/duration);e.y=-Math.sin(u*Math.PI)*36;e.x+=e.face*200*dt;
  }
  if(e.move==='hadouken'&&!e.castDone&&at>=.24){
   e.castDone=true;enemyShots.push({x:e.x+e.face*68,y:FLOOR-90,dir:e.face,life:2.4,t:0,ended:0,damage:m.damage});RyuAudio.play('hadouken-launch',{owner:e,volume:.32});
  }
  if(!e.hitDone&&at<duration&&e.move!=='hadouken'){
   const boxes=RyuAssets.boxes(e.move,at,e.x,FLOOR+e.y,e.face,'hit');
   const hurt=[player.x-27,FLOOR-152,player.x+27,FLOOR];
   if(boxes.some(b=>intersects(b,hurt))){e.hitDone=true;if(hurtPlayer(m.damage)&&attackSound)RyuAudio.play('impact-'+attackSound.impact,{volume:.36});}
  }
  if(at>=duration+.12){idle(e);e.cool=.4+Math.random()*.4;}
  return;
 }
 if(e.state==='dash'||e.state==='backdash'){
  e.x+=e.face*(e.state==='dash'?310:-260)*dt;
  if(e.t>=e.stateLength)idle(e);return;
 }
 if(['intro','recover','guard','crouchGuard','guardHit'].includes(e.state)){
  if(e.t>=e.stateLength)idle(e);return;
 }
 chooseAction(e);
 if(e.state==='idle'){
  e.anim=e.posture;const speed=e.posture==='walk'?125:e.posture==='back'?-85:0;
  e.x+=e.face*speed*dt;
 }
}
function update(dt){
 if(gameMode!=='battle'){if(!paused)Dungeon.update(dt);return;}
 if(paused||!running)return;
 clock+=dt;player.cast=Math.max(0,player.cast-dt);player.inv=Math.max(0,player.inv-dt);player.dash=Math.max(0,player.dash-dt);shake=Math.max(0,shake-dt);
 player.cd=player.cd.map(v=>Math.max(0,v-dt));comboTime-=dt;if(comboTime<=0)combo=0;
 const dir=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 player.moving=dir!==0;if(dir){player.face=dir;player.x=Math.max(65,player.x+dir*190*dt);}
 if(keys.has('j'))cast(0);if(keys.has('l'))cast(2);
 camera=Math.max(0,player.x-300);world=Math.max(world,player.x-220);
 if(kills>0&&player.x+680>spawnAt&&enemies.filter(e=>e.hp>0).length<3){enemies.push(enemy(spawnAt));spawnAt+=560+Math.random()*150;}
 updateMelee(dt);updateMouseFeather(dt);
 for(const e of enemies){updateEnemy(e,dt);if(!running)break;}
 updateBindingShots(dt);
 for(const p of shots){
  const old=p.x;p.x+=p.dir*510*dt;p.life-=dt;
  for(const e of enemies){
   if(e.hp<=0)continue;
   let boxes=RyuAssets.boxes(e.anim,e.state==='attack'?Math.max(0,e.t-MOVES[e.move].windup):e.t,e.x,FLOOR+e.y,e.face,'hurt',e.state==='idle');
   if(e.state==='laugh'||e.bind>0)boxes=[[e.x-32,FLOOR+e.y-170,e.x+32,FLOOR+e.y]];
   const swept=[Math.min(old,p.x)-10,p.y-10,Math.max(old,p.x)+10,p.y+10];
   if(boxes.some(b=>intersects(b,swept))){hit(e,18);p.life=0;break;}
  }
 }
 for(const p of enemyShots){
  p.t+=dt;p.life-=dt;if(p.ended){p.ended+=dt;continue;}
  const old=p.x;p.x+=p.dir*340*dt;
  if(intersects([Math.min(old,p.x)-22,p.y-20,Math.max(old,p.x)+22,p.y+20],[player.x-25,FLOOR-152,player.x+25,FLOOR])){
   if(hurtPlayer(p.damage)){p.ended=.001;p.t=0;RyuAudio.play('impact-7',{volume:.36});}
  }
  for(const f of shots)if(f.life>0&&Math.abs(f.x-p.x)<35){f.life=0;p.ended=.001;p.t=0;spark(p.x,p.y,'#9bdfff');break;}
 }
 shots=shots.filter(p=>p.life>0);enemyShots=enemyShots.filter(p=>p.life>0&&p.ended<.22);
 enemies=enemies.filter(e=>(e.hp>0||e.dead>0)&&(kills===0||e.x>player.x-1000));
 for(const p of effects){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}
 effects=effects.filter(p=>p.life>0);
 for(const t of texts)advanceCaption(t,dt);texts=texts.filter(t=>t.life>0);
 for(let i=0;i<3;i++){const label=$('#cd'+i);if(label)label.textContent=player.cd[i]>.05?player.cd[i].toFixed(1)+'s':tr('就緒');}
}
function text(t,x,y,size=15,color='#eee5ff',align='left'){ctx.font=`bold ${size}px "Microsoft YaHei", sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(t,x,y);ctx.textAlign='left';}
function bar(x,y,w,p,color){ctx.fillStyle='#110f20';ctx.fillRect(x-2,y-2,w+4,12);ctx.fillStyle='#3b2e48';ctx.fillRect(x,y,w,8);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,p),8);}
function actor(i,x,face,unused=false,bob=0){
 if(!sprites[i])return;const s=sprites[i],h=i===7?108:174,w=s.width/s.height*h;
 ctx.save();ctx.translate(Math.round(x-camera),FLOOR+bob);ctx.scale(face,1);ctx.drawImage(s,-w/2,-h,w,h);ctx.restore();
}
function drawBinding(e){
 const scale=bindingScale(e),x=e.x-camera,y=FLOOR+e.y;
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-x,-y);drawBindingSprite(e);ctx.restore();
}
function drawBindingSprite(e){
 const sequence=[0,1,2,1,0,3,2,3];
 if(e.bindVariant===2){
  const laughing=e.bindLaugh>0||e.featherHit;
  const frames=laughing?vineLaughFrames:vineFrames;
  const fps=(laughing?vineLaughLayout:vineBindingLayout).fps*(laughing?1.5:1);
  const i=Math.floor((laughing?e.bindLaughElapsed:e.bindElapsed)*fps)%frames.length,sprite=frames[i];
  if(!sprite)return;
  const w=sprite.width/sprite.height*VINE_HEIGHT;ctx.save();ctx.translate(Math.round(e.x-camera),Math.round(FLOOR+e.y));ctx.drawImage(sprite,-w/2,-VINE_HEIGHT,w,VINE_HEIGHT);ctx.restore();return;
 }
 if(e.bindVariant===1){
  const laughing=e.bindLaugh>0||e.featherHit;
  const frames=laughing?mummyLaughFrames:mummyFrames;
  const i=Math.floor(laughing?e.bindLaughElapsed*8:e.bindElapsed*6)%frames.length,sprite=frames[i];
  if(!sprite)return;
  // Suspended mummy poses face the camera; keep ribbon tails screen-left.
  const w=sprite.width/sprite.height*MUMMY_HEIGHT;ctx.save();ctx.translate(Math.round(e.x-camera),Math.round(FLOOR+e.y));ctx.drawImage(sprite,-w/2,-MUMMY_HEIGHT,w,MUMMY_HEIGHT);ctx.restore();return;
 }
 const laughing=e.bindLaugh>0||e.featherHit;
 const i=sequence[Math.floor((laughing?e.bindLaughElapsed*9:e.bindElapsed*5))%sequence.length],sprite=(e.shirtless?(laughing?bareLaughFrames:bareBindingFrames):(laughing?bindingLaughFrames:bindingFrames))[i];if(!sprite)return;
 const w=sprite.width/sprite.height*BIND_HEIGHT;
 ctx.save();ctx.translate(Math.round(e.x-camera),Math.round(FLOOR+e.y));ctx.scale(e.face,1);
 ctx.drawImage(sprite,-w/2,-BIND_HEIGHT,w,BIND_HEIGHT);ctx.restore();
}
function drawNormalHit(e){
 const sequence=[2,3,2,3],i=e.t<.09?0:e.t<.18?1:sequence[Math.floor((e.t-.18)*9)%sequence.length];
 const sprite=(e.shirtless?bareHitFrames:normalHitFrames)[i];if(!sprite)return;
 const scale=RyuAssets.scale;
 ctx.save();ctx.translate(Math.round(e.x-camera),Math.round(FLOOR+e.y));ctx.scale(e.face*scale,scale);
 ctx.drawImage(sprite,0,0,sprite.width,sprite.height,-64,-112,128,128);ctx.restore();
}
function drawEnemy(e){
 const x=e.x-camera;if(x<-200||x>1160)return;
 ctx.fillStyle='#07081570';ctx.beginPath();ctx.ellipse(x,FLOOR+(e.captive?e.y:0)+1,Math.max(20,(e.hp<=0?90:48)+e.y*.15)*bindingScale(e),8,0,0,Math.PI*2);ctx.fill();
 const laughing=e.state==='laugh'&&e.bind<=0;
 if(e.hp<=0){
  const falling=e.t<DEFEAT_FALL_DURATION;
  RyuAssets.draw(ctx,falling?'fall':'down',falling?e.t/DEFEAT_FALL_DURATION*RyuAssets.duration('fall'):0,x,FLOOR+e.y,e.face,{shirtless:e.shirtless});
 }
 else if(e.bind>0){drawBinding(e);}
 else if(laughing){drawNormalHit(e);}
 else {
  let name=e.anim,time=e.t,loop=e.state==='idle'||e.state==='guard'||e.state==='crouchGuard';
  if(e.state==='attack'){const windup=MOVES[e.move].windup;name=e.t<windup?'idle':e.move;time=Math.max(0,e.t-windup);}
  RyuAssets.draw(ctx,name,time,x,FLOOR+e.y,e.face,{loop,shirtless:e.shirtless});
 }
 if(e.hp>0&&!e.captive){
  const top=e.bind>0?FLOOR+e.y-bindingHeight(e)+(e.bindVariant===2?0:e.bindVariant?-48:-24):232+e.y;bar(x-43,top+10,86,e.hp/100,'#52c878');
  const label=e.bind>0?tr('禁錮 ')+e.bind.toFixed(1)+'s':laughing?tr('忍笑…'):e.state==='attack'?tr(MOVES[e.move].label):e.state==='guard'||e.state==='crouchGuard'||e.state==='guardHit'?tr('防禦'):e.state==='recover'?tr('起身調整'):tr('隆');
  text(label,x,top,12,e.bind>0?'#d9bbff':'#f1dfd0','center');
  if(e.state==='attack'&&e.t<MOVES[e.move].windup){text('!',x,top-23,22,'#ffb68c','center');}
 }
 if(e.hands>0){for(let j=0;j<2;j++){const hx=x+(j?1:-1)*(42+Math.sin(clock*18)*8);ctx.save();ctx.shadowColor='#d79aff';ctx.shadowBlur=15;text('✋',hx,338+Math.cos(clock*12+j)*15,24,'#deb9ff','center');ctx.restore();}}
}
function drawMelee(){
 const i=player.meleeElapsed<.1?0:1+Math.floor((player.meleeElapsed-.1)*12)%3;
 const sprite=meleeFrames[i];if(!sprite)return;
 const scale=174/395*2;
 ctx.save();ctx.translate(Math.round(player.x-camera),FLOOR);ctx.scale(player.face*scale,scale);
 ctx.drawImage(sprite,-128,-223.5,256,256);ctx.restore();
}
function drawBackground(){
 if(!bg.complete||!bg.naturalWidth||!alleyLoop.complete||!alleyLoop.naturalWidth)return;
 const height=540,entranceWidth=bg.naturalWidth*height/bg.naturalHeight;
 const loopWidth=alleyLoop.naturalWidth*height/alleyLoop.naturalHeight;
 const offset=Math.max(0,Math.floor(camera*.65));
 if(offset<entranceWidth)ctx.drawImage(bg,-offset,0,entranceWidth,height);
 // The entrance exists only at world origin. Subsequent panels always face forward.
 let x=entranceWidth-offset;
 if(x<0)x=-((offset-entranceWidth)%loopWidth);
 for(;x<960;x+=loopWidth)ctx.drawImage(alleyLoop,x,0,loopWidth,height);
}
// Small raster frames keep rotation, glow and rune edges on the pixel grid.
const bindingRingFrames=Array.from({length:16},(_,frame)=>{
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 const phase=frame/16*Math.PI*2;
 const dot=(x,y,size,color)=>{g.fillStyle=color;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,size,size);};
 for(let j=0;j<48;j++){
  const a=j/48*Math.PI*2,x=30+Math.cos(a)*15,y=30+Math.sin(a)*19;
  dot(x-2,y-2,6,'#542895');dot(x,y,3,'#b26af4');
  if(Math.sin(a*3-phase*2)>.25)dot(x,y,2,'#f1d6ff');
 }
 for(let j=0;j<4;j++){
  const a=phase+j*Math.PI/2,x=30+Math.cos(a)*22,y=30+Math.sin(a)*22;
  dot(x-3,y-3,6,'#7139b9');dot(x-1,y-3,2,'#e7c0ff');dot(x-3,y-1,6,'#e7c0ff');
 }
 return c;
});
function drawBindingRing(p){
 const x=p.x-camera;
 for(let i=3;i>=1;i--){ctx.globalAlpha=.12*(4-i);ctx.fillStyle='#aa65f2';ctx.fillRect(Math.round(x-p.dir*(23+i*8)),Math.round(p.y-2+(i%2)*4),6,3);}
 ctx.globalAlpha=1;
 const sprite=bindingRingFrames[Math.floor(p.t*24)%bindingRingFrames.length];
 ctx.drawImage(sprite,Math.round(x-32),Math.round(p.y-32));
}
function draw(){
 if(gameMode!=='battle'){Dungeon.draw();return;}
 ctx.clearRect(0,0,960,540);ctx.fillStyle='#171125';ctx.fillRect(0,0,960,540);
 ctx.save();if(shake>0)ctx.translate(Math.sin(clock*100)*3,0);
 drawBackground();
 ctx.fillStyle='#100e252b';ctx.fillRect(0,0,960,540);
 for(let i=0;i<17;i++){const x=(i*83-camera*.3+96000)%960,y=110+(i*79)%320;ctx.globalAlpha=.25+.2*Math.sin(clock+i);ctx.fillStyle='#d9b2ff';ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;
 if(ready){
  if(running||clock>0){for(const e of enemies)drawEnemy(e);}
  else {RyuAssets.draw(ctx,'idle',performance.now()/1000,695,FLOOR,-1,{loop:true});}
 }
 ctx.fillStyle='#07081570';ctx.beginPath();ctx.ellipse(player.x-camera,FLOOR+1,43,8,0,0,Math.PI*2);ctx.fill();
 if(!(player.inv>0&&Math.floor(clock*18)%2)){
  if(player.melee>0)drawMelee();else actor(player.cast>0?2:player.moving?(Math.floor(clock*8)%2?1:3):0,player.x,player.face,false,player.moving?Math.sin(clock*16):0);
 }
 for(const p of shots){ctx.save();ctx.translate(p.x-camera,p.y+Math.sin(clock*18)*4);ctx.scale(p.dir,1);ctx.shadowColor='#d69cff';ctx.shadowBlur=18;text('❧',0,0,40,'#edceff','center');ctx.restore();}
 for(const p of bindingShots)drawBindingRing(p);
 for(const p of enemyShots)RyuAssets.draw(ctx,p.ended?'fireballEnd':'fireball',p.t,p.x-camera,p.y,p.dir,{loop:!p.ended,scale:1.4});
 for(const p of effects){ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x-camera,p.y,4,4);}ctx.globalAlpha=1;
 for(const t of texts)drawCaption(t);ctx.globalAlpha=1;ctx.restore();
 ctx.fillStyle='#100d20dc';ctx.fillRect(22,20,255,67);text(tr('黑袍巫師'),37,44,16);text(tr('體力'),37,72,11,'#ae9abd');bar(73,62,180,player.hp/100,'#bf98ec');text(Math.ceil(player.hp)+'',253,44,13,'#d7c0f6','right');
 ctx.fillStyle='#100d20cc';ctx.fillRect(663,20,135,67);text(String(kills).padStart(2,'0'),678,52,24,'#f2d59e');text(tr('已擊敗'),717,48,11,'#bba5c8');text(Math.floor(world/10)+' m',781,73,13,'#e8daf8','right');
 text(tr('都市夜巷'),480,38,13,'#e8d7f7','center');text('— SF III RYU —',480,58,11,'#ad8bcb','center');
 if(combo>1&&comboTime>0)text(combo+tr(' 連擊'),42,139,25,'#edcba2');
 if(running&&kills>0)text('GO →',880,480+Math.sin(clock*3)*3,18,'#e8c390','center');
}
let accumulator=0;
function frame(t){
 Laughter.tick();
 if(!paused&&(running||gameMode==='prison')){for(const e of gameMode==='prison'?[Dungeon.prisoner].filter(Boolean):enemies)updateFeatherRecovery(e);RyuAudio.tickReactions();}
 if(typeof Onboarding!=='undefined')Onboarding.tick();
 if(typeof MagicShop!=='undefined')MagicShop.tick();
 syncFeatherMetrics();
 const dt=Math.min((t-last)/1000||0,.1);last=t;
 if((running||gameMode!=='battle')&&!paused){accumulator+=dt;while(accumulator>=1/120&&(running||gameMode!=='battle')&&!paused){update(1/120);accumulator-=1/120;}}else accumulator=0;
 updateMouseFeather(0);canvas.style.cursor=(gameMode==='prison'||gameMode==='battle'&&running)&&!paused?'none':'';draw();updateInteraction();requestAnimationFrame(frame);
}requestAnimationFrame(frame);
function trackFeather(e){
 if(e.pointerType&&e.pointerType!=='mouse')return;
 syncFeatherMetrics();
 const r=canvas.getBoundingClientRect();mouseFeather.x=(e.clientX-r.left)/r.width*960;mouseFeather.y=(e.clientY-r.top)/r.height*540;mouseFeather.inside=true;updateMouseFeather(0);
}
canvas.onpointermove=canvas.onpointerenter=trackFeather;
canvas.onpointerleave=canvas.onpointercancel=()=>{mouseFeather.inside=false;updateMouseFeather(0);};
canvas.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();trackFeather(e);cast(1,mouseFeather.x+camera);canvas.focus();};
$('#melee').onclick=meleeAttack;$('#wardrobe').onclick=e=>{e.stopPropagation();toggleWardrobe();};$('#binding-variant').onclick=e=>{e.stopPropagation();toggleBindingVariant();};$('#binding-vine').onclick=e=>{e.stopPropagation();toggleVineBinding();};
$('#start').onclick=start;$('#pause').onclick=pause;$('#resume').onclick=pause;$('#restart').onclick=start;
$('#new-game').onclick=newGame;
$('#sound').onclick=()=>{sound=!sound;RyuAudio.setEnabled(sound);$('#sound').textContent=tr(sound?'♫ 音效：開':'♫ 音效：關');$('#sound').setAttribute('aria-label',tr(sound?'關閉音效':'開啟音效'));if(sound){unlockGameAudio();if(!paused)tone(700);}else audio?.suspend().catch(()=>{});};
window.addEventListener('keydown',e=>{
 if(typeof Onboarding!=='undefined'&&Onboarding.active)return;
 if(typeof MagicShop!=='undefined'&&MagicShop.isOpen)return;
 if(e.target.closest?.('button')&&['enter',' '].includes(e.key.toLowerCase()))return;
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.closest?.('[data-language]'))return;
 if(gameMode!=='battle'){
  const k=e.key.toLowerCase();
  if(['escape','p','e'].includes(k)){e.preventDefault();if(e.repeat)return;if(k==='escape')Dungeon.back();else if(k==='e')toggleWardrobe();else if(gameMode==='prison')pause();}
  return;
 }
 const k=e.key.toLowerCase();if([' ','arrowleft','arrowright','j','k','l','a','d','enter','escape','p','e'].includes(k))e.preventDefault();
 if(k==='k'&&!e.repeat)cast(1);
 if(k==='e'&&!e.repeat)toggleWardrobe();if(k==='enter'&&!running)start();if((k==='escape'||k==='p')&&!e.repeat)pause();if(k===' ')dash();keys.add(k);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();if(gameMode!=='collection'&&(running||gameMode==='prison')&&!paused)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&gameMode!=='collection'&&(running||gameMode==='prison')&&!paused)pause();});
document.querySelectorAll('[data-spell]').forEach(b=>b.onclick=()=>cast(+b.dataset.spell));
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(b.dataset.key===' ')dash();else keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);});
if(document.modelContext?.registerTool){
 const tools=[{name:'read_game_status',description:'讀取當前遊戲體力、擊敗數量、探索距離、暫停狀態與敵人動作',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({running,paused,stamina:Math.ceil(player.hp),defeated:kills,meters:Math.floor(world/10),meleeActive:player.melee>0,enemies:enemies.filter(e=>e.hp>0).map(e=>({stamina:Math.ceil(e.hp),shirtless:e.shirtless,state:e.state,move:e.move,boundSeconds:Math.max(0,e.bind),boundReaction:e.bind>0?((e.bindLaugh>0||e.featherHit)?'laugh':'struggle'):null}))})},
 {name:'set_game_paused',description:'暫停或繼續正在進行的冒險',inputSchema:{type:'object',properties:{paused:{type:'boolean'}},required:['paused'],additionalProperties:false},execute:input=>{if(typeof input.paused!=='boolean')throw Error('paused 必須是布林值');if(!running)throw Error('請先開始冒險');if(paused!==input.paused)pause();return{paused};}}];
 for(const t of tools)try{Promise.resolve(document.modelContext.registerTool(t)).catch(()=>{});}catch{}
}

function refreshLanguage(){
 Laughter.render();
 $('#pause').textContent=tr(paused?'▶ 繼續':'Ⅱ 暫停');
 $('#sound').textContent=tr(sound?'♫ 音效：開':'♫ 音效：關');
 $('#sound').setAttribute?.('aria-label',tr(sound?'關閉音效':'開啟音效'));
 $('#overlay h1').innerHTML=ended?tr('魔力需要<br><em>休息一下。</em>'):tr('今夜，讓對手')+'<br><em>'+tr('笑著認輸。')+'</em>';
 $('#overlay p').innerHTML=ended?tr('本次探索 {meters} 米 · 擊敗 {kills} 位對手',{meters:Math.floor(world/10),kills}):tr('點擊滑鼠，發射禁錮魔法。')+'<br>'+tr('移動羽毛滑鼠，對禁錮的敵人進行搔癢攻擊。');
 $('#start').innerHTML=ended?tr('再來一次 <span>↵</span>'):tr('開始冒險')+' <span>↵</span>';
 $('#load').textContent=tr(ended?'用禁錮打斷起手；看到波動拳時，閃避穿過。':loadFailed?'素材載入失敗，請重新整理重試':ready?'隆的戰鬥動作已就緒 · 按 Enter 開始':'正在喚醒魔法…');
 for(let i=0;i<3;i++){const label=$('#cd'+i);if(label)label.textContent=player.cd[i]>.05?player.cd[i].toFixed(1)+'s':tr('就緒');}
 updateInteraction();
 if(typeof Dungeon!=='undefined')Dungeon.refresh();
}
refreshLanguage();

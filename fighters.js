'use strict';
// Original SFF pixels + AIR timing/pivots/boxes. CNS move behaviour is ported
// explicitly below; this is not a MUGEN script interpreter.
const EnemyRoster=(()=>{
 const common={idle:[0],walk:[20],back:[21],guard:[130],crouchGuard:[131],guardHit:[150],hit:[5000,5001],stagger:[5030],fall:[5100],down:[5110],getup:[5120],dizzy:[5300],victory:[181]};
 const roster={
  'red-ranger':{name:'紅戰士',author:'Chuchoryu',mummyIdentity:'Adult later-life Jason Lee Scott',hasMummy:true,scale:1.7,color:'#fa5159',style:'sword',walk:135,guardChance:.25,
   definitions:{dash:[101],backdash:[106],intro:[190],dizzy:[5000,5001],redJab:[200],redPunch:[220],redKick:[230],redHighKick:[250],redLowKick:[430],redSweep:[450],redSword:[1050],redRush:[1100],redPowerKick:[1200],redWave:[3000],fireball:[2010],fireballEnd:[2010]},
   close:['redJab','redPunch','redKick','redLowKick'],mid:['redHighKick','redSword','redSweep'],special:['redRush','redPowerKick'],ranged:'redWave',
   voice:['0-3','0-5'],bound:['5000-0','5000-1']},
  kuuga:{name:'假面騎士空我',author:'Ruina & Azuma',scale:1.65,color:'#ef4547',style:'rider',walk:145,guardChance:.38,
   definitions:{dash:[100],backdash:[105],intro:[0],kuugaJab:[200],kuugaPunch:[210],kuugaKick:[230],kuugaHighKick:[250],kuugaLowKick:[430],kuugaSweep:[440],kuugaUpper:[1000,1005],kuugaDashKick:[1200,1205],kuugaMightyKick:[40,41,1700,1790],kuugaRiderPunch:[3000]},
   close:['kuugaJab','kuugaPunch','kuugaKick','kuugaLowKick'],mid:['kuugaHighKick','kuugaSweep'],special:['kuugaUpper','kuugaDashKick','kuugaMightyKick'],
   voice:['15-0','15-1','15-4','15-5'],bound:['5000-0','5000-1','5000-2']},
  shingo:{name:'矢吹真吾',author:'Jmorphman',scale:1.75,color:'#82aaff',style:'rush',walk:150,guardChance:.2,
   definitions:{dash:[100],backdash:[105],intro:[190],shingoJab:[200],shingoPunch:[210],shingoKick:[230],shingoHighKick:[250],shingoLowKick:[430],shingoSweep:[450],shingoAragami:[1000],shingoDokugami:[1100],shingoOniyaki:[1200,1201],shingoFlyingKick:[1300,1301]},
   close:['shingoJab','shingoPunch','shingoKick','shingoLowKick'],mid:['shingoHighKick','shingoAragami','shingoSweep'],special:['shingoDokugami','shingoOniyaki','shingoFlyingKick'],
   voice:['4-2','4-3','4-4'],bound:['5000-0','5000-1','5000-2']},
  ryo:{name:'坂崎良',author:'Mouser',hasMummy:true,scale:1.85,color:'#ffb55a',style:'karate',walk:120,guardChance:.5,
   definitions:{dash:[100,101,102],backdash:[105,106,107],intro:[191],ryoJab:[200],ryoPunch:[210],ryoKick:[220],ryoHighKick:[230],ryoLowKick:[420],ryoSweep:[430],ryoKoouken:[1000],ryoUpper:[1010,1011],ryoFlyingKick:[1020,1021],ryoRush:[1030,1031],ryoHaoh:[3000],fireball:[6010],fireballEnd:[6031],superball:[6050]},
   close:['ryoJab','ryoPunch','ryoKick','ryoLowKick'],mid:['ryoHighKick','ryoSweep'],special:['ryoUpper','ryoFlyingKick','ryoRush'],ranged:'ryoKoouken',
   voice:['10-0','10-1'],bound:['11-1','11-2']}
 };
 const moves={};
 function move(id,label,damage,windup,extra={}){moves[id]={label,damage,windup,...extra};}
 for(const [prefix] of [['red'],['kuuga'],['shingo'],['ryo']]){
  for(const [suffix,label,damage,windup] of [['Jab','輕拳',6,.14],['Punch','重拳',10,.23],['Kick','輕踢',7,.17],['HighKick','高踢',11,.24],['LowKick','低踢',8,.2],['Sweep','掃腿',11,.26]])move(prefix+suffix,label,damage,windup);
 }
 move('redSword','動力劍斬',13,.3,{advance:60,special:true,sound:'1000-2'});
 move('redRush','突進斬擊',12,.25,{advance:230,special:true,sound:'1000-1'});
 move('redPowerKick','動力飛踢',14,.32,{advance:250,lift:48,special:true,sound:'1000-0'});
 move('redWave','動力劍波',16,.38,{projectile:true,castAt:.65,speed:360,life:1.5,special:true,sound:'3000-0'});
 move('kuugaUpper','空我上勾拳',13,.27,{advance:70,lift:20,special:true,sound:'20-0'});
 move('kuugaDashKick','空我突進踢',14,.3,{advance:340,lift:32,special:true,sound:'20-1'});
 move('kuugaMightyKick','全能騎士踢',17,.4,{advance:290,advanceStart:.55,lift:105,special:true,sound:'20-1'});
 move('kuugaRiderPunch','騎士拳',17,.4,{advance:50,special:true,sound:'20-0'});
 move('shingoAragami','荒咬未完成',12,.25,{advance:95,special:true,sound:'1000-0'});
 move('shingoDokugami','毒咬未完成',14,.3,{advance:110,special:true,sound:'1100-0'});
 move('shingoOniyaki','鬼燒未完成',15,.32,{advance:65,lift:80,special:true,sound:'1200-0'});
 move('shingoFlyingKick','真吾踢',14,.28,{advance:260,lift:60,special:true,sound:'1300-0'});
 move('ryoKoouken','虎煌拳',12,.3,{projectile:true,castAt:.33,speed:280,life:.8,special:true,sound:'10-5'});
 move('ryoUpper','虎咆',15,.3,{advance:55,lift:78,special:true,sound:'10-6'});
 move('ryoFlyingKick','飛燕疾風腳',14,.3,{advance:240,lift:42,special:true,sound:'10-7'});
 move('ryoRush','暫烈拳',14,.3,{advance:120,lift:35,special:true,sound:'10-15'});
 move('ryoHaoh','霸王翔吼拳',19,.5,{projectile:true,projectileClip:'superball',castAt:.6,speed:340,life:2,special:true,sound:'10-9'});
 const order=['ryu','red-ranger'];
 const isEnabled=kind=>order.includes(typeof kind==='string'?kind:kind?.kind);
 const activeEntries=()=>Object.entries(roster).filter(([kind])=>isEnabled(kind));let spawnIndex=0;
 const json=url=>typeof AssetLoader!=='undefined'?AssetLoader.json(url):fetch(url).then(r=>{if(!r.ok)throw Error('Asset data: '+url);return r.json();});
 const image=url=>{const revision=url.includes('binding-unhelmet-')?'red-default-r87':/^fighters\/red-ranger\/mummy\/unhelmet\/(boots|socks|bare)\/laugh(?:-still)?\.png$/.test(url)?'red-neck-r83':'red-normal-r72';if(typeof AssetLoader!=='undefined')return AssetLoader.image(new Image(),url+'?v='+revision);return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Enemy image failed: '+url));im.src=url+'?v='+(url.includes('binding-unhelmet-')?'red-default-r87':/^fighters\/red-ranger\/mummy\/unhelmet\/(boots|socks|bare)\/laugh(?:-still)?\.png$/.test(url)?'red-neck-r83':'red-normal-r72');});};
 async function loadMummy(base,folder='mummy',states=['normal','laugh']){
  const result={};
  await Promise.all(states.map(async state=>{
   const [layout,sheet]=await Promise.all([json(base+folder+'/'+state+'.json?v=red-normal-r72'),image(base+folder+'/'+state+'.png')]),frames=[];
   if(sheet.width!==layout.width*layout.columns||sheet.height!==layout.height*Math.ceil(layout.count/layout.columns))throw Error('Mummy sheet/layout mismatch: '+base+state);
   for(let i=0;i<layout.count;i++){const f=document.createElement('canvas');f.width=layout.width;f.height=layout.height;f.getContext('2d').drawImage(sheet,i%layout.columns*f.width,Math.floor(i/layout.columns)*f.height,f.width,f.height,0,0,f.width,f.height);frames.push(f);}
   result[state]={frames,layout};
  }));
  return result;
 }
 async function load(){await Promise.all(activeEntries().map(async([kind,c])=>{
  const base='fighters/'+kind+'/';const data=await json(base+'animations.json');
  const a={data,scale:c.scale,pages:[],clips:{},frame:RyuAssets.frame,duration:RyuAssets.duration,draw:RyuAssets.draw,boxes:RyuAssets.boxes};
  const needed=new Set();
  for(const [name,ids] of Object.entries({...common,...c.definitions})){
   const frames=[];
   for(const id of ids){const action=a.data.actions[id];if(!action?.frames.length)throw Error(kind+' missing action '+id);
    for(const f of action.frames){const s=a.data.sprites[f.sprite];if(!s){if(f.sprite.startsWith('-1,'))continue;throw Error(kind+' missing sprite '+f.sprite);}
     needed.add(s.page);frames.push({...f,ticks:f.ticks<0?12:Math.max(1,f.ticks),sourceAction:id});}}
   if(!frames.length)throw Error(kind+' empty clip '+name);
   a.clips[name]={frames,ticks:frames.reduce((n,f)=>n+f.ticks,0)};
  }
  await Promise.all([...needed].map(async n=>{a.pages[n]=await image(base+'atlas-'+n+'.png');}));
  const [binding,layout]=await Promise.all([image(base+'binding.png'),json(base+'binding.json')]);
  c.binding=[];c.bindingLayout=layout;
  for(let i=0;i<4;i++){const f=document.createElement('canvas');f.width=layout.width;f.height=layout.height;f.getContext('2d').drawImage(binding,i%2*f.width,Math.floor(i/2)*f.height,f.width,f.height,0,0,f.width,f.height);c.binding.push(f);}
  if(kind==='red-ranger'){
   c.bindingUnhelmet={};c.bindingUnhelmetLayouts={};
   for(const state of ['normal','laugh']){const sheet=await image(base+'binding-unhelmet-'+state+'.png'),frames=[];
    if(sheet.width!==layout.width*2||sheet.height!==layout.height*2)throw Error('Red default unhelmet layout mismatch');
    for(let i=0;i<4;i++){const f=document.createElement('canvas');f.width=layout.width;f.height=layout.height;f.getContext('2d').drawImage(sheet,i%2*f.width,Math.floor(i/2)*f.height,f.width,f.height,0,0,f.width,f.height);frames.push(f);}c.bindingUnhelmet[state]=frames;c.bindingUnhelmetLayouts[state]=await json(base+'binding-unhelmet-'+state+'.json?v=red-default-r87');
   }
  }
  if(c.hasMummy)c.mummy=await loadMummy(base);
  if(kind==='red-ranger'){c.mummyFootwear={bare:c.mummy};c.mummyUnhelmet={};await Promise.all([...['boots','socks'].map(async outfit=>{c.mummyFootwear[outfit]=await loadMummy(base,'mummy/'+outfit);}),...['boots','socks','bare'].map(async outfit=>{const folder='mummy/unhelmet/'+outfit,set=await loadMummy(base,folder,['normal','laugh','laugh-still']);set.laughTurn=set.laugh;set.laugh=set['laugh-still'];c.mummyUnhelmet[outfit]=set;})]);}
  c.assets=a;c.audio=await json(base+'audio/manifest.json');
 }));}
 function get(e){return roster[typeof e==='string'?e:e?.kind]||null;}
 function assets(e){return get(e)?.assets||RyuAssets;}
 function name(e){return I18n.t(get(e)?.name||'隆');}
 function next(){return order[spawnIndex++%order.length];}
 function reset(first='ryu'){spawnIndex=(order.indexOf(first)+1)%order.length;}
 function choose(e){
  const c=get(e),dist=Math.abs(player.x-e.x);e.face=player.x<e.x?-1:1;
  const busy=enemies.some(o=>o!==e&&o.hp>0&&o.state==='attack'&&Math.abs(o.x-player.x)<200);
  const incoming=shots.some(p=>p.dir*(e.x-p.x)>0&&Math.abs(e.x-p.x)<210);
  if(incoming&&e.reaction<=0){e.reaction=1.1;if(Math.random()<c.guardChance){changeState(e,'guard','guard',.5);return;}changeState(e,'backdash','backdash',.3);return;}
  if(e.decision>0)return;e.decision=.22+Math.random()*.26;
  if(dist>390){changeState(e,'dash','dash',.45);return;}
  if(e.cool<=0&&!busy){
   if(e.special<=0){
    let special;
    if(c.ranged&&dist>175&&dist<390&&Math.random()<.62)special=e.kind==='ryo'&&dist>300&&Math.random()<.3?'ryoHaoh':c.ranged;
    else if(dist<280&&dist>105&&Math.random()<.65)special=e.kind==='kuuga'?'kuugaMightyKick':e.kind==='shingo'?'shingoFlyingKick':e.kind==='red-ranger'?'redPowerKick':'ryoFlyingKick';
    else if(dist<140&&Math.random()<.5)special=e.kind==='kuuga'&&Math.random()<.2?'kuugaRiderPunch':pick(c.special.filter(id=>!moves[id].projectile));
    if(special){beginMove(e,special);e.special=3+Math.random()*2;return;}
   }
   if(dist<105){beginMove(e,pick(c.close));return;}
   if(dist<155){beginMove(e,pick(c.mid.filter(id=>!moves[id].special||e.special<=0)));return;}
  }
  if(dist<66&&Math.random()<.45){changeState(e,'backdash','backdash',.3);return;}
  if(dist<150&&e.cool>0&&Math.random()<c.guardChance){changeState(e,'guard','guard',.35);return;}
  e.posture=dist>100?'walk':dist<70?'back':'idle';
 }
 function attack(e,dt){
  const c=get(e),m=moves[e.move],a=c.assets,at=e.t-m.windup,duration=a.duration(e.move);if(at<0)return;
  if(!e.attackVoiceDone){e.attackVoiceDone=true;voice(e,m.sound||pick(c.voice));}
  if(at<duration){const u=Math.min(1,at/duration);e.y=-Math.sin(u*Math.PI)*(m.lift||0);if(at>=(m.advanceStart||0))e.x+=e.face*(m.advance||0)*dt;}
  else e.y=0;
  if(m.projectile&&!e.castDone&&at>=(m.castAt||.3)){e.castDone=true;enemyShots.push({kind:e.kind,clip:m.projectileClip||'fireball',x:e.x+e.face*62,y:FLOOR-92,dir:e.face,life:m.life,t:0,ended:0,damage:m.damage,speed:m.speed});}
  if(!m.projectile&&!e.hitDone&&at<duration){const boxes=a.boxes(e.move,at,e.x,FLOOR+e.y,e.face,'hit');if(boxes.some(b=>intersects(b,[player.x-27,FLOOR-152,player.x+27,FLOOR]))){e.hitDone=true;hurtPlayer(m.damage);}}
  if(at>=duration+.12){idle(e);e.cool=c.style==='rush'?.3+Math.random()*.3:.5+Math.random()*.35;}
 }
 function supportsBinding(e,variant){const c=get(e);return !!c&&(variant===0||(variant===1&&c.hasMummy===true));}
 function footwear(e){return ['boots','socks','bare'].includes(e?.mummyFootwear)?e.mummyFootwear:'boots';}
 function mummySet(e){const c=get(e);return (e?.mummyUnhelmet===true?c?.mummyUnhelmet?.[footwear(e)]:null)||c?.mummyFootwear?.[footwear(e)]||c?.mummy;}
 function bindingState(e){
  const c=get(e);if(!c?.binding)return null;const hit=e.featherHit||e.bindLaugh>0;
  if(e.bindVariant===1&&c.mummy){const set=mummySet(e),s=hit?(e.kind==='red-ranger'&&e.mummyUnhelmet===true&&e.breakDamage>50?set.laughTurn:set.laugh):set.normal;return {...s,index:Math.floor((hit?e.bindLaughElapsed:e.bindElapsed)*s.layout.fps)%s.frames.length,height:s.layout.displayHeight||MUMMY_HEIGHT,face:1};}
  const sequence=[0,1,2,1,0,3,2,3];const frames=e.kind==='red-ranger'&&e.bindVariant===0&&e.mummyUnhelmet===true?c.bindingUnhelmet[hit?'laugh':'normal']:c.binding;const layout=e.kind==='red-ranger'&&e.bindVariant===0&&e.mummyUnhelmet===true?c.bindingUnhelmetLayouts[hit?'laugh':'normal']:c.bindingLayout;return {frames,layout,index:sequence[Math.floor((hit?e.bindLaughElapsed*9:e.bindElapsed*5))%sequence.length],height:BIND_HEIGHT,face:e.face};
 }
 function frame(e){const s=bindingState(e);return s?.frames[s.index]||null;}
 function drawBinding(e){const s=bindingState(e);if(!s)return;const f=s.frames[s.index],w=f.width/f.height*s.height;ctx.save();ctx.translate(Math.round(e.x-camera),Math.round(FLOOR+e.y));ctx.scale(s.face,1);ctx.drawImage(f,-w/2,-s.height,w,s.height);ctx.restore();}
 function coverage(e,level){
  if(level!==2)return 'cloth';
  if(e.kind==='red-ranger')return e.bindVariant===1?({boots:'shoes',socks:'socks',bare:'skin'}[footwear(e)]):'shoes';
  return ['shingo','kuuga'].includes(e.kind)?'shoes':'skin';
 }
 function weakness(e,polygon){
  const s=bindingState(e);if(!s)return 0;const f=s.frames[s.index],scale=bindingScale(e);
  const local=polygon.map(([x,y])=>[(x-e.x)*s.face/scale,(y-FLOOR-e.y)/scale]);
  // Respect visible covering before intersecting each existing per-frame contact region.
  const regions=s.layout.regions[s.index];
  for(const level of [2,1])for(const r of regions.filter(r=>r.level===level)){
   if(!mouseToolAllowsCoverage(r.coverage||coverage(e,level)))continue;
   const rect=[(r.x-f.width/2)*s.height/f.height,r.y*s.height/f.height-s.height,(r.x+r.w-f.width/2)*s.height/f.height,(r.y+r.h)*s.height/f.height-s.height];
   if(featherIntersectsRect(local,rect))return level;
  }
  return 0;
 }
 async function initAudio(context){await Promise.all(activeEntries().map(async([kind,c])=>{
  if(c.audioLoaded)return;c.audioLoaded=true;
  await Promise.all(Object.keys(c.audio||{}).map(async id=>{try{const r=await fetch('fighters/'+kind+'/audio/'+id+'.wav');RyuAudio.buffers.set(kind+':'+id,await context.decodeAudioData(await r.arrayBuffer()));}catch{}}));
 }));}
 function voice(e,id){if(!id)return false;return RyuAudio.play(e.kind+':'+id,{owner:e,channel:'voice',volume:.38});}
 function boundVoice(e){const c=get(e),pool=c.bound.filter(id=>c.audio?.[id]);const history=e.voiceHistory||[];const choices=pool.filter(id=>!history.includes(id));const id=pick(choices.length?choices:pool);if(voice(e,id))e.voiceHistory=[...history,id].slice(-2);}
 return {roster,moves,isEnabled,enabledKinds:()=>[...order],sourceActions:()=>Object.fromEntries(Object.entries(roster).map(([k,c])=>[k,{...common,...c.definitions}])),load,get,assets,name,next,reset,choose,attack,supportsBinding,footwear,mummySet,bindingState,frame,drawBinding,coverage,weakness,initAudio,voice,boundVoice};
})();

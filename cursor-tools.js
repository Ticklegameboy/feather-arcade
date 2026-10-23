'use strict';
// Shared pixel art and geometric transform for shop, toolbar, pointer and hit testing.
const CursorTools=(()=>{
 const items=[{id:0,name:'羽毛'}, {id:3,name:'紫色鬼手',price:150,description:'黑色指甲 · 手指輪流抓撓'}, {id:4,name:'電動牙刷',price:220,description:'背向鏡頭 · 旋轉刷毛'}];
 const bar=document.querySelector('#cursor-tools'),cursor=document.querySelector('#tool-cursor');
 const pixel=document.createElement('canvas');pixel.width=36;pixel.height=96;
 const rendered=document.createElement('canvas');rendered.width=rendered.height=104;cursor.width=cursor.height=72;
 let previous='',time=0,previousTime=performance.now();
 const ghostImage=new Image();let ghost=null;
 const ready=(typeof AssetLoader!=='undefined'?Promise.all([AssetLoader.json('cursor-art/ghost-hand-a1.json?v=ghost-a1-r79'),AssetLoader.image(ghostImage,'cursor-art/ghost-hand-a1.png?v=ghost-a1-r79')]).then(([data])=>{ghost=data;previous='';}):Promise.all([fetch('cursor-art/ghost-hand-a1.json?v=ghost-a1-r79').then(r=>{if(!r.ok)throw Error('A1 frame data failed');return r.json();}),new Promise((resolve,reject)=>{ghostImage.onload=resolve;ghostImage.onerror=()=>reject(Error('A1 sprite failed'));ghostImage.src='cursor-art/ghost-hand-a1.png?v=ghost-a1-r79';})]).then(([data])=>{ghost=data;previous='';}));
 ready.catch(()=>{}); // assetsReady reports failure; avoid an early unhandled rejection.

 function ghostFrame(t){let elapsed=((t*1000)%ghost.duration+ghost.duration)%ghost.duration;for(let i=0;i<ghost.frames.length;i++){elapsed-=ghost.frames[i].duration;if(elapsed<0)return i;}return 0;}

 function paint(g,id,t){
  const r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
  g.clearRect(0,0,36,96);g.imageSmoothingEnabled=false;
  if(id===4){
   // Handle back faces the viewer; the rotating bristle crown is visible around the head.
   r(13,69,11,23,'#14243c');r(14,70,9,20,'#a7d9e4');r(15,70,3,18,'#f0f9f3');r(20,71,3,17,'#6b9eb8');r(15,88,7,3,'#795ed2');
   r(16,14,5,58,'#243454');r(17,15,3,56,'#c9e2e7');
   for(let i=0;i<8;i++){const a=t*11+i*Math.PI/4,x=18+Math.cos(a)*9,y=10+Math.sin(a)*8;r(x-1,y-1,3,3,i%2?'#98edee':'#f5ffff');}
   r(12,3,13,14,'#193652');r(10,6,17,8,'#193652');r(12,5,13,10,'#7bacc8');r(14,4,9,12,'#add9e3');r(15,6,7,7,'#dcecf0');r(17,8,3,3,'#7bacc8');
   r(17,76,3,4,'#345273');r(18,77,1,2,'#85f2d3');
  }else{
   for(let y=4;y<32;y++){const x=29-Math.floor((y-4)*.7),w=Math.round(Math.sin((y-3)/31*Math.PI)*6);r(x-w,y,w*2+1,1,'#eee7ff');if(y%4===0)r(x-w,y,w,1,'#bdafd4');}
   for(let i=0;i<34;i++)r(28-Math.floor(i*.7),6+i,1,2,'#aa92c6');
  }
 }
 function transform(id,x,y){
  if(id===3)return [36+x-38,36+y-46];
  if(id===4){const c=Math.SQRT1_2;return [36+(x-18)*c-(y-46.5)*c,36+(x-18)*c+(y-46.5)*c];}
  return [36+x-18,36+y-22];
 }
 function draw(canvas,id,t=0,background=false){
  const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,canvas.width,canvas.height);
  if(background){g.fillStyle='#242340';g.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<canvas.height;y+=8)for(let x=0;x<canvas.width;x+=8){g.fillStyle=(x+y)%16?'#34345c':'#39305a';g.fillRect(x,y,8,8);}}
  if(id===3){if(!ghost)return;const i=ghostFrame(t),scale=Math.min(canvas.width,canvas.height)/96;g.drawImage(ghostImage,(i%ghost.columns)*96,Math.floor(i/ghost.columns)*96,96,96,(canvas.width-96*scale)/2+10*scale,(canvas.height-96*scale)/2+2*scale,96*scale,96*scale);return;}
  paint(pixel.getContext('2d'),id,t);const size=id===4?104:72,r=rendered.getContext('2d');r.clearRect(0,0,104,104);r.imageSmoothingEnabled=false;r.save();r.translate(size/2,size/2);
  if(id===4){r.rotate(Math.PI/4);r.translate(-18,-46.5);}else r.translate(-18,-22);
  r.drawImage(pixel,0,0);r.restore();const scale=Math.min(canvas.width/size,canvas.height/size),output=size*scale;g.drawImage(rendered,0,0,size,size,(canvas.width-output)/2,(canvas.height-output)/2,output,output);
 }
 for(const item of items){const button=document.createElement('button');button.type='button';button.dataset.tool=String(item.id);const icon=document.createElement('canvas');icon.width=icon.height=72;icon.setAttribute('aria-hidden','true');const label=document.createElement('span');button.append(icon,label);button.onclick=()=>{if(paused||MagicShop.isOpen||typeof Onboarding!=='undefined'&&Onboarding.active)return;if(Laughter.equip(item.id)){mouseFeather.hover=false;updateMouseFeather(0,true);tick();}};bar.append(button);}
 function tick(){
  const now=performance.now();if(!paused)time+=Math.min((now-previousTime)/1000,.1);previousTime=now;
  const active=running||gameMode!=='battle';bar.hidden=!active||!items.slice(1).some(i=>Laughter.owns(i.id));
  const state=[I18n.language,Laughter.equipped,Laughter.owns(3),Laughter.owns(4),paused].join('|');
  if(state!==previous){previous=state;bar.setAttribute('aria-label',tr('搔癢工具'));for(const item of items){const button=bar.querySelector(`[data-tool="${item.id}"]`);button.hidden=!Laughter.owns(item.id);button.disabled=paused;button.setAttribute('aria-pressed',String(Laughter.equipped===item.id));button.querySelector('span').textContent=tr(item.name);draw(button.querySelector('canvas'),item.id);}}
  const equipped=Laughter.equipped;cursor.hidden=equipped===0;featherCursor.querySelector('svg').style.display=equipped===0?'':'none';if(equipped){const size=equipped===4?104:equipped===3?96:72;if(cursor.width!==size){cursor.width=cursor.height=size;cursor.style.width=cursor.style.height=size+'px';}draw(cursor,equipped,time);}
 }
 function polygon(){const id=Laughter.equipped;if(!id)return FEATHER_ATTACK_POLYGON;
  const points=id===3?(ghost?ghost.frames[ghostFrame(time)].polygon:[]):[[11,3],[25,3],[28,8],[26,16],[12,18],[8,12]];
  return points.map(([x,y])=>{const [tx,ty]=transform(id,x,y);return [tx-36+18,ty-36+22];});
 }
 return {items,draw,tick,polygon,transform,ready};
})();

'use strict';
const MagicShop=(()=>{
 const dialog=document.querySelector('#magic-shop'),bank=document.querySelector('#laughter-bank');
 const items=[{id:1,name:'木乃伊禁錮',price:35,description:'黑色繃帶纏繞 · 戰鬥與地牢可用'},{id:2,name:'藤蔓禁錮',price:100,description:'彎曲黑藤纏繞 · 地牢專屬'},...CursorTools.items.filter(i=>i.id>0)];
 for(const item of items.filter(i=>i.id>2)){const card=document.createElement('article');card.className='shop-item';card.id=`shop-item-${item.id}`;card.innerHTML=`<h3></h3><canvas id="shop-icon-${item.id}" width="48" height="48" aria-hidden="true"></canvas><button type="button"></button><p></p>`;dialog.querySelector('.shop-items').append(card);}
 let returnPaused=false,returnFocus=null,guide=false,lastState='',rewardId=0,rewardStart=0;
 const reward=document.querySelector('#magic-unlocked'),preview=document.querySelector('#unlock-preview');
 function icon(canvas,id){
  if(id>2){CursorTools.draw(canvas,id,0,true);return;}
  const g=canvas.getContext('2d');canvas.width=canvas.height=48;g.imageSmoothingEnabled=false;
  const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const palette=['#173766','#244d8b','#3a54a0','#5356ab','#6953aa','#704497'];
  for(let y=0;y<48;y+=4)for(let x=0;x<48;x+=4){const row=Math.min(5,Math.floor(y/9)+((x/4+y/4)%3===0?1:0));rect(x,y,4,4,palette[row]);}
  function line(a,b,size,color){let [x,y]=a;const dx=Math.abs(b[0]-x),dy=-Math.abs(b[1]-y),sx=x<b[0]?1:-1,sy=y<b[1]?1:-1;let err=dx+dy;for(;;){rect(x-Math.floor(size/2),y-Math.floor(size/2),size,size,color);if(x===b[0]&&y===b[1])break;const e=2*err;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}}
  const star=(x,y,c)=>{rect(x,y-3,1,7,c);rect(x-3,y,7,1,c);rect(x-1,y-1,3,3,c);rect(x,y,1,1,'#fff4ff');};
  if(id===1){
   // Loose, folding strips: black shadows, grey cloth and violet sparkles.
   const ribbons=[[[9,13],[17,10],[28,13],[33,19],[27,23],[15,23],[10,28],[17,32],[32,34],[38,39]],[[34,8],[31,14],[22,18],[18,26],[22,33],[16,39],[9,37]]];
   for(const points of ribbons){for(let i=1;i<points.length;i++)line(points[i-1],points[i],7,'#101020');for(let i=1;i<points.length;i++)line(points[i-1],points[i],5,'#3d3b4e');for(let i=1;i<points.length;i++)line(points[i-1].map((v,j)=>v-(j?1:0)),points[i].map((v,j)=>v-(j?1:0)),1,'#9b91af');}
   rect(11,13,6,1,'#676478');rect(25,32,6,1,'#77708a');star(7,7,'#cf94ff');star(40,22,'#d1a0ff');star(32,41,'#b988ff');rect(40,9,2,2,'#e5c0ff');
  }else{
   const paths=[[[23,42],[17,33],[13,25],[13,16],[18,10],[23,10],[25,14],[22,17]],[[25,42],[29,32],[31,22],[29,14],[33,6],[38,5],[41,9],[39,13]],[[20,41],[11,34],[6,25],[8,20],[12,21]],[[27,42],[36,36],[41,27],[39,21],[35,20],[33,23]],[[24,41],[23,32],[21,25],[23,21]]];
   for(const points of paths){for(let i=1;i<points.length;i++)line(points[i-1],points[i],5,'#110c23');for(let i=1;i<points.length;i++)line(points[i-1],points[i],3,'#34204e');for(let i=1;i<points.length;i++)line(points[i-1].map((v,j)=>v-(j===0?1:0)),points[i].map((v,j)=>v-(j===0?1:0)),1,'#8861b0');}
   rect(14,41,22,3,'#110c23');rect(20,40,9,2,'#664582');star(7,10,'#ff99dc');star(40,37,'#ffa3df');star(27,5,'#ffb2ea');rect(20,31,2,2,'#fa8fd2');
  }
 }
 for(const item of items)icon(document.querySelector(`#shop-icon-${item.id}`),item.id);
 function refresh(){
  bank.setAttribute('aria-label',tr('笑聲 · 開啟魔法商店'));bank.setAttribute('aria-expanded',String(dialog.open));
  document.querySelector('#shop-title').textContent=tr('魔法商店');document.querySelector('#shop-close').textContent=tr('關閉');
  document.querySelector('#shop-balance').textContent=tr('持有笑聲：{amount}',{amount:Math.floor(Laughter.amount).toLocaleString(I18n.language)});
  const accessible=running||gameMode!=='battle';
  const available=accessible&&items.some(i=>!Laughter.owns(i.id)&&Laughter.amount>=i.price);
  const hint=document.querySelector('#magic-available');hint.hidden=!available;hint.textContent=tr('新魔法可習得');
  document.querySelector('#shop-guide-arrow').hidden=true;
  bank.classList.remove('shop-invitation');
  document.querySelector('#unlock-title').textContent=tr(items.find(i=>i.id===rewardId)?.name||'木乃伊禁錮');
  document.querySelector('#unlock-message').textContent=tr('恭喜解鎖新的魔法，快去試試吧！');
  document.querySelector('#unlock-close').textContent=tr('去試試');
  document.querySelector('#shop-guide-text').hidden=!guide||Laughter.owns(1);
  document.querySelector('#shop-guide-text').textContent=tr('花費 35 笑聲，學習你的第一個新魔法！');
  for(const item of items){
   const card=document.querySelector(`#shop-item-${item.id}`),button=card.querySelector('button'),owned=Laughter.owns(item.id),affordable=Laughter.amount>=item.price;
   card.querySelector('h3').textContent=tr(item.name);card.querySelector('p').textContent=tr(item.description);
   card.classList.toggle('owned',owned);card.classList.toggle('tutorial-highlight',guide&&item.id===1&&!owned);
   button.classList.toggle('unaffordable',!owned&&!affordable);button.disabled=owned||!affordable;
   button.textContent=owned?tr('已擁有'):item.price+' '+tr('笑聲');
   button.setAttribute('aria-label',owned?tr('已擁有'):tr('學習 {magic}，花費 {price} 笑聲',{magic:tr(item.name),price:item.price}));
  }
 }
 function drawReward(){
  if(!reward.open)return;if(rewardId>2){CursorTools.draw(preview,rewardId,(performance.now()-rewardStart)/1000,true);return;}const g=preview.getContext('2d'),frames=rewardId===2?vineFrames:mummyFrames,fps=rewardId===2?vineBindingLayout.fps:6;
  const sprite=frames[Math.floor((performance.now()-rewardStart)/1000*fps)%frames.length];if(!sprite)return;
  g.imageSmoothingEnabled=false;g.fillStyle='#17162c';g.fillRect(0,0,360,300);
  for(let y=0;y<300;y+=20)for(let x=0;x<360;x+=20){g.fillStyle=(x+y)%40?'#20213b':'#272440';g.fillRect(x+1,y+1,18,18);}
  const scale=Math.min(310/sprite.width,278/sprite.height),w=sprite.width*scale,h=sprite.height*scale;g.drawImage(sprite,Math.round((360-w)/2),Math.round(294-h),Math.round(w),Math.round(h));
 }
 function tick(){const state=[running,gameMode,I18n.language,Math.floor(Laughter.amount),Laughter.owns(1),Laughter.owns(2),Laughter.owns(3),Laughter.owns(4),Laughter.tutorialPending,dialog.open,guide,rewardId,reward.open].join('|');if(state!==lastState){lastState=state;refresh();}drawReward();if(dialog.open)for(const item of items.filter(i=>i.id>2))CursorTools.draw(document.querySelector(`#shop-icon-${item.id}`),item.id,performance.now()/1000,true);}
 function showReward(id){rewardId=id;rewardStart=performance.now();reward.showModal();tick();document.querySelector('#unlock-close').focus();}
 function dismissReward(){if(!reward.open)return;reward.close();close();}
 reward.addEventListener('cancel',e=>{e.preventDefault();dismissReward();});document.querySelector('#unlock-close').onclick=dismissReward;

 function open(){
  if(dialog.open||reward.open||(!running&&gameMode==='battle'))return;
  if(typeof Onboarding!=='undefined'&&Onboarding.active&&Onboarding.active!=='shop')return;
  guide=Laughter.tutorialPending;if(typeof Onboarding!=='undefined')Onboarding.complete('shop');
  returnPaused=paused;returnFocus=document.activeElement;paused=true;keys.clear();accumulator=0;mouseFeather.inside=false;updateMouseFeather(0,true);RyuAudio.stopAll();audio?.suspend().catch(()=>{});
  if(guide)Laughter.acknowledgeTutorial();dialog.showModal();tick();document.querySelector('#shop-close').focus();
 }
 function close(){
  if(!dialog.open||reward.open)return;dialog.close();paused=returnPaused;accumulator=0;keys.clear();mouseFeather.inside=false;
  if(sound&&!paused)audio?.resume().catch(()=>{});Dungeon.refresh();tick();
  if(returnFocus?.isConnected)returnFocus.focus();else bank.focus();
 }
 function purchase(id){
  if(!dialog.open||reward.open||!Laughter.purchase(id))return false;
  guide=false;updateInteraction();showReward(id);return true;
 }
 bank.onclick=open;document.querySelector('#shop-close').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled)')],first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 for(const item of items)document.querySelector(`#shop-item-${item.id} button`).onclick=()=>purchase(item.id);
 tick();return {open,close,purchase,tick,get isOpen(){return dialog.open||reward.open;}};
})();

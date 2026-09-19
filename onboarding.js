'use strict';
const Onboarding=(()=>{
 const shade=document.querySelector('#onboarding-shade'),message=document.querySelector('#onboarding-message');
 let active=null,previousPause=false,target=null,locked=[],lastLanguage='';
 function refresh(){
  if(!active)return;
  message.dataset.guide=active;message.querySelector('p').textContent=tr(active==='shop'?'點擊發光的笑聲按鈕，解鎖新的禁錮魔法！':'你已抓到隆！點擊發光的地牢按鈕，查看已收錄的敵人。');
  target.setAttribute('aria-describedby','onboarding-copy');lastLanguage=I18n.language;
 }
 function begin(kind){
  active=kind;previousPause=paused;paused=true;keys.clear();accumulator=0;mouseFeather.inside=false;updateMouseFeather(0,true);
  // Freeze play immediately, but let the just-triggered defeat voice finish.
  // Its onEnded handler suspends audio while the guide remains open.
  RyuAudio.reactions.clear();for(const entry of RyuAudio.active)if(entry.owner?.state!=='defeated'||entry.channel!=='voice')RyuAudio.stop(entry);
  if(!RyuAudio.active.size)audio?.suspend().catch(()=>{});
  target=document.querySelector(kind==='shop'?'#laughter-bank':'#dungeon-open');target.hidden=false;target.disabled=false;target.classList.add('onboarding-target');
  locked=[...document.querySelectorAll('button,a,canvas')].filter(el=>el!==target).map(el=>[el,el.inert]);for(const [el] of locked)el.inert=true;
  shade.hidden=message.hidden=false;document.querySelector('#paused').hidden=true;refresh();target.focus();
 }
 function complete(kind){
  if(active!==kind)return false;
  if(kind==='shop')Laughter.acknowledgeTutorial();else Dungeon.acknowledgeTutorial();
  target.classList.remove('onboarding-target');target.removeAttribute('aria-describedby');for(const [el,inert] of locked)el.inert=inert;
  locked=[];shade.hidden=message.hidden=true;active=null;target=null;paused=previousPause;accumulator=0;keys.clear();return true;
 }
 function tick(){
  if(active){if(lastLanguage!==I18n.language)refresh();return;}
  if(!ready||!running||gameMode!=='battle'&&gameMode!=='prison'&&gameMode!=='collection'||MagicShop.isOpen)return;
  if(Laughter.tutorialPending)begin('shop');
  else if(gameMode==='battle'&&Dungeon.tutorialPending)begin('dungeon');
 }
 document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Tab'){e.preventDefault();target.focus();return;}
  if(e.target===target&&['Enter',' '].includes(e.key))return;
  e.preventDefault();e.stopImmediatePropagation();
 },true);
 return {tick,complete,get active(){return active;}};
})();

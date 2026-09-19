'use strict';
const Laughter=(()=>{
 const key='feather-arcade.magic.v1',legacyKey='feather-arcade.laughter.v1',prices={1:35,2:100};
 let amount=0,owned=[],tutorialReady=false,tutorialSeen=false,dirty=false,lastSave=-Infinity,lastDisplay='';
 try{
  const saved=JSON.parse(localStorage.getItem(key)||'null');
  if(saved?.version===1&&Number.isFinite(saved.amount)&&saved.amount>=0){amount=saved.amount;owned=[1,2].filter(id=>saved.owned?.includes(id));tutorialReady=saved.tutorialReady===true;tutorialSeen=saved.tutorialSeen===true;}
  else{const legacy=JSON.parse(localStorage.getItem(legacyKey)||'0');if(Number.isFinite(legacy)&&legacy>=0)amount=legacy;dirty=true;}
 }catch{}
 function owns(id){return id===0||owned.includes(id);}
 function checkTutorial(){if(amount>=35&&!owns(1)&&!tutorialSeen&&!tutorialReady){tutorialReady=true;dirty=true;}}
 function render(){
  const label=document.querySelector('#laughter-label'),value=document.querySelector('#laughter-value');
  if(label)label.textContent=I18n.t('笑聲');
  const formatted=Math.floor(amount).toLocaleString(I18n.language,{maximumFractionDigits:0});
  if(value&&formatted!==lastDisplay){value.textContent=formatted;lastDisplay=formatted;}
 }
 // Balance and purchases are saved together, so reload cannot split a transaction.
 function flush(){if(!dirty)return;try{localStorage.setItem(key,JSON.stringify({version:1,amount,owned,tutorialReady,tutorialSeen}));dirty=false;lastSave=performance.now();}catch{}}
 function tick(){checkTutorial();render();if(dirty&&performance.now()-lastSave>=250)flush();}
 function add(damage){if(!Number.isFinite(damage)||damage<=0)return;amount+=damage;dirty=true;tick();}
 function purchase(id){if(!Number.isInteger(id)||!Object.hasOwn(prices,id)||owns(id)||amount<prices[id])return false;amount-=prices[id];owned.push(id);if(id===1)tutorialSeen=true;dirty=true;flush();render();return true;}
 function acknowledgeTutorial(){tutorialSeen=true;dirty=true;flush();}
 function resetProgress(){amount=0;owned=[];tutorialReady=false;tutorialSeen=false;dirty=true;try{localStorage.setItem(legacyKey,'0');}catch{}flush();render();}
 window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
 tick();return {add,flush,tick,render,owns,purchase,acknowledgeTutorial,resetProgress,get tutorialPending(){return tutorialReady&&!tutorialSeen&&!owns(1);},get amount(){return amount;}};
})();

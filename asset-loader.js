'use strict';
// Bound both downloads and decoding; a stalled request must not lock the start screen.
const AssetLoader=(()=>{
 const queue=[],state={total:0,done:0,retries:0,active:0,finished:false,error:null};
 const started=Date.now(),timeout=45000,attempts=3,limit=8;
 const text=(source,params)=>typeof I18n==='undefined'?source:I18n.t(source,params);
 function render(){
  if(state.finished)return;
  const label=document.querySelector('#load'),retry=document.querySelector('#load-retry');
  if(!label)return;
  if(state.error){label.textContent=text('載入失敗，請檢查網路後重試。')+' '+state.error.assetURL.split('?')[0];}
  else {label.textContent=text('正在載入素材：{done} / {total}',state)+(state.retries?' · '+text('正在自動重試'):'');
   if(Date.now()-started>15000)label.textContent+=' · '+text('首次載入較慢，請保持網頁開啟。');}
  if(retry)retry.hidden=!state.error&&Date.now()-started<=15000;
 }
 function pump(){while(state.active<limit&&queue.length){state.active++;const job=queue.shift();job().finally(()=>{state.active--;pump();});}}
 function request(url,operation){
  state.total++;render();
  return new Promise((resolve,reject)=>{queue.push(async()=>{
   for(let attempt=0;attempt<attempts;attempt++){
    const target=url+(attempt?(url.includes('?')?'&':'?')+'loadRetry='+attempt:'');
    try {const result=await operation(target);state.done++;render();resolve(result);return;}
    catch(error){if(attempt===attempts-1){error.assetURL=url;reject(error);return;}
     state.retries++;render();await new Promise(r=>setTimeout(r,500*(attempt+1)));}
   }
  });pump();});
 }
 function json(url){return request(url,target=>new Promise((resolve,reject)=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>{controller.abort();reject(Error('Asset request timed out'));},timeout);
  fetch(target,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
   .then(resolve,reject).finally(()=>clearTimeout(timer));
 }));}
 function image(im,url){return request(url,target=>new Promise((resolve,reject)=>{
  let timer;
  function finish(error){clearTimeout(timer);im.onload=im.onerror=null;if(error){im.removeAttribute('src');reject(error);}else resolve(im);}
  im.onload=()=>finish();im.onerror=()=>finish(Error('Image request failed'));
  timer=setTimeout(()=>finish(Error('Image request timed out')),timeout);im.src=target;
 }));}
 const ticker=setInterval(render,1000);
 const retry=document.querySelector('#load-retry');if(retry)retry.onclick=()=>location.reload();
 return {json,image,render,state,
  complete(){state.finished=true;clearInterval(ticker);if(retry)retry.hidden=true;},
  fail(error){state.error=error;if(!error.assetURL)error.assetURL='';clearInterval(ticker);render();}
 };
})();

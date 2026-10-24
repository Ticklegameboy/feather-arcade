'use strict';
const GameAnalytics=(()=>{
 const id=window.FEATHER_ANALYTICS?.measurementId||'';
 const enabled=/^G-[A-Z0-9]+$/.test(id)&&location.hostname==='ticklegameboy.github.io';
 const loadedAt=performance.now();let started=false,pendingSeconds=0,failed=false,loaded=false;
 const allowed=new Set(['page_view','game_start','game_play_time','game_end','game_load_complete','game_load_failed']);
 function send(name,params={}){
  if(!enabled||!allowed.has(name))return;
  try {window.gtag('event',name,{send_to:id,game_version:'r90',...params});}catch{}
 }
 if(enabled){
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('js',new Date());
  window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
   page_location:location.origin+location.pathname,page_referrer:'',page_title:'Feather Arcade',cookie_flags:'SameSite=Lax;Secure'});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;
  script.onerror=()=>{};document.head.appendChild(script);
  send('page_view');
 }
 function flush(){
  const seconds=Math.floor(pendingSeconds);if(!started||seconds<1)return;
  pendingSeconds-=seconds;send('game_play_time',{value:seconds,active_play_seconds:seconds});
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
 window.addEventListener('pagehide',flush);
 return {
  start(kind){flush();started=true;pendingSeconds=0;send('game_start',{character:kind==='red-ranger'?'red-ranger':'ryu'});},
  tick(seconds,active){if(!started||!active||document.hidden)return;pendingSeconds+=Math.max(0,Math.min(Number(seconds)||0,1));if(pendingSeconds>=30)flush();},
  end(){if(!started)return;flush();started=false;send('game_end');},
  loadComplete(){if(loaded||failed)return;loaded=true;send('game_load_complete',{load_seconds:Math.round((performance.now()-loadedAt)/1000)});},
  loadFailed(asset){if(failed||loaded)return;failed=true;
   // Only an asset path is sent; never send raw error text, queries, saved games or user input.
   const path=typeof asset==='string'?asset.split(/[?#]/)[0]:'';
   send('game_load_failed',{asset_path:/^[a-zA-Z0-9_./-]{1,180}$/.test(path)&&!path.includes('..')?path:'unknown'});
  }
 };
})();

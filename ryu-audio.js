/* PotS Ryu samples and user-provided laughter. See ryu--audio--CREDITS.txt. */
const RyuAudio={
 context:null,enabled:false,buffers:new Map(),active:new Set(),loading:null,reactions:new Map(),laughIds:[],laughHistory:[],
 init(context,revision){
  this.context=context;if(this.loading)return this.loading;
  const url=path=>`${path}?v=${revision}`;
  this.loading=fetch(url('ryu--audio--manifest.json')).then(r=>{if(!r.ok)throw Error('Ryu audio manifest');return r.json();}).then(async manifest=>{
   await Promise.all(Object.entries(manifest.sounds).map(async([id,entry])=>{
    try{const r=await fetch(url('ryu--audio--'+entry.file));if(!r.ok)return;this.buffers.set(id,await context.decodeAudioData(await r.arrayBuffer()));}catch{}
   }));
   const hashes=new Set();this.laughIds=Object.entries(manifest.sounds).filter(([id,e])=>{if(!id.startsWith('laugh-')||!this.buffers.has(id)||hashes.has(e.sha256))return false;hashes.add(e.sha256);return true;}).map(([id])=>id);
  }).catch(()=>{});return this.loading;
 },
 setEnabled(enabled){this.enabled=enabled;if(!enabled)this.stopAll();},
 play(id,{owner=null,channel='effect',volume=.4,reaction=false,onEnded=null}={}){
  const buffer=this.buffers.get(id),context=this.context;
  // Do not queue a late voice when loading finishes after its animation.
  if(!this.enabled||!buffer||!context||context.state!=='running')return false;
  if(owner&&channel==='voice')this.stopOwner(owner,'voice',reaction);
  if(this.active.size>=12)this.stop([...this.active].find(e=>e.channel!=='voice')||this.active.values().next().value);
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(context.destination);
  const entry={source,gain,owner,channel,id,endAt:context.currentTime+buffer.duration,stopped:false};this.active.add(entry);
  source.onended=()=>{source.disconnect();gain.disconnect();this.active.delete(entry);if(!entry.stopped)onEnded?.(entry);};source.start();return true;
 },
 stop(entry){if(!entry)return;entry.stopped=true;try{entry.source.stop();}catch{}this.active.delete(entry);const state=this.reactions.get(entry.owner);if(state?.entry===entry){state.entry=null;state.gapUntil=this.context.currentTime+.3;}},
 stopOwner(owner,channel,preserveReaction=false){if(!preserveReaction&&(!channel||channel==='voice'))this.reactions.delete(owner);for(const entry of this.active)if(entry.owner===owner&&(!channel||entry.channel===channel))this.stop(entry);},
 stopSound(owner,id){for(const entry of this.active)if(entry.owner===owner&&entry.id===id)this.stop(entry);},
 stopAll(){this.reactions.clear();for(const entry of this.active)this.stop(entry);},
 hasLaughClips(){return this.enabled&&this.laughIds.length>0&&!!this.context;},
 setLaughing(owner,reacting,weakness='normal'){
  if(!this.hasLaughClips())return;
  let state=this.reactions.get(owner);
  if(!state){if(!reacting)return;state={reacting:false,entry:null,history:[],gapUntil:null,releaseAt:null,weakness,firstPending:true};this.reactions.set(owner,state);}
  if(state.reacting===reacting&&(!reacting||state.weakness===weakness))return;
  state.reacting=reacting;
  if(reacting){this.stopSound(owner,'dizzy');if(state.entry)this.stop(state.entry);state.weakness=weakness;state.firstPending=true;state.releaseAt=null;state.gapUntil=null;this.nextLaugh(owner,state);}
  else{state.releaseAt=Math.min(this.context.currentTime+.3,state.entry?.endAt??Infinity);state.gapUntil=state.releaseAt;}
 },
 nextLaugh(owner,state){
  const opening=state.weakness==='super'?['laugh-10','laugh-11','laugh-12']:['laugh-1','laugh-2','laugh-3'];
  const choices=this.laughIds.filter(id=>(!state.firstPending||opening.includes(id))&&!this.laughHistory.includes(id));
  const id=choices[Math.floor(Math.random()*choices.length)];if(!id)return;
  if(this.play(id,{owner,channel:'voice',volume:.55,reaction:true,onEnded:entry=>{
   if(this.reactions.get(owner)!==state||state.entry!==entry)return;
   state.entry=null;state.gapUntil=entry.endAt;
   this.tickReactions();
  }})){state.entry=[...this.active].find(e=>e.owner===owner&&e.id===id);this.laughHistory.push(id);this.laughHistory=this.laughHistory.slice(-2);state.history=this.laughHistory.slice();state.firstPending=false;state.gapUntil=null;}
 },
 tickReactions(){
  if(!this.enabled||this.context?.state!=='running')return;
  for(const [owner,state] of this.reactions){
   if(!state.reacting&&state.releaseAt!==null&&this.context.currentTime>=state.releaseAt){if(state.entry)this.stop(state.entry);state.entry=null;state.releaseAt=null;state.gapUntil=null;this.play('dizzy',{owner,channel:'voice',volume:.5,reaction:true});continue;}
   if(state.entry)continue;
   if(state.gapUntil!==null&&this.context.currentTime<state.gapUntil)continue;
   if(state.reacting)this.nextLaugh(owner,state);
   else if(state.gapUntil!==null){state.gapUntil=null;this.play('dizzy',{owner,channel:'voice',volume:.5,reaction:true});}
  }
 }
};
const RYU_ATTACK_AUDIO={
 jab:{swing:1,impact:1},straight:{swing:2,impact:2},heavyPunch:{swing:3,impact:3},hook:{swing:3,impact:3},
 lightKick:{swing:4,impact:4},sideKick:{swing:5,impact:5},roundhouse:{swing:6,impact:6},highKick:{swing:6,impact:6},
 crouchPunch:{swing:1,impact:1},lowKick:{swing:4,impact:4},sweep:{swing:6,impact:6},jumpKick:{swing:6,impact:6},
 hadouken:{voice:'hadouken',impact:7},shoryuken:{voice:'shoryuken',swing:3,impact:3},tatsu:{voice:'tatsumaki',swing:6,impact:6}
};

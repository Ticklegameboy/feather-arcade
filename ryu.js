/* Original SF3 pixels and AIR timing: Umihei; source archive: Tatayecorp/demo_mugenJS. */
const RyuAssets = {
  assetRevision: 'tutorial-sound-r62',
  assetURL(path) { return `${path}?v=${this.assetRevision}`; },
  scale: 1.65, data: null, pages: [], shirtlessPages: [], shirtlessMap: null, clips: {},
  definitions: {
    idle:[0], walk:[20], back:[21], crouch:[10,11,12],
    dash:[100,101,102,103], backdash:[105,106,107,108],
    jump:[40,41,47], jumpKick:[40,671,47],
    guard:[120,130,140], crouchGuard:[121,131,141], guardHit:[150,151],
    jab:[201], straight:[211], heavyPunch:[221], hook:[241],
    lightKick:[261], sideKick:[271], roundhouse:[281], highKick:[291],
    crouchPunch:[401], lowKick:[441], sweep:[451,455],
    hadouken:[1001,1002], shoryuken:[1201,1211,1221],
    tatsu:[1401,1402,1402,1402,1406],
    hit:[5000,5001], bodyHit:[5010,5011], stagger:[5030,5031],
    fall:[5100], down:[5110], getup:[5120], dizzy:[5300],
    victory:[181], intro:[191], fireball:[1011], fireballEnd:[1015]
  },
  async load() {
    this.data = await (typeof AssetLoader!=='undefined'?AssetLoader.json('ryu/animations.json'):fetch('ryu/animations.json').then(r=>r.json()));
    const needed = new Set();
    for (const [name,ids] of Object.entries(this.definitions)) {
      const frames=[];
      for (const id of ids) {
        const action=this.data.actions[id];
        if (!action) throw Error('缺少動作 '+id);
        for (const f of action.frames) {
          const s=this.data.sprites[f.sprite];
          if (!s) throw Error('戰鬥動作缺少精靈 '+f.sprite);
          needed.add(s.page);
          frames.push({...f, ticks:f.ticks<0?12:Math.max(1,f.ticks), sourceAction:id});
        }
      }
      this.clips[name]={frames,ticks:frames.reduce((sum,f)=>sum+f.ticks,0)};
    }
    await Promise.all([...needed].map(page=>typeof AssetLoader!=='undefined'?AssetLoader.image(new Image(),`ryu/atlas-${page}.png`).then(im=>{this.pages[page]=im;}):new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>{this.pages[page]=image;resolve();};
      image.onerror=()=>reject(Error('隆的精靈頁載入失敗'));image.src=`ryu/atlas-${page}.png`;
    })));
    this.shirtlessMap=await (typeof AssetLoader!=='undefined'?AssetLoader.json(this.assetURL('ryu/shirtless/manifest.json')):fetch(this.assetURL('ryu/shirtless/manifest.json')).then(r=>r.json()));
    await Promise.all(Array.from({length:this.shirtlessMap.sheets},(_,i)=>new Promise((resolve,reject)=>{
      const im=new Image();im.onerror=()=>reject(Error('外觀精靈載入失敗'));
      const prepare=()=>{
        const layout=this.shirtlessMap.layouts[i];
        const density=this.shirtlessMap.textureScale||1;
        const c=document.createElement('canvas');c.width=layout.cols*this.shirtlessMap.cell*density;c.height=layout.rows*this.shirtlessMap.cell*density;
        const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,c.width,c.height);
        if(!this.shirtlessMap.transparent){
          const d=g.getImageData(0,0,c.width,c.height);
          for(let n=0;n<d.data.length;n+=4){const r=d.data[n],v=d.data[n+1],b=d.data[n+2];if((v>105&&v>r*1.4&&v>b*1.4)||(r>150&&b>140&&v<100&&r>v*1.7&&b>v*1.7))d.data[n+3]=0;}
          g.putImageData(d,0,0);
        }
        this.shirtlessPages[i]=c;resolve();
      };if(typeof AssetLoader!=='undefined')AssetLoader.image(im,this.assetURL(`ryu/shirtless/combat-${i}.png`)).then(()=>{try{prepare();}catch(error){reject(error);}},reject);else {im.onload=prepare;im.src=this.assetURL(`ryu/shirtless/combat-${i}.png`);}
    })));
    return this;
  },
  frame(name,time,loop=false) {
    const clip=this.clips[name]||this.clips.idle;
    if (!clip) return null;
    let tick=Math.max(0,time*60);
    tick=loop?tick%clip.ticks:Math.min(tick,clip.ticks-.001);
    for (const f of clip.frames) { if(tick<f.ticks)return f;tick-=f.ticks; }
    return clip.frames[clip.frames.length-1];
  },
  duration(name) { return this.clips[name].ticks/60; },
  draw(ctx,name,time,x,feet,face=1,options={}) {
    const f=this.frame(name,time,options.loop);if(!f)return;
    const s=this.data.sprites[f.sprite],costume=options.shirtless&&this.shirtlessMap.items[f.sprite];
    const page=costume?this.shirtlessPages[costume.sheet]:this.pages[s.page];if(!page)return;
    let [sx,sy,w,h]=s.rect,[ax,ay]=s.axis;
    if(costume){const size=this.shirtlessMap.cell,cols=this.shirtlessMap.layouts[costume.sheet].cols;sx=costume.cell%cols*size;sy=Math.floor(costume.cell/cols)*size;w=h=size;ax+=costume.x;ay+=costume.y;}
    const scale=options.scale||this.scale;
    ctx.save();ctx.translate(Math.round(x),Math.round(feet));ctx.scale(face*scale,scale);
    if(options.alpha!==undefined)ctx.globalAlpha*=options.alpha;
    if(f.blend.startsWith('A'))ctx.globalCompositeOperation='lighter';
    ctx.translate(f.x,f.y);ctx.scale(f.flip.includes('H')?-1:1,f.flip.includes('V')?-1:1);
    // Texture resolution is independent of AIR coordinates, sprite pivots and hitboxes.
    const density=costume?(this.shirtlessMap.textureScale||1):1;
    ctx.drawImage(page,sx*density,sy*density,w*density,h*density,-ax,-ay,w,h);ctx.restore();
  },
  boxes(name,time,x,feet,face,kind='hurt',loop=false) {
    const f=this.frame(name,time,loop);if(!f)return [];
    const s=this.scale,flip=f.flip.includes('H')?-1:1,v=f.flip.includes('V')?-1:1;
    return f[kind].map(([l,t,r,b])=>{
      const x1=x+(f.x+l*flip)*face*s,x2=x+(f.x+r*flip)*face*s;
      const y1=feet+(f.y+t*v)*s,y2=feet+(f.y+b*v)*s;
      return [Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2)];
    });
  }
};

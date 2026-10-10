/* Tiny Tindahan — mobile-first 2D game. No deps. Canvas procedural animation. */
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SAVE_KEY='tinyTindahanSaveV1';

/* ---------- IMAGE ASSETS (paste real URLs here) ----------
   Hanggang walang tunay na link, procedural art ang gamit (no broken images).
   Kapag nag-paste ka ng https:// URL, drawImage() ang magpapakita nito
   nang hindi nabe-bend (contain-fit) at hindi pixelated (high smoothing). */
const ASSETS={
  store:'[I-PASTE ANG LINK NG TINDING PNG MO DITO]',
  kubo:'[I-PASTE ANG LINK NG KUBO PNG MO DITO]',
  products:{
    sweetcorn:'[I-PASTE ANG LINK NG SWEET CORN DITO]',
    pompoms:'[I-PASTE ANG LINK NG POMPOMS DITO]',
  },
};
const IMG={}; // key -> {img, loaded, failed}
function isRealUrl(u){return typeof u==='string'&&/^https?:\/\/.+/i.test(u)&&u.indexOf('I-PASTE')===-1;}
function assetOverrides(){try{return JSON.parse(localStorage.getItem('tinyTindahanAssetsV1')||'{}');}catch(e){return{};}}
function resolveAsset(key,def){const o=assetOverrides();if(o[key]&&isRealUrl(o[key]))return o[key];return def;}
function loadAsset(key,url){
  if(!isRealUrl(url))return;
  const e=IMG[key]={img:new Image(),loaded:false,failed:false};
  e.img.onload=()=>{e.loaded=true;};
  e.img.onerror=()=>{e.failed=true;};
  e.img.src=url;
}
function loadAllAssets(){
  loadAsset('store',resolveAsset('store',ASSETS.store));
  loadAsset('kubo',resolveAsset('kubo',ASSETS.kubo));
  Object.entries(ASSETS.products||{}).forEach(([id,url])=>loadAsset('prod_'+id,resolveAsset('prod_'+id,url)));
}
function assetReady(key){const e=IMG[key];return (e&&e.loaded&&e.img.naturalWidth)?e.img:null;}
/* Contain-fit draw: never stretched, never squashed. */
function drawImageContain(g,img,cx,cy,boxW,boxH){
  const iw=img.naturalWidth,ih=img.naturalHeight;if(!iw||!ih)return false;
  const s=Math.min(boxW/iw,boxH/ih),dw=iw*s,dh=ih*s;
  const ps=g.imageSmoothingEnabled,pq=g.imageSmoothingQuality;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(img,cx-dw/2,cy-dh/2,dw,dh);
  g.imageSmoothingEnabled=ps;g.imageSmoothingQuality=pq;return true;
}
window.TindahanAssets={
  set(key,url){ // TindahanAssets.set('prod_pompoms','https://…png')
    if(!isRealUrl(url)){toast('Hindi valid na image URL.');return false;}
    const o=assetOverrides();o[key]=url;
    try{localStorage.setItem('tinyTindahanAssetsV1',JSON.stringify(o));}catch(e){}
    loadAsset(key,url);toast('🖼 Asset updated: '+key);return true;
  },
  keys(){return ['store','kubo',...Object.keys(ASSETS.products||{}).map(id=>'prod_'+id)];},
};

/* ---------- DATA ---------- */
const PRODUCTS=[
 {id:'pompoms',name:'Pompoms',short:'POM',c1:'#ff7a1a',c2:'#ffd23f',price:8,kind:'packet',era:0},
 {id:'sweetcorn',name:'Sweet Corn',short:'CORN',c1:'#f9d423',c2:'#2e7d4f',price:7,kind:'packet',era:0},
 {id:'bangus',name:'Sizzling Bangus',short:'BANGUS',c1:'#2196f3',c2:'#ff5252',price:9,kind:'packet',era:0},
 {id:'lumpia',name:'Lumpia',short:'LUMPIA',c1:'#ffb300',c2:'#8d2d00',price:10,kind:'packet',era:0},
 {id:'chocnut',name:'Choc Nut',short:'CHOC',c1:'#6d2c00',c2:'#ff9e3d',price:5,kind:'packet',era:0},
 {id:'sarsi',name:'Sarsi',short:'SARSI',c1:'#4a0000',c2:'#ff3d3d',price:12,kind:'bottle',era:0},
 {id:'bastapinoy',name:'Basta Pinoy',short:'B.PINOY',c1:'#0d47a1',c2:'#ffeb3b',price:8,kind:'packet',era:1},
 {id:'aiza',name:'Aiza',short:'AIZA',c1:'#ff5fa2',c2:'#ffffff',price:7,kind:'packet',era:1},
 {id:'lechon',name:'Lechon Manok',short:'LECHON',c1:'#c62828',c2:'#ffb300',price:11,kind:'packet',era:1},
 {id:'kentucky',name:'Kentucky',short:'KENTKY',c1:'#b71c1c',c2:'#ffffff',price:11,kind:'packet',era:1},
 {id:'piknik',name:'Piknik',short:'PIKNIK',c1:'#2e7d32',c2:'#ffeb3b',price:9,kind:'packet',era:1},
 {id:'yamyam',name:'Yamyam',short:'YAM',c1:'#7b1fa2',c2:'#ffcc80',price:6,kind:'packet',era:1},
 {id:'icedgem',name:'Iced Gem',short:'GEM',c1:'#4fc3f7',c2:'#f8bbd0',price:6,kind:'jar',era:2},
 {id:'dipsea',name:'Dip Sea',short:'DIP',c1:'#00695c',c2:'#80deea',price:8,kind:'packet',era:2},
 {id:'pusit',name:'Vinegar Pusit',short:'PUSIT',c1:'#37474f',c2:'#ff8a65',price:9,kind:'packet',era:2},
 {id:'clover',name:'Clover Bits',short:'CLOVER',c1:'#1b5e20',c2:'#ffd54f',price:8,kind:'packet',era:2},
 {id:'tomi',name:'Tomi',short:'TOMI',c1:'#e65100',c2:'#fff176',price:7,kind:'packet',era:2},
 {id:'kobi',name:'Kobi',short:'KOBI',c1:'#3e2723',c2:'#ffab40',price:7,kind:'packet',era:2},
 {id:'halo',name:'Halo-halo',short:'HALO',c1:'#ab47bc',c2:'#fff59d',price:15,kind:'cup',era:3},
 {id:'rinbee',name:'Rin-Bee',short:'RINBEE',c1:'#d32f2f',c2:'#ffeb3b',price:8,kind:'packet',era:3},
 {id:'choko',name:'Choko-Choko',short:'CHOKO',c1:'#4e342e',c2:'#ffcc80',price:6,kind:'packet',era:3},
 {id:'cheers',name:'Cheers',short:'CHEERS',c1:'#0d47a1',c2:'#80deea',price:12,kind:'bottle',era:3},
];
const P=id=>PRODUCTS.find(p=>p.id===id);
const ERAS=[
 {year:'1990',name:'Karikton',cap:60,desc:'Kahoy na pushcart, kubo, kawayan, dirt road.'},
 {year:'2000',name:'Sari-sari',cap:90,desc:'Yero + kongkretong bahay, semento, dagdag shelf.'},
 {year:'2010',name:'Mini-store',cap:120,desc:'Pinturang tindahan, paved road, jeep, modern shelf.'},
 {year:'2026',name:'Talipapa',cap:150,desc:'Maraming stall, ilaw, tricycle, tarpaulin.'},
];
const CUSTOMER_DEFS=[
 {name:'Jun-jun',role:'Bata',skin:'#f2b880',hair:0,hc:'#1a1a1a',shirt:'#ff5252',pants:'#3345ff',h:0.72,w:0.9,lines:['Pabili po ng {o}! P favorite ko!','Ate/Kuya, {o} daw sabi ni Mama!','Wow {o}! Bilis po, laro pa kami!']},
 {name:'Mika',role:'Estudyante',skin:'#e8a06c',hair:2,hc:'#3b2a1a',shirt:'#ffffff',pants:'#2e5cb8',h:0.85,w:0.9,lines:['Pabili {o}, baon ko sa school!','Miss na miss ko {o} noong bata ako!','Isang {o} nga, gutom na ako sa quiz!']},
 {name:'Aling Nena',role:'Nanay',skin:'#d99a63',hair:3,hc:'#555555',shirt:'#2e7d4f',pants:'#6d4c41',h:0.95,w:1.15,lines:['Nak, {o} nga at {o2}. Pameryenda ng mga bata.','Ay {o}! Parang noong 1990 pa lasa nito.','Magkano {o}? Sige, kunin ko na!']},
 {name:'Mang Boy',role:'Manggagawa',skin:'#c9854e',hair:1,hc:'#111111',shirt:'#455a64',pants:'#263238',h:1.05,w:1.1,lines:['Pabili {o}, pang-lunch break lang.','Isang {o} nga, pawis na pawis na ako!','Buti may {o} ka pa, suki na kita!']},
 {name:'Tatay Pilo',role:'Lolo',skin:'#e0a878',hair:1,hc:'#cccccc',shirt:'#a1887f',pants:'#4e342e',h:0.98,w:1.0,lines:['Noong araw, {o} limang piso lang…','Apó, {o} nga. Parang kay Lola mo.','Dahan-dahan lang, {o} at kuwentuhan muna!']},
 {name:'Liza',role:'Ate',skin:'#f0b27f',hair:2,hc:'#4a2c00',shirt:'#ff9ecb',pants:'#37474f',h:0.95,w:0.95,lines:['Pabili {o}! Craving talaga!','Picture muna ng {o} ko ha, pang-story!','{o} nga, tapos {o2} kung meron!']},
 {name:'Kuya Rodel',role:'Tricycle driver',skin:'#cf8a52',hair:0,hc:'#0a0a0a',shirt:'#ffeb3b',pants:'#212121',h:1.08,w:1.2,lines:['Pabili {o}, biyahe ulit ako!','Isang {o} nga, nauuhaw sa init!','Suki! {o} at {o2}, mabilis lang!']},
];
const OUTFITS=[
 {id:'tshirt90',name:'Lumang T-shirt',era:0,shirt:'#f5f0e1',pants:'#5d6d7e',dress:false},
 {id:'duster',name:'Duster ni Lola',era:0,shirt:'#ff9ecb',pants:'#ff9ecb',dress:true},
 {id:'bestida',name:'Bestida 90s',era:0,shirt:'#7fb3ff',pants:'#7fb3ff',dress:true},
 {id:'jersey',name:'Jersey 2000',era:1,shirt:'#d32f2f',pants:'#212121',dress:false},
 {id:'maong',name:'Maong 2000',era:1,shirt:'#4fc3f7',pants:'#1a237e',dress:false},
 {id:'hoodie',name:'Hoodie 2010',era:2,shirt:'#7c4dff',pants:'#37474f',dress:false},
 {id:'skinny',name:'Skinny 2010',era:2,shirt:'#ffeb3b',pants:'#212121',dress:false},
 {id:'street',name:'Street 2026',era:3,shirt:'#00e5ff',pants:'#111111',dress:false},
 {id:'baro',name:'Modern Baro 2026',era:3,shirt:'#fff176',pants:'#fff176',dress:true},
];
const SKINS=['#f6c391','#e8a06c','#c9854e','#8d5a2b'];
const DECORS=[
 {id:'canopyR',name:'Pulá canopy',cost:30},
 {id:'canopyB',name:'Asul canopy',cost:30},
 {id:'plant',name:'Halaman (+ganda)',cost:40},
 {id:'radio2',name:'Bagong radyo',cost:50},
 {id:'lights',name:'Paskong ilaw',cost:80},
];

/* ---------- SAVE ---------- */
function defaultSave(){
  const stock={};['pompoms','sweetcorn','bangus','lumpia','chocnut','sarsi'].forEach(id=>stock[id]=8);
  return {coins:20,stock,box:{},capacity:60,era:0,shopLevel:0,
    unlocked:['pompoms','sweetcorn','bangus','lumpia','chocnut','sarsi'],
    upgrades:{capTier:0},staff:[],decor:['canopyR'],
    char:{name:'Apo',skin:0,face:0,hair:1,body:1,outfit:'tshirt90'},
    lastClaim:'',storySeen:false,started:false,served:0,earned:0,reducedMotion:false,music:true,volume:0.6,radio:true};
}
let S;
try{const raw=localStorage.getItem(SAVE_KEY);S=raw?Object.assign(defaultSave(),JSON.parse(raw)):defaultSave();}
catch(e){S=defaultSave();}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function stockTotal(){return Object.values(S.stock).reduce((a,b)=>a+(b||0),0);}
function boxTotal(){return Object.values(S.box).reduce((a,b)=>a+(b||0),0);}
function manilaToday(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}catch(e){const d=new Date(Date.now()+8*3600e3);return d.toISOString().slice(0,10);}}

/* ---------- AUDIO (original sounds) ---------- */
let AC=null,musicTimer=null,musicOn=S.music!==false,radioOn=S.radio!==false,vol=S.volume??0.6;
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function beep(f,dur,type,g,when=0){const ac=audio();if(!ac)return;const o=ac.createOscillator(),gn=ac.createGain();o.type=type||'sine';o.frequency.value=f;gn.gain.value=(g??0.15)*vol;const t=ac.currentTime+when;o.connect(gn);gn.connect(ac.destination);o.start(t);o.stop(t+dur);}
const sfx={
 coin(){beep(950,.09,'square',.12);beep(1420,.14,'square',.12,.09);},
 pop(){beep(520,.07,'triangle',.2);},
 buy(){beep(523,.1,'triangle',.2);beep(659,.1,'triangle',.2,.1);beep(784,.16,'triangle',.2,.2);},
 sad(){beep(300,.2,'sawtooth',.08);beep(220,.3,'sawtooth',.08,.15);},
 delivery(){[523,587,659,784].forEach((f,i)=>beep(f,.12,'triangle',.2,i*.11));},
};
// Original nostalgic pluck loop (C major pentatonic, own melody)
const MELODY=[523,587,659,784,659,587,523,440,523,659,784,880,784,659,587,523];
let mi=0;
function startMusic(){stopMusic();if(!musicOn||!radioOn)return;musicTimer=setInterval(()=>{if(document.hidden)return;const f=MELODY[mi%MELODY.length];beep(f,.28,'triangle',.10);if(mi%4===0)beep(f/2,.3,'sine',.07);mi++;},340);}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else startMusic();});
['pointerdown','touchstart'].forEach(ev=>document.addEventListener(ev,function once(){audio();startMusic();},{once:true}));

/* ---------- TOAST / LOG ---------- */
function toast(m,ms=2200){const t=$('toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add('hidden'),ms);}
function logDlg(who,text){const d=$('dialogLog');const el=document.createElement('div');el.innerHTML='<b>'+who+':</b> '+text;d.prepend(el);while(d.children.length>30)d.lastChild.remove();}

/* roundRect fallback for older WebViews */
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this;};}

/* ---------- CHARACTER DRAWING (proper limbs) ---------- */
function drawPerson(g,x,yBase,sc,o,phase,mode){
  // o:{skin,hair,hc,shirt,pants,h,w,face,body,outfitDress}
  const red=S.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=red?0:phase;
  const walking=(mode==='walk');
  const bob=walking?(red?0:Math.abs(Math.sin(t))*3*sc):Math.sin(t*0.7)*1.2*sc;
  const legSwing=walking?(red?0:Math.sin(t)*0.9):0;
  const armSwing=walking?(red?0:Math.sin(t+Math.PI)*0.8):(mode==='happy'?Math.sin(t*2)*0.3:Math.sin(t*0.7)*0.12);
  const y=yBase+bob*0.3;
  const wMul=(o.w||1)*(o.body===2?1.35:o.body===0?0.8:1);
  const hMul=o.h||1;
  const legL=26*sc*hMul, hipY=y-legL;
  g.lineCap='round';
  // shadow
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x,yBase+4*sc,20*sc*wMul,6*sc,0,0,7);g.fill();
  // legs (two visible limbs with knees+feet)
  const legW=7*sc*wMul;
  [[-1,legSwing],[1,-legSwing]].forEach(([side,sw])=>{
    const kx=x+side*6*sc+sw*10*sc, ky=hipY+legL*0.55;
    const fx=x+side*6*sc+sw*16*sc, fy=y-1*sc;
    g.strokeStyle=o.pants||'#333';g.lineWidth=legW;
    g.beginPath();g.moveTo(x+side*5*sc,hipY);g.lineTo(kx,ky);g.lineTo(fx,fy);g.stroke();
    g.fillStyle='#3b2a1a';g.fillRect(fx-7*sc,fy-3*sc,14*sc,6*sc); // tsinelas
  });
  // torso (outfit visibly differs)
  const torsoH=(o.dress?44:34)*sc*hMul, torsoW=(o.dress?30:24)*sc*wMul;
  g.fillStyle=o.shirt||'#fff';
  if(o.dress){g.beginPath();g.moveTo(x-torsoW*0.55,hipY);g.lineTo(x+torsoW*0.55,hipY);g.lineTo(x+torsoW*0.9,hipY-torsoH);g.lineTo(x-torsoW*0.9,hipY-torsoH);g.closePath();g.fill();}
  else{g.fillRect(x-torsoW/2,hipY-torsoH,torsoW,torsoH);}
  g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x-torsoW/2,hipY-torsoH,torsoW,5*sc);
  // arms (two limbs, swing opposite)
  [[-1,armSwing],[1,-armSwing]].forEach(([side,sw])=>{
    const shX=x+side*torsoW*0.55, shY=hipY-torsoH+6*sc;
    let ex,ey;
    if(mode==='give'){ex=x;ey=shY+14*sc; // both reach forward
    }else{ex=shX+side*4*sc+sw*10*sc;ey=shY+20*sc+Math.abs(sw)*4*sc;}
    g.strokeStyle=o.skin;g.lineWidth=6*sc;
    g.beginPath();g.moveTo(shX,shY);g.lineTo((shX+ex)/2+sw*3*sc,(shY+ey)/2);g.lineTo(ex,ey);g.stroke();
    g.fillStyle=o.skin;g.beginPath();g.arc(ex,ey,3.6*sc,0,7);g.fill();
  });
  // head
  const hr=13*sc*(o.body===2?1.1:1);
  const hy=hipY-torsoH-hr-4*sc+bob*0.4;
  g.fillStyle=o.skin;g.beginPath();g.arc(x,hy,hr,0,7);g.fill();
  // hair variants
  g.fillStyle=o.hc||'#222';
  if(o.hair===0){g.beginPath();g.arc(x,hy-3*sc,hr,Math.PI,0);g.fill();} // short
  else if(o.hair===1){g.beginPath();g.arc(x,hy-2*sc,hr+1*sc,Math.PI*0.95,Math.PI*2.05);g.fill();g.fillRect(x-hr,hy-hr-6*sc,hr*2,7*sc);} // cap/flat
  else if(o.hair===2){g.beginPath();g.arc(x,hy-3*sc,hr+1*sc,Math.PI,0);g.fill();g.fillRect(x-hr-4*sc,hy-6*sc,6*sc,20*sc);g.fillRect(x+hr-2*sc,hy-6*sc,6*sc,20*sc);} // long
  else{g.beginPath();g.arc(x,hy-2*sc,hr+2*sc,Math.PI*0.9,Math.PI*2.1);g.fill();g.beginPath();g.arc(x,hy-hr-8*sc,5*sc,0,7);g.fill();} // bun
  // faces variants
  g.fillStyle='#222';
  const blink=(Math.sin(t*0.5)>0.97)?0.2:1;
  if(o.face===0){g.fillRect(x-6*sc,hy-1*sc,3*sc,4*sc*blink);g.fillRect(x+3*sc,hy-1*sc,3*sc,4*sc*blink);g.strokeStyle='#222';g.lineWidth=1.6*sc;g.beginPath();g.arc(x,hy+4*sc,5*sc,0.2,Math.PI-0.2);g.stroke();}
  else if(o.face===1){g.beginPath();g.arc(x-5*sc,hy,1.8*sc,0,7);g.arc(x+5*sc,hy,1.8*sc,0,7);g.fill();g.strokeStyle='#222';g.beginPath();g.arc(x,hy+3*sc,4*sc,0,Math.PI);g.stroke();}
  else{g.fillRect(x-6*sc,hy-2*sc,4*sc,2*sc);g.fillRect(x+2*sc,hy-2*sc,4*sc,2*sc);g.fillRect(x-3*sc,hy+5*sc,6*sc,2*sc);}
  if(mode==='happy'){g.strokeStyle='#222';g.lineWidth=2*sc;g.beginPath();g.arc(x,hy+3*sc,7*sc,0.1,Math.PI-0.1);g.stroke();}
  if(mode==='sad'){g.strokeStyle='#222';g.beginPath();g.arc(x,hy+8*sc,5*sc,Math.PI+0.3,-0.3);g.stroke();}
}
function drawCharFromSave(g,x,y,sc,phase,mode){
  const c=S.char, of=OUTFITS.find(o=>o.id===c.outfit)||OUTFITS[0];
  drawPerson(g,x,y,sc,{skin:SKINS[c.skin],hair:c.hair,hc:'#2b1c10',shirt:of.shirt,pants:of.pants,h:1,w:1,face:c.face,body:c.body,dress:of.dress},phase,mode||'idle');
}

/* ---------- PRODUCT PACKET DRAWING ---------- */
function drawProduct(g,p,x,y,w,h,sway=0,sel=false){
  g.save();g.translate(x,y+Math.sin(sway)*2);if(sel){g.translate(0,-6);g.shadowColor='#2e7d4f';g.shadowBlur=10;}
  const pim=assetReady('prod_'+p.id);
  if(pim){drawImageContain(g,pim,0,0,w,h);g.restore();return;} // real sprite, aspect preserved
  if(p.kind==='bottle'){
    g.fillStyle=p.c1;g.fillRect(-w*0.22,-h*0.5,w*0.44,h);
    g.fillStyle=p.c2;g.fillRect(-w*0.22,-h*0.12,w*0.44,h*0.24);
    g.fillStyle='#c9a86a';g.fillRect(-w*0.12,-h*0.68,w*0.24,h*0.2);
    g.fillStyle='#fff';g.font=`900 ${Math.max(7,w*0.22)}px sans-serif`;g.textAlign='center';g.fillText(p.short,-0,-h*0.02+3);
  }else if(p.kind==='jar'||p.kind==='cup'){
    g.fillStyle='rgba(255,255,255,.9)';g.fillRect(-w/2,-h/2,w,h);
    g.fillStyle=p.c1;g.fillRect(-w/2,-h/2,w,h*0.3);
    g.fillStyle=p.c2;g.beginPath();g.arc(0,h*0.1,w*0.28,0,7);g.fill();
    g.fillStyle='#3b2a1a';g.font=`900 ${Math.max(6,w*0.2)}px sans-serif`;g.textAlign='center';g.fillText(p.short,0,-h*0.22);
  }else{
    g.fillStyle=p.c1;g.beginPath();g.roundRect(-w/2,-h/2,w,h,4);g.fill();
    g.fillStyle=p.c2;g.fillRect(-w/2,-h*0.1,w,h*0.34);
    g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-w/2,-h/2,w,h*0.18);
    g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;
    g.font=`900 ${Math.max(6,w*0.24)}px sans-serif`;g.textAlign='center';
    g.strokeText(p.short,0,2);g.fillText(p.short,0,2);
    g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-w/2,-h/2-3,w,3);
  }
  g.restore();
}

/* ---------- BACKGROUND PER ERA ---------- */
let leaves=[];
for(let i=0;i<14;i++)leaves.push({x:Math.random()*420,y:Math.random()*200,s:2+Math.random()*3,v:8+Math.random()*14,ph:Math.random()*7});
function drawBackground(g,t){
  const era=S.era, red=S.reducedMotion;
  const skies=[['#ffe9b8','#bfe3c6'],['#cfe8ff','#cfe8c0'],['#bfe0ff','#d8ecc8'],['#ffd9ec','#cfe0ff']];
  const gr=g.createLinearGradient(0,0,0,430);gr.addColorStop(0,skies[era][0]);gr.addColorStop(0.62,skies[era][1]);gr.addColorStop(0.63,'#9db87a');gr.addColorStop(1,'#7a9a5a');
  g.fillStyle=gr;g.fillRect(0,0,420,430);
  // sun + clouds
  g.fillStyle='#ffcf5c';g.beginPath();g.arc(360,52,22,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.9)';
  const cx=red?60:((60+t*6)%480)-30;
  g.beginPath();g.ellipse(cx,50,30,10,0,0,7);g.ellipse(cx+22,54,22,8,0,0,7);g.fill();
  // houses
  if(era===0){
    drawKubo(g,40,150);drawKubo(g,300,140,true);
    g.strokeStyle='#7a5a2a';g.lineWidth=3;for(let i=0;i<6;i++){g.beginPath();g.moveTo(10+i*70,250);g.lineTo(10+i*70,222);g.stroke();}g.strokeStyle='#a67c3a';g.beginPath();g.moveTo(0,230);g.lineTo(420,226);g.stroke();
    g.fillStyle='#8a6a3a';g.fillRect(0,268,420,50); // dirt road
    g.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<8;i++)g.fillRect(i*60+((t*0)%1),280+i*3,26,4);
  }else if(era===1){
    drawConcrete(g,30,140,'#ffe0b2');drawKubo(g,290,150,true);
    g.fillStyle='#9e9e9e';g.fillRect(0,268,420,50);g.fillStyle='#fff';for(let i=0;i<7;i++)g.fillRect(i*70,290,34,5);
  }else if(era===2){
    drawConcrete(g,20,130,'#bbdefb');drawConcrete(g,250,125,'#ffcdd2');
    g.fillStyle='#616161';g.fillRect(0,268,420,52);g.fillStyle='#ffeb3b';for(let i=0;i<7;i++)g.fillRect(i*70,292,30,5);
  }else{
    drawConcrete(g,10,120,'#e1bee7');drawConcrete(g,160,115,'#b2dfdb');drawConcrete(g,310,120,'#ffcc80');
    g.fillStyle='#424242';g.fillRect(0,268,420,54);
    if(S.decor.includes('lights')){g.fillStyle='#fff176';for(let i=0;i<10;i++){g.beginPath();g.arc(20+i*40,120+Math.sin(t*3+i)*3,3,0,7);g.fill();}}
  }
  // trees + sway leaves
  drawTree(g,90,220,t);drawTree(g,345,215,t+2);
  if(!red){g.fillStyle='rgba(46,125,50,.7)';leaves.forEach(L=>{L.y+=L.v*0.016;if(L.y>260){L.y=20;L.x=Math.random()*420;}g.fillRect(L.x+Math.sin(t*2+L.ph)*8,L.y,L.s,L.s*0.6);});}
  // nearby store + radio (real sprite when URL is pasted, else drawn fallback)
  drawNeighborStore(g,t,era,red);
}
function drawNeighborStore(g,t,era,red){
  const sim=assetReady('store');
  if(sim){drawImageContain(g,sim,350,195,130,110);} // bottom-anchored look, aspect preserved
  else{
    g.fillStyle=era>=2?'#8d6e63':'#a1887f';g.fillRect(300,180,100,70);
    g.fillStyle='#5d4037';g.fillRect(295,175,110,12);
    g.fillStyle='#fff';g.font='900 8px sans-serif';g.textAlign='center';g.fillText('ALING PONSING',350,188);
    g.font='7px sans-serif';g.fillText('sari-sari',350,197);
  }
  g.fillStyle='#222';g.fillRect(312,205,26,18); // radio
  g.strokeStyle='#ff5252';g.lineWidth=1.5;
  if(radioOn&&musicOn&&!red){for(let i=0;i<3;i++){g.beginPath();g.arc(325,214,6+i*4+Math.sin(t*4)*2,-0.6,0.6);g.stroke();}}
  g.fillStyle='#ffcf5c';g.font='11px sans-serif';g.textAlign='center';g.fillText('♪ radyo',325,236);
}
function drawKubo(g,x,y,flip){
  const kim=assetReady('kubo');
  if(kim){g.save();g.translate(x,y+5);if(flip)g.scale(-1,1);drawImageContain(g,kim,0,0,120,100);g.restore();return;}
  g.save();g.translate(x,y);if(flip)g.scale(-1,1);
  g.fillStyle='#8a5a2b';g.fillRect(-34,0,68,44);
  g.fillStyle='#5d3a12';for(let i=-30;i<34;i+=10)g.fillRect(i,0,3,44);
  g.fillStyle='#c49a4a';g.beginPath();g.moveTo(-44,2);g.lineTo(0,-30);g.lineTo(44,2);g.closePath();g.fill();
  g.fillStyle='#6d4c1a';g.beginPath();g.moveTo(-44,2);g.lineTo(0,-30);g.lineTo(0,2);g.closePath();g.fill();
  g.fillStyle='#3b2a1a';g.fillRect(-8,14,16,30);
  g.restore();
}
function drawConcrete(g,x,y,c){
  g.fillStyle=c;g.fillRect(x,y,90,90);
  g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x,y,90,10);
  g.fillStyle='#5d4037';g.fillRect(x+30,y+50,28,40);
  g.fillStyle='#90caf9';g.fillRect(x+8,y+24,22,18);g.fillRect(x+60,y+24,22,18);
  g.fillStyle='#fff';g.font='900 8px sans-serif';g.textAlign='center';
  g.fillText(S.era>=3?'TALIPAPA':'BAHAY',x+45,y+16);
}
function drawTree(g,x,y,t){
  g.strokeStyle='#5d4037';g.lineWidth=8;g.beginPath();g.moveTo(x,y+30);g.lineTo(x,y);g.stroke();
  const sw=S.reducedMotion?0:Math.sin(t*1.5+x)*4;
  g.fillStyle='#2e7d4f';g.beginPath();g.arc(x+sw,y-16,26,0,7);g.arc(x-16+sw,y-6,18,0,7);g.arc(x+16+sw,y-6,18,0,7);g.fill();
}
function drawShop(g,t){
  const lvl=S.shopLevel, cx=210, base=330;
  const sim=assetReady('store');
  if(sim&&lvl>=1){drawImageContain(g,sim,cx,base-118,[0,0,230,270,320][lvl],160);} // real store art as facade; shelves+canopy still drawn over it
  const flutter=S.reducedMotion?0:Math.sin(t*2.2)*3;
  // wheels + cart body grows with level
  const wdt=[150,190,230,280][lvl];
  g.fillStyle='#6d4c1a';g.fillRect(cx-wdt/2,base-58,wdt,52);
  g.fillStyle='#8a5a2b';g.fillRect(cx-wdt/2,base-58,wdt,10);
  g.fillStyle='#3b2a1a';
  [[-wdt/2+18],[wdt/2-18]].forEach(([dx])=>{g.beginPath();g.arc(cx+dx,base+2,13,0,7);g.fill();g.fillStyle='#c9a86a';g.beginPath();g.arc(cx+dx,base+2,5,0,7);g.fill();g.fillStyle='#3b2a1a';});
  // canopy poles + fluttering canopy
  g.strokeStyle='#5d4037';g.lineWidth=5;
  g.beginPath();g.moveTo(cx-wdt/2+8,base-58);g.lineTo(cx-wdt/2+8,base-110);g.stroke();
  g.beginPath();g.moveTo(cx+wdt/2-8,base-58);g.lineTo(cx+wdt/2-8,base-110);g.stroke();
  const can=S.decor.includes('canopyB')?'#4fc3f7':(S.decor.includes('canopyR')?'#e2703a':'#e2703a');
  g.fillStyle=can;g.beginPath();g.moveTo(cx-wdt/2-14,base-108+flutter);g.lineTo(cx+wdt/2+14,base-108-flutter);g.lineTo(cx+wdt/2,base-88);g.lineTo(cx-wdt/2,base-88);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.85)';g.font='900 11px sans-serif';g.textAlign='center';
  g.fillText(lvl===0?'LOLA\'S KARITON ★ 1990':lvl===1?'SARI-SARI ★ 2000':lvl===2?'MINI-STORE ★ 2010':'TALIPAPA ★ 2026',cx,base-94);
  // handwritten price sign
  g.save();g.translate(cx-wdt/2-34,base-70);g.rotate(-0.06);
  g.fillStyle='#fff8e1';g.strokeStyle='#5d4037';g.lineWidth=2;g.fillRect(0,0,52,42);g.strokeRect(0,0,52,42);
  g.fillStyle='#3b2a1a';g.font='900 9px sans-serif';g.fillText('PRESYO',26,12);g.font='8px sans-serif';g.fillText('mura!',26,24);g.fillText('suki ❤',26,34);
  g.restore();
  // shelves: hanging packets sway + jars + bottles
  const un=S.unlocked.slice(0,lvl===0?6:lvl===1?12:lvl===2?18:24);
  const swayBase=t*2;
  un.slice(0,9).forEach((id,i)=>{
    const p=P(id);const hx=cx-wdt/2+22+i*((wdt-44)/8);
    const sway=swayBase+i*0.7;
    if(p.kind==='bottle'){drawProduct(g,p,hx,base-40,20,30,sway);}
    else{ // hanging
      g.strokeStyle='#3b2a1a';g.lineWidth=1.5;g.beginPath();g.moveTo(hx,base-88);g.lineTo(hx+Math.sin(sway)*4,base-66);g.stroke();
      drawProduct(g,p,hx+Math.sin(sway)*4,base-52,26,30,sway);
      const q=S.stock[id]||0;
      g.fillStyle=q>0?'#2e7d4f':'#c62828';g.beginPath();g.arc(hx+10,base-62,8,0,7);g.fill();
      g.fillStyle='#fff';g.font='900 9px sans-serif';g.textAlign='center';g.fillText(q>9?'9+':String(q),hx+10,base-59);
    }
  });
  if(S.decor.includes('plant')){g.fillStyle='#2e7d4f';g.beginPath();g.arc(cx+wdt/2+22,base-20,12,0,7);g.fill();g.fillStyle='#8d2d00';g.fillRect(cx+wdt/2+14,base-14,16,12);}
}

/* ---------- CUSTOMERS / GAME LOOP ---------- */
let custs=[],spawnT=1,flyAnims=[],activeIdx=0;
function unlockedProds(){return PRODUCTS.filter(p=>S.unlocked.includes(p.id));}
function fmtOrder(o){return o.map(l=>`${l.qty}× ${P(l.pid).name}`).join(', ');}
function makeOrder(){
  const pool=unlockedProds();
  const inStock=pool.filter(p=>(S.stock[p.id]||0)>0);
  const useStock=inStock.length&&Math.random()<0.8?inStock:pool;
  const n=1+(Math.random()<0.45?1:0)+(Math.random()<0.18?1:0);
  const order=[];const copy=[...useStock];
  for(let i=0;i<n&&copy.length;i++){const p=copy.splice(Math.floor(Math.random()*copy.length),1)[0];order.push({pid:p.id,qty:1+(Math.random()<0.3?1:0)});}
  if(!order.length)order.push({pid:pool[0].id,qty:1});
  return order;
}
function spawnCustomer(){
  const def=CUSTOMER_DEFS[Math.floor(Math.random()*CUSTOMER_DEFS.length)];
  const order=makeOrder();
  const names=order.map(l=>P(l.pid).name);
  let tpl=def.lines[Math.floor(Math.random()*def.lines.length)];
  tpl=tpl.replace('{o}',names[0]||'').replace('{o2}',names[1]||names[0]||'');
  custs.push({def,order,line:tpl,x:460,y:322,state:'walk',phase:Math.random()*7,patience:75+Math.random()*30+(S.staff.length*25),mood:'idle',payT:0});
}
function updateGame(dt,t){
  spawnT-=dt;
  if(spawnT<=0&&custs.length<3){spawnCustomer();spawnT=6+Math.random()*5;}
  // queue targets
  const spots=[250,330,400];
  custs.forEach((c,i)=>{
    c.phase+=dt*7;
    const tx=spots[Math.min(i,2)];
    if(c.state==='walk'){
      c.x+=(tx-c.x)*Math.min(1,dt*1.6);
      if(Math.abs(c.x-tx)<4){c.x=tx;c.state='order';}
    }else if(c.state==='order'){
      c.patience-=dt;
      if(c.patience<=0){c.state='leave';c.mood='sad';logDlg(c.def.name,'Hay… aalis na ako. Balik na lang ako!');sfx.sad();}
    }else if(c.state==='happy'){
      c.payT-=dt;if(c.payT<=0)c.state='leave';
    }else if(c.state==='leave'){
      c.x-=dt*110;if(c.x<-40){custs.splice(custs.indexOf(c),1);}
    }
  });
  flyAnims=flyAnims.filter(f=>{f.t+=dt*2;return f.t<1;});
  render(t);
}
function currentCust(){return custs[0]&&custs[0].state==='order'?custs[0]:null;}
let tray={}; // pid->qty
function render(t){
  const cv=$('gameCanvas');if(!cv)return;const g=cv.getContext('2d');
  g.clearRect(0,0,420,430);
  drawBackground(g,t);drawShop(g,t);
  // staff behind cart
  S.staff.forEach((s,i)=>{drawPerson(g,150+i*24,318,0.8,{skin:'#e8a06c',hair:2,hc:'#111',shirt:'#2e7d4f',pants:'#333',h:0.9,w:1,face:1},t*1.2+i,'idle');});
  // player
  drawCharFromSave(g,120,332,1.0,t*1.4,custs[0]?.state==='order'?'give':'idle');
  // customers queue
  custs.forEach((c,i)=>{
    const sc=c.def.h*0.95;
    const mode=c.state==='walk'?'walk':c.state==='happy'?'happy':c.mood==='sad'||c.state==='leave'&&c.mood==='sad'?'sad':'idle';
    drawPerson(g,c.x,c.y,sc,{skin:c.def.skin,hair:c.def.hair,hc:c.def.hc,shirt:c.def.shirt,pants:c.def.pants,h:1,w:c.def.w,face:i%3},c.phase,mode);
    g.fillStyle='rgba(0,0,0,.6)';g.font='900 11px sans-serif';g.textAlign='center';g.fillText(c.def.name+' • '+c.def.role,c.x,c.y-118*sc);
    if(c.state==='order'&&i===0){
      // speech bubble matching order
      const bx=clamp(c.x,120,290),by=c.y-200;
      g.fillStyle='#fff';g.strokeStyle='#3b2a1a';g.lineWidth=2;
      g.beginPath();g.roundRect(bx-105,by,210,86,10);g.fill();g.stroke();
      g.beginPath();g.moveTo(c.x-8,c.y-112);g.lineTo(c.x+8,c.y-112);g.lineTo(bx,by+86);g.closePath();g.fillStyle='#fff';g.fill();
      g.fillStyle='#3b2a1a';g.font='12px sans-serif';g.textAlign='center';
      const words=c.line.length>52?c.line.slice(0,52)+'…':c.line;
      g.fillText('“'+words+'”',bx,by+18);
      c.order.forEach((l,j)=>{drawProduct(g,P(l.pid),bx-60+j*60,by+52,34,32,t*2+j);g.fillStyle='#3b2a1a';g.font='900 11px sans-serif';g.fillText('×'+l.qty,bx-60+j*60,by+72);});
      // patience bar
      g.fillStyle='#ddd';g.fillRect(bx-90,by+76,180,6);
      g.fillStyle=c.patience>30?'#2e7d4f':'#c62828';g.fillRect(bx-90,by+76,180*clamp(c.patience/100,0,1),6);
    }
  });
  flyAnims.forEach(f=>{
    const x=f.x0+(f.x1-f.x0)*f.t, y=f.y0+(f.y1-f.y0)*f.t-40*Math.sin(f.t*Math.PI);
    drawProduct(g,P(f.pid),x,y,30,30,0,true);
  });
  refreshOrderBar();
}
function refreshOrderBar(){
  const c=currentCust();const bar=$('orderBar');
  if(!c){bar.classList.add('hidden');return;}
  bar.classList.remove('hidden');
  $('orderText').textContent=`🧾 ${c.def.name}: ${fmtOrder(c.order)} — “${c.line}”`;
  const tr=$('trayRow');tr.innerHTML='';
  Object.entries(tray).forEach(([pid,q])=>{if(q>0){const d=document.createElement('span');d.className='tray-chip';d.textContent=`${P(pid).name} ×${q}`;tr.appendChild(d);}});
  if(!Object.keys(tray).length||!Object.values(tray).some(v=>v>0))tr.innerHTML='<span class="hint">Tapikin ang paninda sa ibaba 👇</span>';
  if(!$('pasBtn')){const b=document.createElement('button');b.id='pasBtn';b.className='btn ghost';b.textContent='Pasensya 🙏';b.onclick=()=>{if(currentCust()){logDlg('Ikaw','Pasensya na po, ubos na ang stock! Balik po kayo bukas.');sfx.sad();currentCust().state='leave';currentCust().mood='sad';tray={};save();}};$('serveBtn').parentElement.appendChild(b);}
}
function renderShelf(){
  const sh=$('shelf');sh.innerHTML='';
  PRODUCTS.forEach(p=>{
    const un=S.unlocked.includes(p.id);
    const d=document.createElement('button');d.className='item'+(un?'':' locked')+((tray[p.id]||0)>0?' selected':'');
    d.innerHTML=`<div class="pk" data-pk="${p.id}"></div><div class="nm">${un?p.name:'🔒 '+p.name}</div><div class="ct">Stock: ${un?(S.stock[p.id]||0):'—'}</div><div class="pr">🪙${p.price}${un?'':' • era '+ERAS[p.era].year}</div>`;
    d.onclick=()=>{
      if(!un){toast(`🔒 Ma-unlock sa ${ERAS[p.era].year} upgrade!`);return;}
      const c=currentCust();if(!c){toast('Hintay muna ng customer…');return;}
      if((S.stock[p.id]||0)<=((tray[p.id]||0))){toast(`Ubós na ang ${p.name}! Kuha sa Delivery 📦`);logDlg('Ikaw',`Naku, ubos na ang ${p.name}…`);sfx.sad();return;}
      tray[p.id]=(tray[p.id]||0)+1;sfx.pop();renderShelf();
    };
    sh.appendChild(d);
    const pk=d.querySelector('[data-pk]');const c2=document.createElement('canvas');c2.width=52;c2.height=52;pk.appendChild(c2);
    drawProduct(c2.getContext('2d'),p,26,28,34,36,p.id.length);
  });
}
$('serveBtn').onclick=()=>{
  const c=currentCust();if(!c)return;
  // exact match required
  const want={};c.order.forEach(l=>want[l.pid]=(want[l.pid]||0)+l.qty);
  const keys=new Set([...Object.keys(want),...Object.keys(tray).filter(k=>tray[k]>0)]);
  for(const k of keys){if((want[k]||0)!==(tray[k]||0)){toast('❌ Hindi tugma! Order: '+fmtOrder(c.order));return;}}
  for(const l of c.order){if((S.stock[l.pid]||0)<l.qty){toast(`❌ Walang stock: ${P(l.pid).name}`);return;}}
  let gain=0;c.order.forEach(l=>{S.stock[l.pid]-=l.qty;gain+=P(l.pid).price*l.qty;flyAnims.push({pid:l.pid,x0:210,y0:250,x1:c.x,y1:c.y-60,t:0});});
  S.coins+=gain;S.served++;S.earned+=gain;
  logDlg('Ikaw',`Salamat ${c.def.name}! ${gain} coins! 🪙`);logDlg(c.def.name,['Salamat, suki!','Sarap! Balik ako bukas!','Buti na lang may stock ka pa!'][Math.floor(Math.random()*3)]);
  sfx.buy();setTimeout(()=>sfx.coin(),250);
  c.state='happy';c.mood='happy';c.payT=1.2;tray={};save();refreshStats();renderShelf();renderUpgrades();
};
$('clearTrayBtn').onclick=()=>{tray={};renderShelf();refreshOrderBar();};

/* ---------- DELIVERY ---------- */
function freeAmount(){return Math.max(6,Math.floor(S.capacity/2));}
function distribute(addMap){
  // addMap pid->qty requested; respect free space, rest to box
  let free=S.capacity-stockTotal();
  for(const [pid,q] of Object.entries(addMap)){
    let put=Math.min(q,Math.max(0,free));
    S.stock[pid]=(S.stock[pid]||0)+put;free-=put;
    let left=q-put;if(left>0)S.box[pid]=(S.box[pid]||0)+left;
  }
}
function mixedBundle(n,bonus=0){
  const pool=unlockedProds();const map={};const total=n+bonus;
  for(let i=0;i<total;i++){const p=pool[i%pool.length];map[p.id]=(map[p.id]||0)+1;}
  return map;
}
function refreshDelivery(){
  const today=manilaToday();const claimed=S.lastClaim===today;
  $('dailyInfo').textContent=claimed?`✔ Na-claim na ngayong ${today} (Manila). Balik bukas! May ${boxTotal()} sa box.`:`🎁 Libreng delivery ngayon (${today}, Manila): ~${freeAmount()} piraso (≈kalahati ng ${S.capacity}). Hindi ito pupuno nang todo — sobra mapupunta sa box.`;
  $('claimFreeBtn').disabled=claimed;$('claimAdBtn').disabled=claimed;
  // bundles
  const br=$('bundleRow');br.innerHTML='';
  window._bundle=window._bundle||'mixed';
  [['mixed','🎲 Halo (+6)'],...unlockedProds().slice(0,6).map(p=>[p.id,`+6 ${p.name}`])].forEach(([id,label])=>{
    const b=document.createElement('button');b.className='btn small'+(window._bundle===id?' primary':' ghost');b.textContent=label;
    b.onclick=()=>{window._bundle=id;refreshDelivery();};br.appendChild(b);
  });
  $('adStatus').textContent='Demo Ad lang — walang totoong kita. Bawat tapos = eksaktong 6 piraso.';
  const pp=$('paidPacks');pp.innerHTML='';
  [['Maliit — 20pcs — ₱49','20'],['Gitna — 50pcs — ₱99','50'],['Laki — 120pcs — ₱199','120']].forEach(([t,n])=>{
    const d=document.createElement('div');d.className='up-card';d.innerHTML=`<b>${t}</b><p>Demo-only — hindi pa connected ang payments. Hindi ito investment o pagkakakitaan.</p>`;
    const btn=document.createElement('button');btn.className='btn small';btn.textContent='Hindi available (demo)';btn.disabled=true;btn.title='Payments not connected';
    d.appendChild(btn);pp.appendChild(d);
  });
  const bl=$('deliveryBoxList');bl.innerHTML=boxTotal()?Object.entries(S.box).filter(([,q])=>q>0).map(([pid,q])=>`<span class="tray-chip">📥 ${P(pid).name} ×${q}</span>`).join(''):'<span class="hint">Walang laman — malinis! ✨</span>';
}
$('claimFreeBtn').onclick=()=>{claimDaily(false);};
$('claimAdBtn').onclick=()=>{claimDaily(true);};
function claimDaily(withAd){
  const today=manilaToday();
  if(S.lastClaim===today){toast('Na-claim na ngayong araw (Manila)!');return;}
  const doClaim=(bonus)=>{S.lastClaim=today;distribute(mixedBundle(freeAmount(),bonus));sfx.delivery();save();refreshStats();refreshDelivery();renderShelf();toast(bonus?`🎁 ${freeAmount()+6} piraso! (30+6 bonus)`:`🎁 ${freeAmount()} piraso na-deliver! Sobra nasa box 📥`);logDlg('Delivery Kuya',`Delivery! ${freeAmount()+(bonus?6:0)} piraso. ${boxTotal()} nasa box.`);};
  if(!withAd){doClaim(0);}
  else{openDemoAd(()=>doClaim(6));}
}
$('watchAdBtn').onclick=()=>{
  const b=window._bundle||'mixed';
  $('adStatus').textContent=`Reward preview: eksaktong 6 × ${b==='mixed'?'halong paninda':P(b).name}. Ibibigay lang pag tapos ang ad.`;
  openDemoAd(()=>{
    const map=b==='mixed'?mixedBundle(6):{[b]:6};
    distribute(map);sfx.delivery();save();refreshStats();refreshDelivery();renderShelf();
    toast('📺 +6 piraso nakuha! Eksakto, walang labis.');
  });
};
let adDone=null;
function openDemoAd(cb){
  adDone=cb;$('adModal').classList.remove('hidden');let n=3;$('adTimer').textContent=n;
  clearInterval($('adModal')._t);
  $('adModal')._t=setInterval(()=>{n--;if(n<=0){clearInterval($('adModal')._t);$('adModal').classList.add('hidden');const f=adDone;adDone=null;if(f)f();}else $('adTimer').textContent=n;},1000);
}
$('adClose').onclick=()=>{clearInterval($('adModal')._t);$('adModal').classList.add('hidden');adDone=null;toast('Isinara — walang reward (kailangan tapusin).');};
$('moveBoxBtn').onclick=()=>{
  let free=S.capacity-stockTotal();if(free<=0){toast('Puno pa ang shelf! Mag-upgrade o magbenta muna.');return;}
  for(const pid of Object.keys(S.box)){const mv=Math.min(S.box[pid],free);S.stock[pid]=(S.stock[pid]||0)+mv;S.box[pid]-=mv;free-=mv;if(S.box[pid]<=0)delete S.box[pid];}
  save();refreshStats();refreshDelivery();renderShelf();sfx.pop();
};

/* ---------- UPGRADES ---------- */
function refreshUpgrades(){
  $('eraBadge').textContent=ERAS[S.era].year;
  const ep=$('eraProgress');ep.innerHTML=ERAS.map((e,i)=>`<div class="era-step ${i<S.era?'done':i===S.era?'now':''}">${e.year}<br>${e.name}</div>`).join('');
  const ul=$('upgradeList');ul.innerHTML='';
  const capCost=[80,200,450][S.upgrades.capTier];
  // capacity
  ul.appendChild(upCard(`🧺 Shelf +30 (ngayon ${S.capacity})`,capCost?`Gastos: ${capCost} coins. Coins pang-upgrade lang, hindi pambili ng stock.`:'MAX na!',capCost?()=>{if(S.coins<capCost){toast('Kulang coins! Magbenta muna 🪙');return;}S.coins-=capCost;S.upgrades.capTier++;S.capacity=[60,90,120,150][S.upgrades.capTier]??150;save();refreshAll();toast('🧺 Lumaki ang shelf! +30 capacity');}:null,capCost==null));
  // product unlocks
  const groups=[['Basta Pinoy pack (2000)',['bastapinoy','aiza','lechon','kentucky','piknik','yamyam'],120,1],['Iced Gem pack (2010)',['icedgem','dipsea','pusit','clover','tomi','kobi'],300,2],['Halo-halo pack (2026)',['halo','rinbee','choko','cheers'],600,3]];
  groups.forEach(([name,ids,cost,era])=>{
    const has=ids.every(id=>S.unlocked.includes(id));
    ul.appendChild(upCard(`🍭 ${name}`,has?'✔ Unlocked na':`Gastos: ${cost} coins. Kailangan era ${ERAS[era].year}.`,has?null:()=>{if(S.era<era&&S.shopLevel<era){toast('I-upgrade muna ang era!');return;}if(S.coins<cost){toast('Kulang coins!');return;}S.coins-=cost;ids.forEach(id=>{if(!S.unlocked.includes(id))S.unlocked.push(id);if(!(id in S.stock))S.stock[id]=0;});save();refreshAll();toast('🍭 Bagong paninda unlocked!');}));
  });
  // era advance
  const eraCost=[150,400,900][S.era];
  if(S.era<3)ul.appendChild(upCard(`🏠 ${ERAS[S.era].year} → ${ERAS[S.era+1].year}: ${ERAS[S.era+1].name}`,`Gastos: ${eraCost} coins. ${ERAS[S.era+1].desc} Luma pero pamilyar pa rin ang barangay.`,()=>{if(S.coins<eraCost){toast('Kulang coins!');return;}S.coins-=eraCost;S.era++;S.shopLevel=S.era;S.capacity=Math.max(S.capacity,ERAS[S.era].cap);save();refreshAll();toast(`🎉 Panahon na: ${ERAS[S.era].year}! Nagbago ang barangay!`);}));
  else ul.appendChild(upCard('🏆 2026 Talipapa — MAX','Ikaw na ang alamat ng barangay! Salamat sa paglalaro.',null,true));
  // staff
  const sl=$('staffList');sl.innerHTML='';
  const staffDefs=[['Ate Cora — helper (+patience)',100],['Kuya Jun — taga-abot (+patience)',250],['Team Talipapa (2 staff)',500]];
  staffDefs.forEach(([n,c],i)=>{
    const has=S.staff.includes(i);
    sl.appendChild(upCard(`🧑‍🍳 ${n}`,has?'✔ Nagtatrabaho na':`Gastos: ${c} coins.`,has?null:()=>{if(S.coins<c){toast('Kulang coins!');return;}S.coins-=c;S.staff.push(i);save();refreshAll();toast('🧑‍🍳 May staff ka na!');}));
  });
  // decor
  const dl=$('decorList');dl.innerHTML='';
  DECORS.forEach(d=>{
    const has=S.decor.includes(d.id);
    const b=document.createElement('button');b.className='btn small'+(has?' primary':'');b.textContent=(has?'✔ ':'')+d.name+` (${d.cost}🪙)`;
    b.onclick=()=>{if(has){
      if(d.id.startsWith('canopy'))S.decor=S.decor.filter(x=>!x.startsWith('canopy'));
      else S.decor=S.decor.filter(x=>x!==d.id);
      save();refreshAll();return;}
      if(S.coins<d.cost){toast('Kulang coins!');return;}S.coins-=d.cost;
      if(d.id.startsWith('canopy'))S.decor=S.decor.filter(x=>!x.startsWith('canopy'));
      S.decor.push(d.id);save();refreshAll();toast('🎀 Gaganda ng tindahan!');};
    dl.appendChild(b);
  });
  // closet
  const cl=$('closetList');cl.innerHTML='';
  OUTFITS.forEach(o=>{
    const locked=S.era<o.era;const b=document.createElement('button');b.className='btn small'+(S.char.outfit===o.id?' primary':' ghost');b.textContent=(locked?'🔒 ':'')+o.name;
    b.onclick=()=>{if(locked){toast(`Ma-unlock sa ${ERAS[o.era].year}!`);return;}S.char.outfit=o.id;save();refreshCharMini();toast('👕 Nagpalit ng damit — kita sa lakad!');};
    cl.appendChild(b);
  });
  refreshCharMini();
}
function upCard(title,desc,fn,done){
  const d=document.createElement('div');d.className='up-card';
  d.innerHTML=`<b>${title}</b><p>${desc}</p>`;
  if(fn){const b=document.createElement('button');b.className='btn small primary';b.textContent='Bilhin ⬆';b.onclick=()=>{sfx.pop();fn();};d.appendChild(b);}
  else if(done){const s=document.createElement('span');s.className='pill';s.textContent='MAX / Done';d.appendChild(s);}
  return d;
}

/* ---------- CHARACTER UI ---------- */
function optRow(el,items,cur,cb){
  const e=$(el);e.innerHTML='';
  items.forEach((label,i)=>{const b=document.createElement('button');b.className='opt'+(cur===i?' sel':'');b.innerHTML=label;b.onclick=()=>{cb(i);};e.appendChild(b);});
}
function refreshCharUI(){
  const c=S.char;
  optRow('skinOpts',SKINS.map(s=>`<span style="background:${s};border-radius:50%;display:inline-block;width:22px;height:22px"></span>`),c.skin,i=>{c.skin=i;save();previewChar();});
  optRow('faceOpts',['🙂 Mukha 1','😊 Mukha 2','😎 Mukha 3'],c.face,i=>{c.face=i;save();previewChar();});
  optRow('hairOpts',['✂ Maikli','🧢 Flat','💇 Mahaba','💈 Bun'],c.hair,i=>{c.hair=i;save();previewChar();});
  optRow('bodyOpts',['🌱 Payat','🧍 Tama','🍚 Malusog'],c.body,i=>{c.body=i;save();previewChar();});
  const eo=$('outfitOpts');eo.innerHTML='';
  OUTFITS.filter(o=>o.era===0).forEach(o=>{const b=document.createElement('button');b.className='opt'+(c.outfit===o.id?' sel':'');b.textContent=o.name;b.onclick=()=>{c.outfit=o.id;save();refreshCharUI();previewChar();};eo.appendChild(b);});
}
let charPhase=0;
function previewChar(){
  const cv=$('charPreview');if(!cv||$('charScreen').classList.contains('hidden'))return;
  const g=cv.getContext('2d');g.clearRect(0,0,220,240);
  g.fillStyle='#ffe9c7';g.fillRect(0,0,220,240);
  g.fillStyle='#2e7d4f';g.fillRect(0,190,220,50);
  drawCharFromSave(g,110,190,1.3,charPhase,'idle');
}
function refreshCharMini(){
  $('charMini').innerHTML=`<b>${escapeHtml(S.char.name)}</b> • ${OUTFITS.find(o=>o.id===S.char.outfit)?.name||''} • era ${ERAS[S.era].year}<br><span class="hint">Damit at buhok — makikita sa canvas sa taas.</span>`;
  const eh=$('editHair');if(eh){optRow('editHair',['✂ Maikli','🧢 Flat','💇 Mahaba','💈 Bun'],S.char.hair,i=>{S.char.hair=i;save();});}
  const eo2=$('editOutfit');if(eo2){eo2.innerHTML='';OUTFITS.forEach(o=>{const locked=S.era<o.era;const b=document.createElement('button');b.className='opt'+(S.char.outfit===o.id?' sel':'')+(locked?' locked':'');b.textContent=(locked?'🔒 ':'')+o.name;b.onclick=()=>{if(locked){toast(`Ma-unlock sa ${ERAS[o.era].year}`);return;}S.char.outfit=o.id;save();refreshUpgrades();};eo2.appendChild(b);});}
}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ---------- STORY ---------- */
const STORY=[
 {y:'TAONG 1990…',t:'Mainit na hapon sa barangay. Ikaw ay pauwi — may sulat mula kay Lola. “Ang kariton ay sa iyo na, apo…”'},
 {y:'ANG KARITON NI LOLA',t:'Narito ang lumang wooden pushcart: kupas na canopy, anim na paninda na lang. Amoy kahoy at alaala.'},
 {y:'BUKSAN AT AYUSIN',t:'Binuksan mo ang kariton. Inayos ang Pompoms, Sweet Corn, Bangus, Lumpia, Choc Nut at Sarsi. Kumalampag ang mga nakasabit na chichirya.'},
 {y:'UNANG CUSTOMER',t:'“Pabili po!” Si Jun-jun, takbong papunta. Ito na — ang unang benta ng Tiny Tindahan mo!'},
];
let storyIdx=0,storyT=0;
function showStory(){storyIdx=0;storyT=0;$('storyScreen').classList.remove('hidden');$('charScreen').classList.add('hidden');$('gameScreen').classList.add('hidden');drawStory();}
function drawStory(){
  $('storyYear').textContent=STORY[storyIdx].y;$('storyText').textContent=STORY[storyIdx].t;
  $('storyReplay').classList.toggle('hidden',!S.storySeen);
}
$('storyNext').onclick=()=>{sfx.pop();storyIdx++;if(storyIdx>=STORY.length){S.storySeen=true;save();$('storyScreen').classList.add('hidden');$('charScreen').classList.remove('hidden');refreshCharUI();previewChar();}else drawStory();};
$('storySkip').onclick=()=>{S.storySeen=true;save();$('storyScreen').classList.add('hidden');$('charScreen').classList.remove('hidden');refreshCharUI();previewChar();};
$('storyReplay').onclick=()=>{storyIdx=0;drawStory();};
$('replayStoryBtn').onclick=()=>{$('gameScreen').classList.add('hidden');showStory();S.storySeen=true;};
function renderStoryCanvas(t){
  const cv=$('storyCanvas');if(!cv||!$('storyScreen')||$('storyScreen').classList.contains('hidden'))return;
  const g=cv.getContext('2d');g.clearRect(0,0,420,400);
  drawBackground(g,t);
  const px=80+Math.min(200,(t-storyT)*30)%220;
  if(storyIdx===0)drawCharFromSave(g,px,262,1.1,t*6,'walk');
  else if(storyIdx===1){drawShop(g,t);drawCharFromSave(g,90,262,1.1,t*1.5,'idle');}
  else if(storyIdx===2){drawShop(g,t);drawCharFromSave(g,150,262,1.1,t*1.5,'give');}
  else{drawShop(g,t);drawCharFromSave(g,120,262,1.0,t*1.5,'idle');drawPerson(g,300,262,0.72,{skin:'#f2b880',hair:0,hc:'#111',shirt:'#ff5252',pants:'#3345ff',h:1,w:0.9,face:0},t*7,'walk');}
}

/* ---------- NAV / STATS ---------- */
function refreshStats(){$('coinVal').textContent=S.coins;$('stockVal').textContent=`${stockTotal()}/${S.capacity}`;$('soundBtn').textContent=musicOn?'🔊':'🔇';$('radioBtn').textContent=`📻 Radyo: ${radioOn?'ON':'OFF'}`;$('motionBtn').textContent=`🍃 Galaw: ${S.reducedMotion?'OFF':'ON'}`;}
function refreshAll(){save();refreshStats();renderShelf();refreshDelivery();refreshUpgrades();refreshOrderBar();}
document.querySelectorAll('#tabs .tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  ['shop','delivery','upgrades','char'].forEach(k=>$('panel-'+k).classList.toggle('hidden',k!==b.dataset.tab));
  sfx.pop();
});
$('soundBtn').onclick=()=>{musicOn=!musicOn;S.music=musicOn;save();if(musicOn)startMusic();else stopMusic();refreshStats();};
$('radioBtn').onclick=()=>{radioOn=!radioOn;S.radio=radioOn;save();if(radioOn)startMusic();else stopMusic();refreshStats();};
$('motionBtn').onclick=()=>{S.reducedMotion=!S.reducedMotion;save();refreshStats();toast(S.reducedMotion?'Reduced motion ON — kalmado 🍃':'Galaw ON — buhay ang barangay!');};
$('volRange').value=Math.round(vol*100);
$('volRange').oninput=e=>{vol=e.target.value/100;S.volume=vol;save();};
$('resetBtn').onclick=()=>{if(confirm('Burahin ang lahat ng progress? Kailangan ng confirm.')){localStorage.removeItem(SAVE_KEY);location.reload();}};
$('charStart').onclick=()=>{
  const nm=$('charName').value.trim();if(nm)S.char.name=nm.slice(0,14);
  S.storySeen=true;S.started=true;save();$('charScreen').classList.add('hidden');$('gameScreen').classList.remove('hidden');
  refreshAll();logDlg('Lola (alaala)','Alagaan mo ang tindahan, apo. Mura lang, ngiti palagi! ❤');sfx.buy();
};
$('editCharBtn').onclick=()=>{$('editModal').classList.remove('hidden');refreshCharMini();};
$('editClose').onclick=()=>{$('editModal').classList.add('hidden');save();refreshAll();};
$('charName').addEventListener('input',e=>{S.char.name=e.target.value.slice(0,14);});

/* ---------- BOOT ---------- */
function boot(){
  loadAllAssets();
  $('charName').value=S.char.name||'Apo';
  refreshStats();
  if(!S.storySeen){showStory();}
  else if(!S.started){$('storyScreen').classList.add('hidden');$('charScreen').classList.remove('hidden');refreshCharUI();previewChar();}
  else{$('storyScreen').classList.add('hidden');$('charScreen').classList.add('hidden');$('gameScreen').classList.remove('hidden');}
  let last=performance.now();
  function loop(now){
    const dt=Math.min(0.05,(now-last)/1000);last=now;const t=now/1000;
    charPhase+=dt*2;previewChar();renderStoryCanvas(t);
    if(!$('gameScreen').classList.contains('hidden'))updateGame(dt,t);
    // edit preview
    if(!$('editModal').classList.contains('hidden')){const g=$('editPreview').getContext('2d');g.clearRect(0,0,220,200);g.fillStyle='#ffe9c7';g.fillRect(0,0,220,200);drawCharFromSave(g,110,165,1.2,t*1.5,'idle');}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  renderShelf();refreshDelivery();refreshUpgrades();
  // expose for verification
  window.__game={get save(){return S;},manilaToday,freeAmount,stockTotal,
    claimDaily,distribute,serve:()=>$('serveBtn').click(),spawnCustomer,get custs(){return custs;},traySet:(m)=>{tray=m;},
    setAsset:(k,u)=>window.TindahanAssets.set(k,u),assets:()=>window.TindahanAssets.keys()};
}
document.addEventListener('DOMContentLoaded',boot);

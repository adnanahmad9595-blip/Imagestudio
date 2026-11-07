(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("editorCanvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
const state = {
  image:null, imageName:"", images:[], activeImageIndex:-1, zoom:100, filter:"Original", effect:null, effectOpacity:65,
  effectScale:100, effectColor:"#f6c56f", frame:null, frameOpacity:100, frameColor:"#e9bd69",
  frameWidth:7, shape:null, shapeZoom:100, brightness:100, contrast:100, saturation:100, blur:0,
  category:"All", frameCategory:"All", history:[], historyIndex:-1, checker:true
};
const effects = [
 ["Nature","Cherry blossom","🌸","petals"],["Nature","Rose petals","🌹","petals"],["Nature","Butterflies","🦋","butterflies"],["Nature","Fireflies","✨","fireflies"],["Nature","Dreamy clouds","☁️","clouds"],["Nature","Rainbow light","🌈","rainbow"],["Nature","Autumn leaves","🍂","leaves"],["Nature","Spring flowers","🌼","flowers"],["Nature","Summer sunshine","☀️","sunshine"],["Nature","Winter snow","❄️","snow"],
 ["Luxury","Glassmorphism","💎","glass"],["Luxury","Broken glass","✧","shards"],["Luxury","Holographic","🌈","holo"],["Luxury","Diamond sparkle","✦","sparkle"],["Luxury","Neon glow","💜","neon"],["Luxury","Golden dust","✨","dust"],["Luxury","Silver shimmer","✧","shimmer"],["Luxury","Luxury gold","♛","gold"],
 ["Light","Bokeh","◉","bokeh"],["Light","Lens flare","☼","flare"],["Light","Light leak","☀","leak"],["Light","Film burn","🔥","burn"],["Light","Prism","◇","prism"],["Light","Glowing orbs","●","orbs"],["Light","Soft glow","✧","glow"],["Light","Sun rays","☼","rays"],
 ["Weather","Rain","☂","rain"],["Weather","Snowfall","❄","snow"],["Weather","Water splash","💧","water"],["Weather","Lightning","ϟ","lightning"],["Weather","Smoke","☁","smoke"],["Weather","Fire","🔥","fire"],["Weather","Wind motion","〰","wind"],
 ["Artistic","Vintage grain","▦","grain"],["Artistic","Cinematic bars","▬","cinema"],["Artistic","Torn paper","▤","paper"],["Artistic","Reflection","◒","reflection"],["Artistic","3D depth","◈","depth"],["Artistic","Halftone","⠿","halftone"],["Artistic","Mosaic","▦","mosaic"],["Artistic","Glitch","▥","glitch"],["Artistic","Pixelate","▧","pixel"],["Artistic","Confetti","🎊","confetti"],["Artistic","Newspaper","▤","news"],["Artistic","Film strip","▥","film"]
];
const filters = [
 ["Original","◉","none"],["Vintage","▦","sepia(0.45) contrast(1.08)"],["Cinematic","🎬","contrast(1.2) saturate(0.82) sepia(0.12)"],["Black & White","◐","grayscale(1)"],["Warm","☀","sepia(0.22) saturate(1.2)"],["Cool","❄","hue-rotate(15deg) saturate(0.85)"],["Dreamy","✧","brightness(1.12) saturate(0.85)"],["Vivid","🌈","saturate(1.65) contrast(1.08)"],["Matte","◌","contrast(.86) saturate(.8)"],["Fade","▱","contrast(.82) brightness(1.08)"],["Noir","◐","grayscale(1) contrast(1.55)"],["Retro","📼","sepia(.3) hue-rotate(-12deg) contrast(1.1)"],["Pastel","🌸","saturate(.72) brightness(1.12)"],["Golden","✦","sepia(.28) saturate(1.25)"],["Dramatic","⚡","contrast(1.5) saturate(.78)"],["Soft","☁","brightness(1.08) contrast(.9)"]];
const frames = [
 ["Classic","Golden","♛"],["Classic","Silver","✧"],["Classic","Minimal white","□"],["Classic","Black border","▣"],["Classic","Wooden","▤"],["Classic","Polaroid","▱"],["Classic","Film strip","▥"],
 ["Floral","Floral garden","🌸"],["Floral","Rose garden","🌹"],["Floral","Flower wreath","🌼"],["Floral","Leaf border","🍃"],
 ["Celebration","Birthday","🎂"],["Celebration","Wedding","💍"],["Celebration","Love","❤️"],["Celebration","Baby","🧸"],["Celebration","Family","🏡"],["Celebration","Christmas","🎄"],["Celebration","Eid","☪"],["Celebration","Ramadan","🌙"],
 ["Creative","Vintage","📷"],["Creative","Neon","💜"],["Creative","3D bevel","◇"],["Creative","Magazine","▤"],["Creative","Newspaper","▥"],["Creative","Instagram","◎"],["Creative","Torn paper","▱"],["Creative","Nature","🌿"]
];
const shapes = [["circle","●"],["heart","♥"],["star","★"],["hexagon","⬡"],["oval","⬭"],["diamond","◆"],["triangle","▲"],["rounded","▢"],["cloud","☁"],["flower","✿"],["arch","⌂"],["shield","⬟"],["speech","▱"],["leaf","🍃"],["pentagon","⬠"],["cross","✚"]];
const filterMap = Object.fromEntries(filters.map(x=>[x[0],x[2]]));
const effectCategories = ["All",...new Set(effects.map(x=>x[0]))], frameCategories = ["All",...new Set(frames.map(x=>x[0]))];
let activeEffectCategory="All", activeFrameCategory="All";

function setStatus(t){$("stageStatus").textContent=t}
function draw(){
  if(!state.image) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  const img=state.image, scale=Math.min(canvas.width/img.width,canvas.height/img.height)*state.zoom/100;
  const w=img.width*scale*state.shapeZoom/100,h=img.height*scale*state.shapeZoom/100;
  const x=(canvas.width-w)/2,y=(canvas.height-h)/2;
  ctx.filter=`${filterMap[state.filter]||"none"} brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px)`;
  if(state.shape) clipShape(ctx,state.shape,canvas.width/2,canvas.height/2,Math.min(canvas.width,canvas.height)*.43);
  ctx.drawImage(img,x,y,w,h); ctx.restore();
  if(state.shape) drawShapeRim();
  if(state.effect) drawEffect(state.effect[3],state.effectOpacity/100,state.effectScale/100,state.effectColor);
  if(state.frame) drawFrame(state.frame);
  if(state.activeImageIndex>=0&&state.images[state.activeImageIndex])state.images[state.activeImageIndex].settings=captureSettings();
}
function clipShape(c,shape,cx,cy,r){
 c.beginPath();
 if(shape==="circle") c.arc(cx,cy,r,0,Math.PI*2);
 else if(shape==="oval") c.ellipse(cx,cy,r,r*.68,0,0,Math.PI*2);
 else if(shape==="heart"){c.moveTo(cx,cy+r*.85);c.bezierCurveTo(cx-r*1.35,cy+r*.1,cx-r*1.05,cy-r*.8,cx,cy-r*.25);c.bezierCurveTo(cx+r*1.05,cy-r*.8,cx+r*1.35,cy+r*.1,cx,cy+r*.85)}
 else if(shape==="star"){for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c[i?"lineTo":"moveTo"](cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}c.closePath()}
 else if(shape==="hexagon"||shape==="pentagon"){let n=shape==="hexagon"?6:5;for(let i=0;i<n;i++){let a=-Math.PI/2+i*2*Math.PI/n;c[i?"lineTo":"moveTo"](cx+Math.cos(a)*r,cy+Math.sin(a)*r)}c.closePath()}
 else if(shape==="triangle"){c.moveTo(cx,cy-r);c.lineTo(cx+r*.9,cy+r*.75);c.lineTo(cx-r*.9,cy+r*.75);c.closePath()}
 else if(shape==="diamond"){c.moveTo(cx,cy-r);c.lineTo(cx+r*.8,cy);c.lineTo(cx,cy+r);c.lineTo(cx-r*.8,cy);c.closePath()}
 else if(shape==="rounded"){c.roundRect(cx-r,cy-r,r*2,r*2,r*.25)}
 else if(shape==="cloud"){c.moveTo(cx-r*.75,cy+r*.4);c.arc(cx-r*.48,cy+r*.08,r*.36,Math.PI*.65,Math.PI*1.8);c.arc(cx-r*.08,cy-r*.25,r*.48,Math.PI,Math.PI*1.9);c.arc(cx+r*.42,cy-r*.05,r*.42,Math.PI*1.2,Math.PI*2.2);c.arc(cx+r*.62,cy+r*.25,r*.3,Math.PI*1.5,Math.PI*.5);c.closePath()}
 else if(shape==="flower"){for(let i=0;i<8;i++){let a=i*Math.PI/4;c.ellipse(cx+Math.cos(a)*r*.48,cy+Math.sin(a)*r*.48,r*.28,r*.43,a,0,Math.PI*2)}}
 else if(shape==="arch"){c.moveTo(cx-r,cy+r);c.lineTo(cx-r,cy);c.arc(cx,cy,r,Math.PI,0);c.lineTo(cx+r,cy+r);c.closePath()}
 else if(shape==="shield"){c.moveTo(cx-r,cy-r*.85);c.lineTo(cx+r,cy-r*.85);c.lineTo(cx+r*.82,cy+r*.25);c.lineTo(cx,cy+r);c.lineTo(cx-r*.82,cy+r*.25);c.closePath()}
 else if(shape==="speech"){c.roundRect(cx-r,cy-r*.7,r*2,r*1.35,r*.2);c.moveTo(cx-r*.3,cy+r*.65);c.lineTo(cx-r*.55,cy+r);c.lineTo(cx+r*.1,cy+r*.65)}
 else if(shape==="leaf"){c.moveTo(cx,cy-r);c.bezierCurveTo(cx+r*1.2,cy-r*.4,cx+r*.85,cy+r*.8,cx,cy+r);c.bezierCurveTo(cx-r*1.2,cy+r*.4,cx-r*.85,cy-r*.8,cx,cy-r)}
 else if(shape==="cross"){c.rect(cx-r*.28,cy-r,r*.56,r*2);c.rect(cx-r,cy-r*.28,r*2,r*.56)}
 c.clip();
}
function drawShapeRim(){ctx.save();ctx.strokeStyle="#ffffff";ctx.lineWidth=12;ctx.beginPath();clipShape(ctx,state.shape,canvas.width/2,canvas.height/2,Math.min(canvas.width,canvas.height)*.43);ctx.stroke();ctx.restore()}
function seeded(i){return ((Math.sin(i*127.1+3)*43758.5453)%1+1)%1}
function drawEffect(type,opacity,scale,color){
 const W=canvas.width,H=canvas.height;ctx.save();ctx.globalAlpha=opacity;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3*scale;
 const count=type==="snow"||type==="rain"||type==="petals"||type==="confetti"?95:45;
 for(let i=0;i<count;i++){
  const x=seeded(i+2)*W,y=seeded(i+121)*H,s=(5+seeded(i+44)*22)*scale;
  if(["snow","fireflies","sparkle","dust","shimmer","orbs","bokeh","confetti","petals","butterflies","flowers","leaves"].includes(type)){
   if(type==="snow"){ctx.beginPath();ctx.arc(x,y,s*.22,0,7);ctx.fillStyle="#fff";ctx.fill()}
   else if(type==="rain"){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8*scale,y+28*scale);ctx.stroke()}
   else if(type==="petals"||type==="leaves"||type==="flowers"||type==="butterflies"||type==="confetti"){ctx.save();ctx.translate(x,y);ctx.rotate(seeded(i+5)*6);ctx.beginPath();ctx.ellipse(0,0,s*.35,s,0,0,7);ctx.fill();ctx.restore()}
   else {ctx.beginPath();ctx.arc(x,y,s*.45,0,7);ctx.globalAlpha=opacity*(.15+seeded(i+3)*.65);ctx.fill()}
  } else if(type==="sparkle"||type==="shards"||type==="prism"||type==="holo"||type==="lightning"){
   ctx.beginPath();ctx.moveTo(x-s,y);ctx.lineTo(x+s,y);ctx.moveTo(x,y-s);ctx.lineTo(x,y+s);ctx.stroke()
  } else if(type==="grain"||type==="halftone"||type==="pixel"||type==="mosaic"){ctx.fillRect(x,y,s*.25,s*.25)}
  else if(type==="flare"||type==="rays"||type==="sunshine"||type==="rainbow"){ctx.beginPath();ctx.arc(W*.5,H*.45,s+i*2,0,Math.PI*2);ctx.stroke()}
  else if(type==="glass"||type==="shimmer"||type==="water"||type==="smoke"||type==="clouds"){ctx.beginPath();ctx.arc(x,y,s,0,7);ctx.stroke()}
  else if(type==="fire"||type==="burn"||type==="neon"||type==="glow"){ctx.shadowBlur=18;ctx.shadowColor=color;ctx.beginPath();ctx.arc(x,y,s*.45,0,7);ctx.fill()}
  else {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s,y+s*.5);ctx.stroke()}
 }
 if(type==="cinema"){ctx.globalAlpha=opacity;ctx.fillStyle="#080808";ctx.fillRect(0,0,W,H*.12);ctx.fillRect(0,H*.88,W,H*.12)}
 if(type==="news"||type==="paper"){ctx.strokeStyle=color;ctx.lineWidth=12*scale;ctx.strokeRect(20,20,W-40,H-40)}
 if(type==="gold"||type==="neon"){ctx.strokeStyle=color;ctx.lineWidth=18*scale;ctx.shadowBlur=25;ctx.shadowColor=color;ctx.strokeRect(24,24,W-48,H-48)}
 if(type==="rainbow"){let g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"#ff5470");g.addColorStop(.3,"#ffc857");g.addColorStop(.55,"#49d7bd");g.addColorStop(.8,"#5a83ff");g.addColorStop(1,"#c35cff");ctx.globalAlpha=opacity*.25;ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 if(type==="burn"){let g=ctx.createRadialGradient(W,H,10,W,H,W*.9);g.addColorStop(0,"#ff8a27");g.addColorStop(1,"transparent");ctx.globalAlpha=opacity*.45;ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 ctx.restore();
}
function drawFrame(item){
 const W=canvas.width,H=canvas.height,p=Math.min(W,H)*state.frameWidth/100;
 ctx.save();ctx.globalAlpha=state.frameOpacity/100;ctx.lineWidth=p;ctx.strokeStyle=state.frameColor;
 const name=item[1].toLowerCase();
 if(name.includes("polaroid")){ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.clearRect(p,p,W-2*p,H-p*2.8);ctx.fillStyle="#fff";ctx.fillRect(p,H-p*2.8,W-2*p,p*1.8)}
 else if(name.includes("film")){ctx.fillStyle="#171717";ctx.fillRect(0,0,W,H);ctx.clearRect(p*2,p,W-p*4,H-p*2);ctx.fillStyle="#fff";for(let x=20;x<W;x+=70){ctx.fillRect(x,5,32,14);ctx.fillRect(x,H-19,32,14)}}
 else {ctx.strokeRect(p/2,p/2,W-p,H-p);if(name.includes("gold")||name.includes("wedding")||name.includes("luxury")){ctx.lineWidth=p*.22;ctx.strokeStyle="#fff1be";ctx.strokeRect(p*1.2,p*1.2,W-p*2.4,H-p*2.4)}if(name.includes("floral")||name.includes("rose")||name.includes("flower")){ctx.fillStyle=state.frameColor;for(let i=0;i<16;i++){let a=i*Math.PI/8;ctx.beginPath();ctx.arc(W/2+Math.cos(a)*(W*.47),H/2+Math.sin(a)*(H*.47),p*.5,0,7);ctx.fill()}}}
 ctx.restore();
}
function renderCategories(target,cats,active,fn){$(target).innerHTML="";cats.forEach(c=>{let b=document.createElement("button");b.className="chip"+(c===active?" active":"");b.textContent=c;b.onclick=()=>fn(c);$(target).append(b)})}
function renderEffects(){renderCategories("effectCategories",effectCategories,activeEffectCategory,c=>{activeEffectCategory=c;renderEffects()});$("effectGrid").innerHTML="";effects.filter(e=>activeEffectCategory==="All"||e[0]===activeEffectCategory).forEach(e=>{let b=document.createElement("button");b.className="preset"+(state.effect?.[1]===e[1]?" selected":"");b.innerHTML=`<span class="preset-swatch">${e[2]}</span><span class="preset-name">${e[1]}</span>`;b.onclick=()=>{state.effect=e;syncSelection();draw()};$("effectGrid").append(b)})}
function renderFilters(){$("filterGrid").innerHTML="";filters.forEach(f=>{let b=document.createElement("button");b.className="preset"+(state.filter===f[0]?" selected":"");b.innerHTML=`<span class="preset-swatch">${f[1]}</span><span class="preset-name">${f[0]}</span>`;b.onclick=()=>{state.filter=f[0];syncSelection();draw()};$("filterGrid").append(b)})}
function renderFrames(){renderCategories("frameCategories",frameCategories,activeFrameCategory,c=>{activeFrameCategory=c;renderFrames()});$("frameGrid").innerHTML="";frames.filter(f=>activeFrameCategory==="All"||f[0]===activeFrameCategory).forEach(f=>{let b=document.createElement("button");b.className="preset"+(state.frame?.[1]===f[1]?" selected":"");b.innerHTML=`<span class="preset-swatch">${f[2]}</span><span class="preset-name">${f[1]}</span>`;b.onclick=()=>{state.frame=f;syncSelection();draw()};$("frameGrid").append(b)})}
function renderShapes(){$("shapeGrid").innerHTML="";shapes.forEach(s=>{let b=document.createElement("button");b.className="shape-btn"+(state.shape===s[0]?" active":"");b.innerHTML=`<span>${s[1]}</span><small>${s[0]}</small>`;b.onclick=()=>{state.shape=s[0];renderShapes();draw()};$("shapeGrid").append(b)})}
function syncSelection(){renderEffects();renderFilters();renderFrames();renderShapes()}
function update(id,value){state[id]=value;draw()}
function bindRange(id,key,suffix="%"){const el=$(id),out=$(id+"Value");el.addEventListener("input",()=>{state[key]=+el.value;out.textContent=el.value+suffix;draw()})}
function snapshot(){if(!state.image)return;try{const data=canvas.toDataURL("image/png");state.history=state.history.slice(0,state.historyIndex+1);state.history.push(data);if(state.history.length>20)state.history.shift();state.historyIndex=state.history.length-1;updateHistoryButtons()}catch(e){}}
function updateHistoryButtons(){$("undoBtn").disabled=state.historyIndex<=0;$("redoBtn").disabled=state.historyIndex>=state.history.length-1}
function restoreHistory(i){if(i<0||i>=state.history.length)return;state.historyIndex=i;let im=new Image();im.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(im,0,0);updateHistoryButtons()};im.src=state.history[i]}
const EDIT_KEYS=["zoom","filter","effect","effectOpacity","effectScale","effectColor","frame","frameOpacity","frameColor","frameWidth","shape","shapeZoom","brightness","contrast","saturation","blur"];
function captureSettings(){const out={};EDIT_KEYS.forEach(k=>out[k]=state[k]);return out}
function applySettings(settings){if(settings)EDIT_KEYS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(settings,k))state[k]=settings[k]});["zoom","effectOpacity","effectScale","frameOpacity","frameWidth","shapeZoom","brightness","contrast","saturation","blur"].forEach(k=>{if($(k)){$(k).value=state[k];const suffix=k==="blur"?"px":"%";if($(k+"Value"))$(k+"Value").textContent=state[k]+suffix}});if($("effectColor"))$("effectColor").value=state.effectColor;if($("frameColor"))$("frameColor").value=state.frameColor;syncSelection()}
function makeThumb(img){const c=document.createElement("canvas");const scale=Math.min(1,180/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext("2d").drawImage(img,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.72)}
function renderGallery(){const rail=$("thumbnailRail");rail.innerHTML="";$("galleryCount").textContent=state.images.length+ (state.images.length===1?" photo":" photos");state.images.forEach((item,index)=>{const b=document.createElement("button");b.type="button";b.className="photo-thumb"+(index===state.activeImageIndex?" active":"");b.title="Edit "+item.name;b.setAttribute("aria-label","Select photo "+(index+1)+": "+item.name);const im=document.createElement("img");im.src=item.thumb;im.alt=item.name;const n=document.createElement("span");n.className="thumb-index";n.textContent=String(index+1);const label=document.createElement("span");label.textContent=item.name;b.append(im,n,label);b.onclick=()=>selectImage(index);rail.append(b)});}
function selectImage(index){if(index<0||index>=state.images.length||index===state.activeImageIndex)return;if(state.activeImageIndex>=0)state.images[state.activeImageIndex].settings=captureSettings();const item=state.images[index];state.activeImageIndex=index;state.image=item.image;state.imageName=item.name;applySettings(item.settings);$("emptyState").style.display="none";canvas.style.display="block";$("downloadBtn").disabled=false;$("photoInfo").textContent=`${item.name} · ${item.image.width} × ${item.image.height} · ${(item.size/1024/1024).toFixed(2)} MB`;setStatus(`Photo ${index+1} of ${state.images.length} · ready to edit`);state.history=[];state.historyIndex=-1;draw();snapshot();renderGallery()}
function loadFiles(files){const accepted=Array.from(files||[]).filter(file=>{if(!/^image\/(jpeg|png|webp)$/.test(file.type)){alert(file.name+": Please choose a JPG, PNG or WEBP image.");return false}if(file.size>25*1024*1024){alert(file.name+": Please choose an image smaller than 25 MB.");return false}return true});if(!accepted.length)return;Promise.all(accepted.map(file=>new Promise(resolve=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const item={image:img,name:file.name,size:file.size,thumb:makeThumb(img),settings:{zoom:100,filter:"Original",effect:null,effectOpacity:65,effectScale:100,effectColor:"#f6c56f",frame:null,frameOpacity:100,frameColor:"#e9bd69",frameWidth:7,shape:null,shapeZoom:100,brightness:100,contrast:100,saturation:100,blur:0}};URL.revokeObjectURL(url);resolve(item)};img.onerror=()=>{URL.revokeObjectURL(url);alert(file.name+": This image could not be opened.");resolve(null)};img.src=url}))).then(items=>{const valid=items.filter(Boolean);if(!valid.length)return;const firstIndex=state.images.length;state.images.push(...valid);if(state.activeImageIndex===-1)selectImage(firstIndex);else renderGallery()})}
$("fileInput").addEventListener("change",e=>{loadFiles(e.target.files);e.target.value=""});
const dz=$("dropZone");["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag")}));dz.addEventListener("drop",e=>loadFiles(e.dataTransfer.files));
$("zoom").addEventListener("input",e=>{state.zoom=+e.target.value;$("zoomValue").textContent=e.target.value+"%";draw()});
bindRange("quality","quality","%");bindRange("effectOpacity","effectOpacity","%");bindRange("effectScale","effectScale","%");bindRange("frameOpacity","frameOpacity","%");bindRange("frameWidth","frameWidth","%");bindRange("shapeZoom","shapeZoom","%");
bindRange("brightness","brightness","%");bindRange("contrast","contrast","%");bindRange("saturation","saturation","%");bindRange("blur","blur","px");
$("effectColor").addEventListener("input",e=>{state.effectColor=e.target.value;draw()});$("frameColor").addEventListener("input",e=>{state.frameColor=e.target.value;draw()});
$("fitBtn").onclick=()=>{$("zoom").value=100;$("zoomValue").textContent="100%";state.zoom=100;draw()};
$("centerBtn").onclick=()=>{state.shapeZoom=100;$("shapeZoom").value=100;$("shapeZoomValue").textContent="100%";draw()};
$("clearEffect").onclick=()=>{state.effect=null;syncSelection();draw()};$("noShapeBtn").onclick=()=>{state.shape=null;renderShapes();draw()};
$("resetAdjustments").onclick=()=>{["brightness","contrast","saturation","blur"].forEach(k=>{state[k]=k==="blur"?0:100;$(k).value=state[k];$(k+"Value").textContent=state[k]+(k==="blur"?"px":"%")});draw()};
$("format").onchange=()=>{};$("downloadBtn").onclick=()=>{if(!state.image)return;const mime=$("format").value,q=+$("quality").value/100;const a=document.createElement("a");a.download=(state.imageName.replace(/\.[^.]+$/,"")||"lovepdfi-photo")+"-edited."+(mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg");a.href=canvas.toDataURL(mime,q);a.click()};
$("resetBtn").onclick=()=>{if(!state.image)return;state.effect=null;state.frame=null;state.shape=null;state.filter="Original";state.brightness=state.contrast=state.saturation=100;state.blur=0;state.zoom=100;state.shapeZoom=100;["zoom","shapeZoom"].forEach(k=>{$(k).value=100;$(k+"Value").textContent="100%"});$("brightness").value=$("contrast").value=$("saturation").value=100;$("blur").value=0;["brightness","contrast","saturation"].forEach(k=>$(k+"Value").textContent="100%");$("blurValue").textContent="0px";syncSelection();draw();snapshot();if(state.activeImageIndex>=0)state.images[state.activeImageIndex].settings=captureSettings();renderGallery()};
$("checkerBtn").onclick=()=>{$("canvasWrap").classList.toggle("plain")};
$("undoBtn").onclick=()=>restoreHistory(state.historyIndex-1);$("redoBtn").onclick=()=>restoreHistory(state.historyIndex+1);
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));document.querySelectorAll(".tool-pane").forEach(p=>p.classList.toggle("active",p.id==="pane-"+t.dataset.tab))});
$("year").textContent=new Date().getFullYear();
renderEffects();renderFilters();renderFrames();renderShapes();
})();
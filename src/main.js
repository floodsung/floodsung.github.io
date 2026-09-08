import * as THREE from 'three';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createSurface } from './surfaces.js';

const $ = (s) => document.querySelector(s);
const panel = $('#panel'), panelContent = $('#panel-content'), sectorEl = $('#sector'), speedEl = $('#speed');
let content;
try { content = await fetch('data/content.json').then(r => r.json()); } catch (e) { content = {profile:{name:'Flood Sung',role:'AI Researcher. Robotics Founder. Agent Systems Builder.',company:'XVI Robotics',summary:'Founder & CEO of XVI Robotics.'},research:[],publications:[],opensource:{},career:[],contact:{}}; }

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040b);
scene.fog = new THREE.FogExp2(0x050a18, 0.00125);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(pointer: coarse)').matches;
const quality = mobile ? 1 : 1.5;
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 2600);
camera.position.set(0, 5.5, 27);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
$('#scene').appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .62, .5, .82); composer.addPass(bloom);


scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x070914, .75));
const sun = new THREE.DirectionalLight(0xd7e5ff, 2.4); sun.position.set(18, 28, 16); scene.add(sun);
const cyanLight = new THREE.PointLight(0x37dfff, 80, 120); cyanLight.position.set(0, 8, 15); scene.add(cyanLight);
const violetLight = new THREE.PointLight(0x855cff, 160, 220); violetLight.position.set(-30, -14, -55); scene.add(violetLight);

function seeded(i){ const x=Math.sin(i*999.13)*43758.5453; return x-Math.floor(x); }
function starfield(){
  const n=15000, pos=new Float32Array(n*3), col=new Float32Array(n*3), size=new Float32Array(n);
  for(let i=0;i<n;i++){const r=THREE.MathUtils.lerp(220,1100,seeded(i)), a=seeded(i+4)*Math.PI*2, b=Math.acos(THREE.MathUtils.randFloatSpread(2));pos.set([r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a)],i*3);const c=new THREE.Color().setHSL(seeded(i+8)>.86?.09:.57,.7,.62);col.set(c.toArray(),i*3);size[i]=seeded(i+3)>.94?2.8:.9;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('size',new THREE.BufferAttribute(size,1));
  const m=new THREE.PointsMaterial({size:.9,vertexColors:true,transparent:true,opacity:.9,sizeAttenuation:true,blending:THREE.AdditiveBlending});scene.add(new THREE.Points(g,m));
}
starfield();
function nebula(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d'); const g=x.createRadialGradient(256,256,10,256,256,256);g.addColorStop(0,'#b49bffcc');g.addColorStop(.18,'#6959d980');g.addColorStop(.5,'#1b3c7e30');g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(0,0,512,512);
  const tex=new THREE.CanvasTexture(c); for(let i=0;i<11;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.set(THREE.MathUtils.randFloatSpread(300),THREE.MathUtils.randFloatSpread(150),THREE.MathUtils.randFloat(-260,-40));const z=THREE.MathUtils.randFloat(45,120);s.scale.set(z*2.1,z,1);scene.add(s);}
}
nebula();
const textures=new THREE.TextureLoader();
const earthMap=textures.load('assets/earth-day.jpg');earthMap.colorSpace=THREE.SRGBColorSpace;
const earthNormal=textures.load('assets/earth-normal.jpg');
const moonMap=textures.load('assets/moon.jpg');moonMap.colorSpace=THREE.SRGBColorSpace;
function planet(pos,r,color,opts={}){
  const g=new THREE.Group();g.position.set(...pos);g.userData.radius=r;
  const surface=opts.earth?earthMap:opts.moon?moonMap:createSurface(color,opts.gas);
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,map:surface,bumpMap:opts.earth?null:surface,bumpScale:opts.gas?.015:.15,normalMap:opts.earth?earthNormal:null,normalScale:new THREE.Vector2(.4,.4),roughness:.83,metalness:.03});
  const body=new THREE.Mesh(new THREE.SphereGeometry(r,64,48),mat);g.add(body);
  if(opts.cloud){const cm=new THREE.MeshStandardMaterial({color:0xbcd4ff,transparent:true,opacity:.12,roughness:1});const cloud=new THREE.Mesh(new THREE.SphereGeometry(r*1.018,48,32),cm);g.add(cloud);}
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(r*1.08,40,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.09,side:THREE.BackSide,blending:THREE.AdditiveBlending}));g.add(atmo);
  if(opts.ring){const ring=new THREE.Mesh(new THREE.RingGeometry(r*1.35,r*1.52,128),new THREE.MeshBasicMaterial({color:opts.ringColor||0x80eaff,transparent:true,opacity:.5,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));ring.rotation.x=Math.PI/2.2;g.add(ring);}
  scene.add(g); return g;
}
function station(pos){
  const g=new THREE.Group();g.position.set(...pos); const metal=new THREE.MeshStandardMaterial({color:0x263550,metalness:.88,roughness:.26});
  const core=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,1.8,64),metal);core.rotation.z=Math.PI/2;g.add(core);
  for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(4.2+i*1.28,.16,12,128),new THREE.MeshStandardMaterial({color:i%2?0x33456a:0x7693b5,metalness:.95,roughness:.2,emissive:i===1?0x0e5180:0x050b19,emissiveIntensity:1.2}));ring.rotation.y=Math.PI/2;ring.rotation.z=i*.08;g.add(ring);}
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const pod=new THREE.Mesh(new THREE.BoxGeometry(.7,.35,1.3),metal);pod.position.set(Math.cos(a)*4.5,Math.sin(a)*4.5,0);pod.rotation.z=a;g.add(pod);const win=new THREE.Mesh(new THREE.BoxGeometry(.25,.08,.5),new THREE.MeshBasicMaterial({color:i%3?0x80eaff:0xffd58a,blending:THREE.AdditiveBlending}));win.position.copy(pod.position).multiplyScalar(1.04);win.rotation.z=a;g.add(win);}
  for(let i=0;i<6;i++){const arm=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,9),metal);arm.rotation.z=i*Math.PI/3;arm.position.set(0,0,0);g.add(arm);}
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,8,16),new THREE.MeshBasicMaterial({color:0x80eaff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending}));beacon.position.y=5;g.add(beacon);
  scene.add(g);return g;
}
function asteroidBelt(center,r,count,color){const g=new THREE.Group();g.position.set(...center);for(let i=0;i<count;i++){const a=i/count*Math.PI*2+seeded(i)*.4,rad=r+THREE.MathUtils.randFloatSpread(8),s=THREE.MathUtils.randFloat(.3,1.5);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),new THREE.MeshStandardMaterial({color,roughness:1,metalness:.1}));m.position.set(Math.cos(a)*rad,THREE.MathUtils.randFloatSpread(7),Math.sin(a)*rad);m.rotation.set(seeded(i)*3,seeded(i+2)*3,seeded(i+4)*3);g.add(m);}scene.add(g);return g;}
const nodes={profile:planet([0,0,0],6.2,0x243b9a,{earth:true,ring:false}),research:planet([-32,12,-58],8,0x4a238a,{gas:true,ring:true,ringColor:0xa78bfa}),papers:planet([36,-8,-100],11,0x174f7e,{moon:true,ring:true}),open:planet([76,22,-48],7,0x157a73,{ring:false}),career:planet([-76,-15,-28],7.5,0x744027,{ring:true,ringColor:0xffb866}),contact:planet([2,-30,-148],8,0x65458f,{ring:false})};
const homeStation=station([-15,-2,-6]);homeStation.scale.setScalar(1.1);homeStation.rotation.set(.35,.4,.25);
station([-32,12,-48]); station([36,-8,-88]); station([76,22,-39]); station([-76,-15,-20]); station([2,-30,-136]);
asteroidBelt([36,-8,-100],15,72,0x40516d); asteroidBelt([76,22,-48],11,34,0x387c78);
const avatarTex=new THREE.Texture();const avatarImg=new Image();avatarImg.onload=()=>{const c=document.createElement('canvas');c.width=avatarImg.naturalWidth;c.height=avatarImg.naturalHeight;const x=c.getContext('2d');x.drawImage(avatarImg,0,0);const px=x.getImageData(0,0,c.width,c.height);for(let i=0;i<px.data.length;i+=4){const n=i/4,ax=(n%c.width)/c.width-.5,ay=Math.floor(n/c.width)/c.height-.5;if(ax*ax+ay*ay>.235||px.data[i]>220&&px.data[i+1]>220&&px.data[i+2]>220)px.data[i+3]=0;}x.putImageData(px,0,0);avatarTex.image=c;avatarTex.needsUpdate=true;};avatarImg.src='avatar.png';const avatar=new THREE.Mesh(new THREE.PlaneGeometry(3.5,3.5),new THREE.MeshBasicMaterial({map:avatarTex,transparent:true,opacity:.93,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));avatar.position.set(-14,1,7);avatar.scale.setScalar(.7);scene.add(avatar);
const ship=new THREE.Group();const hull=new THREE.Mesh(new THREE.ConeGeometry(1.35,5.4,8),new THREE.MeshStandardMaterial({color:0xdbe7ff,metalness:.9,roughness:.2,emissive:0x10234c,emissiveIntensity:.8}));hull.rotation.x=-Math.PI/2;ship.add(hull);const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.68,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0x80eaff,metalness:.15,roughness:.06,transmission:.3,emissive:0x0c6495,emissiveIntensity:1.4}));cockpit.position.z=-.5;ship.add(cockpit);const engine=new THREE.PointLight(0x55dfff,12,22);engine.position.z=2.3;ship.add(engine);ship.scale.setScalar(.17);ship.position.set(0,-1.5,22);scene.add(ship);
const nodeNames={profile:'XVI ORBITAL / PROFILE',research:'RESEARCH STATION',papers:'ARCHIVE RING',open:'COMMUNITY DOCK',career:'TIMELINE GATE',contact:'COMMS ARRAY'};const labels={};
for(const [key,obj] of Object.entries(nodes)){const label=document.createElement('button');label.className='node-label';label.innerHTML=`${nodeNames[key]}<small>F · DOCK / CLICK</small>`;document.body.appendChild(label);labels[key]=label;label.onclick=()=>dock(key);}
function openPanel(key){const d=content[key==='open'?'opensource':key];if(key==='profile'){panelContent.innerHTML=`<div class="eyebrow">HOME ORBIT / PROFILE</div><h2>${d.name}</h2><p>${d.role}</p><p>${d.summary}</p><div class="metric-row">${Object.entries(d.metrics||{}).map(([k,v])=>`<div class="metric"><strong>${v}</strong><span>${k.replace(/([A-Z])/g,' $1').toUpperCase()}</span></div>`).join('')}</div>`;}else if(key==='research'){panelContent.innerHTML=`<div class="eyebrow">RESEARCH STATION / VECTORS</div><h2>FROM FEW-SHOT TO EMBODIED INTELLIGENCE</h2><p>The through-line is sample-efficient intelligence: models that reason, adapt, act, and transfer across real environments.</p>${d.map(x=>`<p><strong>${x.title}</strong><br>${x.body}</p>`).join('')}`;}else if(key==='papers'){panelContent.innerHTML=`<div class="eyebrow">ARCHIVE RING / PUBLICATIONS</div><h2>SELECTED SIGNALS</h2><p>Google Scholar snapshot retrieved ${content.retrievedAt}. Citation counts change over time.</p>${content.publications.map(x=>`<p><a href="${x.url}" target="_blank" rel="noreferrer"><strong>${x.title}</strong></a><br>${x.year} · ${x.citations} citations</p>`).join('')}`;}else if(key==='open'){panelContent.innerHTML=`<div class="eyebrow">COMMUNITY DOCK / OPEN SOURCE</div><h2>TOOLS IN THE WILD</h2><p>${d.summary}</p><div class="meta">${(d.repoDetails||[]).map(r=>`<a href="${r.url}" target="_blank" rel="noreferrer">${r.name}</a> · ${r.stars}★ · ${r.description}`).join('<br>')}\n\n${d.stats.stars} stars · ${d.stats.forks} forks · ${d.stats.followers} followers · ${d.stats.repos} repositories</div><p><a href="https://github.com/floodsung" target="_blank" rel="noreferrer">OPEN GITHUB ↗</a></p>`;}else if(key==='career'){panelContent.innerHTML=`<div class="eyebrow">TIMELINE GATE / CAREER</div><h2>RESEARCH · SYSTEMS · COMPANY BUILDING</h2><p>${d.join('\n')}</p>`;}else{panelContent.innerHTML=`<div class="eyebrow">COMMS ARRAY / CONTACT</div><h2>OPEN CHANNEL</h2><p>For research collaboration, speaking, media, or company-building conversations.</p><div class="meta">EMAIL  ${content.contact.email}\nGITHUB  github.com/floodsung\nSCHOLAR  s11zFYQAAAAJ\nLINKEDIN  flood-sung-305273117</div><p><a href="mailto:${content.contact.email}">TRANSMIT EMAIL ↗</a></p>`;}panel.classList.add('open');}
let activeKey='profile';function dock(key){activeKey=key;sectorEl.textContent=nodeNames[key].split(' / ')[0];const p=nodes[key].position;camera.position.lerp(new THREE.Vector3(p.x,p.y+8,p.z+18),.85);ship.position.copy(camera.position).add(new THREE.Vector3(0,-2,-4));openPanel(key);document.querySelectorAll('.dockbar button').forEach(b=>b.classList.toggle('active',b.dataset.node===key));}
document.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>dock(b.dataset.node));panel.querySelector('.close').onclick=()=>panel.classList.remove('open');
const keys={};addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false)});addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Escape'){panel.classList.remove('open');travel=null;}if(e.key.toLowerCase()==='f'){const near=nearest();if(near)dock(near)}});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let yaw=0,pitch=-.08,drag=false,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-lastX)*.002;pitch-=(e.clientY-lastY)*.002;pitch=Math.max(-1.1,Math.min(1.1,pitch));lastX=e.clientX;lastY=e.clientY});renderer.domElement.addEventListener('pointerup',()=>drag=false);renderer.domElement.addEventListener('pointercancel',()=>drag=false);
const velocity=new THREE.Vector3();function nearest(){let best=null,dist=Infinity;for(const [k,o] of Object.entries(nodes)){const d=camera.position.distanceTo(o.position);if(d<dist){dist=d;best=k}}return dist<16?best:null;}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.04,(t-(loop.last||t))/1000);loop.last=t;const dir=new THREE.Vector3();if(keys.w||keys.arrowup)dir.z-=1;if(keys.s||keys.arrowdown)dir.z+=1;if(keys.a||keys.arrowleft)dir.x-=1;if(keys.d||keys.arrowright)dir.x+=1;if(keys.q)dir.y+=1;if(keys.e)dir.y-=1;const boost=keys.shift?2.8:1;dir.normalize().multiplyScalar(22*boost);velocity.lerp(dir,1-Math.exp(-dt*3.5));const forward=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));const right=new THREE.Vector3(1,0,0).applyEuler(new THREE.Euler(0,yaw,0));camera.position.addScaledVector(right,velocity.x*dt);camera.position.addScaledVector(forward, -velocity.z*dt);camera.position.y+=velocity.y*dt;camera.rotation.set(pitch,yaw,0,'YXZ');ship.position.copy(camera.position).addScaledVector(forward,10.5).add(new THREE.Vector3(0,-2.35,0));ship.rotation.set(pitch,yaw,0);ship.rotation.z=-velocity.x*.025;engine.intensity=10+velocity.length()*.9;speedEl.textContent=velocity.length().toFixed(1);avatar.lookAt(camera.position);if(!reducedMotion){homeStation.rotation.y+=dt*.018;Object.values(nodes).forEach(n=>n.rotation.y+=dt*.015);}
  const ray=new THREE.Raycaster();ray.camera=camera;for(const [k,o] of Object.entries(nodes)){const p=o.position.clone().project(camera),el=labels[k];const distance=camera.position.distanceTo(o.position);const visible=p.z<1&&p.z>-1&&distance<210;let blocked=false;if(visible){ray.set(camera.position,o.position.clone().sub(camera.position).normalize());const hits=ray.intersectObjects(scene.children,true);blocked=hits.some(h=>{let root=h.object;while(root.parent&&root.parent!==scene)root=root.parent;return root!==o&&h.distance<distance-2})}el.style.display=visible&&!blocked?'block':'none';if(visible&&!blocked){el.style.left=((p.x+1)/2*innerWidth)+'px';el.style.top=((1-p.y)/2*innerHeight)+'px';el.style.opacity=Math.max(.25,Math.min(1,1-distance/210));}}
  composer.render();}
requestAnimationFrame(loop);
document.body.dataset.ready='true';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,quality));});
setTimeout(()=>{const boot=document.querySelector('#boot');if(boot)boot.remove()},900);

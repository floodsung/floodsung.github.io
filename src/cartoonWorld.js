import * as THREE from 'three';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

// A compact, hand-built diorama kit.  The geometry is deliberately chunky and
// readable at thumbnail size: every landmark has one strong silhouette and a
// small set of animated details instead of a cloud of unrelated primitives.
const COLORS = {
  ink: 0x14233f,
  ground: 0x263e62,
  edge: 0x6ddcff,
  paper: 0xffd77d,
  compare: 0xff8b6a,
  proof: 0xa88dff,
  agent: 0x4ee6c1,
  window: 0xb7f4ff,
  shadow: 0x0b1224,
};

function rampTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#182742'; ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = '#34557a'; ctx.fillRect(1, 0, 1, 1);
  ctx.fillStyle = '#7ea5c7'; ctx.fillRect(2, 0, 1, 1);
  ctx.fillStyle = '#e6f7ff'; ctx.fillRect(3, 0, 1, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

const ramp = rampTexture();
const glow = (color, intensity = 1.2) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity: .86, blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const toon = (color, opts = {}) => new THREE.MeshToonMaterial({
  color, gradientMap: ramp, ...opts,
});
const metal = (color = COLORS.ink) => new THREE.MeshStandardMaterial({
  color, metalness: .52, roughness: .38,
});
const box = (size, color, opts = {}) => new THREE.Mesh(
  new RoundedBoxGeometry(size[0], size[1], size[2], opts.segments || 3, opts.radius || .14),
  toon(color, opts.material || {}),
);

function labelTexture(text, color = '#c9f6ff') {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '600 28px Space Grotesk, Arial'; ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 48);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function floatingLabel(text, accent) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: labelTexture(text, accent === COLORS.compare ? '#ffd1b8' : accent === COLORS.proof ? '#ded2ff' : '#baffee'),
    transparent: true, depthWrite: false,
  }));
  sprite.scale.set(4.6, .85, 1); sprite.position.y = 5.1; return sprite;
}

function makeIsland(root) {
  const island = new THREE.Group(); island.name = 'Research Park ground';
  const top = new THREE.Mesh(new THREE.CylinderGeometry(33, 29, 2.8, 12), toon(COLORS.ground));
  top.position.y = -1.4; island.add(top);
  const under = new THREE.Mesh(new THREE.ConeGeometry(24, 18, 12), toon(COLORS.shadow));
  under.position.y = -11; island.add(under);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(30.5, .28, 8, 12), glow(COLORS.edge));
  rim.rotation.x = Math.PI / 2; rim.position.y = -.05; island.add(rim);
  // A warm inlaid path gives the player a legible route through the hub.
  const path = new THREE.Mesh(new THREE.TorusGeometry(18, 1.05, 8, 64), toon(0x38577a));
  path.rotation.x = Math.PI / 2; path.position.y = .08; island.add(path);
  root.add(island);
  return island;
}

function windowStrip(parent, x, y, z, w, h, d, color = COLORS.window) {
  const m = box([w, h, d], color, { radius: .06, segments: 2, material: { emissive: color, emissiveIntensity: .32 } });
  m.position.set(x, y, z); parent.add(m); return m;
}

function labBuilding(root, position, title, accent, kind) {
  const g = new THREE.Group(); g.position.set(...position); g.name = `${title} landmark`;
  const base = box([9, 3.5, 8], COLORS.ink, { radius: .42 }); base.position.y = 1.7; g.add(base);
  const plinth = box([11, .35, 10], accent, { radius: .13 }); plinth.position.y = .08; g.add(plinth);
  const roof = box([8.3, .5, 7.4], accent, { radius: .18 }); roof.position.y = 4; g.add(roof);
  for (let i = -2; i <= 2; i++) windowStrip(g, i * 1.35, 2.1, 4.08, .72, .55, .1, COLORS.window);
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 1), new THREE.MeshBasicMaterial({ map: labelTexture(title), transparent: true, depthWrite: false }));
  badge.position.set(0, 3.05, 4.14); g.add(badge);
  if (kind === 'compare') {
    for (const x of [-2.6, 2.6]) {
      const tower = box([2, 8, 2], accent, { radius: .3 }); tower.position.set(x, 5.1, 0); g.add(tower);
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(.9, 1), glow(x < 0 ? COLORS.compare : COLORS.agent)); core.position.set(x, 8.3, 0); g.add(core);
    }
    const bridge = box([6.4, .55, 1.1], COLORS.paper, { radius: .18 }); bridge.position.y = 6.5; bridge.rotation.z = -.12; g.add(bridge);
  } else if (kind === 'proof') {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.5, .52, 8, 24, Math.PI), toon(accent));
    arch.rotation.z = Math.PI / 2; arch.position.set(0, 6, 0); g.add(arch);
    for (let i = 0; i < 5; i++) { const book = box([.65, 2 + i * .2, 2.2], i % 2 ? COLORS.paper : accent, { radius: .09 }); book.position.set(-1.5 + i * .75, 5 + i * .15, .3); book.rotation.z = (i - 2) * .05; g.add(book); }
  } else {
    const forge = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.2, 3.4, 12), metal(accent)); forge.position.y = 6; g.add(forge);
    for (let i = 0; i < 4; i++) { const arm = box([.45, 4, .45], accent, { radius: .12 }); arm.position.set(Math.cos(i * Math.PI / 2) * 3.4, 4, Math.sin(i * Math.PI / 2) * 3.4); arm.rotation.z = i * Math.PI / 2; g.add(arm); }
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), glow(COLORS.agent)); core.position.y = 8.2; g.add(core);
  }
  g.add(floatingLabel(title, accent));
  g.userData.landmark = true; g.userData.slug = kind; g.userData.title = title; root.add(g); return g;
}

function stationAndTrain(root) {
  const group = new THREE.Group(); group.name = 'XVI Research Line station'; group.position.set(0, .3, 17);
  const platform = box([16, .7, 5], COLORS.ink, { radius: .25 }); platform.position.y = .15; group.add(platform);
  const stripe = box([13, .08, .18], COLORS.edge, { radius: .02 }); stripe.position.set(0, .55, 2.2); group.add(stripe);
  for (const x of [-6.3, 6.3]) { const pillar = box([.45, 7, .45], COLORS.paper, { radius: .12 }); pillar.position.set(x, 3.9, 0); group.add(pillar); }
  const canopy = box([15, .3, 4.8], COLORS.ink, { radius: .16 }); canopy.position.y = 7.3; group.add(canopy);
  const train = new THREE.Group(); train.name = 'Research train'; train.position.set(0, 2, -1.2);
  const body = box([12, 2.2, 2.8], COLORS.agent, { radius: .55 }); train.add(body);
  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 2.2, 8, 16), toon(COLORS.agent)); nose.rotation.z = Math.PI / 2; nose.position.x = 6.2; train.add(nose);
  for (let i = -4; i <= 4; i += 2) windowStrip(train, i, 2.18, 1.45, 1.2, .68, .08, COLORS.window);
  const wheelMat = metal(COLORS.shadow); for (const x of [-4.5, 4.5]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .22, 16), wheelMat); wheel.rotation.z = Math.PI / 2; wheel.position.set(x, -1.15, 0); train.add(wheel); }
  train.userData.speed = .28; train.userData.startX = 0; group.add(train);
  root.add(group); return { group, train };
}

function addTrees(root) {
  const spots = [[-20, 0, 13], [-25, 0, -7], [20, 0, -14], [24, 0, 8], [-7, 0, -23], [8, 0, -24]];
  for (const [x, y, z] of spots) {
    const tree = new THREE.Group(); tree.position.set(x, y, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .36, 2.4, 8), toon(0x76543f)); trunk.position.y = 1.2; tree.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 1), toon(0x4ec6a0)); crown.position.y = 2.85; tree.add(crown);
    root.add(tree);
  }
}

/** Build the complete small world.  `update(dt, elapsed)` is safe to call from
 * an animation loop, while `landmarks` can be attached to interaction logic. */
export function createCartoonWorld(scene) {
  const root = new THREE.Group(); root.name = 'XVI Knowledge City'; scene.add(root);
  makeIsland(root); addTrees(root);
  const landmarks = [
    labBuilding(root, [-15, 0, -5], 'COMPARE LAB', COLORS.compare, 'compare'),
    labBuilding(root, [14, 0, -7], 'PROOF LIBRARY', COLORS.proof, 'proof'),
    labBuilding(root, [0, 0, -21], 'AGENT FOUNDRY', COLORS.agent, 'agent'),
  ];
  const station = stationAndTrain(root);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 9, 8), glow(COLORS.edge)); beacon.position.set(0, 4.8, 17); root.add(beacon);
  const sun = new THREE.DirectionalLight(0xffe4be, 2.2); sun.position.set(-20, 35, 18); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -42; sun.shadow.camera.right = 42; sun.shadow.camera.top = 42; sun.shadow.camera.bottom = -42; sun.shadow.bias = -.0005; root.add(sun);
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return {
    root, landmarks, station,
    update(dt, elapsed) {
      station.train.position.x = Math.sin(elapsed * .16) * 2.5;
      station.train.rotation.y = Math.sin(elapsed * .16) * .018;
      landmarks[0].rotation.y = Math.sin(elapsed * .25) * .025;
      landmarks[1].rotation.y = Math.sin(elapsed * .19 + 1) * .02;
      landmarks[2].rotation.y = Math.sin(elapsed * .22 + 2) * .025;
      beacon.material.opacity = .58 + Math.sin(elapsed * 3) * .22;
    },
  };
}

export default createCartoonWorld;

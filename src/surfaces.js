import * as THREE from 'three';

// Small procedural albedo maps keep every world readable without a heavy asset pack.
export function createSurface(base, gas = false) {
  const size = 512;
  const c = document.createElement('canvas'); c.width = size; c.height = size / 2;
  const ctx = c.getContext('2d'); const image = ctx.createImageData(c.width, c.height);
  const color = new THREE.Color(base); const hsl = {}; color.getHSL(hsl);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const u = x / c.width, v = y / c.height; const wave = Math.sin((v * (gas ? 22 : 8) + Math.sin(u * 16) * .32) * Math.PI * 2);
    const noise = Math.sin(x * .071 + y * .037) * .5 + Math.sin(x * .013 - y * .093) * .25;
    const n = gas ? wave * .17 + noise * .12 : noise * .045;
    const k = Math.max(.42, Math.min(1.55, 1 + n));
    const i = (y * c.width + x) * 4; image.data[i] = color.r * 255 * k; image.data[i+1] = color.g * 255 * k; image.data[i+2] = color.b * 255 * k; image.data[i+3] = 255;
  }
  ctx.putImageData(image, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}

# XVI Research Park verification

Run: skill-pass-4 / skill-pass-4-mobile, current source revision before final deployment.

- `npm run build`: passed with Vite 5.4.21; output includes bundled Three.js and `dist/data/content.json`.
- `node --check src/main.js` and `node --check src/cartoonWorld.js`: passed.
- Desktop canvas inspector: passed `nonblank`; 1280x720; color entropy 3.59 bits; edge density 0.15; luminance contrast 149.1; no console/page errors.
- Mobile canvas inspector: passed `nonblank`; 390x664; color entropy 3.59 bits; edge density 0.16; luminance contrast 87.1; no console/page errors.
- Active-play screenshot: central park, player robot, three landmark buildings, train/station, quest HUD and map controls visible.
- Test hook: `active-play` acknowledged; `compare-near` positions player for scan challenge.
- Asset credential probe: TRIPO, GEMINI, ELEVENLABS missing; graphics use authored procedural toon geometry and no paid client assets.
- Remaining risk: CDN imports require network access; hero assets are stylized procedural geometry rather than externally generated GLB.
- Playwright real-input path: Fast travel -> Compare Lab -> `E` -> choose first answer; observed hint `E · SCAN COMPARE`, challenge title `Compare the signals`, progress `1 / 3`, and Paper Card title `Learning to Compare: Relation Network for Few-Shot Learning`.
- Build note: Vite reports a 507 kB minified chunk because Three.js and post-processing remain in one static module; no functional build error.

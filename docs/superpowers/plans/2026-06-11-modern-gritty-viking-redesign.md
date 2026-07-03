# Modern Gritty Viking Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the prototype/MSPaint/pixel feel with a modern gritty Viking fantasy presentation using smooth monster SVGs, richer combat animation, and cohesive war-camp UI/UX.

**Architecture:** Keep the existing plain JavaScript + canvas architecture. Improve the visual system in-place by adding small reusable canvas helpers, replacing runtime monster SVGs, and restyling existing screens without changing persistence or gameplay balance.

**Tech Stack:** Browser ES modules, HTML canvas, runtime SVG data URIs, CSS, local static server.

---

## File Structure

- Modify `style.css`: remove pixelated canvas rendering and set base smoothing/background behavior.
- Modify `assets/sprites.js`: replace generic recolored monster SVGs with unique layered SVG monsters.
- Modify `assets/visualPatch.js`: tune sprite scale, animation, chilled/frozen overlays, monster HP bars, and combat border treatment.
- Modify `src/canvas.js`: reduce old geometric monster visual interference and tune background/effects toward modern gritty Viking fantasy.
- Modify `src/ui.js`: restyle combat HUD, run ledger, hero bench, barricade, torches, and bars.
- Modify `src/screens.js`: redesign title, level select, upgrades, shop, gear, achievements, victory/defeat, skill choices, and shared buttons/panels.
- Do not modify persistence structures in `src/gameState.js`.
- Do not modify level, hero, gear, or monster balance data except if a label/icon must be read by a redesigned view.

## Task 1: Rendering Foundation And Visual Tokens

**Files:**
- Modify: `style.css`
- Modify: `src/screens.js`
- Modify: `src/ui.js`

- [ ] **Step 1: Remove forced pixel rendering**

In `style.css`, replace:

```css
#gameCanvas {
    display: block;
    width: 100vw;
    height: 100vh;
    image-rendering: pixelated;
}
```

with:

```css
#gameCanvas {
    display: block;
    width: 100vw;
    height: 100vh;
    image-rendering: auto;
}
```

Expected result: browser canvas scaling is no longer deliberately pixelated.

- [ ] **Step 2: Add shared war-camp palette constants in `src/screens.js`**

Near the top of `src/screens.js`, after existing constants, add:

```js
const WAR = {
    bg: '#080706',
    panel: '#17110c',
    panel2: '#24180f',
    timber: '#3a2414',
    timber2: '#5b351c',
    iron: '#6f7780',
    ironDark: '#24282c',
    bronze: '#b47a2d',
    bronzeBright: '#e2ad54',
    parchment: '#d8c39a',
    text: '#f0dfba',
    muted: '#9e8c70',
    ember: '#df6a26',
    danger: '#b83a2c',
    frost: '#7fb7c7',
    shadow: 'rgba(0,0,0,0.72)'
};
```

Expected result: screen redraw work uses one palette instead of scattered gold/neon values.

- [ ] **Step 3: Add matching combat palette constants in `src/ui.js`**

Near the top of `src/ui.js`, after the module-level timers, add:

```js
const WAR_UI = {
    panel: '#17110c',
    panel2: '#24180f',
    timber: '#3a2414',
    timber2: '#5b351c',
    iron: '#6f7780',
    bronze: '#b47a2d',
    bronzeBright: '#e2ad54',
    text: '#f0dfba',
    muted: '#9e8c70',
    ember: '#df6a26',
    frost: '#7fb7c7',
    hpGood: '#5fb15b',
    hpWarn: '#d69a35',
    hpBad: '#b83a2c'
};
```

Expected result: HUD and combat panel work uses a consistent material system.

- [ ] **Step 4: Smoke test module loading**

Run a local static server from the project root:

```powershell
python -m http.server 5173
```

Open `http://localhost:5173`.

Expected: the game loads without module errors and the canvas edges no longer look intentionally blocky.

- [ ] **Step 5: Commit**

```bash
git add style.css src/screens.js src/ui.js
git commit -m "style: add modern war-camp visual foundation"
```

## Task 2: Replace Monster SVGs With Unique Smooth Illustrated Enemies

**Files:**
- Modify: `assets/sprites.js`

- [ ] **Step 1: Upgrade SVG wrapper**

In `assets/sprites.js`, replace `svgWrap(body)` with:

```js
function svgWrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <filter id="softGlow"><feDropShadow dx="0" dy="0" stdDeviation="2.6" flood-color="#f1c16a" flood-opacity=".34"/></filter>
      <filter id="coldGlow"><feDropShadow dx="0" dy="0" stdDeviation="2.8" flood-color="#8fd8ef" flood-opacity=".38"/></filter>
      <filter id="emberGlow"><feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="#f06a2a" flood-opacity=".48"/></filter>
      <linearGradient id="iron" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#c6c0ad"/><stop offset=".48" stop-color="#7b7f81"/><stop offset="1" stop-color="#292f33"/>
      </linearGradient>
      <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6c3c20"/><stop offset="1" stop-color="#2a140b"/>
      </linearGradient>
      <linearGradient id="hide" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7a5432"/><stop offset="1" stop-color="#22130c"/>
      </linearGradient>
    </defs>${body}</svg>`;
}
```

Expected: all sprites can reuse higher-quality material gradients and glows.

- [ ] **Step 2: Replace `monsterSvg(id)` with a switch-based dispatcher**

Replace the current shared `monsterSvg(id)` function with:

```js
function monsterSvg(id) {
  if (id === 'archer') return archerSvg();
  if (id === 'berserker') return berserkerSvg();
  if (id === 'shaman') return shamanSvg();
  if (id === 'boss') return bossSvg();
  return gruntSvg();
}
```

Expected: each monster type can have a distinct body instead of a recolored shared body.

- [ ] **Step 3: Add `gruntSvg()`**

Add this function below `monsterSvg(id)`:

```js
function gruntSvg() {
  return svgWrap(`
    <ellipse cx="64" cy="119" rx="37" ry="8" fill="#000" opacity=".42"/>
    <path d="M42 111 L48 68 C50 50 77 48 83 68 L90 111 Z" fill="url(#leather)" stroke="#120a06" stroke-width="3.5"/>
    <path d="M39 70 C30 74 23 86 20 101 L33 107 L45 83 Z" fill="#4b2917" stroke="#120a06" stroke-width="3"/>
    <path d="M87 70 C101 74 108 86 110 101 L97 107 L83 83 Z" fill="#4b2917" stroke="#120a06" stroke-width="3"/>
    <circle cx="64" cy="39" r="18" fill="#6c3a20" stroke="#130907" stroke-width="3"/>
    <path d="M45 32 C49 13 79 13 84 32 C72 26 57 26 45 32Z" fill="#312018" stroke="#0d0705" stroke-width="3"/>
    <path d="M49 29 L34 17 L40 43 M79 29 L94 17 L88 43" fill="#b9a985" stroke="#15100b" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="57" cy="39" r="3.5" fill="#ff8a32" filter="url(#emberGlow)"/>
    <circle cx="71" cy="39" r="3.5" fill="#ff8a32" filter="url(#emberGlow)"/>
    <path d="M55 53 C61 58 69 58 75 53" fill="none" stroke="#160806" stroke-width="3" stroke-linecap="round"/>
    <circle cx="38" cy="78" r="18" fill="#392216" stroke="#a47838" stroke-width="4"/>
    <path d="M26 78 H50 M38 66 V91" stroke="#7b5330" stroke-width="3" stroke-linecap="round"/>
    <path d="M85 86 L106 63" stroke="#4a2a17" stroke-width="6" stroke-linecap="round"/>
    <path d="M101 58 L114 51 L109 67 Z" fill="url(#iron)" stroke="#171b1d" stroke-width="2.5"/>
    <path d="M48 75 L64 92 L80 75 L85 111 L43 111 Z" fill="#201613" opacity=".72"/>
  `);
}
```

Expected: grunt reads as a shield-and-axe raider at combat scale.

- [ ] **Step 4: Add `archerSvg()`**

Add:

```js
function archerSvg() {
  return svgWrap(`
    <ellipse cx="64" cy="119" rx="32" ry="7" fill="#000" opacity=".38"/>
    <path d="M41 112 L49 63 C52 45 75 43 82 63 L89 112 Z" fill="#25313a" stroke="#090d10" stroke-width="3.5"/>
    <path d="M45 55 C48 24 80 23 84 55 C73 49 57 49 45 55Z" fill="#34251a" stroke="#0a0604" stroke-width="3"/>
    <path d="M49 53 C55 38 73 38 80 53 L75 64 L53 64 Z" fill="#6b5035" stroke="#160c08" stroke-width="2.5"/>
    <path d="M53 37 L42 21 M75 37 L86 21" stroke="#a89672" stroke-width="5" stroke-linecap="round"/>
    <circle cx="58" cy="55" r="3" fill="#8fd8ef" filter="url(#coldGlow)"/>
    <circle cx="70" cy="55" r="3" fill="#8fd8ef" filter="url(#coldGlow)"/>
    <path d="M33 70 C22 82 21 99 33 110" fill="none" stroke="#6a4529" stroke-width="5" stroke-linecap="round"/>
    <path d="M95 67 C111 82 111 101 95 114" fill="none" stroke="#9b7446" stroke-width="5" stroke-linecap="round"/>
    <path d="M94 67 C111 82 111 101 95 114" fill="none" stroke="#1b1008" stroke-width="2" stroke-linecap="round"/>
    <path d="M92 64 L97 116" stroke="#d8c9a6" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M44 73 L30 83 L27 101 L40 98 L52 80 Z" fill="#2b1b13" stroke="#0e0805" stroke-width="2.5"/>
    <path d="M56 72 L70 83 L82 72 L84 112 L46 112 Z" fill="#171d22" opacity=".82"/>
    <path d="M58 84 L78 76" stroke="#8fd8ef" stroke-width="2" opacity=".8" filter="url(#coldGlow)"/>
  `);
}
```

Expected: archer has a lean hooded silhouette with a visible bow.

- [ ] **Step 5: Add `berserkerSvg()`**

Add:

```js
function berserkerSvg() {
  return svgWrap(`
    <ellipse cx="64" cy="119" rx="43" ry="9" fill="#000" opacity=".44"/>
    <path d="M31 112 L39 65 C43 42 85 42 91 65 L99 112 Z" fill="url(#hide)" stroke="#100806" stroke-width="4"/>
    <path d="M35 62 L19 75 L16 102 L34 108 L45 77 Z" fill="#4a2c1a" stroke="#0e0705" stroke-width="3"/>
    <path d="M93 62 L109 75 L112 102 L94 108 L83 77 Z" fill="#4a2c1a" stroke="#0e0705" stroke-width="3"/>
    <path d="M35 61 C42 49 51 43 64 43 C77 43 87 49 94 61 C85 54 43 54 35 61Z" fill="#392215" stroke="#140906" stroke-width="3"/>
    <circle cx="64" cy="38" r="20" fill="#744121" stroke="#120806" stroke-width="3.5"/>
    <path d="M45 27 L31 12 L38 41 M83 27 L97 12 L90 41" fill="#b99b65" stroke="#17100b" stroke-width="4" stroke-linejoin="round"/>
    <path d="M49 37 L60 42 M79 37 L68 42" stroke="#ff503f" stroke-width="4" stroke-linecap="round" filter="url(#emberGlow)"/>
    <path d="M55 54 C61 61 70 61 76 54" fill="none" stroke="#220705" stroke-width="4" stroke-linecap="round"/>
    <path d="M55 59 L46 111 M73 59 L84 111" stroke="#b83a2c" stroke-width="3" stroke-linecap="round"/>
    <path d="M90 89 L109 69" stroke="#4a2a17" stroke-width="7" stroke-linecap="round"/>
    <path d="M104 63 L118 54 L116 75 L101 73 Z" fill="url(#iron)" stroke="#15191b" stroke-width="3"/>
    <path d="M39 87 L24 72 L20 94 Z" fill="url(#iron)" stroke="#15191b" stroke-width="2.5"/>
  `);
}
```

Expected: berserker reads as heavier and more aggressive than the grunt.

- [ ] **Step 6: Add `shamanSvg()`**

Add:

```js
function shamanSvg() {
  return svgWrap(`
    <ellipse cx="64" cy="119" rx="34" ry="8" fill="#000" opacity=".4"/>
    <path d="M38 113 C42 78 40 55 55 43 C61 38 70 38 76 43 C91 55 87 79 92 113 Z" fill="#201326" stroke="#09050c" stroke-width="4"/>
    <path d="M43 66 C31 75 26 89 25 108 L40 111 L49 79 Z" fill="#2b1830" stroke="#09050c" stroke-width="3"/>
    <path d="M84 65 C96 73 102 90 103 109 L88 112 L79 79 Z" fill="#2b1830" stroke="#09050c" stroke-width="3"/>
    <path d="M47 42 C52 22 78 22 83 42 C73 35 57 35 47 42Z" fill="#332318" stroke="#0d0705" stroke-width="3"/>
    <circle cx="64" cy="45" r="16" fill="#5f3922" stroke="#120806" stroke-width="3"/>
    <circle cx="58" cy="47" r="3" fill="#c786df" filter="url(#softGlow)"/>
    <circle cx="70" cy="47" r="3" fill="#c786df" filter="url(#softGlow)"/>
    <path d="M54 62 C60 65 68 65 74 62" fill="none" stroke="#15070a" stroke-width="3" stroke-linecap="round"/>
    <path d="M52 75 L64 91 L76 75" fill="none" stroke="#b17ac7" stroke-width="2" opacity=".78" filter="url(#softGlow)"/>
    <path d="M92 111 L99 46" stroke="#4a2a17" stroke-width="5" stroke-linecap="round"/>
    <path d="M99 44 L91 30 L107 31 Z" fill="#c8b88d" stroke="#15100b" stroke-width="2.5"/>
    <circle cx="99" cy="38" r="7" fill="#6f3c82" stroke="#d6a1e8" stroke-width="2" filter="url(#softGlow)"/>
    <path d="M46 83 C57 89 71 89 82 83" fill="none" stroke="#6d4b39" stroke-width="2.5"/>
    <circle cx="49" cy="86" r="3" fill="#c8b88d"/><circle cx="64" cy="89" r="3" fill="#c8b88d"/><circle cx="79" cy="86" r="3" fill="#c8b88d"/>
  `);
}
```

Expected: shaman reads as a robed caster with bone/staff identity, not a purple blob.

- [ ] **Step 7: Add `bossSvg()`**

Add:

```js
function bossSvg() {
  return svgWrap(`
    <ellipse cx="64" cy="119" rx="52" ry="10" fill="#000" opacity=".48"/>
    <path d="M21 113 L30 59 C35 28 94 28 100 59 L108 113 Z" fill="#2b211b" stroke="#090605" stroke-width="5"/>
    <path d="M31 60 L14 78 L13 107 L34 113 L47 77 Z" fill="#3b281d" stroke="#090605" stroke-width="4"/>
    <path d="M97 60 L114 78 L115 107 L94 113 L81 77 Z" fill="#3b281d" stroke="#090605" stroke-width="4"/>
    <circle cx="64" cy="37" r="24" fill="#70411f" stroke="#100705" stroke-width="4"/>
    <path d="M38 30 C43 7 85 7 90 30 C78 22 50 22 38 30Z" fill="#1f1d1a" stroke="#0a0807" stroke-width="4"/>
    <path d="M41 25 L30 8 L51 20 M87 25 L98 8 L77 20" fill="#b59a68" stroke="#15100b" stroke-width="4" stroke-linejoin="round"/>
    <path d="M42 19 L49 3 L57 18 L64 0 L72 18 L80 3 L86 19" fill="url(#iron)" stroke="#111416" stroke-width="3.2" stroke-linejoin="round"/>
    <circle cx="55" cy="40" r="4" fill="#ff5b24" filter="url(#emberGlow)"/>
    <circle cx="73" cy="40" r="4" fill="#ff5b24" filter="url(#emberGlow)"/>
    <path d="M54 58 C61 66 70 66 78 58" fill="none" stroke="#160605" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M39 70 L64 92 L89 70 L96 113 L32 113 Z" fill="#151515" opacity=".74"/>
    <path d="M43 72 L29 90 L36 104 L51 84 Z M85 72 L99 90 L92 104 L77 84 Z" fill="url(#iron)" stroke="#111416" stroke-width="3"/>
    <path d="M94 88 L115 62" stroke="#4a2a17" stroke-width="8" stroke-linecap="round"/>
    <path d="M109 55 L124 44 L121 72 L104 70 Z" fill="#8a3425" stroke="#140706" stroke-width="3"/>
    <path d="M28 88 L14 72 L10 99 Z" fill="url(#iron)" stroke="#111416" stroke-width="3"/>
    <path d="M48 79 C56 86 72 86 81 79" fill="none" stroke="#b47a2d" stroke-width="3"/>
  `);
}
```

Expected: boss has unique mass, headgear, and weapon silhouette.

- [ ] **Step 8: Run sprite smoke test in browser**

Start the local server:

```powershell
python -m http.server 5173
```

Open `http://localhost:5173`, start a level, and confirm all standard monsters show illustrated silhouettes. Use the browser console:

```js
window.gameState.screen = 'combat'
window.gameState.monsters.map(m => m.defId)
```

Expected: the map includes standard monster ids, and visible sprites are not flat recolors.

- [ ] **Step 9: Commit**

```bash
git add assets/sprites.js
git commit -m "feat: redraw monsters as modern SVG enemies"
```

## Task 3: Combat Sprite Animation And State Polish

**Files:**
- Modify: `assets/visualPatch.js`

- [ ] **Step 1: Add monster animation profile data**

Replace the current `monsterCfg` object in `assets/visualPatch.js` with:

```js
const monsterCfg = {
  grunt: { key: 'monster_grunt', glow: '#df6a26', scale: 1.74, sway: .025, bob: 2.0 },
  archer: { key: 'monster_archer', glow: '#7fb7c7', scale: 1.68, sway: .032, bob: 2.4 },
  berserker: { key: 'monster_berserker', glow: '#b83a2c', scale: 1.86, sway: .038, bob: 1.5 },
  shaman: { key: 'monster_shaman', glow: '#b27ac9', scale: 1.76, sway: .02, bob: 2.8 },
  boss: { key: 'monster_boss', glow: '#df6a26', scale: 2.05, sway: .014, bob: 1.1 }
};
```

Expected: sprite behavior is configured per monster type.

- [ ] **Step 2: Replace `getMonsterSpriteScale(monster)`**

Replace it with:

```js
function getMonsterSpriteScale(monster) {
  return (monsterCfg[monster.defId] || monsterCfg.grunt).scale;
}
```

Expected: each monster uses its configured scale.

- [ ] **Step 3: Replace `getMonsterBob(monster, now)`**

Replace it with:

```js
function getMonsterBob(monster, now) {
  const frozen = monster.statusEffects?.some(e => e.type === 'frozen');
  if (frozen) return 0;
  const cfg = monsterCfg[monster.defId] || monsterCfg.grunt;
  return Math.sin(now * .004 + monster.x * .03) * cfg.bob;
}
```

Expected: frozen monsters stop bobbing; others feel more animated.

- [ ] **Step 4: Update `drawMonsterSprites(now)`**

Inside `drawMonsterSprites`, replace the local key/glow/rotation setup with:

```js
const cfg = monsterCfg[m.defId] || monsterCfg.grunt;
const scale = getMonsterSpriteScale(m);
const chilled = m.statusEffects?.some(e => e.type === 'chilled');
const frozen = m.statusEffects?.some(e => e.type === 'frozen');
const glow = frozen ? '#8be7ff' : chilled ? '#7fb7c7' : cfg.glow;
const bob = getMonsterBob(m, now);
const rotation = frozen ? 0 : Math.sin(now * .002 + m.x * .02) * cfg.sway;
drawSvgSprite(ctx, cfg.key, m.x, m.y, m.w * scale, m.h * scale, {
  bob,
  rotation,
  shadowColor: glow,
  shadowBlur: frozen ? 20 : chilled ? 16 : 12,
  alpha: frozen ? .86 : 1,
  fallbackColor: glow
});
if (chilled || frozen) drawMonsterStatusOverlay(m, now, scale, frozen);
```

Expected: monster animation and state treatment are type-aware.

- [ ] **Step 5: Add `drawMonsterStatusOverlay`**

Add this helper near the HP bar helpers:

```js
function drawMonsterStatusOverlay(monster, now, scale, frozen) {
  const spriteW = monster.w * scale;
  const spriteH = monster.h * scale;
  const bob = getMonsterBob(monster, now);
  ctx.save();
  ctx.globalAlpha = frozen ? .46 : .26;
  ctx.strokeStyle = frozen ? '#bff3ff' : '#8bd6ec';
  ctx.fillStyle = frozen ? 'rgba(170,238,255,.13)' : 'rgba(120,205,230,.08)';
  ctx.lineWidth = frozen ? 2 : 1.3;
  ctx.shadowColor = '#8be7ff';
  ctx.shadowBlur = frozen ? 14 : 8;
  ctx.beginPath();
  ctx.ellipse(monster.x, monster.y + bob, spriteW * .32, spriteH * .42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = now * .001 + i * Math.PI / 2;
    const x = monster.x + Math.cos(a) * spriteW * .22;
    const y = monster.y + bob - spriteH * .2 + Math.sin(a) * spriteH * .12;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  }
  ctx.restore();
}
```

Expected: chilled/frozen states are visible through icy overlays rather than only symbols.

- [ ] **Step 6: Restyle monster HP bars**

In `drawMonsterHpBar`, keep the layout math but use these colors:

```js
const fill = hpPct > .55 ? '#5fb15b' : hpPct > .25 ? '#d69a35' : '#b83a2c';
ctx.fillStyle = 'rgba(8,6,4,.92)';
ctx.strokeStyle = isBoss ? 'rgba(226,173,84,.92)' : 'rgba(95,82,63,.82)';
```

Expected: monster HP bars fit the war-camp palette and remain readable.

- [ ] **Step 7: Combat smoke test**

Open a combat level and inspect:

- Standard enemies have different silhouettes.
- Frozen/chilled overlays appear.
- Boss HP treatment is stronger.
- Hero sprites remain unchanged and readable.

Expected: no console errors from missing helper names.

- [ ] **Step 8: Commit**

```bash
git add assets/visualPatch.js
git commit -m "style: polish combat sprite animation states"
```

## Task 4: Combat HUD, Hero Bench, And Barricade Redesign

**Files:**
- Modify: `src/ui.js`

- [ ] **Step 1: Add shared material helpers**

Add these helpers before `drawHUD`:

```js
function drawWarPanel(ctx, x, y, w, h, r = 8, accent = WAR_UI.bronze) {
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, WAR_UI.panel2);
    bg.addColorStop(1, WAR_UI.panel);
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, Math.max(2, r - 2));
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.3;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
}

function drawIronDivider(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = 'rgba(111,119,128,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawSmallLabel(ctx, text, x, y, align = 'left') {
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `bold 10px 'Cinzel', serif`;
    ctx.fillStyle = WAR_UI.muted;
    ctx.fillText(text, x, y);
}
```

Expected: HUD components share panel, divider, and label styling.

- [ ] **Step 2: Restyle `drawHUD`**

Rewrite `drawHUD` to:

- Draw one full-width top war panel.
- Show wave on left.
- Show party level/XP centered.
- Show gold right of center.
- Keep run stats in a smaller ledger panel on the right.

Use existing calculations for wave, XP, and gold. Preserve `drawRunStatPanel(ctx, W, H, state, barH)` call after top HUD.

Expected: top HUD is cleaner and less arcade-gold.

- [ ] **Step 3: Restyle `drawRunStatPanel`**

Replace the panel background in `drawRunStatPanel` with:

```js
drawWarPanel(ctx, panelX, panelY, panelW, panelH, 8, 'rgba(180,122,45,0.75)');
```

Then set:

```js
ctx.fillStyle = WAR_UI.bronzeBright;
ctx.font = `bold 11px 'Cinzel', serif`;
```

for the title, and use `WAR_UI.muted` / `WAR_UI.text` for labels and values.

Expected: run stats feel like a compact war ledger.

- [ ] **Step 4: Restyle `drawHeroPanel` as defender bench**

Keep the existing hero placement math. Change the panel background gradient to charred timber:

```js
const pg = ctx.createLinearGradient(0, panelY, 0, H);
pg.addColorStop(0, '#21150d');
pg.addColorStop(.45, '#130d09');
pg.addColorStop(1, '#080605');
ctx.fillStyle = pg;
ctx.fillRect(0, panelY, W, panelH);
```

Use `drawWarPanel` for each hero label/HP area under the SVG hero, with hero accent colors preserved.

Expected: bottom area reads as a defender bench, not a flat black strip.

- [ ] **Step 5: Restyle barricade materials**

In `drawBarricade`, change plank gradients to darker charred wood:

```js
woodG.addColorStop(0, state.barricade.dead ? '#170b05' : '#5b351c');
woodG.addColorStop(0.45, state.barricade.dead ? '#0d0704' : '#3a2414');
woodG.addColorStop(1, state.barricade.dead ? '#080503' : '#1d120b');
```

Use `WAR_UI.iron` for bolts and `WAR_UI.bronze` for the cap accent.

Expected: barricade better matches the war-camp material language.

- [ ] **Step 6: Manual combat verification**

Open `http://localhost:5173`, start a level, and verify:

- Top HUD is readable at desktop width.
- Run ledger does not overlap quit/auto controls.
- Bottom hero labels and HP bars fit.
- Barricade HP and planks remain readable.

Expected: no click behavior changed.

- [ ] **Step 7: Commit**

```bash
git add src/ui.js
git commit -m "style: redesign combat HUD and barricade"
```

## Task 5: Shared Screen Components And Main Menu Redesign

**Files:**
- Modify: `src/screens.js`

- [ ] **Step 1: Replace `drawRuneButton` visual treatment**

Keep the function signature unchanged. Replace its body with a war-camp button implementation that:

- Measures hover from the existing `mouse`.
- Uses timber/iron gradients.
- Uses bronze bright border for primary.
- Uses muted iron border for disabled.
- Keeps text centered.

Expected: all buttons improve without click-zone changes.

- [ ] **Step 2: Replace `drawPanel` visual treatment**

Keep the function signature unchanged. Replace the body with:

```js
function drawPanel(ctx, x, y, w, h, accentColor) {
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, WAR.panel2);
    bg.addColorStop(.5, WAR.panel);
    bg.addColorStop(1, '#0b0806');
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 6);
    ctx.stroke();

    ctx.strokeStyle = accentColor || WAR.bronze;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    ctx.fillRect(x + 10, y + 8, Math.max(0, w - 20), 1);
}
```

Expected: all modals share one cohesive panel frame.

- [ ] **Step 3: Replace `drawModalBg` visual treatment**

Keep the signature. Use a darker smoke overlay:

```js
function drawModalBg(ctx, W, H, accentColor) {
    ctx.fillStyle = 'rgba(0,0,0,0.74)';
    ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .72);
    vg.addColorStop(0, `rgba(${hexToRgb(accentColor || WAR.bronze)},0.08)`);
    vg.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
}
```

Expected: overlays feel cinematic but remain readable.

- [ ] **Step 4: Redesign title screen composition**

In `drawTitleScreen`, keep the existing click button coordinates from `handleClick`:

```js
const btnW = 240, btnH = 52;
const btnX = W / 2 - btnW / 2;
const btnY = H * 0.60;
```

Draw a wider war-table panel behind the buttons:

```js
drawPanel(ctx, W / 2 - 180, H * 0.56, 360, 300, WAR.bronze);
```

Keep the four labels:

- `ENTER BATTLE`
- `HERO UPGRADES`
- `GEAR`
- `SHOP`

Remove emoji prefixes from the visible labels.

Expected: title screen feels like a command menu, and existing click zones remain valid.

- [ ] **Step 5: Replace version/footer styling**

Change the version text to:

```js
ctx.fillStyle = 'rgba(158,140,112,0.7)';
ctx.font = `11px 'Cinzel', serif`;
ctx.textAlign = 'left';
ctx.fillText('VIKINGFALL', 16, H - 16);
```

Expected: footer no longer feels like debug/prototype copy.

- [ ] **Step 6: Verify title menu clicks**

Open the game and click:

- Enter Battle
- Hero Upgrades
- Gear
- Shop
- Achievements
- Auto Skills

Expected: every existing menu action still works.

- [ ] **Step 7: Commit**

```bash
git add src/screens.js
git commit -m "style: redesign shared screen chrome and title menu"
```

## Task 6: Level Select, Modal Screens, And Skill Choice Redesign

**Files:**
- Modify: `src/screens.js`

- [ ] **Step 1: Restyle `drawLevelCard`**

Keep `drawLevelCard(ctx, x, y, w, h, lvl, locked, hovered, t)` signature unchanged. Update visuals to:

- Use `drawPanel`-style card frame.
- Replace large emoji icon emphasis with small canvas marks.
- Keep `lvl.name`, `lvl.sub`, and `lvl.desc`.
- Use muted locked state.
- Use stronger border and slight scale/glow for hover.

Expected: level select reads like a carved campaign board.

- [ ] **Step 2: Add small level icon helper**

Add near `drawLevelCard`:

```js
function drawLevelMark(ctx, x, y, r, color, locked) {
    ctx.save();
    ctx.strokeStyle = locked ? '#444' : color;
    ctx.fillStyle = locked ? '#1a1714' : 'rgba(180,122,45,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * .82, y - r * .28);
    ctx.lineTo(x + r * .52, y + r * .82);
    ctx.lineTo(x - r * .52, y + r * .82);
    ctx.lineTo(x - r * .82, y - r * .28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * .42, y + r * .05);
    ctx.lineTo(x + r * .42, y + r * .05);
    ctx.moveTo(x, y - r * .42);
    ctx.lineTo(x, y + r * .5);
    ctx.stroke();
    ctx.restore();
}
```

Expected: level cards no longer rely on emoji as the primary visual.

- [ ] **Step 3: Restyle hero upgrade cards**

In `drawHeroUpgradeOverlay`, keep hero upgrade button coordinates unchanged. Replace emoji portrait drawing with simple hero sigil cards:

- Astrid: bow mark.
- Hilda: frost rune mark.
- Bjorn: axe/lightning mark.

Use the same hero colors already in the function.

Expected: hero upgrades feel like roster cards instead of emoji panels.

- [ ] **Step 4: Restyle shop, gear, and achievements overlays**

Within each overlay:

- Use the new `drawPanel`.
- Use `WAR.text`, `WAR.muted`, `WAR.bronzeBright`.
- Keep all existing click target math.
- Keep reward/item text unchanged except emoji-only heading decoration may be removed.

Expected: all overlays share visual language and existing behavior.

- [ ] **Step 5: Restyle skill choice popup**

In `drawSkillChoicePopup`:

- Remove emoji icon display as the main visual.
- Use an etched mark per hero.
- Keep skill name, type, description, and selected hover copy.
- Keep `getSkillCardRects(W, H)` unchanged so clicks still work.

Expected: skill popup becomes three etched choice tablets.

- [ ] **Step 6: Verify all non-combat screens**

Open the game and verify:

- Level select card click starts a level.
- Back button returns to title.
- Hero upgrade overlay opens/closes.
- Shop overlay opens/closes.
- Gear overlay opens/closes.
- Achievements overlay opens/closes.
- Skill choices can still be selected after leveling in combat.

Expected: no screen flow regression.

- [ ] **Step 7: Commit**

```bash
git add src/screens.js
git commit -m "style: redesign menus overlays and skill choices"
```

## Task 7: Background, Effects, And Final Visual QA

**Files:**
- Modify: `src/canvas.js`
- Modify: `assets/visualPatch.js`
- Modify: `src/ui.js`
- Modify: `src/screens.js`

- [ ] **Step 1: Tune background palette**

In `src/canvas.js`, keep the aurora and mountains, but reduce grid scan visibility by lowering alpha values in `drawGrid`:

```js
ctx.strokeStyle='rgba(40,60,120,0.045)';
```

and scan gradient midpoint:

```js
sg.addColorStop(0.5,'rgba(60,120,255,0.012)');
```

Expected: background feels less sci-fi grid and more Viking night battlefield.

- [ ] **Step 2: Tune hit particles**

In `spawnHitParticles`, reduce the default color dependency by keeping color but using fewer, larger particles:

```js
for(let i=0;i<9;i++){
```

Expected: hits look chunky and readable without noisy confetti.

- [ ] **Step 3: Check old geometric monsters do not visually dominate**

In `main.js`, `drawProjectiles` happens but `drawMonster` is not called in the current draw path. Confirm with:

```powershell
rg -n "drawMonster\\(" .
```

Expected: `drawMonster` exists but is not used as the primary combat renderer. If it is called from another path, remove or gate that call so `assets/visualPatch.js` owns visible monsters.

- [ ] **Step 4: Desktop visual QA**

Start local server:

```powershell
python -m http.server 5173
```

Open `http://localhost:5173` and check at approximately `1366x768`:

- Title screen looks modern and smooth.
- Level select does not clip cards.
- Combat HUD and hero bench do not overlap.
- Monsters are smooth SVGs, distinct, and readable.
- No forced pixelated rendering remains.

Expected: no console errors and no obvious layout clipping.

- [ ] **Step 5: Narrow viewport visual QA**

Resize browser to approximately `390x844` and check:

- Title buttons fit.
- Level select cards remain clickable.
- Combat top HUD remains readable enough.
- Skill choice popup text does not overflow card bounds.

Expected: critical controls remain visible and clickable.

- [ ] **Step 6: Final status check**

Run:

```powershell
git status --short
```

Expected: only intended modified files are listed before the final commit.

- [ ] **Step 7: Commit**

```bash
git add src/canvas.js assets/visualPatch.js src/ui.js src/screens.js style.css assets/sprites.js
git commit -m "polish: complete modern Viking visual redesign"
```

## Self-Review Checklist

- Spec coverage: monster SVGs, smooth rendering, animation polish, title, level select, upgrades, shop, gear, achievements, skill choice, HUD, barricade, and verification are covered.
- Scope: no framework rewrite, no balance changes, no persistence changes.
- Placeholder scan: no task relies on TBD/TODO/fill-in instructions.
- Type consistency: all named files and functions already exist in the repo except the helper functions explicitly added in tasks.
- Verification: plan uses local static server and manual browser checks because this repo has no package scripts or automated test suite.


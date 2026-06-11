// Runtime SVG sprite factory for heroes and monsters.
// These are SVG assets encoded as data URIs and drawn on canvas.
const cache = new Map();

const C = {
  astrid: ['#ffb432', '#3f2717', '#d9a441'],
  hilda: ['#7df0ff', '#0b1b33', '#b8f6ff'],
  bjorn: ['#ffe84a', '#2b3641', '#d9e4ee'],
  grunt: ['#ff5522', '#304c36', '#d8c796'],
  archer: ['#00e5ff', '#182f35', '#d9d0b8'],
  berserker: ['#ff1744', '#5f151a', '#443124'],
  shaman: ['#d040ff', '#331348', '#e089ff'],
  boss: ['#ff7a18', '#354c5e', '#dfefff']
};

function svgWrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <filter id="g"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#fff" flood-opacity=".45"/></filter>
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

function heroSvg(id) {
  const [glow, armor, trim] = C[id] || C.astrid;
  const weapon = id === 'astrid'
    ? `<path d="M28 96 C10 66 20 36 48 21" fill="none" stroke="#8b5524" stroke-width="8" stroke-linecap="round"/><line x1="26" y1="94" x2="34" y2="35" stroke="#f6ead0" stroke-width="2"/><path d="M31 88 L72 53" stroke="${glow}" stroke-width="4" stroke-linecap="round" filter="url(#g)"/>`
    : id === 'hilda'
      ? `<path d="M102 105 L106 46" stroke="#4d2c16" stroke-width="6" stroke-linecap="round"/><path d="M106 45 L116 30 L99 34 Z" fill="#e9fcff" stroke="${glow}" stroke-width="2" filter="url(#g)"/>`
      : `<path d="M91 78 L112 88 L101 110 L79 100 Z" fill="#dfe8ef" stroke="#252b32" stroke-width="3" filter="url(#g)"/><path d="M94 87 L82 109" stroke="#4d2b15" stroke-width="6" stroke-linecap="round"/><path d="M103 42 L91 58 L105 64 L90 83" fill="none" stroke="${glow}" stroke-width="4" stroke-linecap="round" filter="url(#g)"/>`;
  return svgWrap(`<ellipse cx="64" cy="120" rx="42" ry="8" fill="#000" opacity=".45"/><path d="M31 114 L38 60 C43 43 85 43 91 60 L98 114 Z" fill="${armor}" stroke="${trim}" stroke-width="3"/><path d="M39 58 L19 79 L18 104 L34 104 L37 86 L51 70 Z M89 58 L109 79 L110 104 L94 104 L91 86 L77 70 Z" fill="#5a3319" stroke="#120806" stroke-width="3"/><path d="M48 61 L64 85 L80 61 L88 114 L40 114 Z" fill="#101827" stroke="${trim}" stroke-width="2.5"/><circle cx="64" cy="35" r="19" fill="#c88452" stroke="#1d0e07" stroke-width="2.5"/><path d="M46 31 C49 10 81 9 85 31 C74 24 59 23 46 31Z" fill="#8f431f" stroke="#2c1208" stroke-width="2.7"/><path d="M45 30 L30 15 L51 23 M83 30 L98 15 L77 23" fill="#ded7c5" stroke="#2a1d12" stroke-width="3.4" stroke-linejoin="round"/><circle cx="56" cy="36" r="3" fill="#130806"/><circle cx="72" cy="36" r="3" fill="#130806"/><path d="M55 48 C60 52 68 52 73 48" fill="none" stroke="#3c1809" stroke-width="2.6" stroke-linecap="round"/>${weapon}`);
}

function monsterSvg(id) {
  if (id === 'archer') return archerSvg();
  if (id === 'berserker') return berserkerSvg();
  if (id === 'shaman') return shamanSvg();
  if (id === 'boss') return bossSvg();
  return gruntSvg();
}

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

function svgFor(key) {
  if (key.startsWith('hero_')) return heroSvg(key.replace('hero_', ''));
  return monsterSvg(key.replace('monster_', ''));
}

function getImage(key) {
  if (!cache.has(key)) {
    const img = new Image();
    img.decoding = 'async';
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgFor(key))}`;
    cache.set(key, img);
  }
  return cache.get(key);
}

export function drawSvgSprite(ctx, key, cx, cy, w, h, opts = {}) {
  const img = getImage(key);
  ctx.save();
  ctx.translate(cx, cy + (opts.bob || 0));
  ctx.rotate(opts.rotation || 0);
  ctx.globalAlpha *= opts.alpha ?? 1;
  if (opts.shadowColor) { ctx.shadowColor = opts.shadowColor; ctx.shadowBlur = opts.shadowBlur ?? 14; }
  if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, -w / 2, -h / 2, w, h);
  else { ctx.fillStyle = opts.fallbackColor || '#d4a017'; ctx.beginPath(); ctx.arc(0, 0, Math.min(w, h) * .25, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

export function warmupSprites() {
  ['hero_astrid','hero_hilda','hero_bjorn','monster_grunt','monster_archer','monster_berserker','monster_shaman','monster_boss'].forEach(getImage);
}

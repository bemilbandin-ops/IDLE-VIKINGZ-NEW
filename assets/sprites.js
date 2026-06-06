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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><filter id="g"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#fff" flood-opacity=".45"/></filter></defs>${body}</svg>`;
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
  const [glow, body, bone] = C[id] || C.grunt;
  const boss = id === 'boss';
  return svgWrap(`<ellipse cx="64" cy="120" rx="${boss ? 50 : 36}" ry="8" fill="#000" opacity=".42"/><path d="M${boss ? 22 : 36} 113 L${boss ? 30 : 42} 58 C${boss ? 34 : 47} ${boss ? 25 : 39} ${boss ? 94 : 81} ${boss ? 25 : 39} ${boss ? 99 : 87} 58 L${boss ? 107 : 94} 113 Z" fill="${body}" stroke="#0b1117" stroke-width="4"/><circle cx="64" cy="37" r="${boss ? 25 : 20}" fill="${body}" stroke="#071016" stroke-width="4"/><path d="M44 28 L25 14 L37 45 M84 28 L103 14 L91 45" fill="${bone}" stroke="#101820" stroke-width="3"/><circle cx="56" cy="38" r="4" fill="${glow}" filter="url(#g)"/><circle cx="72" cy="38" r="4" fill="${glow}" filter="url(#g)"/><path d="M54 56 C61 63 69 63 76 56" fill="none" stroke="#08080a" stroke-width="4" stroke-linecap="round"/><path d="M38 69 L17 88 L24 110 L40 101 L49 78 Z M90 69 L111 88 L104 110 L88 101 L79 78 Z" fill="${body}" stroke="#0b1117" stroke-width="3"/>`);
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

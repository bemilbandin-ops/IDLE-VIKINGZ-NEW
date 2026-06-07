import { state } from '../src/gameState.js';
import { drawSvgSprite, warmupSprites } from './sprites.js';

warmupSprites();

const overlay = document.createElement('canvas');
overlay.id = 'svgVisualOverlay';
overlay.style.position = 'fixed';
overlay.style.inset = '0';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '4';
overlay.style.background = 'transparent';
document.body.appendChild(overlay);
const ctx = overlay.getContext('2d');

const autoButton = document.createElement('button');
autoButton.id = 'autoSkillSpeedButton';
autoButton.type = 'button';
autoButton.textContent = 'AUTO PICK SKILLS + 2x GAME SPEED';
autoButton.style.position = 'fixed';
autoButton.style.left = '14px';
autoButton.style.top = '58px';
autoButton.style.zIndex = '8';
autoButton.style.padding = '8px 10px';
autoButton.style.maxWidth = '185px';
autoButton.style.font = "700 11px Cinzel, Georgia, serif";
autoButton.style.lineHeight = '1.15';
autoButton.style.letterSpacing = '.4px';
autoButton.style.color = '#fff7d4';
autoButton.style.background = 'linear-gradient(#4d3210, #1b1208)';
autoButton.style.border = '1px solid rgba(240,192,64,.85)';
autoButton.style.borderRadius = '9px';
autoButton.style.boxShadow = '0 0 12px rgba(212,160,23,.35), inset 0 0 12px rgba(0,0,0,.45)';
autoButton.style.cursor = 'pointer';
autoButton.style.userSelect = 'none';
autoButton.style.pointerEvents = 'auto';
document.body.appendChild(autoButton);

function syncAutoButton() {
  const active = !!state.autoPickSkills;
  autoButton.textContent = active ? 'AUTO PICK SKILLS + 2x GAME SPEED: ON' : 'AUTO PICK SKILLS + 2x GAME SPEED';
  autoButton.style.background = active ? 'linear-gradient(#8b6010, #3b2508)' : 'linear-gradient(#4d3210, #1b1208)';
  autoButton.style.borderColor = active ? '#ffe066' : 'rgba(240,192,64,.85)';
  autoButton.style.display = state.screen === 'combat' ? 'block' : 'none';
}

autoButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  state.autoPickSkills = !state.autoPickSkills;
  state.gameSpeed = state.autoPickSkills ? 2 : 1;
  syncAutoButton();
});

function autoPickSkillIfNeeded() {
  if (!state.autoPickSkills || !state.pendingSkillChoice || !state.skillChoices?.length) return;
  const skill = state.skillChoices[0];
  if (typeof skill.effect === 'function') skill.effect(state);
  state.party.activeSkills.push(skill);
  state.pendingSkillChoice = false;
  state.skillChoices = [];
}

const heroCfg = {
  astrid: { key: 'hero_astrid', glow: '#ffb432', ultimate: 'volley', every: 6 },
  hilda:  { key: 'hero_hilda',  glow: '#7df0ff', ultimate: 'blizzard', every: 5 },
  bjorn:  { key: 'hero_bjorn',  glow: '#ffe84a', ultimate: 'storm', every: 4 }
};
const monsterCfg = {
  grunt: 'monster_grunt', archer: 'monster_archer', berserker: 'monster_berserker', shaman: 'monster_shaman', boss: 'monster_boss'
};

const seenProjectiles = new Set();
const attackAnims = new Map();
const ultAnims = new Map();
const attackCounts = new Map();

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (overlay.width !== w || overlay.height !== h) {
    overlay.width = w; overlay.height = h;
    overlay.style.width = `${window.innerWidth}px`; overlay.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function heroPanelY(H) {
  return H - Math.max(110, H * 0.16) + Math.max(110, H * 0.16) * 0.46;
}

function heroSize(W, H) {
  return Math.min(Math.max(42, W * 0.052), Math.max(58, H * 0.105));
}

function observeProjectiles(now) {
  for (const p of state.projectiles || []) {
    if (!p || !p.ownerId || seenProjectiles.has(p.id)) continue;
    seenProjectiles.add(p.id);
    const hero = state.heroes.find(h => h.id === p.ownerId);
    if (!hero) continue;
    const cfg = heroCfg[hero.id] || heroCfg.astrid;
    attackAnims.set(hero.id, { start: now, duration: hero.id === 'bjorn' ? 620 : hero.id === 'hilda' ? 520 : 430, targetX: p.x, targetY: p.y });
    const n = (attackCounts.get(hero.id) || 0) + 1;
    attackCounts.set(hero.id, n);
    const skillReady = (hero.id === 'astrid' && hero.volleyAttack && n % 5 === 0) || (hero.id === 'hilda' && hero.blizzard && n % 4 === 0) || (hero.id === 'bjorn' && hero.stormCall && n % 4 === 0);
    if (skillReady || n % cfg.every === 0) ultAnims.set(hero.id, { start: now, duration: hero.id === 'hilda' ? 1300 : 950, kind: cfg.ultimate, x: p.x, y: p.y });
  }
  if (seenProjectiles.size > 350) {
    const keep = new Set((state.projectiles || []).map(p => p.id));
    for (const id of seenProjectiles) if (!keep.has(id)) seenProjectiles.delete(id);
  }
}

function progress(anim, now) {
  if (!anim) return null;
  const p = (now - anim.start) / anim.duration;
  return p < 0 || p > 1 ? null : p;
}

function drawMonsterSprites(now) {
  for (const m of state.monsters || []) {
    if (!m || m.dead) continue;
    const key = monsterCfg[m.defId] || 'monster_grunt';
    const scale = m.defId === 'boss' ? 1.95 : m.defId === 'berserker' ? 1.78 : 1.72;
    const chilled = m.statusEffects?.some(e => e.type === 'chilled');
    const frozen = m.statusEffects?.some(e => e.type === 'frozen');
    const glow = frozen ? '#8be7ff' : chilled ? '#7ec8e3' : (m.defId === 'shaman' ? '#d040ff' : m.defId === 'archer' ? '#00e5ff' : m.defId === 'berserker' ? '#ff1744' : m.defId === 'boss' ? '#ff7a18' : '#ff5522');
    drawSvgSprite(ctx, key, m.x, m.y, m.w * scale, m.h * scale, { bob: frozen ? 0 : Math.sin(now * .004 + m.x) * 2, rotation: frozen ? 0 : Math.sin(now * .002 + m.x) * .025, shadowColor: glow, shadowBlur: frozen ? 18 : 13, alpha: frozen ? .88 : 1, fallbackColor: glow });
  }
}

function drawAttackFx(hero, cx, cy, size, p) {
  const fade = 1 - p;
  const strike = Math.sin(p * Math.PI);
  ctx.save();
  ctx.globalAlpha *= fade;
  ctx.lineCap = 'round';
  if (hero.id === 'astrid') {
    ctx.strokeStyle = 'rgba(255,202,74,.95)'; ctx.lineWidth = 2 + strike * 3; ctx.shadowColor = '#ffb432'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(cx - size * .35, cy - size * .2); ctx.quadraticCurveTo(cx, cy - size * (.75 + strike * .2), cx + size * .45, cy - size * .32); ctx.stroke();
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx + i * size * .12, cy - size * .45); ctx.lineTo(cx + i * size * .12, cy - size * (.95 + p * .55)); ctx.stroke(); }
  } else if (hero.id === 'hilda') {
    ctx.strokeStyle = 'rgba(145,238,255,.95)'; ctx.lineWidth = 2.2; ctx.shadowColor = '#7df0ff'; ctx.shadowBlur = 18;
    for (let i = 0; i < 3; i++) { const r = size * (.22 + p * .55 + i * .12); ctx.beginPath(); ctx.arc(cx, cy - size * .2, r, p * Math.PI * 2, p * Math.PI * 2 + Math.PI * 1.35); ctx.stroke(); }
  } else {
    ctx.strokeStyle = 'rgba(255,238,77,.96)'; ctx.lineWidth = 3 + strike * 4; ctx.shadowColor = '#ffe84a'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(cx, cy - size * .05, size * (.42 + strike * .25), -Math.PI * .85, Math.PI * (.55 + p * .6)); ctx.stroke();
  }
  ctx.restore();
}

function drawUltimateFx(hero, p, W, H) {
  const anim = ultAnims.get(hero.id);
  const fade = Math.sin(p * Math.PI);
  ctx.save(); ctx.globalAlpha *= fade; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (anim.kind === 'volley') {
    ctx.strokeStyle = 'rgba(255,190,45,.88)'; ctx.lineWidth = 2.4; ctx.shadowColor = '#ffb432'; ctx.shadowBlur = 20;
    for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(hero.x, heroPanelY(H) - 6); ctx.lineTo((anim.x || W / 2) + i * 38, Math.max(45, (anim.y || H * .35) - p * 130)); ctx.stroke(); }
  } else if (anim.kind === 'blizzard') {
    const cx = anim.x || W / 2, cy = Math.max(90, anim.y || H * .35); ctx.strokeStyle = 'rgba(156,238,255,.88)'; ctx.lineWidth = 2; ctx.shadowColor = '#7df0ff'; ctx.shadowBlur = 24;
    for (let i = 0; i < 7; i++) { const r = 34 + i * 18 + p * 18; ctx.beginPath(); ctx.arc(cx, cy, r, -p * Math.PI * 4 + i, -p * Math.PI * 4 + i + Math.PI * .8); ctx.stroke(); }
  } else {
    const x0 = anim.x || W / 2, y0 = Math.max(80, anim.y || H * .35); ctx.strokeStyle = 'rgba(255,238,77,.92)'; ctx.lineWidth = 3; ctx.shadowColor = '#ffe84a'; ctx.shadowBlur = 26;
    for (let i = -2; i <= 2; i++) { const x = x0 + i * 55; ctx.beginPath(); ctx.moveTo(x, 35 + (i & 1) * 18); ctx.lineTo(x + 18, y0 * .38); ctx.lineTo(x - 10, y0 * .68); ctx.lineTo(x + 12, y0); ctx.stroke(); }
  }
  ctx.restore();
}

function drawHeroSprites(now, W, H) {
  const y = heroPanelY(H), size = heroSize(W, H);
  for (const hero of state.heroes || []) {
    const cfg = heroCfg[hero.id] || heroCfg.astrid;
    const a = progress(attackAnims.get(hero.id), now);
    const u = progress(ultAnims.get(hero.id), now);
    if (a == null) attackAnims.delete(hero.id);
    if (u == null) ultAnims.delete(hero.id);
    const wave = a == null ? 0 : Math.sin(a * Math.PI);
    const dx = hero.id === 'astrid' ? -wave * size * .08 : hero.id === 'bjorn' ? wave * size * .08 : 0;
    const dy = hero.id === 'hilda' ? -wave * size * .08 : -wave * size * .035;
    if (a != null) drawAttackFx(hero, hero.x, y, size, a);
    if (u != null) drawUltimateFx(hero, u, W, H);
    drawSvgSprite(ctx, cfg.key, hero.x + dx, y + dy, size * 1.95, size * 1.95, { rotation: (hero.dead ? -.08 : Math.sin(now * .0018 + hero.x) * .015 + (hero.id === 'bjorn' ? wave * .08 : hero.id === 'astrid' ? -wave * .05 : 0)), bob: hero.dead ? 0 : Math.sin(now * .003 + hero.x) * 1.8, shadowColor: hero.dead ? '#333' : cfg.glow, shadowBlur: hero.dead ? 0 : 12 + wave * 14 + (u != null ? 16 : 0), alpha: hero.dead ? .35 : 1, fallbackColor: cfg.glow });
  }
}

function frame(now) {
  resize();
  syncAutoButton();
  autoPickSkillIfNeeded();
  const W = window.innerWidth, H = window.innerHeight;
  ctx.clearRect(0, 0, W, H);
  if (state.screen === 'combat') {
    observeProjectiles(now);
    drawMonsterSprites(now);
    drawHeroSprites(now, W, H);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
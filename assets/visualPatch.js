import { state } from '../src/gameState.js';
import { drawSvgSprite, warmupSprites } from './sprites.js';
import { autoPickRandomSkill } from '../src/skills.js';
import { saveGameState } from '../src/utils.js';

warmupSprites();

const overlay = document.createElement('canvas');
overlay.id = 'svgVisualOverlay';
overlay.style.position = 'fixed';
overlay.style.inset = '0';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '1';
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
  // Main menu owns this setting. Hide the older combat-only button so players do
  // not need to press a second Auto button after starting a level.
  autoButton.style.display = 'none';
}

autoButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  state.autoPickSkills = !state.autoPickSkills;
  state.gameSpeed = state.autoPickSkills ? 2 : 1;
  saveGameState(state);
  syncAutoButton();
});

function autoPickSkillIfNeeded() {
  if (!state.autoPickSkills || !state.pendingSkillChoice || !state.skillChoices?.length) return;
  autoPickRandomSkill(state);
}

const heroCfg = {
  astrid: { key: 'hero_astrid', glow: '#ffb432', ultimate: 'volley', every: 6 },
  hilda:  { key: 'hero_hilda',  glow: '#7df0ff', ultimate: 'blizzard', every: 5 },
  bjorn:  { key: 'hero_bjorn',  glow: '#ffe84a', ultimate: 'storm', every: 4 }
};
const monsterCfg = {
  grunt: { key: 'monster_grunt', glow: '#df6a26', scale: 1.74, sway: .025, bob: 2.0 },
  archer: { key: 'monster_archer', glow: '#7fb7c7', scale: 1.68, sway: .032, bob: 2.4 },
  berserker: { key: 'monster_berserker', glow: '#b83a2c', scale: 1.86, sway: .038, bob: 1.5 },
  shaman: { key: 'monster_shaman', glow: '#b27ac9', scale: 1.76, sway: .02, bob: 2.8 },
  boss: { key: 'monster_boss', glow: '#df6a26', scale: 2.05, sway: .014, bob: 1.1 }
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
  const panelH = Math.max(110, H * 0.16);
  return H - panelH + panelH * 0.32;
}

function combatTopBorderY(H) {
  return Math.max(52, H * 0.07) + 10;
}

function heroSize(W, H) {
  return Math.min(Math.max(38, W * 0.047), Math.max(52, H * 0.092));
}

function getHeroLevel(hero) {
  const pickedSkills = (state.party?.activeSkills || []).filter(skill => (skill.id || '').startsWith(`${hero.id}_`)).length;
  return 1 + pickedSkills;
}

function drawPanelMaskForOldHeroText(hero, H) {
  const panelH = Math.max(110, H * 0.16);
  const oldY = H - panelH + panelH * 0.46;
  ctx.save();
  ctx.fillStyle = '#060504';
  ctx.fillRect(hero.x - 58, oldY + panelH * 0.17, 116, panelH * 0.47);
  ctx.restore();
}

function drawHeroLevelLabel(hero, x, y, size) {
  const cfg = heroCfg[hero.id] || heroCfg.astrid;
  const label = `LV ${getHeroLevel(hero)}`;
  ctx.save();
  ctx.font = "bold 13px Cinzel, Georgia, serif";
  const w = Math.max(62, ctx.measureText(label).width + 28);
  const h = 23;
  const ly = y + size * 1.02;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,.78)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, ly - h / 2, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = hero.dead ? 'rgba(90,90,90,.7)' : cfg.glow;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = hero.dead ? '#777' : '#fff3b0';
  ctx.shadowColor = hero.dead ? '#000' : cfg.glow;
  ctx.shadowBlur = hero.dead ? 0 : 8;
  ctx.fillText(label, x, ly + 0.5);
  ctx.restore();
}

function drawCombatBorders(W, H) {
  const topY = combatTopBorderY(H);
  const panelH = Math.max(110, H * 0.16);
  const bottomY = H - panelH;
  ctx.save();
  ctx.lineCap = 'square';
  ctx.shadowColor = '#d4a017';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(240,192,64,.92)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, topY);
  ctx.lineTo(W - 8, topY);
  ctx.moveTo(8, topY);
  ctx.lineTo(8, H - 8);
  ctx.moveTo(W - 8, topY);
  ctx.lineTo(W - 8, H - 8);
  ctx.moveTo(8, bottomY);
  ctx.lineTo(W - 8, bottomY);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,0,0,.75)';
  ctx.lineWidth = 1;
  ctx.strokeRect(13, topY + 5, W - 26, Math.max(10, bottomY - topY - 10));
  ctx.restore();
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

function getMonsterSpriteScale(monster) {
  return (monsterCfg[monster.defId] || monsterCfg.grunt).scale;
}

function getMonsterBob(monster, now) {
  const frozen = monster.statusEffects?.some(e => e.type === 'frozen');
  if (frozen) return 0;
  const cfg = monsterCfg[monster.defId] || monsterCfg.grunt;
  return Math.sin(now * .004 + monster.x * .03) * cfg.bob;
}

function drawMonsterSprites(now) {
  for (const m of state.monsters || []) {
    if (!m || m.dead) continue;
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
  }
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

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

function drawMonsterHpBar(monster, now) {
  if (!monster.maxHp || monster.maxHp <= 0) return;
  const isBoss = monster.defId === 'boss';
  const scale = getMonsterSpriteScale(monster);
  const hpPct = Math.max(0, Math.min(1, monster.hp / monster.maxHp));
  const spriteW = monster.w * scale;
  const spriteH = monster.h * scale;
  const barW = isBoss ? Math.max(86, spriteW * .86) : Math.max(44, spriteW * .72);
  const barH = isBoss ? 9 : 6;
  const x = monster.x - barW / 2;
  const y = monster.y + getMonsterBob(monster, now) - spriteH / 2 - (isBoss ? 17 : 12);
  const radius = barH / 2;
  const fill = hpPct > .55 ? '#5fb15b' : hpPct > .25 ? '#d69a35' : '#b83a2c';

  ctx.save();
  ctx.globalAlpha = .96;
  ctx.fillStyle = 'rgba(8,6,4,.92)';
  drawRoundedRect(x - 1, y - 1, barW + 2, barH + 2, radius + 1);
  ctx.fill();
  ctx.strokeStyle = isBoss ? 'rgba(226,173,84,.92)' : 'rgba(95,82,63,.82)';
  ctx.lineWidth = isBoss ? 1.4 : 1;
  ctx.stroke();

  ctx.fillStyle = '#140905';
  drawRoundedRect(x, y, barW, barH, radius);
  ctx.fill();

  if (hpPct > 0) {
    const fillW = Math.max(radius * 2, barW * hpPct);
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, '#fff2a8');
    grad.addColorStop(.18, fill);
    grad.addColorStop(1, fill);
    ctx.fillStyle = grad;
    ctx.shadowColor = fill;
    ctx.shadowBlur = isBoss ? 9 : 5;
    drawRoundedRect(x, y, Math.min(barW, fillW), barH, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (isBoss) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 9px Cinzel, Georgia, serif';
    ctx.fillStyle = '#ffd76a';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText('BOSS', monster.x, y - 3);
  }
  ctx.restore();
}

function drawMonsterHpBars(now) {
  for (const m of state.monsters || []) {
    if (!m || m.dead) continue;
    drawMonsterHpBar(m, now);
  }
}

function drawFloatingTexts() {
  const texts = state.floatingTexts || [];
  if (!texts.length) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#000';

  for (const entry of texts) {
    if (!entry || entry.alpha <= 0) continue;
    const fontSize = entry.fontSize || 15;
    ctx.font = `bold ${fontSize}px Cinzel, Georgia, serif`;
    ctx.shadowBlur = entry.shadowBlur ?? 5;
    ctx.globalAlpha = Math.max(0, Math.min(1, entry.alpha));
    ctx.strokeStyle = 'rgba(0,0,0,.85)';
    ctx.fillStyle = entry.color || '#fff8e0';
    ctx.strokeText(entry.text, entry.x, entry.y);
    ctx.fillText(entry.text, entry.x, entry.y);
  }

  ctx.restore();
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


function drawCombatEffects(now, W, H) {
  for (const e of state.combatEffects || []) {
    const p = Math.max(0, Math.min(1, (e.age || 0) / (e.duration || 1)));
    const fade = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (e.type === 'volley') {
      ctx.strokeStyle = 'rgba(255,190,45,.9)'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffb432'; ctx.shadowBlur = 22;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo((e.x || W/2) + i * 28, Math.max(40, (e.y || H*.35) - 120)); ctx.lineTo((e.x || W/2) + i * 8, e.y || H*.35); ctx.stroke(); }
    } else if (e.type === 'blizzard' || e.type === 'frost_burst') {
      const r0 = e.radius || 70; ctx.strokeStyle = 'rgba(156,238,255,.92)'; ctx.lineWidth = 2; ctx.shadowColor = '#7df0ff'; ctx.shadowBlur = 26;
      for (let i = 0; i < 5; i++) { const r = r0 * (.35 + p) + i * 10; ctx.beginPath(); ctx.arc(e.x || W/2, e.y || H*.35, r, -p * Math.PI * 5 + i, -p * Math.PI * 5 + i + Math.PI * 1.1); ctx.stroke(); }
    } else if (e.type === 'lightning_chain') {
      ctx.strokeStyle = 'rgba(255,238,77,.96)'; ctx.lineWidth = 3; ctx.shadowColor = '#ffe84a'; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo((e.x1 + e.x2) / 2 + Math.sin(now * .03) * 18, (e.y1 + e.y2) / 2); ctx.lineTo(e.x2, e.y2); ctx.stroke();
    } else if (e.type === 'lightning_strike') {
      ctx.strokeStyle = 'rgba(255,238,77,.96)'; ctx.lineWidth = 3.5; ctx.shadowColor = '#ffe84a'; ctx.shadowBlur = 28;
      ctx.beginPath(); ctx.moveTo(e.x, 35); ctx.lineTo(e.x + 18, e.y * .45); ctx.lineTo(e.x - 12, e.y * .72); ctx.lineTo(e.x + 8, e.y); ctx.stroke();
    } else if (e.type === 'shockwave') {
      ctx.strokeStyle = 'rgba(255,238,77,.9)'; ctx.lineWidth = 3; ctx.shadowColor = '#ffe84a'; ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.arc(e.x, e.y, (e.radius || 55) * p, 0, Math.PI * 2); ctx.stroke();
    } else if (e.type === 'shatter') {
      ctx.strokeStyle = 'rgba(180,240,255,.95)'; ctx.lineWidth = 2; ctx.shadowColor = '#9eefff'; ctx.shadowBlur = 24;
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a) * 65 * p, e.y + Math.sin(a) * 65 * p); ctx.stroke(); }
    }
    ctx.restore();
  }
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
    drawPanelMaskForOldHeroText(hero, H);
    if (a != null) drawAttackFx(hero, hero.x, y, size, a);
    if (u != null) drawUltimateFx(hero, u, W, H);
    drawSvgSprite(ctx, cfg.key, hero.x + dx, y + dy, size * 1.95, size * 1.95, { rotation: (hero.dead ? -.08 : Math.sin(now * .0018 + hero.x) * .015 + (hero.id === 'bjorn' ? wave * .08 : hero.id === 'astrid' ? -wave * .05 : 0)), bob: hero.dead ? 0 : Math.sin(now * .003 + hero.x) * 1.8, shadowColor: hero.dead ? '#333' : cfg.glow, shadowBlur: hero.dead ? 0 : 12 + wave * 14 + (u != null ? 16 : 0), alpha: hero.dead ? .35 : 1, fallbackColor: cfg.glow });
    drawHeroLevelLabel(hero, hero.x + dx, y + dy, size);
  }
}

function frame(now) {
  resize();
  syncAutoButton();
  autoPickSkillIfNeeded();
  const W = window.innerWidth, H = window.innerHeight;
  ctx.clearRect(0, 0, W, H);
  if (state.screen === 'combat') {
    if (state.pendingSkillChoice && !state.autoPickSkills) {
      requestAnimationFrame(frame);
      return;
    }
    observeProjectiles(now);
    drawMonsterSprites(now);
    drawMonsterHpBars(now);
    drawHeroSprites(now, W, H);
    drawCombatEffects(now, W, H);
    drawFloatingTexts();
    drawCombatBorders(W, H);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

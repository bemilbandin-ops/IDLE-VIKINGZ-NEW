import { drawHealthBar, spawnTorchParticle } from './canvas.js';
import { formatGold, roundRect } from './utils.js';

// Torch positions relative to barricade — filled in drawBarricade, used by HUD tick
let _torchPositions = [];
let _torchTimer = 0;

// Returns the Y coordinate of the top of the hero panel — the visual "front line" of heroes.
// Projectiles should spawn here, not at hero.y (which is a game-logic coord with no sprite).
export function getHeroPanelY(H) {
    const panelH = Math.max(110, H * 0.16);
    const panelY = H - panelH;
    // Return the center Y of the hero shapes, which sit at 46% down the panel
    return panelY + panelH * 0.46;
}

export function tickTorches(dt) {
    _torchTimer += dt;
    if (_torchTimer > 0.04) {
        _torchTimer = 0;
        _torchPositions.forEach(pos => {
            if (Math.random() < 0.6) spawnTorchParticle(pos.x, pos.y);
        });
    }
}

// ── HUD ────────────────────────────────────────────────────────────────────
export function drawHUD(ctx, W, H, state) {
    const barH = Math.max(52, H * 0.07);

    // Engraved stone background
    const hudGrad = ctx.createLinearGradient(0, 0, 0, barH);
    hudGrad.addColorStop(0, '#1c1510');
    hudGrad.addColorStop(0.5, '#141008');
    hudGrad.addColorStop(1, '#0c0a06');
    ctx.fillStyle = hudGrad;
    ctx.fillRect(0, 0, W, barH);

    // Bottom border with gold accent
    ctx.strokeStyle = '#6a4a10';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, barH); ctx.lineTo(W, barH); ctx.stroke();
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, barH - 2); ctx.lineTo(W, barH - 2); ctx.stroke();

    // Rune dividers
    ctx.strokeStyle = 'rgba(212,160,23,0.25)';
    ctx.lineWidth = 1;
    [W * 0.33, W * 0.66].forEach(x => {
        ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, barH - 8); ctx.stroke();
    });

    // ─ Left: Wave info
    const displayWave = Math.min(state.currentWave + 1, 20);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(212,160,23,0.5)';
    ctx.font = `10px 'Cinzel', serif`;
    ctx.fillText('WAVE', W * 0.03, barH * 0.32);

    ctx.fillStyle = '#f0c040';
    ctx.font = `bold ${Math.round(barH * 0.38)}px 'Cinzel', serif`;
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 8;
    ctx.fillText(`${displayWave}`, W * 0.03, barH * 0.68);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(200,180,120,0.6)';
    ctx.font = `12px 'Crimson Text', serif`;
    ctx.fillText(`/ 20`, W * 0.03 + barH * 0.3, barH * 0.68);

    // Wave progress bar (thin, under wave text)
    const wPct = displayWave / 20;
    const wBarX = W * 0.03, wBarY = barH - 7, wBarW = W * 0.28, wBarH = 3;
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(wBarX, wBarY, wBarW, wBarH);
    const wGrad = ctx.createLinearGradient(wBarX, 0, wBarX + wBarW, 0);
    wGrad.addColorStop(0, '#8b5a10');
    wGrad.addColorStop(1, '#f0c040');
    ctx.fillStyle = wGrad;
    ctx.fillRect(wBarX, wBarY, wBarW * wPct, wBarH);

    // ─ Center: Party level + XP
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(212,160,23,0.5)';
    ctx.font = `10px 'Cinzel', serif`;
    ctx.fillText('PARTY LEVEL', W / 2, barH * 0.25);

    ctx.fillStyle = '#f0c040';
    ctx.font = `bold ${Math.round(barH * 0.42)}px 'Cinzel', serif`;
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 10;
    ctx.fillText(`${state.party.level}`, W / 2, barH * 0.62);
    ctx.shadowBlur = 0;

    // XP bar
    const xpNeeded = Math.floor(50 * state.party.level * 1.2);
    const xpPct = Math.min(1, state.party.exp / xpNeeded);
    const xBarX = W / 2 - W * 0.1, xBarY = barH - 7, xBarW = W * 0.2;
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(xBarX, xBarY, xBarW, 3);
    ctx.fillStyle = '#7ec8e3';
    ctx.fillRect(xBarX, xBarY, xBarW * xpPct, 3);

    // ─ Right: Gold, kept left of the Quit button
    const goldRight = Math.min(W * 0.76, W - 132);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(212,160,23,0.5)';
    ctx.font = `10px 'Cinzel', serif`;
    ctx.fillText('GOLD', goldRight, barH * 0.25);

    // Coin icon
    const coinX = goldRight - 48;
    const coinY = barH * 0.62;
    drawCoin(ctx, coinX, coinY, 10);

    ctx.fillStyle = '#f0c040';
    ctx.font = `bold ${Math.round(barH * 0.38)}px 'Cinzel', serif`;
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 8;
    ctx.fillText(formatGold(state.gold), goldRight, barH * 0.65);
    ctx.shadowBlur = 0;
}

function drawCoin(ctx, x, y, r) {
    ctx.save();
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 6;
    const g = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 1, x, y, r);
    g.addColorStop(0, '#ffe066');
    g.addColorStop(1, '#a06800');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,100,0.5)';
    ctx.font = `bold ${r}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('₵', x, y);
    ctx.restore();
}

// ── Hero Panel ─────────────────────────────────────────────────────────────
export function drawHeroPanel(ctx, W, H, state) {
    const panelH = Math.max(110, H * 0.16);
    const panelY = H - panelH;
    const t = Date.now();

    // Panel bg
    const pg = ctx.createLinearGradient(0, panelY, 0, H);
    pg.addColorStop(0, '#0e0c08'); pg.addColorStop(1, '#060504');
    ctx.fillStyle = pg; ctx.fillRect(0, panelY, W, panelH);

    // Top border
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(W, panelY); ctx.stroke();
    ctx.strokeStyle = 'rgba(212,160,23,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, panelY + 3); ctx.lineTo(W, panelY + 3); ctx.stroke();

    const spacing = Math.min(Math.max(W * 0.26, 150), 260);
    const totalW = spacing * 2;
    const startX = W / 2 - totalW / 2;

    state.heroes.forEach((hero, i) => {
        const cx = startX + i * spacing;
        const heroY = panelY + panelH * 0.46;

        // Keep the old orb model hidden. The SVG hero model is drawn by assets/visualPatch.js.
        const HERO_CFG = { astrid:'#ffb432', hilda:'#50c8ff', bjorn:'#ff64c8' };
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        roundRect(ctx, cx - 48, heroY + panelH * 0.20, 96, 30, 9);
        ctx.fill();
        ctx.strokeStyle = hero.dead ? '#333' : `${HERO_CFG[hero.id] || '#d4a017'}88`;
        ctx.lineWidth = 1;
        roundRect(ctx, cx - 48, heroY + panelH * 0.20, 96, 30, 9);
        ctx.stroke();
        ctx.fillStyle = hero.dead ? '#555' : (HERO_CFG[hero.id] || '#d4a017');
        ctx.font = `bold 10px 'Cinzel', serif`;
        ctx.fillText((hero.name || hero.id).toUpperCase(), cx, heroY + panelH * 0.28);
        ctx.font = `bold 12px 'Cinzel', serif`;
        ctx.fillStyle = hero.dead ? '#777' : '#fff3b0';
        ctx.shadowColor = hero.dead ? '#000' : (HERO_CFG[hero.id] || '#d4a017');
        ctx.shadowBlur = hero.dead ? 0 : 6 + Math.sin(t * 0.004 + i) * 2;
        ctx.fillText(`LV ${state.party.level}`, cx, heroY + panelH * 0.42);
        ctx.shadowBlur = 0;

        // HP bar
        const hpW = 74, hpH = 5;
        const hpX = cx - hpW / 2;
        const hpY = heroY + panelH * 0.55;
        const hpPct = hero.hp / hero.maxHp;
        const hpColor = hero.dead ? '#333' : hpPct > 0.5 ? '#4caf50' : hpPct > 0.25 ? '#ff9800' : '#f44336';
        drawHealthBar(ctx, hpX, hpY, hpW, hpH, hpPct, hpColor, !hero.dead);
        ctx.restore();
    });
}

// ── Barricade ──────────────────────────────────────────────────────────────
export function drawBarricade(ctx, W, H, state) {
    const bW = W * 0.62;
    const bH = H * 0.10;
    const bX = (W - bW) / 2;
    const bY = H * 0.70;
    const pct = Math.max(0, state.barricade.hp / state.barricade.maxHp);

    // Update torch positions (for particle system)
    _torchPositions = [
        { x: bX + 12, y: bY - 18 },
        { x: bX + bW - 12, y: bY - 18 }
    ];

    // Torch glow on wall
    if (!state.barricade.dead) {
        [bX + 12, bX + bW - 12].forEach(tx => {
            const tg = ctx.createRadialGradient(tx, bY - 10, 0, tx, bY - 10, 60);
            tg.addColorStop(0, 'rgba(255,140,30,0.18)');
            tg.addColorStop(1, 'rgba(255,100,10,0)');
            ctx.fillStyle = tg;
            ctx.fillRect(tx - 60, bY - 60, 120, 80);
        });
    }

    // HP bar above barricade
    const hpBarW = bW, hpBarH = 10;
    const hpColor = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    drawHealthBar(ctx, bX, bY - 26, hpBarW, hpBarH, pct, hpColor, true);
    // HP label
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(200,180,120,0.7)';
    ctx.font = `10px 'Cinzel', serif`;
    ctx.fillText('BARRICADE', bX, bY - 40);

    // === Draw barricade structure ===
    const numPlanks = 7;
    const plankW = bW / numPlanks;

    for (let p = 0; p < numPlanks; p++) {
        const px = bX + p * plankW;
        const damage = 1 - pct;
        const sag = damage * Math.sin((p + 0.5) * 0.8) * 4;

        // Plank shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(px + 2, bY + sag + 3, plankW - 2, bH + 2);

        // Plank wood gradient
        const woodG = ctx.createLinearGradient(px, bY, px, bY + bH);
        if (state.barricade.dead) {
            woodG.addColorStop(0, '#1a0e06');
            woodG.addColorStop(1, '#0a0603');
        } else {
            woodG.addColorStop(0, `hsl(25,${50 - damage*30}%,${30 - damage*10}%)`);
            woodG.addColorStop(0.4, `hsl(25,${44 - damage*25}%,${26 - damage*8}%)`);
            woodG.addColorStop(1, `hsl(20,${36 - damage*20}%,${18 - damage*6}%)`);
        }
        ctx.fillStyle = woodG;
        ctx.fillRect(px + 1, bY + sag, plankW - 2, bH);

        // Grain lines
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
        for (let g = 1; g < 3; g++) {
            const gx = px + (plankW / 3) * g;
            ctx.beginPath(); ctx.moveTo(gx + 1, bY + sag); ctx.lineTo(gx, bY + bH + sag); ctx.stroke();
        }

        // Plank divider gap
        ctx.fillStyle = '#050302';
        ctx.fillRect(px, bY + sag, 2, bH);

        // Metal bolts
        [bY + bH * 0.25, bY + bH * 0.75].forEach(boltY => {
            ctx.fillStyle = '#7a8a90';
            ctx.beginPath(); ctx.arc(px + plankW / 2, boltY + sag, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4a5a60'; ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#aabac0';
            ctx.beginPath(); ctx.arc(px + plankW / 2 - 1, boltY + sag - 1, 1.5, 0, Math.PI * 2); ctx.fill();
        });

        // Damage cracks
        if (pct < 0.66 && !state.barricade.dead) {
            ctx.strokeStyle = `rgba(0,0,0,${damage * 0.7})`;
            ctx.lineWidth = 1.5;
            if (p % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(px + plankW * 0.3, bY + sag + bH * 0.15);
                ctx.lineTo(px + plankW * 0.6, bY + sag + bH * 0.5);
                ctx.lineTo(px + plankW * 0.4, bY + sag + bH * 0.85);
                ctx.stroke();
            }
        }
    }

    // Top cap beam
    const capG = ctx.createLinearGradient(bX, bY - 8, bX, bY + 4);
    capG.addColorStop(0, state.barricade.dead ? '#160b04' : '#6b4018');
    capG.addColorStop(1, state.barricade.dead ? '#0d0703' : '#3a2010');
    ctx.fillStyle = capG;
    ctx.fillRect(bX - 6, bY - 8, bW + 12, 12);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(bX - 6, bY - 8, bW + 12, 12);

    // Spike tops
    if (!state.barricade.dead) {
        const spikeCount = 9;
        ctx.fillStyle = '#5a3010';
        for (let s = 0; s < spikeCount; s++) {
            const sx = bX + (bW / spikeCount) * (s + 0.5);
            ctx.beginPath();
            ctx.moveTo(sx, bY - 22);
            ctx.lineTo(sx - 6, bY - 8);
            ctx.lineTo(sx + 6, bY - 8);
            ctx.closePath(); ctx.fill();
        }
    }

    // Draw torches
    if (!state.barricade.dead) {
        drawTorch(ctx, bX + 12, bY - 18);
        drawTorch(ctx, bX + bW - 12, bY - 18);
    }
}

function drawTorch(ctx, x, y) {
    // Torch handle
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(x - 3, y, 6, 22);
    // Torch head
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(x - 5, y - 8, 10, 10);
    // Flame glow
    const fg = ctx.createRadialGradient(x, y - 8, 0, x, y - 8, 20);
    fg.addColorStop(0, 'rgba(255,200,60,0.9)');
    fg.addColorStop(0.4, 'rgba(255,100,20,0.5)');
    fg.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.arc(x, y - 8, 20, 0, Math.PI * 2); ctx.fill();
    // Flame shape
    const t = Date.now() * 0.003;
    ctx.fillStyle = '#ff8800';
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 4);
    ctx.quadraticCurveTo(x - 8 + Math.sin(t) * 4, y - 18, x + Math.sin(t * 1.3) * 2, y - 24);
    ctx.quadraticCurveTo(x + 8 + Math.sin(t * 0.9) * 3, y - 18, x + 5, y - 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 4);
    ctx.quadraticCurveTo(x - 3 + Math.sin(t * 1.2) * 2, y - 15, x + Math.sin(t) * 2, y - 20);
    ctx.quadraticCurveTo(x + 3 + Math.sin(t * 0.8) * 2, y - 15, x + 3, y - 4);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
}

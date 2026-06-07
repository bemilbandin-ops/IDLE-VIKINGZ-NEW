// ── Screens — Full visual overhaul ───────────────────────────────────────────

import { roundRect, hexToRgb, saveGameState, getShopPanelDims, getHeroUpgradePanelDims, getDisplayedGold } from './utils.js';
import { applySkillChoice } from './skills.js';
import { checkAchievements, claimAchievement, getAchievementList } from './achievements.js';
<<<<<<< HEAD
=======
import { ascendHero, canAscendHero, getAscensionCost, getAscensionTier, getNextAscensionTier, getHeroDisplayName } from './ascension.js';
import { levels } from '../data/levels.js';
>>>>>>> d12e53c (hp bars, more levels etc)

const T = () => Date.now();

const HERO_UPGRADE_TYPES = [
    { key: 'atk', label: '⚔ Attack', base: 50, mul: 25, bonusLabel: 'attack' },
    { key: 'income', label: '💰 Income', base: 40, mul: 20, bonusLabel: 'income' },
    { key: 'atkSpeed', label: '⚡ Speed', base: 60, mul: 30, bonusLabel: 'attack speed' }
];
const HERO_UPGRADE_BONUS_STEP = 5;

function getUpgradeBonusText(level, bonusLabel) {
    return `+${level * HERO_UPGRADE_BONUS_STEP}% ${bonusLabel}`;
}

function getUpgradePreviewText(bonusLabel) {
    return `+${HERO_UPGRADE_BONUS_STEP}% ${bonusLabel}`;
}


// ── Title Screen ─────────────────────────────────────────────────────────────
export function drawTitleScreen(ctx, W, H, state) {
    // Already have atmospheric bg from clearScreen. Add layered title elements.
    const t = T();

    // Large rune circle behind title
    drawRuneCircle(ctx, W / 2, H * 0.38, Math.min(W, H) * 0.28, t);

    // VIKINGFALL — layered glow text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow layer
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.font = `bold ${Math.round(H * 0.09)}px 'Cinzel Decorative', serif`;
    ctx.fillText('VIKINGFALL', W / 2 + 3, H * 0.38 + 3);

    // Outer glow
    ctx.shadowColor = '#d4a017';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#7a4a08';
    ctx.fillText('VIKINGFALL', W / 2, H * 0.38);

    // Mid glow
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#c8962a';
    ctx.fillText('VIKINGFALL', W / 2, H * 0.38);

    // Top bright
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#f0d060';
    ctx.fillText('VIKINGFALL', W / 2, H * 0.38);
    ctx.shadowBlur = 0;

    // Subtitle with rune border
    const subY = H * 0.48;
    const lineW = W * 0.32;
    ctx.strokeStyle = 'rgba(212,160,23,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - lineW / 2, subY); ctx.lineTo(W / 2 - 90, subY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + 90, subY); ctx.lineTo(W / 2 + lineW / 2, subY); ctx.stroke();

    ctx.fillStyle = '#8a9ba8';
    ctx.font = `italic 18px 'Crimson Text', serif`;
    ctx.shadowColor = '#7ec8e3'; ctx.shadowBlur = 4;
    ctx.fillText('Defend the Gates of Midgard', W / 2, subY);
    ctx.shadowBlur = 0;

    // Gold display top-right
    drawGoldBadge(ctx, W - 16, 16, getDisplayedGold(state));

    // Buttons
    const btnW = 240, btnH = 52;
    const btnX = W / 2 - btnW / 2;
    const btnY = H * 0.60;

    drawRuneButton(ctx, btnX, btnY, btnW, btnH, '⚔  ENTER BATTLE', state.mouse, '#d4a017', '#f0c040', true);
    drawRuneButton(ctx, btnX, btnY + btnH + 16, btnW, btnH, '✦  HERO UPGRADES', state.mouse, '#4a8fa8', '#7ec8e3');
    drawRuneButton(ctx, btnX, btnY + (btnH + 16) * 2, btnW, btnH, '⚙  GEAR', state.mouse, '#5a3070', '#b07af0');
    drawRuneButton(ctx, btnX, btnY + (btnH + 16) * 3, btnW, btnH, '◈  SHOP', state.mouse, '#8b4513', '#c87820');

<<<<<<< HEAD
    // Auto skill toggle
    const toggle = getAutoPickToggleRect(W, H);
    drawRuneButton(ctx, toggle.x, toggle.y, toggle.w, toggle.h, `Auto Pick Skills: ${state.autoPickSkills ? 'ON' : 'OFF'}`, state.mouse, state.autoPickSkills ? '#1f6b38' : '#5a3310', state.autoPickSkills ? '#58d878' : '#d4a017', false, false);
=======
    drawAutoPickToggle(ctx, W, H, state);
>>>>>>> d12e53c (hp bars, more levels etc)

    const achievementButton = getAchievementsButtonRect(W, H);
    const achievements = getAchievementList(state);
    const readyCount = achievements.filter(a => a.ready && !a.claimed).length;
    drawRuneButton(ctx, achievementButton.x, achievementButton.y, achievementButton.w, achievementButton.h, `🏆 ACHIEVEMENTS${readyCount > 0 ? ` (${readyCount})` : ''}`, state.mouse, '#5a4210', '#f0c040', readyCount > 0, false);

    // Gear count badge
    const gearCount = (state.gearInventory || []).length;
    if (gearCount > 0) {
        ctx.fillStyle = '#b07af0'; ctx.font = `bold 12px 'Cinzel', serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${gearCount} piece${gearCount !== 1 ? 's' : ''} collected`, btnX + btnW + 10, btnY + (btnH + 16) * 2 + btnH / 2);
        ctx.textAlign = 'center';
    }

    // Version
    ctx.fillStyle = 'rgba(100,90,70,0.6)';
    ctx.font = `11px 'Crimson Text', serif`;
    ctx.textAlign = 'left';
    ctx.fillText('v1.0 — VIKINGFALL', 16, H - 16);

    // Overlays
    if (state.shopOpen) drawShopOverlay(ctx, W, H, state);
    if (state.heroUpgradeOpen) drawHeroUpgradeOverlay(ctx, W, H, state);
    if (state.gearOpen) drawGearOverlay(ctx, W, H, state);
    if (state.achievementsOpen) drawAchievementsOverlay(ctx, W, H, state);
}

// ── Level Select ──────────────────────────────────────────────────────────────
export function drawLevelSelectScreen(ctx, W, H, state) {
    const t = T();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // Title
    ctx.fillStyle = '#f0c040';
    ctx.font = `bold ${Math.round(H * 0.05)}px 'Cinzel', serif`;
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 14;
    ctx.fillText('CHOOSE YOUR BATTLE', W / 2, H * 0.12);
    ctx.shadowBlur = 0;

    // Decorative line
    const dl = W * 0.5;
    ctx.strokeStyle = 'rgba(212,160,23,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W/2 - dl/2, H * 0.17); ctx.lineTo(W/2 + dl/2, H * 0.17); ctx.stroke();

    drawAutoPickToggle(ctx, W, H, state);

    const layout = getLevelSelectLayout(W, H, levels.length);
    levels.forEach((levelData, i) => {
        const pos = getLevelCardPosition(layout, i);
        const isLocked = i > state.highestUnlockedLevel;
        const isHov = !isLocked &&
            state.mouse.x >= pos.x && state.mouse.x <= pos.x + layout.cardW &&
            state.mouse.y >= pos.y && state.mouse.y <= pos.y + layout.cardH;

        drawLevelCard(ctx, pos.x, pos.y, layout.cardW, layout.cardH, getLevelCardMeta(levelData, i), isLocked, isHov, t + i * 300);
    });

    // Back button
    drawRuneButton(ctx, 20, 20, 130, 42, '← Back', state.mouse, '#555', '#888', false, true);
}

function getLevelSelectLayout(W, H, count) {
    const cols = count <= 3 ? count : (W < 720 ? 3 : W < 980 ? 4 : 5);
    const rows = Math.ceil(count / cols);
    const gapX = Math.max(10, Math.min(18, W * 0.014));
    const gapY = Math.max(10, Math.min(16, H * 0.018));
    const maxCardW = count <= 3 ? 220 : 184;
    const topY = count <= 3 ? H * 0.24 : H * 0.22;
    const bottomPad = H * 0.055;
    const usableW = W * 0.92;
    const usableH = H - topY - bottomPad;
    const cardW = Math.min(maxCardW, (usableW - gapX * (cols - 1)) / cols);
    const cardH = Math.min(count <= 3 ? H * 0.52 : 218, (usableH - gapY * (rows - 1)) / rows);
    const totalW = cardW * cols + gapX * (cols - 1);
    const totalH = cardH * rows + gapY * (rows - 1);
    return { cols, rows, gapX, gapY, cardW, cardH, startX: W / 2 - totalW / 2, startY: topY + Math.max(0, (usableH - totalH) / 2) };
}

function getLevelCardPosition(layout, index) {
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    return {
        x: layout.startX + col * (layout.cardW + layout.gapX),
        y: layout.startY + row * (layout.cardH + layout.gapY)
    };
}

function getLevelCardMeta(levelData, index) {
    return {
        name: levelData.name || `Level ${index + 1}`,
        sub: levelData.sub || `Level ${index + 1}`,
        desc: levelData.desc || `HP x${levelData.hpMult || 1}\nGold x${levelData.goldMult || 1}`,
        icon: levelData.icon || '⚔',
        color: levelData.color || '#8b6010',
        glow: levelData.glow || '#f0c040'
    };
}

// ── Combat Overlays ───────────────────────────────────────────────────────────
export function drawCombatOverlays(ctx, W, H, state) {
    const barH = Math.max(52, H * 0.07);

    // Quit button
    const qW = 88, qH = 34;
    const qX = W - qW - 14;
    const qY = (barH - qH) / 2;
    drawRuneButton(ctx, qX, qY, qW, qH, '✕ QUIT', state.mouse, '#6a1010', '#ff4444', false, true);

    drawAutoPickToggle(ctx, W, H, state);

    // Wave cleared banner
    if (state.waveTransitioning && !state.levelComplete) {
        const alpha = Math.min(1, state.waveTransitionTimer / 1.5);
        const fadeOut = state.waveTransitionTimer < 0.4 ? state.waveTransitionTimer / 0.4 : 1;
        ctx.save();
        ctx.globalAlpha = alpha * fadeOut;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(H * 0.042)}px 'Cinzel', serif`;
        ctx.fillStyle = '#f0c040';
        ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 20;
        ctx.fillText(`— Wave ${Math.min(state.currentWave, 19) + 1} Cleared —`, W / 2, H * 0.47);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // Victory
    if (state.levelComplete) {
        drawVictoryScreen(ctx, W, H, state);
    }

    // Defeat
    if (state.levelFailed) {
        drawDefeatScreen(ctx, W, H, state);
    }

    // Skill selection popup (drawn on top of everything else)
    if (state.pendingSkillChoice && state.skillChoices && state.skillChoices.length > 0) {
        drawSkillChoicePopup(ctx, W, H, state);
    }
}

// ── Victory ───────────────────────────────────────────────────────────────────
function drawVictoryScreen(ctx, W, H, state) {
    const t = T();

    // Dim + gold shimmer overlay
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);

    // Golden shimmer beams
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.0002;
        const len = Math.min(W, H) * 0.6;
        const g = ctx.createLinearGradient(W/2, H*0.42, W/2 + Math.cos(angle)*len, H*0.42 + Math.sin(angle)*len);
        g.addColorStop(0, 'rgba(212,160,23,0.08)');
        g.addColorStop(1, 'rgba(212,160,23,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(W/2, H*0.42);
        ctx.lineTo(W/2 + Math.cos(angle-0.1)*len, H*0.42 + Math.sin(angle-0.1)*len);
        ctx.lineTo(W/2 + Math.cos(angle+0.1)*len, H*0.42 + Math.sin(angle+0.1)*len);
        ctx.closePath(); ctx.fill();
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // VICTORY
    ctx.font = `bold ${Math.round(H * 0.09)}px 'Cinzel Decorative', serif`;
    ctx.shadowColor = '#f0c040'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#d4a017';
    ctx.fillText('VICTORY!', W / 2, H * 0.35);
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#fff8c0';
    ctx.fillText('VICTORY!', W / 2, H * 0.35);
    ctx.shadowBlur = 0;

    // Stars
    for (let i = 0; i < 5; i++) {
        const sx = W/2 - 100 + i * 50;
        const pulse = 0.8 + 0.2 * Math.sin(t * 0.003 + i);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#f0c040';
        ctx.font = '28px serif';
        ctx.fillText('★', sx, H * 0.46);
        ctx.restore();
    }

    ctx.fillStyle = '#ddd';
    ctx.font = `22px 'Crimson Text', serif`;
    ctx.fillText(`Level ${state.currentLevel + 1} — All waves defeated!`, W / 2, H * 0.54);
    ctx.fillStyle = '#f0c040';
    ctx.font = `18px 'Crimson Text', serif`;
    ctx.fillText(`Gold earned: ${Math.floor(state.sessionGold)}`, W / 2, H * 0.60);

    // Shard reward display
    const shardRewards = state.pendingShardRewards || [];
    const shardHero = state.levelCompletedShardHero;
    if (shardRewards.length > 0) {
        ctx.fillStyle = '#7ec8e3';
        ctx.font = `16px 'Crimson Text', serif`;
        const rewardText = shardRewards.map(reward => {
            const label = reward.type === 'firstClear' ? 'First clear' : 'Rare drop';
            return `${label}: ${getHeroDisplayName(reward.heroId)} +${reward.amount}`;
        }).join('  •  ');
        ctx.fillText(rewardText, W / 2, H * 0.65);
    }

    // Gear rewards display
    const gearRewards = state.pendingGearRewards || [];
    if (gearRewards.length > 0) {
        const gy = H * (shardRewards.length > 0 ? 0.70 : 0.65);
        ctx.font = `bold 14px 'Cinzel', serif`;
        ctx.fillStyle = '#b07af0';
        ctx.shadowColor = '#b07af0'; ctx.shadowBlur = 8;
        ctx.fillText('⚙ Gear Found!', W / 2, gy);
        ctx.shadowBlur = 0;
        gearRewards.forEach((g, i) => {
            const rarityColors = { common: '#aaa', rare: '#7ec8e3', epic: '#d090ff' };
            ctx.fillStyle = rarityColors[g.rarity] || '#aaa';
            ctx.font = `14px 'Crimson Text', serif`;
            ctx.fillText(`${g.icon} ${g.name} — ${g.desc}`, W / 2, gy + 20 + i * 20);
        });
    }

    const extraShift = (shardRewards.length > 0 ? 8 : 0) + (gearRewards.length > 0 ? gearRewards.length * 20 + 20 : 0);
    drawRuneButton(ctx, W/2 - 110, H * 0.68 + extraShift, 220, 54, 'Continue ▶', state.mouse, '#8b6010', '#f0c040', true);
}

// ── Defeat ────────────────────────────────────────────────────────────────────
function drawDefeatScreen(ctx, W, H, state) {
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, W, H);

    // Red vignette pulse
    const vPulse = 0.12 + 0.06 * Math.sin(T() * 0.002);
    const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(100,10,10,${vPulse})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    ctx.font = `bold ${Math.round(H * 0.09)}px 'Cinzel Decorative', serif`;
    ctx.shadowColor = '#cc1111'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#5a0000';
    ctx.fillText('DEFEATED', W / 2, H * 0.34);
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff4444';
    ctx.fillText('DEFEATED', W / 2, H * 0.34);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aaa';
    ctx.font = `20px 'Crimson Text', serif`;
    ctx.fillText('The barricade has fallen...', W / 2, H * 0.44);

    // Gear rewards even on loss
    const defeatGearRewards = state.pendingGearRewards || [];
    if (defeatGearRewards.length > 0) {
        ctx.font = `bold 13px 'Cinzel', serif`;
        ctx.fillStyle = '#b07af0'; ctx.shadowColor = '#b07af0'; ctx.shadowBlur = 6;
        ctx.fillText('⚙ Gear Found Despite Defeat!', W / 2, H * 0.49);
        ctx.shadowBlur = 0;
        defeatGearRewards.forEach((g, i) => {
            const rarityColors = { common: '#aaa', rare: '#7ec8e3', epic: '#d090ff' };
            ctx.fillStyle = rarityColors[g.rarity] || '#aaa';
            ctx.font = `13px 'Crimson Text', serif`;
            ctx.fillText(`${g.icon} ${g.name}`, W / 2, H * 0.53 + i * 18);
        });
    }

    const defeatShift = defeatGearRewards.length > 0 ? 30 : 0;
    drawRuneButton(ctx, W/2-110, H*0.54 + defeatShift, 220, 52, '↺  Retry', state.mouse, '#5a0808', '#ff4444', false);
    drawRuneButton(ctx, W/2-110, H*0.64 + defeatShift, 220, 52, '⬡  Main Menu', state.mouse, '#2a2a2a', '#666', false, true);
}

// ── Shop Overlay ──────────────────────────────────────────────────────────────
function drawShopOverlay(ctx, W, H, state) {
    drawModalBg(ctx, W, H, '#d4a017');

    const { pW, pH, pX, pY } = getShopPanelDims(W, H);

    drawPanel(ctx, pX, pY, pW, pH, '#d4a017');

    // Title
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(pH * 0.07)}px 'Cinzel', serif`;
    ctx.fillStyle = '#f0c040';
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 10;
    ctx.fillText('THE SHOP', W / 2, pY + pH * 0.09);
    ctx.shadowBlur = 0;

    // Gold
    drawGoldBadge(ctx, W / 2, pY + pH * 0.16, getDisplayedGold(state), true);

    // Items
    state.shopItems.forEach((item, i) => {
        const iY = pY + pH * 0.24 + i * (pH * 0.21);
        const iX = pX + pW * 0.06, iW = pW * 0.88, iH = pH * 0.18;
        const canAfford = state.gold >= item.cost;

        // Item card
        ctx.fillStyle = canAfford ? 'rgba(212,160,23,0.08)' : 'rgba(60,50,40,0.5)';
        ctx.strokeStyle = canAfford ? 'rgba(212,160,23,0.4)' : 'rgba(80,70,60,0.4)';
        ctx.lineWidth = 1;
        roundRect(ctx, iX, iY, iW, iH, 6); ctx.fill(); ctx.stroke();

        // Icon area
        ctx.fillStyle = canAfford ? 'rgba(212,160,23,0.15)' : 'rgba(50,40,30,0.4)';
        roundRect(ctx, iX + 8, iY + 8, iH - 16, iH - 16, 4); ctx.fill();
        ctx.font = `${Math.round(iH * 0.44)}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(['⚔', '🛡', '💨'][i], iX + 8 + (iH - 16) / 2, iY + iH / 2);

        // Text
        ctx.textAlign = 'left';
        ctx.font = `bold 16px 'Cinzel', serif`;
        ctx.fillStyle = canAfford ? '#e8d080' : '#888';
        ctx.fillText(item.name, iX + iH + 6, iY + iH * 0.34);
        ctx.font = `14px 'Crimson Text', serif`;
        ctx.fillStyle = canAfford ? '#bbb' : '#666';
        ctx.fillText(item.desc, iX + iH + 6, iY + iH * 0.64);

        // Buy button
        const bW = 90, bH = 32;
        const bX = iX + iW - bW - 8, bY = iY + (iH - bH) / 2;
        drawRuneButton(ctx, bX, bY, bW, bH, `${item.cost}g`, state.mouse,
            canAfford ? '#8b6010' : '#2a2010', canAfford ? '#d4a017' : '#555', false, !canAfford);
    });

    // Close
    drawRuneButton(ctx, W/2 - 70, pY + pH - 52, 140, 40, '✕ Close', state.mouse, '#2a2010', '#888', false, true);
}

// ── Hero Upgrade Overlay ──────────────────────────────────────────────────────
function drawHeroUpgradeOverlay(ctx, W, H, state) {
    drawModalBg(ctx, W, H, '#7ec8e3');

    const { pW, pH, pX, pY } = getHeroUpgradePanelDims(W, H);

    drawPanel(ctx, pX, pY, pW, pH, '#7ec8e3');

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(pH * 0.065)}px 'Cinzel', serif`;
    ctx.fillStyle = '#7ec8e3';
    ctx.shadowColor = '#7ec8e3'; ctx.shadowBlur = 12;
    ctx.fillText('HERO UPGRADES', W / 2, pY + pH * 0.08);
    ctx.shadowBlur = 0;

    drawGoldBadge(ctx, W / 2, pY + pH * 0.15, getDisplayedGold(state), true);

    const HEROES = [
        { id: 'astrid', name: 'Astrid', title: 'The Archer', emoji: '🏹', color: '#c8962a', glow: '#f0c040' },
        { id: 'hilda',  name: 'Hilda',  title: 'The Völva',  emoji: '❄️',  color: '#4a8fa8', glow: '#7ec8e3' },
        { id: 'bjorn',  name: 'Bjorn',  title: 'The Hurler', emoji: '⚡',  color: '#6b3d11', glow: '#c87820' }
    ];

    const colW = (pW - 48) / 3;
    HEROES.forEach((hero, i) => {
        const cX = pX + 16 + i * (colW + 8);
        const cY = pY + pH * 0.21;
        const cH = pH * 0.72;
        const upgrades = state.permanentUpgrades[hero.id];
        const heroLevel = 1 + upgrades.atk + upgrades.income + upgrades.atkSpeed;

        // Card
        ctx.fillStyle = `rgba(${hexToRgb(hero.color)},0.10)`;
        ctx.strokeStyle = `rgba(${hexToRgb(hero.color)},0.5)`;
        ctx.lineWidth = 1.5;
        roundRect(ctx, cX, cY, colW, cH, 8); ctx.fill(); ctx.stroke();

        // Hero portrait
        const portH = colW * 0.55;
        ctx.fillStyle = `rgba(${hexToRgb(hero.color)},0.18)`;
        roundRect(ctx, cX + 10, cY + 10, colW - 20, portH, 6); ctx.fill();
        ctx.font = `${portH * 0.55}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(hero.emoji, cX + colW / 2, cY + 10 + portH / 2);

        ctx.font = `bold 14px 'Cinzel', serif`;
        ctx.fillStyle = hero.color;
        ctx.shadowColor = hero.glow; ctx.shadowBlur = 6;
        ctx.fillText(hero.name.toUpperCase(), cX + colW / 2, cY + 10 + portH + 16);
        ctx.shadowBlur = 0;
        ctx.font = `italic 12px 'Crimson Text', serif`;
        ctx.fillStyle = '#888';
        ctx.fillText(hero.title, cX + colW / 2, cY + 10 + portH + 32);
        ctx.textAlign = 'right';
        ctx.font = `bold 10px 'Cinzel', serif`;
        ctx.fillStyle = '#fff3b0';
        ctx.fillText(`Hero Lv ${heroLevel}`, cX + colW - 16, cY + 24);
        ctx.textAlign = 'center';

        const tier = getAscensionTier(state, hero.id);
        const nextTier = getNextAscensionTier(state, hero.id);
        const shardCount = (state.shards && state.shards[hero.id]) || 0;
        const ascendCost = getAscensionCost(state, hero.id);
        ctx.font = `bold 11px 'Cinzel', serif`;
        ctx.fillStyle = tier.color;
        ctx.shadowColor = tier.color; ctx.shadowBlur = 5;
        ctx.fillText(`${tier.name.toUpperCase()}  x${tier.statMultiplier.toFixed(2)}`, cX + colW / 2, cY + 10 + portH + 49);
        ctx.shadowBlur = 0;
        ctx.font = `11px 'Crimson Text', serif`;
        ctx.fillStyle = '#c8e8f0';
        ctx.fillText(`Shards: ${shardCount}${ascendCost ? ` / ${ascendCost}` : ' / MAX'}`, cX + colW / 2, cY + 10 + portH + 65);
        if (nextTier) {
            const canAscend = canAscendHero(state, hero.id);
            const aW = Math.min(116, colW - 24), aH = 22;
            drawRuneButton(ctx, cX + colW / 2 - aW / 2, cY + 10 + portH + 74, aW, aH,
                `Ascend: ${nextTier.name}`, state.mouse,
                canAscend ? darkenColor(nextTier.color) : '#1a1008',
                canAscend ? nextTier.color : '#444',
                canAscend, !canAscend);
        }

        ctx.textAlign = 'right';
        ctx.font = `bold 10px 'Cinzel', serif`;
        ctx.fillStyle = '#fff3b0';
        ctx.fillText(`Hero Lv ${heroLevel}`, cX + colW - 16, cY + 24);
        ctx.textAlign = 'center';

        // Upgrade buttons
        const upgs = HERO_UPGRADE_TYPES;

        upgs.forEach((u, j) => {
            const lvl = upgrades[u.key];
            const cost = u.base + lvl * u.mul;
            const canAfford = state.gold >= cost;
            const uY = cY + 10 + portH + 104 + j * (cH * 0.145);
            const uH = cH * 0.13;

            ctx.fillStyle = canAfford ? `rgba(${hexToRgb(hero.color)},0.12)` : 'rgba(30,20,10,0.4)';
            ctx.strokeStyle = canAfford ? `rgba(${hexToRgb(hero.color)},0.35)` : 'rgba(60,50,40,0.3)';
            ctx.lineWidth = 1;
            roundRect(ctx, cX + 8, uY, colW - 16, uH, 4); ctx.fill(); ctx.stroke();

            ctx.textAlign = 'left';
            ctx.font = `bold 11px 'Cinzel', serif`;
            ctx.fillStyle = canAfford ? '#ddd' : '#666';
            ctx.fillText(`${u.label} — Lv ${lvl}`, cX + 14, uY + uH * 0.24);

            ctx.font = `10px 'Crimson Text', serif`;
            ctx.fillStyle = canAfford ? '#fff3b0' : '#777';
            ctx.fillText(`Now: ${getUpgradeBonusText(lvl, u.bonusLabel)}`, cX + 14, uY + uH * 0.46);
            ctx.fillStyle = canAfford ? hero.glow : '#666';
            ctx.fillText(`Next: ${getUpgradeBonusText(lvl + 1, u.bonusLabel)} (${getUpgradePreviewText(u.bonusLabel)})`, cX + 14, uY + uH * 0.66);
            ctx.fillStyle = canAfford ? '#d8c8a0' : '#555';
            ctx.fillText(`Cost: ${cost} gold`, cX + 14, uY + uH * 0.84);

            const bW2 = 64, bH2 = 22;
            drawRuneButton(ctx, cX + colW - bW2 - 10, uY + (uH - bH2) / 2, bW2, bH2,
                `${cost}g`, state.mouse,
                canAfford ? darkenColor(hero.color) : '#1a1008',
                canAfford ? hero.glow : '#444',
                false, !canAfford);
        });
    });

    drawRuneButton(ctx, W/2 - 70, pY + pH - 50, 140, 40, '✕ Close', state.mouse, '#1a2028', '#7ec8e3', false, true);
}

// ── Gear Overlay ──────────────────────────────────────────────────────────────
function drawGearOverlay(ctx, W, H, state) {
    drawModalBg(ctx, W, H, '#b07af0');
    const pW = Math.min(W * 0.80, 720), pH = H * 0.80;
    const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;
    drawPanel(ctx, pX, pY, pW, pH, '#b07af0');

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(pH * 0.065)}px 'Cinzel', serif`;
    ctx.fillStyle = '#b07af0'; ctx.shadowColor = '#b07af0'; ctx.shadowBlur = 12;
    ctx.fillText('GEAR', W / 2, pY + pH * 0.07);
    ctx.shadowBlur = 0;

    // Three gear slots
    const SLOTS = [
        { key: 'weapon', label: '⚔ Weapon', color: '#c8962a' },
        { key: 'armor',  label: '🛡 Armor',  color: '#4a8fa8' },
        { key: 'relic',  label: '✨ Relic',  color: '#9b4de0' }
    ];

    const slotW = (pW - 48) / 3;
    const slotY = pY + pH * 0.14;
    const slotH = pH * 0.24;

    const { gearPool } = window._gearData || { gearPool: [] };
    const RARITY_COLORS = { common: '#aaaaaa', rare: '#4a8fa8', epic: '#9b4de0' };

    SLOTS.forEach((slot, i) => {
        const sx = pX + 16 + i * (slotW + 8);
        const equippedId = state.equippedGear[slot.key];
        const equippedGear = equippedId ? gearPool.find(g => g.id === equippedId) : null;

        ctx.fillStyle = `rgba(80,50,120,0.18)`;
        ctx.strokeStyle = slot.color + '88';
        ctx.lineWidth = 1.5;
        roundRect(ctx, sx, slotY, slotW, slotH, 8); ctx.fill(); ctx.stroke();

        ctx.font = `bold 12px 'Cinzel', serif`;
        ctx.fillStyle = slot.color; ctx.shadowColor = slot.color; ctx.shadowBlur = 5;
        ctx.fillText(slot.label, sx + slotW / 2, slotY + slotH * 0.22);
        ctx.shadowBlur = 0;

        if (equippedGear) {
            ctx.font = `22px serif`;
            ctx.fillText(equippedGear.icon, sx + slotW / 2, slotY + slotH * 0.48);
            ctx.font = `bold 11px 'Cinzel', serif`;
            ctx.fillStyle = RARITY_COLORS[equippedGear.rarity] || '#aaa';
            ctx.fillText(equippedGear.name, sx + slotW / 2, slotY + slotH * 0.68);
            ctx.font = `10px 'Crimson Text', serif`;
            ctx.fillStyle = '#bbb';
            ctx.fillText(equippedGear.desc, sx + slotW / 2, slotY + slotH * 0.82);
        } else {
            ctx.font = `28px serif`; ctx.fillStyle = 'rgba(180,160,200,0.3)';
            ctx.fillText('—', sx + slotW / 2, slotY + slotH * 0.55);
            ctx.font = `11px 'Crimson Text', serif`; ctx.fillStyle = '#666';
            ctx.fillText('Empty slot', sx + slotW / 2, slotY + slotH * 0.80);
        }
    });

    // Inventory list
    const invY = slotY + slotH + 18;
    ctx.font = `bold 13px 'Cinzel', serif`;
    ctx.fillStyle = '#b07af0'; ctx.textAlign = 'left';
    ctx.fillText('Inventory', pX + 16, invY);
    ctx.textAlign = 'center';

    const inventory = state.gearInventory || [];
    if (inventory.length === 0) {
        ctx.font = `14px 'Crimson Text', serif`; ctx.fillStyle = '#666';
        ctx.fillText('No gear collected yet — defeat waves to earn drops!', W / 2, invY + 28);
    } else {
        const itemW = (pW - 48) / Math.min(inventory.length, 4);
        const maxPerRow = 4;
        inventory.forEach((gearId, i) => {
            const gear = gearPool.find(g => g.id === gearId);
            if (!gear) return;
            const row = Math.floor(i / maxPerRow), col = i % maxPerRow;
            const ix = pX + 16 + col * (itemW + 4);
            const iy = invY + 14 + row * 72;
            const isEquipped = Object.values(state.equippedGear).includes(gearId);

            ctx.fillStyle = isEquipped ? `rgba(${hexToRgb(RARITY_COLORS[gear.rarity] || '#888')},0.25)` : 'rgba(60,40,80,0.5)';
            ctx.strokeStyle = RARITY_COLORS[gear.rarity] || '#888';
            ctx.lineWidth = isEquipped ? 2 : 1;
            roundRect(ctx, ix, iy, itemW - 4, 66, 5); ctx.fill(); ctx.stroke();

            ctx.font = `18px serif`; ctx.textAlign = 'center';
            ctx.fillText(gear.icon, ix + (itemW - 4) / 2, iy + 18);
            ctx.font = `bold 10px 'Cinzel', serif`;
            ctx.fillStyle = RARITY_COLORS[gear.rarity] || '#aaa';
            ctx.fillText(gear.name, ix + (itemW - 4) / 2, iy + 36);
            if (isEquipped) {
                ctx.font = `9px 'Crimson Text', serif`; ctx.fillStyle = '#b07af0';
                ctx.fillText('Equipped', ix + (itemW - 4) / 2, iy + 50);
            } else {
                const bW3 = 56, bH3 = 14;
                drawRuneButton(ctx, ix + (itemW - 4) / 2 - bW3/2, iy + 48, bW3, bH3, 'Equip', state.mouse, '#3a1060', '#b07af0', false, false);
            }
        });
    }

    drawRuneButton(ctx, W/2 - 70, pY + pH - 50, 140, 40, '✕ Close', state.mouse, '#1a0a28', '#b07af0', false, true);
}

function handleGearOverlayClick(state, mouse, W, H) {
    const pW = Math.min(W * 0.80, 720), pH = H * 0.80;
    const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;

    if (inRect(mouse, W/2 - 70, pY + pH - 50, 140, 40)) {
        state.gearOpen = false;
        return { action: 'none' };
    }

    const { gearPool } = window._gearData || { gearPool: [] };
    const SLOTS = ['weapon', 'armor', 'relic'];
    const slotW = (pW - 48) / 3;
    const slotY = pY + pH * 0.14;
    const slotH = pH * 0.24;
    const invY = slotY + slotH + 18;
    const inventory = state.gearInventory || [];
    const maxPerRow = 4;
    const itemW = inventory.length > 0 ? (pW - 48) / Math.min(inventory.length, 4) : (pW - 48) / 4;

    inventory.forEach((gearId, i) => {
        const gear = gearPool.find(g => g.id === gearId);
        if (!gear) return;
        const isEquipped = Object.values(state.equippedGear).includes(gearId);
        if (isEquipped) return;
        const row = Math.floor(i / maxPerRow), col = i % maxPerRow;
        const ix = pX + 16 + col * (itemW + 4);
        const iy = invY + 14 + row * 72;
        const bW3 = 56, bH3 = 14;
        if (inRect(mouse, ix + (itemW - 4) / 2 - bW3/2, iy + 48, bW3, bH3)) {
            // Equip: set in correct slot
            state.equippedGear[gear.slot] = gearId;
            checkAchievements(state);
            saveGameState(state);
        }
    });

    return { action: 'none' };
}


// ── Achievements Overlay ─────────────────────────────────────────────────────
function drawAchievementsOverlay(ctx, W, H, state) {
    drawModalBg(ctx, W, H, '#f0c040');
    const pW = Math.min(W * 0.84, 760), pH = H * 0.82;
    const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;
    drawPanel(ctx, pX, pY, pW, pH, '#f0c040');

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(pH * 0.06)}px 'Cinzel', serif`;
    ctx.fillStyle = '#f0c040'; ctx.shadowColor = '#f0c040'; ctx.shadowBlur = 12;
    ctx.fillText('ACHIEVEMENTS', W / 2, pY + pH * 0.07);
    ctx.shadowBlur = 0;

    ctx.font = `13px 'Crimson Text', serif`;
    ctx.fillStyle = '#c8b98c';
    ctx.fillText('Complete small goals, then claim safe rewards for your Viking hall.', W / 2, pY + pH * 0.125);

    const rows = getAchievementList(state);
    const rowX = pX + 18;
    const rowW = pW - 36;
    const rowH = Math.min(58, (pH - 150) / rows.length);
    const startY = pY + pH * 0.17;

    rows.forEach((achievement, i) => {
        const y = startY + i * (rowH + 8);
        const claimed = achievement.claimed;
        const ready = achievement.ready && !claimed;
        ctx.fillStyle = claimed ? 'rgba(40,70,48,0.48)' : ready ? 'rgba(90,70,18,0.62)' : 'rgba(20,24,28,0.72)';
        ctx.strokeStyle = claimed ? '#58d878' : ready ? '#f0c040' : 'rgba(212,160,23,0.35)';
        ctx.lineWidth = ready ? 2 : 1;
        roundRect(ctx, rowX, y, rowW, rowH, 8); ctx.fill(); ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = `bold 13px 'Cinzel', serif`;
        ctx.fillStyle = claimed ? '#9ff0ad' : '#fff0b0';
        ctx.fillText(`${claimed ? '✓' : ready ? '!' : '•'} ${achievement.name}`, rowX + 12, y + rowH * 0.30);

        ctx.font = `12px 'Crimson Text', serif`;
        ctx.fillStyle = '#c8b98c';
        ctx.fillText(`${achievement.requirement} (${achievement.progress})`, rowX + 12, y + rowH * 0.62);

        ctx.textAlign = 'center';
        ctx.font = `bold 11px 'Cinzel', serif`;
        ctx.fillStyle = '#f0c040';
        ctx.fillText(achievement.reward, rowX + rowW * 0.62, y + rowH * 0.45);

        const bW = 94, bH = 26;
        const bX = rowX + rowW - bW - 12;
        const bY = y + rowH / 2 - bH / 2;
        if (claimed) {
            drawRuneButton(ctx, bX, bY, bW, bH, 'Claimed', state.mouse, '#1f6b38', '#58d878', false, true);
        } else if (ready) {
            drawRuneButton(ctx, bX, bY, bW, bH, 'Claim', state.mouse, '#8b6010', '#f0c040', true, false);
        } else {
            drawRuneButton(ctx, bX, bY, bW, bH, 'Locked', state.mouse, '#202832', '#555a60', false, true);
        }
    });

    drawRuneButton(ctx, W/2 - 70, pY + pH - 50, 140, 40, '✕ Close', state.mouse, '#1a2028', '#f0c040', false, true);
}

function handleAchievementsOverlayClick(state, mouse, W, H) {
    const pW = Math.min(W * 0.84, 760), pH = H * 0.82;
    const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;

    if (inRect(mouse, W/2 - 70, pY + pH - 50, 140, 40)) {
        state.achievementsOpen = false;
        return { action: 'none' };
    }

    const rows = getAchievementList(state);
    const rowX = pX + 18;
    const rowW = pW - 36;
    const rowH = Math.min(58, (pH - 150) / rows.length);
    const startY = pY + pH * 0.17;

    rows.forEach((achievement, i) => {
        const y = startY + i * (rowH + 8);
        const bW = 94, bH = 26;
        const bX = rowX + rowW - bW - 12;
        const bY = y + rowH / 2 - bH / 2;
        if (achievement.ready && !achievement.claimed && inRect(mouse, bX, bY, bW, bH)) {
            claimAchievement(state, achievement.id);
        }
    });

    return { action: 'none' };
}

// ── Shared Visual Helpers ─────────────────────────────────────────────────────

function drawRuneButton(ctx, x, y, w, h, label, mouse, bgColor, borderColor, primary = false, muted = false) {
    const isHov = mouse && mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, x + 2, y + 3, w, h, 5); ctx.fill();

    // Body
    const bodyAlpha = muted ? 0.4 : isHov ? 0.85 : 0.65;
    if (primary && isHov) {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, `rgba(${hexToRgb(borderColor)},0.45)`);
        g.addColorStop(1, `rgba(${hexToRgb(bgColor)},0.7)`);
        ctx.fillStyle = g;
    } else {
        ctx.fillStyle = bgColor + (muted ? '40' : isHov ? 'aa' : '60');
    }
    roundRect(ctx, x, y, w, h, 5); ctx.fill();

    // Border
    ctx.strokeStyle = muted ? '#444' : borderColor + (isHov ? 'ff' : '99');
    ctx.lineWidth = isHov ? 1.5 : 1;
    if (isHov && !muted) { ctx.shadowColor = borderColor; ctx.shadowBlur = 10; }
    roundRect(ctx, x, y, w, h, 5); ctx.stroke();
    ctx.shadowBlur = 0;

    // Rune corner marks
    if (!muted) {
        const c = borderColor;
        const sz = 4;
        ctx.fillStyle = c + 'cc';
        [[x+3,y+3],[x+w-7,y+3],[x+3,y+h-7],[x+w-7,y+h-7]].forEach(([px,py]) => {
            ctx.fillRect(px, py, sz, 1);
            ctx.fillRect(px, py, 1, sz);
        });
    }

    // Label
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${primary ? 'bold ' : ''}${Math.min(15, h * 0.34)}px 'Cinzel', serif`;
    ctx.fillStyle = muted ? '#666' : isHov ? '#fff' : '#e8d8a8';
    if (isHov && !muted) { ctx.shadowColor = borderColor; ctx.shadowBlur = 6; }
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
}

export { drawRuneButton as drawButton };

function drawPanel(ctx, x, y, w, h, accentColor) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, x + 4, y + 5, w, h, 10); ctx.fill();

    // Body
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, '#18130c');
    bg.addColorStop(1, '#0c0a06');
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, 10); ctx.fill();

    // Border
    ctx.strokeStyle = accentColor + '66';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 10); ctx.stroke();

    // Inner glow border
    ctx.strokeStyle = accentColor + '22';
    ctx.lineWidth = 4;
    roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 8); ctx.stroke();

    // Corner ornaments
    const orn = 20;
    ctx.strokeStyle = accentColor + 'aa'; ctx.lineWidth = 1.5;
    [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([cx,cy], i) => {
        const sx = i % 2 === 0 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(cx + sx*8, cy); ctx.lineTo(cx + sx*8, cy + sy*orn); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + sy*8); ctx.lineTo(cx + sx*orn, cy + sy*8); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + sx*8, cy + sy*8, 3, 0, Math.PI*2); ctx.stroke();
    });
}

function drawModalBg(ctx, W, H, accentColor) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);
    // Vignette
    const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.6);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
}

function drawRuneCircle(ctx, cx, cy, r, t) {
    // Outer ring
    ctx.strokeStyle = 'rgba(212,160,23,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // Rotating rune marks
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.0001;
        const x1 = cx + Math.cos(angle) * r;
        const y1 = cy + Math.sin(angle) * r;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(212,160,23,0.5)' : 'rgba(212,160,23,0.2)';
        ctx.beginPath(); ctx.arc(x1, y1, i % 3 === 0 ? 3 : 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // Inner ring
    ctx.strokeStyle = 'rgba(212,160,23,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2); ctx.stroke();

    // Cross lines
    ctx.strokeStyle = 'rgba(212,160,23,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI + t * 0.00005;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72);
        ctx.lineTo(cx - Math.cos(a) * r * 0.72, cy - Math.sin(a) * r * 0.72);
        ctx.stroke();
    }
}

function drawLevelCard(ctx, x, y, w, h, lvl, locked, hovered, t) {
    ctx.save();

    // Hover lift
    if (hovered) {
        ctx.translate(0, -4);
        ctx.shadowColor = lvl.glow; ctx.shadowBlur = 30;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, x+3, y+5, w, h, 8); ctx.fill(); ctx.shadowBlur = 0;

    // Card body
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    if (locked) {
        bg.addColorStop(0, '#111');
        bg.addColorStop(1, '#080808');
    } else {
        bg.addColorStop(0, '#1a1510');
        bg.addColorStop(1, '#0e0a06');
    }
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, 8); ctx.fill();

    // Border
    ctx.strokeStyle = locked ? '#333' : (hovered ? lvl.glow : lvl.color + '88');
    ctx.lineWidth = locked ? 1 : (hovered ? 2 : 1.5);
    roundRect(ctx, x, y, w, h, 8); ctx.stroke();

    if (!locked) {
        // Top color accent band
        const band = ctx.createLinearGradient(x, y, x, y + h * 0.35);
        band.addColorStop(0, `rgba(${hexToRgb(lvl.color)},0.18)`);
        band.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = band;
        roundRect(ctx, x, y, w, h * 0.35, 8); ctx.fill();
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (locked) {
        // Lock icon
        ctx.strokeStyle = '#555'; ctx.lineWidth = 3;
        const lx = x + w/2, ly = y + h*0.4;
        ctx.beginPath(); ctx.arc(lx, ly - 14, 12, Math.PI, 0, false); ctx.stroke();
        ctx.strokeRect(lx - 12, ly - 14, 24, 20);
        ctx.fillStyle = '#555';
        ctx.fillRect(lx - 12, ly - 14, 24, 20);
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(lx, ly - 5, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(lx-1.5, ly-4, 3, 8);

        ctx.fillStyle = '#444';
        ctx.font = `14px 'Cinzel', serif`;
        ctx.fillText('LOCKED', x + w/2, y + h*0.72);
    } else {
        // Icon
        ctx.font = `${h * 0.24}px serif`;
        ctx.fillText(lvl.icon, x + w/2, y + h * 0.22);

        // Name
        ctx.font = `bold ${Math.min(16, w * 0.11)}px 'Cinzel', serif`;
        ctx.fillStyle = hovered ? '#fff' : '#ddd';
        if (hovered) { ctx.shadowColor = lvl.glow; ctx.shadowBlur = 8; }

        // Word wrap name
        const words = lvl.name.split(' ');
        if (words.length > 2) {
            ctx.fillText(words.slice(0,2).join(' '), x + w/2, y + h * 0.46);
            ctx.fillText(words.slice(2).join(' '), x + w/2, y + h * 0.56);
        } else {
            ctx.fillText(lvl.name, x + w/2, y + h * 0.5);
        }
        ctx.shadowBlur = 0;

        // Difficulty badge
        const diffColors = { Easy: '#4caf50', Medium: '#ff9800', Hard: '#f44336' };
        const dColor = diffColors[lvl.sub] || '#888';
        const badgeW = 70, badgeH = 22;
        ctx.fillStyle = dColor + '33';
        ctx.strokeStyle = dColor + '88'; ctx.lineWidth = 1;
        roundRect(ctx, x + w/2 - badgeW/2, y + h*0.66, badgeW, badgeH, 11);
        ctx.fill(); ctx.stroke();
        ctx.font = `bold 11px 'Cinzel', serif`;
        ctx.fillStyle = dColor;
        ctx.fillText(lvl.sub.toUpperCase(), x + w/2, y + h*0.66 + badgeH/2);

        // Description
        ctx.font = `italic 12px 'Crimson Text', serif`;
        ctx.fillStyle = '#888';
        const lines = lvl.desc.split('\n');
        lines.forEach((line, li) => {
            ctx.fillText(line, x + w/2, y + h * 0.81 + li * 16);
        });
    }

    ctx.restore();
}

function drawGoldBadge(ctx, x, y, gold, centered = false) {
    ctx.save();
    const text = `${Math.floor(gold)} Gold`;
    ctx.font = `bold 14px 'Cinzel', serif`;
    const tw = ctx.measureText(text).width;
    const bW = tw + 36, bH = 26;
    const bX = centered ? x - bW/2 : x - bW - 4;
    const bY = y - bH/2;

    ctx.fillStyle = 'rgba(212,160,23,0.15)';
    ctx.strokeStyle = 'rgba(212,160,23,0.5)'; ctx.lineWidth = 1;
    roundRect(ctx, bX, bY, bW, bH, 13); ctx.fill(); ctx.stroke();

    // Coin
    const cg = ctx.createRadialGradient(bX+14, bY+13, 1, bX+14, bY+13, 8);
    cg.addColorStop(0, '#ffe066'); cg.addColorStop(1, '#a06800');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(bX + 14, bY + 13, 8, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#f0c040';
    ctx.font = `bold 14px 'Cinzel', serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, bX + 26, bY + 13);
    ctx.restore();
}

// ── Click Handler ─────────────────────────────────────────────────────────────

// ── Skill Choice Popup ────────────────────────────────────────────────────────
const HERO_COLORS = {
    astrid: '#c8962a',
    hilda:  '#4a8fa8',
    bjorn:  '#6b3d11',
};
const HERO_GLOWS = {
    astrid: '#ffaa00',
    hilda:  '#7ec8e3',
    bjorn:  '#c8822a',
};
const HERO_NAMES = {
    astrid: 'Astrid',
    hilda: 'Hilda',
    bjorn: 'Bjorn',
};

// Returns layout rects for the 3 skill cards so handleClick can reuse them
function getSkillCardRects(W, H) {
    const panelW = Math.min(W * 0.92, 780);
    const panelH = Math.min(H * 0.72, 500);
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;
    const cardGap = panelW * 0.03;
    const cardW = (panelW - cardGap * 4) / 3;
    const cardH = panelH * 0.68;
    const cardY = panelY + panelH * 0.28;
    return { panelX, panelY, panelW, panelH, cardW, cardH, cardY, cardGap };
}

function drawSkillChoicePopup(ctx, W, H, state) {
    const t = T();
    drawModalBg(ctx, W, H, '#d4a017');
    const { panelX, panelY, panelW, panelH, cardW, cardH, cardY, cardGap } = getSkillCardRects(W, H);
    drawPanel(ctx, panelX, panelY, panelW, panelH, '#d4a017');

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const titleSize = Math.min(Math.round(panelH * 0.09), 38);
    ctx.font = `bold ${titleSize}px 'Cinzel', serif`;
    ctx.fillStyle = '#f0c040'; ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 16;
    ctx.fillText('LEVEL UP!', W / 2, panelY + panelH * 0.09);
    ctx.shadowBlur = 0;
    const subSize = Math.min(Math.round(panelH * 0.048), 20);
    ctx.font = `${subSize}px 'Crimson Text', serif`;
    ctx.fillStyle = 'rgba(200,180,120,0.85)';
    ctx.fillText(`Party Level ${state.party.level} \u2014 Choose a Skill`, W / 2, panelY + panelH * 0.17);

    state.skillChoices.forEach((skill, i) => {
        const cardX = panelX + cardGap + i * (cardW + cardGap);
        const mouse = state.mouse;
        const hovered = mouse.x >= cardX && mouse.x <= cardX + cardW &&
                        mouse.y >= cardY && mouse.y <= cardY + cardH;
        const heroId = (skill.id || 'astrid').split('_')[0];
        const heroName = HERO_NAMES[heroId] || 'Hero';
        const accent = HERO_COLORS[heroId] || '#d4a017';
        const glow   = HERO_GLOWS[heroId]  || '#f0c040';
        const cx = cardX + cardW / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        roundRect(ctx, cardX+3, cardY+5, cardW, cardH, 10); ctx.fill();
        const bg = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        if (hovered) { bg.addColorStop(0, `rgba(${hexToRgb(accent)},0.30)`); bg.addColorStop(1, `rgba(${hexToRgb(accent)},0.08)`); }
        else { bg.addColorStop(0, '#1e1810'); bg.addColorStop(1, '#0e0b07'); }
        ctx.fillStyle = bg;
        roundRect(ctx, cardX, cardY, cardW, cardH, 10); ctx.fill();

        ctx.strokeStyle = hovered ? glow : accent + '88'; ctx.lineWidth = hovered ? 2 : 1.5;
        if (hovered) { ctx.shadowColor = glow; ctx.shadowBlur = 16; }
        roundRect(ctx, cardX, cardY, cardW, cardH, 10); ctx.stroke();
        ctx.shadowBlur = 0;

        const accentBar = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
        accentBar.addColorStop(0, 'rgba(0,0,0,0)'); accentBar.addColorStop(0.5, accent + (hovered ? 'cc' : '55')); accentBar.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = accentBar; roundRect(ctx, cardX, cardY, cardW, 3, 2); ctx.fill();

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const iconSize = Math.min(Math.round(cardH * 0.13), 32);
        ctx.font = `${iconSize}px serif`;
        ctx.globalAlpha = hovered ? 1 : 0.75;
        const iconEmoji = heroId === 'astrid' ? '\u{1F3F9}' : heroId === 'hilda' ? '\u2744\uFE0F' : '\u26A1';
        ctx.fillText(iconEmoji, cx, cardY + cardH * 0.105);
        ctx.globalAlpha = 1;

        ctx.font = `bold ${Math.min(Math.round(cardH * 0.044), 12)}px 'Cinzel', serif`;
        ctx.fillStyle = accent + 'ee';
        ctx.fillText(heroName.toUpperCase(), cx, cardY + cardH * 0.20);

        let nameSize = Math.min(Math.round(cardH * 0.072), 18);
        ctx.font = `bold ${nameSize}px 'Cinzel', serif`;
        while (ctx.measureText(skill.name).width > cardW * 0.88 && nameSize > 8) { nameSize--; ctx.font = `bold ${nameSize}px 'Cinzel', serif`; }
        ctx.fillStyle = hovered ? '#fff8c0' : '#e8d8a8';
        if (hovered) { ctx.shadowColor = glow; ctx.shadowBlur = 8; }
        ctx.fillText(skill.name, cx, cardY + cardH * 0.315);
        ctx.shadowBlur = 0;

        ctx.font = `${Math.min(Math.round(cardH * 0.048), 12)}px 'Cinzel', serif`;
        ctx.fillStyle = accent + 'dd';
        ctx.fillText((skill.type || '').replace('_',' ').toUpperCase(), cx, cardY + cardH * 0.43);

        ctx.strokeStyle = accent + '44'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cardX + cardW*0.12, cardY + cardH*0.50); ctx.lineTo(cardX + cardW*0.88, cardY + cardH*0.50); ctx.stroke();

        const desc = skill.description || '';
        const availH = cardH * 0.36;
        const maxLineW = cardW * 0.86;
        const wrapText = (text, sz) => {
            ctx.font = `${sz}px 'Crimson Text', serif`;
            const words = text.split(' '); let line = ''; const out = [];
            words.forEach(w => { const t2 = line ? line+' '+w : w; if (ctx.measureText(t2).width > maxLineW && line) { out.push(line); line = w; } else { line = t2; } });
            if (line) out.push(line); return out;
        };
        let descSz = Math.min(Math.round(cardH * 0.058), 15);
        let descLines = wrapText(desc, descSz);
        while (descSz > 9 && descLines.length * descSz * 1.35 > availH) { descSz--; descLines = wrapText(desc, descSz); }
        ctx.font = `${descSz}px 'Crimson Text', serif`;
        ctx.fillStyle = 'rgba(210,195,155,0.92)';
        const lineH2 = descSz * 1.35;
        const totalH2 = descLines.length * lineH2;
        const dStartY = cardY + cardH * 0.54 + (availH - totalH2) / 2 + lineH2 / 2;
        descLines.forEach((l, li) => ctx.fillText(l, cx, dStartY + li * lineH2));

        if (hovered) {
            ctx.font = `bold ${Math.min(Math.round(cardH * 0.065), 14)}px 'Cinzel', serif`;
            ctx.fillStyle = '#f0c040'; ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 8;
            ctx.fillText('\u25B6 SELECT \u25C0', cx, cardY + cardH * 0.93);
            ctx.shadowBlur = 0;
        }
    });
}


export function handleClick(state, levelIndex, clickX, clickY, W, H) {
    const mouse = { x: clickX, y: clickY };

    if (state.screen === 'title') {
        if (state.achievementsOpen) {
            return handleAchievementsOverlayClick(state, mouse, W, H);
        }

        if (state.shopOpen) {
            const { pW, pH, pX, pY } = getShopPanelDims(W, H);

            state.shopItems.forEach((item, i) => {
                const iY = pY + pH * 0.24 + i * (pH * 0.21);
                const iX = pX + pW * 0.06, iW = pW * 0.88, iH = pH * 0.18;
                const bW = 90, bH = 32;
                const bX = iX + iW - bW - 8, bY = iY + (iH - bH) / 2;
                if (inRect(mouse, bX, bY, bW, bH) && state.gold >= item.cost) {
                    state.gold -= item.cost;
                    applyShopItem(state, item.id);
                    saveGameState(state);
                }
            });

            if (inRect(mouse, W/2 - 70, pY + pH - 52, 140, 40)) state.shopOpen = false;
            return { action: 'none' };
        }

        if (state.gearOpen) {
            const gearResult = handleGearOverlayClick(state, mouse, W, H);
            return gearResult;
        }

        if (state.heroUpgradeOpen) {
            const { pW, pH, pX, pY } = getHeroUpgradePanelDims(W, H);
            const colW = (pW - 48) / 3;
            const HERO_IDS = ['astrid', 'hilda', 'bjorn'];

            HERO_IDS.forEach((id, i) => {
                const cX = pX + 16 + i * (colW + 8);
                const cY = pY + pH * 0.21;
                const portH = colW * 0.55;
                const upgrades = state.permanentUpgrades[id];
                const hero = { id, color: ['#c8962a','#4a8fa8','#6b3d11'][i] };
<<<<<<< HEAD
                const upgs = HERO_UPGRADE_TYPES;
=======
>>>>>>> d12e53c (hp bars, more levels etc)
                const cH = pH * 0.72;
                const ascendCost = getAscensionCost(state, id);
                if (ascendCost !== null) {
                    const aW = Math.min(116, colW - 24), aH = 22;
                    const aX = cX + colW / 2 - aW / 2;
                    const aY = cY + 10 + portH + 74;
                    if (inRect(mouse, aX, aY, aW, aH) && ascendHero(state, id)) {
                        saveGameState(state);
                    }
                }
                const upgs = HERO_UPGRADE_TYPES;
                upgs.forEach((u, j) => {
                    const lvl = upgrades[u.key];
                    const cost = u.base + lvl * u.mul;
                    const uY = cY + 10 + portH + 104 + j * (cH * 0.145);
                    const uH = cH * 0.13;
                    const bW2 = 64, bH2 = 22;
                    const bX2 = cX + colW - bW2 - 10, bY2 = uY + (uH - bH2) / 2;
                    if (inRect(mouse, bX2, bY2, bW2, bH2) && state.gold >= cost) {
                        state.gold -= cost;
                        state.permanentUpgrades[id][u.key]++;
                        saveGameState(state);
                    }
                });
            });

            if (inRect(mouse, W/2 - 70, pY + pH - 50, 140, 40)) state.heroUpgradeOpen = false;
            return { action: 'none' };
        }

        const autoToggle = getAutoPickToggleRect(W, H);
        const achievementButton = getAchievementsButtonRect(W, H);
        if (inRect(mouse, achievementButton.x, achievementButton.y, achievementButton.w, achievementButton.h)) {
            state.achievementsOpen = true;
            state.shopOpen = false;
            state.heroUpgradeOpen = false;
            state.gearOpen = false;
            return { action:'none' };
        }

        if (inRect(mouse, autoToggle.x, autoToggle.y, autoToggle.w, autoToggle.h)) {
<<<<<<< HEAD
            state.autoPickSkills = !state.autoPickSkills;
            saveGameState(state);
=======
            toggleAutoPickSkills(state);
>>>>>>> d12e53c (hp bars, more levels etc)
            return { action:'none' };
        }

        // Main buttons
        const btnW = 240, btnH = 52, btnX = W/2 - btnW/2;
        const btnY = H * 0.60;
        if (inRect(mouse, btnX, btnY, btnW, btnH)) { state.screen = 'levelSelect'; return { action:'none' }; }
        if (inRect(mouse, btnX, btnY+btnH+16, btnW, btnH)) { state.heroUpgradeOpen = true; return { action:'none' }; }
        if (inRect(mouse, btnX, btnY+(btnH+16)*2, btnW, btnH)) { state.gearOpen = true; return { action:'none' }; }
        if (inRect(mouse, btnX, btnY+(btnH+16)*3, btnW, btnH)) { state.shopOpen = true; return { action:'none' }; }
        return { action: 'none' };
    }

    if (state.screen === 'levelSelect') {
        if (inRect(mouse, 20, 20, 130, 42)) { state.screen = 'title'; return { action:'none' }; }

        const autoToggle = getAutoPickToggleRect(W, H);
        if (inRect(mouse, autoToggle.x, autoToggle.y, autoToggle.w, autoToggle.h)) {
            toggleAutoPickSkills(state);
            return { action:'none' };
        }

        const layout = getLevelSelectLayout(W, H, levels.length);
        for (let i = 0; i < levels.length; i++) {
            if (i <= state.highestUnlockedLevel) {
                const pos = getLevelCardPosition(layout, i);
                if (inRect(mouse, pos.x, pos.y, layout.cardW, layout.cardH)) {
                    state.currentLevel = i;
                    return { action: 'startLevel', levelIndex: i };
                }
            }
        }
    }

    if (state.screen === 'combat') {
        const autoToggle = getAutoPickToggleRect(W, H);
        if (!state.levelComplete && !state.levelFailed && inRect(mouse, autoToggle.x, autoToggle.y, autoToggle.w, autoToggle.h)) {
            toggleAutoPickSkills(state);
            return { action:'none' };
        }

        // Skill choice popup intercepts all clicks while open
        if (state.pendingSkillChoice && state.skillChoices && state.skillChoices.length > 0) {
            const { cardX: _cx, cardW, cardH, cardY, cardGap, panelX } = getSkillCardRects(W, H);
            const { panelX: pX, panelW, panelH, cardY: cY } = getSkillCardRects(W, H);
            state.skillChoices.forEach((skill, i) => {
                const cX = pX + cardGap + i * (cardW + cardGap);
                if (inRect(mouse, cX, cY, cardW, cardH)) {
                    applySkillChoice(state, skill);
                }
            });
            return { action: 'none' };
        }

        const barH = Math.max(52, H * 0.07);
        const qW = 88, qH = 34;
        const qX = W - qW - 14, qY = (barH - qH) / 2;
        if (inRect(mouse, qX, qY, qW, qH)) return { action: 'quitToMenu' };

        if (state.levelComplete) {
            const shardRewards2 = state.pendingShardRewards || [];
            const gearR = state.pendingGearRewards || [];
            const extraShift2 = (shardRewards2.length > 0 ? 8 : 0) + (gearR.length > 0 ? gearR.length * 20 + 20 : 0);
            if (inRect(mouse, W/2-110, H*0.68 + extraShift2, 220, 54)) return { action: 'quitToMenu' };
        }
        if (state.levelFailed) {
            const defeatShift = (state.pendingGearRewards || []).length > 0 ? 30 : 0;
            if (inRect(mouse, W/2-110, H*0.54 + defeatShift, 220, 52)) return { action: 'retry' };
            if (inRect(mouse, W/2-110, H*0.64 + defeatShift, 220, 52)) return { action: 'quitToMenu' };
        }
    }

    return { action: 'none' };
}

// ── Utility ───────────────────────────────────────────────────────────────────
<<<<<<< HEAD
function getAutoPickToggleRect(W, H) {
    return { x: 16, y: Math.max(70, H * 0.12), w: 220, h: 36 };
=======
function drawAutoPickToggle(ctx, W, H, state) {
    const toggle = getAutoPickToggleRect(W, H);
    drawRuneButton(
        ctx, toggle.x, toggle.y, toggle.w, toggle.h,
        `Auto Skills + 2x: ${state.autoPickSkills ? 'ON' : 'OFF'}`,
        state.mouse,
        state.autoPickSkills ? '#1f6b38' : '#5a3310',
        state.autoPickSkills ? '#58d878' : '#d4a017',
        state.autoPickSkills,
        false
    );
}

function toggleAutoPickSkills(state) {
    state.autoPickSkills = !state.autoPickSkills;
    state.gameSpeed = state.autoPickSkills ? 2 : 1;
    saveGameState(state);
}

function getAutoPickToggleRect(W, H) {
    return { x: 16, y: Math.max(70, H * 0.12), w: 200, h: 36 };
>>>>>>> d12e53c (hp bars, more levels etc)
}

function getAchievementsButtonRect(W, H) {
    const toggle = getAutoPickToggleRect(W, H);
    return { x: toggle.x, y: toggle.y + toggle.h + 10, w: 220, h: 36 };
}

function inRect(m, x, y, w, h) { return m.x>=x && m.x<=x+w && m.y>=y && m.y<=y+h; }

function darkenColor(hex) {
    if (!hex || hex.length < 7) return '#111';
    const r = Math.floor(parseInt(hex.slice(1,3),16) * 0.4);
    const g = Math.floor(parseInt(hex.slice(3,5),16) * 0.4);
    const b = Math.floor(parseInt(hex.slice(5,7),16) * 0.4);
    return `rgb(${r},${g},${b})`;
}

function applyShopItem(state, itemId) {
    if (itemId === 'atk_boost') ['astrid','hilda','bjorn'].forEach(id => state.permanentUpgrades[id].atk += 2);
    else if (itemId === 'hp_boost') ['astrid','hilda','bjorn'].forEach(id => state.permanentUpgrades[id].income += 2);
    else if (itemId === 'speed_boost') ['astrid','hilda','bjorn'].forEach(id => state.permanentUpgrades[id].atkSpeed += 2);
    saveGameState(state);
}

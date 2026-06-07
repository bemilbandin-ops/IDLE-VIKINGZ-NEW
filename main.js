import { state } from './src/gameState.js';
import { ctx, getW, getH, clearScreen, afterDraw, drawProjectiles, spawnHitParticles, triggerShake, drawDebugOverlay } from './src/canvas.js';
import { drawTitleScreen, drawLevelSelectScreen, drawCombatOverlays, handleClick } from './src/screens.js';
import { resetLevelState } from './src/gameState.js';
import { drawHUD, drawHeroPanel, drawBarricade, tickTorches } from './src/ui.js';
import { spawnWave, updateMonsters, checkWaveComplete, loadProgress, onLevelFailed, initWaveTracking } from './src/waves.js';
import { heroAttackTick, updateFloatingTexts } from './src/combat.js';
import { updateProjectiles, updateCombatEffects } from './src/projectiles.js';
import { levels } from './data/levels.js';
import { gearPool } from './data/gear.js';
import { saveGameState } from './src/utils.js';
import { autoPickRandomSkill } from './src/skills.js';
import { checkAchievements, getAchievementIncomeMultiplier, getAchievementOfflineMultiplier, grantGold } from './src/achievements.js';

window._gearData = { gearPool };

let lastTime = 0;
let fpsTime = 0;
let frameCount = 0;
let autoSaveTimer = 0;
let tabHidden = false;
let tabHiddenAt = 0;

// Gold/hr rates matching loadProgress calculation
const IDLE_RATES = [20, 30, 45, 65, 90, 120, 155, 195, 240, 290, 345]; // indexed by highestUnlockedLevel
function idleGoldPerSecond(state) {
    const rate = IDLE_RATES[Math.min(state.highestUnlockedLevel, IDLE_RATES.length - 1)];
    return (rate * getAchievementIncomeMultiplier(state)) / 3600;
}

// Load saved progress on startup
loadProgress(state);
state.gameSpeed = state.autoPickSkills ? 2 : 1;
state.displayGold = state.gold;

// ── Pause/resume when tab is hidden ─────────────────────────────────────────
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabHidden = true;
        tabHiddenAt = performance.now();
        saveGameState(state);
    } else {
        tabHidden = false;
        // When tab comes back, compute how long we were hidden
        // and credit idle gold (handled like offline — instant grant)
        const hiddenMs = performance.now() - tabHiddenAt;
        const hiddenSec = hiddenMs / 1000;
        if (hiddenSec >= 60) {
            const cappedSec = Math.min(hiddenSec, 12 * 3600);
            const earned = Math.floor(idleGoldPerSecond(state) * getAchievementOfflineMultiplier(state) * cappedSec);
            if (earned > 0) {
                const mins = Math.floor(hiddenSec / 60);
                const hrs = Math.floor(mins / 60);
                const dispTime = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
                state.pendingOfflineGold = earned;
                state.pendingOfflineTime = dispTime;
            }
        }
        // Reset lastTime so dt doesn't spike after returning
        lastTime = performance.now();
    }
});

// Save on tab close/refresh
window.addEventListener('beforeunload', () => { saveGameState(state); });

const canvas = document.getElementById('gameCanvas');

canvas.addEventListener('mousemove', (e) => {
    state.mouse.x = e.offsetX;
    state.mouse.y = e.offsetY;
});

canvas.addEventListener('click', (e) => {
    const W = getW(), H = getH();

    // Offline gold collect popup — intercept any click
    if (state.pendingOfflineGold > 0) {
        grantGold(state, state.pendingOfflineGold);
        state.pendingOfflineGold = 0;
        state.pendingOfflineTime = '';
        saveGameState(state);
        return;
    }

    const result = handleClick(state, state.currentLevel, e.offsetX, e.offsetY, W, H);
    if (result && result.action === 'startLevel') {
        startLevel(result.levelIndex, W, H);
    } else if (result && result.action === 'quitToMenu') {
        saveGameState(state);
        state.screen = 'title';
        state.shopOpen = false;
        state.heroUpgradeOpen = false;
        state.gearOpen = false;
        state.achievementsOpen = false;
    } else if (result && result.action === 'retry') {
        startLevel(state.currentLevel, W, H);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.screen === 'combat') {
        saveGameState(state);
        state.screen = 'title';
    }
    if (e.key === 'Enter' && state.screen === 'title') state.screen = 'levelSelect';
    if (e.key.toLowerCase() === 'd') state.debugMode = !state.debugMode;
});

function startLevel(levelIndex, W, H) {
    state.currentLevel = levelIndex;
    state.sessionGold = 0;
    state.runStartedAt = Date.now();
    resetLevelState(state, levelIndex, W, H);
    state.screen = 'combat';
    spawnWave(state, levels[state.currentLevel]);
    initWaveTracking(state);
}

function drawOfflinePopup(ctx, W, H) {
    if (!state.pendingOfflineGold || state.pendingOfflineGold <= 0) return;

    // Dim entire screen
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);

    const pW = Math.min(W * 0.7, 440);
    const pH = 220;
    const pX = W / 2 - pW / 2;
    const pY = H / 2 - pH / 2;

    // Panel
    ctx.fillStyle = '#1a140a';
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pX, pY, pW, pH, 12);
    ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // Title
    ctx.font = `bold 22px 'Cinzel', serif`;
    ctx.fillStyle = '#f0c040';
    ctx.shadowColor = '#d4a017'; ctx.shadowBlur = 12;
    ctx.fillText('Welcome Back, Viking!', W / 2, pY + 42);
    ctx.shadowBlur = 0;

    // Time away
    ctx.font = `16px 'Crimson Text', serif`;
    ctx.fillStyle = '#ccc';
    ctx.fillText(`You were away for ${state.pendingOfflineTime}`, W / 2, pY + 78);

    // Gold earned
    ctx.font = `bold 28px 'Cinzel', serif`;
    ctx.fillStyle = '#f0c040';
    ctx.shadowColor = '#c87820'; ctx.shadowBlur = 10;
    ctx.fillText(`+ ${state.pendingOfflineGold} Gold`, W / 2, pY + 120);
    ctx.shadowBlur = 0;

    ctx.font = `13px 'Crimson Text', serif`;
    ctx.fillStyle = '#888';
    const rate = IDLE_RATES[Math.min(state.highestUnlockedLevel, IDLE_RATES.length - 1)];
    ctx.fillText(`Earning rate: ${rate} gold/hr (${state.highestUnlockedLevel} levels cleared)`, W / 2, pY + 150);

    // Click to collect button
    const bW = 200, bH = 44;
    const bX = W / 2 - bW / 2, bY = pY + pH - 60;
    const hov = state.mouse.x >= bX && state.mouse.x <= bX + bW &&
                state.mouse.y >= bY && state.mouse.y <= bY + bH;
    ctx.fillStyle = hov ? '#c87820' : '#8b6010';
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 8);
    ctx.fill(); ctx.stroke();
    ctx.font = `bold 15px 'Cinzel', serif`;
    ctx.fillStyle = '#fff8e0';
    ctx.fillText('Collect!', W / 2, bY + bH / 2);
}

function update(dt) {
    checkAchievements(state);
    // Don't update game logic if tab is hidden (RAF already pauses, but just in case)
    if (tabHidden) return;

    // Accumulate idle gold passively even while on title/menu
    state.idleGoldTimer = (state.idleGoldTimer || 0) + dt;
    if (state.idleGoldTimer >= 1) {
        state.idleGoldTimer -= 1;
        grantGold(state, idleGoldPerSecond(state)); // tiny per-second passive drip
    }

    // Keep the visible gold counter calm/readable; actual gold still changes immediately.
    state.goldDisplayTimer = (state.goldDisplayTimer || 0) + dt;
    if (state.goldDisplayTimer >= 1) {
        state.goldDisplayTimer = 0;
        state.displayGold = state.gold;
    }

    if (state.screen === 'combat') {
        if (state.levelComplete || state.levelFailed) return;
        if (state.pendingSkillChoice && state.autoPickSkills) autoPickRandomSkill(state);
        if (state.pendingSkillChoice) return;

        state.gameSpeed = state.autoPickSkills ? 2 : 1;
        const combatDt = dt * state.gameSpeed;
        const hpBefore = {};
        state.monsters.forEach(m => { hpBefore[m.id] = m.hp; });

        updateMonsters(state, combatDt);
        heroAttackTick(state, combatDt);
        updateProjectiles(state, combatDt);
        updateCombatEffects(state, combatDt);
        updateFloatingTexts(state, combatDt);
        checkWaveComplete(state, combatDt);
        checkAchievements(state);

        state.monsters.forEach(m => {
            if (hpBefore[m.id] !== undefined && m.hp < hpBefore[m.id] && !m.dead) {
                spawnHitParticles(m.x, m.y, m.defId === 'boss' ? '#ff6600' : '#cc3300');
                if (hpBefore[m.id] - m.hp > 40) triggerShake(3);
            }
        });

        if (state.barricade.dead && !state.levelFailed) {
            state.levelFailed = true;
            triggerShake(12);
            onLevelFailed(state);
        }

        // Auto-save every 30s during combat
        autoSaveTimer += combatDt;
        if (autoSaveTimer >= 30) {
            autoSaveTimer = 0;
            saveGameState(state);
        }

        tickTorches(combatDt);
    }
}

let fps = 0;


function drawCurrentLevelTint(ctx, W, H) {
    if (state.screen !== 'combat') return;
    const tint = levels[state.currentLevel]?.backgroundTint;
    if (!tint) return;
    ctx.save();
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

function draw(now) {
    const W = getW(), H = getH();
    clearScreen(now);
    drawCurrentLevelTint(ctx, W, H);

    if (state.screen === 'title') {
        drawTitleScreen(ctx, W, H, state);
    } else if (state.screen === 'levelSelect') {
        drawLevelSelectScreen(ctx, W, H, state);
    } else if (state.screen === 'combat') {
        drawHUD(ctx, W, H, state);
        drawBarricade(ctx, W, H, state);
        drawProjectiles(ctx, state);
        drawHeroPanel(ctx, W, H, state);
        drawCombatOverlays(ctx, W, H, state);
    }

    // Offline popup always drawn on top
    if (state.pendingOfflineGold > 0) {
        drawOfflinePopup(ctx, W, H);
    }

    drawDebugOverlay(ctx, W, H, state, fps);
    afterDraw();
}

function loop(now) {
    if (tabHidden) {
        requestAnimationFrame(loop);
        return;
    }
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    frameCount++;
    fpsTime += dt;
    if (fpsTime >= 1) { fps = frameCount; frameCount = 0; fpsTime = 0; }

    update(dt);
    draw(now);
    requestAnimationFrame(loop);
}

lastTime = performance.now();
requestAnimationFrame(loop);

window.gameState = state;
console.log('Vikingfall — v2.1 loaded');
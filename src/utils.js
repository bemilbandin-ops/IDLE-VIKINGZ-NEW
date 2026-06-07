export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function getDisplayedGold(state) {
    return typeof state.displayGold === 'number' ? state.displayGold : (state.gold || 0);
}

export function formatGold(n) {
    if (n >= 1000000) return Math.floor(n / 1000000) + 'M';
    if (n >= 1000) return Math.floor(n / 1000) + 'K';
    return Math.floor(n).toString();
}

export function hexToRgb(hex) {
    if (!hex || hex.length < 7) return '128,128,128';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

export function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

export function saveGameState(state) {
    try {
        const save = {
            highestUnlockedLevel: state.highestUnlockedLevel,
            gold: state.gold,
            shards: state.shards,
            permanentUpgrades: state.permanentUpgrades,
            equippedGear: state.equippedGear || { weapon: null, armor: null, relic: null },
            gearInventory: state.gearInventory || [],
            achievementStats: state.achievementStats || {},
            achievements: state.achievements || { claimed: {}, ready: {} },
            achievementRewards: state.achievementRewards || { incomePercent: 0, offlineGoldPercent: 0 },
<<<<<<< HEAD
=======
            heroAscensions: state.heroAscensions || {},
            firstClearShardRewards: state.firstClearShardRewards || {},
>>>>>>> d12e53c (hp bars, more levels etc)
            autoPickSkills: state.autoPickSkills === true,
            lastSeen: Date.now()
        };
        localStorage.setItem('vikingfall_save', JSON.stringify(save));
    } catch(e) {
        console.warn('Could not save progress:', e);
    }
}

// Gold per hour based on completed levels
// Scales by completed levels. Index 0 means no levels cleared yet.
export function idleGoldPerHour(highestUnlockedLevel) {
    const rates = [20, 30, 45, 65, 90, 120, 155, 195, 240, 290, 345];
    return rates[Math.min(highestUnlockedLevel, rates.length - 1)];
}

// Compute offline gold earned since lastSeen, capped at 12 hours
export function computeOfflineGold(save) {
    if (!save || !save.lastSeen) return 0;
    const elapsed = (Date.now() - save.lastSeen) / 1000; // seconds
    if (elapsed < 60) return 0; // ignore tiny gaps
    const cappedSeconds = Math.min(elapsed, 12 * 3600);
    const rate = idleGoldPerHour(save.highestUnlockedLevel || 0);
    return Math.floor(rate * cappedSeconds / 3600);
}

export function getShopPanelDims(W, H) {
    const pW = Math.min(W * 0.58, 500), pH = H * 0.72;
    return { pW, pH, pX: W / 2 - pW / 2, pY: H / 2 - pH / 2 };
}

export function getHeroUpgradePanelDims(W, H) {
    const pW = Math.min(W * 0.76, 700), pH = H * 0.78;
    return { pW, pH, pX: W / 2 - pW / 2, pY: H / 2 - pH / 2 };
}

export function uuid() {
    return Math.random().toString(36).substring(2, 11);
}
import { heroes } from '../data/heroes.js';
import { levels } from '../data/levels.js';
import { applyAscensionStats, createDefaultHeroAscensions } from './ascension.js';

export const state = {
    screen: 'title',
    currentLevel: 0,
    currentWave: 0,
    party: { level: 1, exp: 0, activeSkills: [] },
    heroes: [],
    monsters: [],
    projectiles: [],
    combatEffects: [],
    barricade: { hp: 500, maxHp: 500, dead: false },
    floatingTexts: [],
    gold: 0,
    displayGold: 0,
    goldDisplayTimer: 0,
    shards: { astrid: 0, hilda: 0, bjorn: 0 },
    heroAscensions: createDefaultHeroAscensions(),
    firstClearShardRewards: {},
    pendingShardRewards: [],
    permanentUpgrades: {
        astrid: { atk: 0, income: 0, atkSpeed: 0 },
        hilda: { atk: 0, income: 0, atkSpeed: 0 },
        bjorn: { atk: 0, income: 0, atkSpeed: 0 }
    },
    // Gear system — 3 slots, each holds one gear piece id (or null)
    equippedGear: { weapon: null, armor: null, relic: null },
    // Inventory: array of gear ids collected
    gearInventory: [],
    // Pending gear rewards after level end
    pendingGearRewards: [],
    sessionGold: 0,
    runStartedAt: 0,
    debugMode: false,
    mouse: { x: 0, y: 0 },
    highestUnlockedLevel: 0,
    // Idle system
    idleGoldTimer: 0,
    pendingOfflineGold: 0,
    pendingOfflineTime: '',
    waveCleared: false,
    waveTransitionTimer: 0,
    waveTransitioning: false,
    bossWarningsShown: {},
    levelComplete: false,
    levelFailed: false,
    // Skill selection popup
    pendingSkillChoice: false,
    skillChoices: [],
    autoPickSkills: false,
    gameSpeed: 1,
    // Shop & hero upgrade screen state
    shopOpen: false,
    heroUpgradeOpen: false,
    gearOpen: false,
    achievementsOpen: false,
    achievementStats: {
        monstersDefeated: 0,
        totalGoldEarned: 0,
        level1Cleared: false,
        firstGearEquipped: false,
        partyLevel5Reached: false,
        gearPiecesCollected: 0
    },
    achievements: { claimed: {}, ready: {} },
    achievementRewards: { incomePercent: 0, offlineGoldPercent: 0 },
    // Shop items available on title screen
    shopItems: [
        { id: 'atk_boost', name: 'Sharpened Blades', desc: '+10% ATK for all heroes', cost: 100 },
        { id: 'hp_boost', name: 'Golden Ledger', desc: '+2 Income for all heroes', cost: 80 },
        { id: 'speed_boost', name: 'Swift Bowstrings', desc: '+10% ATK Speed for all heroes', cost: 120 },
    ]
};

export function resetLevelState(state, levelIndex, W, H) {
    const levelData = levels[levelIndex];

    state.currentWave = 0;
    state.waveCleared = false;
    state.waveTransitionTimer = 0;
    state.waveTransitioning = false;
    state.bossWarningsShown = {};
    state.levelComplete = false;
    state.levelFailed = false;
    state.pendingSkillChoice = false;
    state.skillChoices = [];
    state.monsters = [];
    state.projectiles = [];
    state.combatEffects = [];
    state.floatingTexts = [];
    state.party = { level: 1, exp: 0, activeSkills: [] };
    state.pendingGearRewards = [];
    state.pendingShardRewards = [];
    state.levelCompletedShardHero = null;

    const heroSize = Math.min(H * 0.12, 80);
    const heroSpacing = Math.min(Math.max(heroSize * 2.25, W * 0.20), W * 0.29);
    const centerX = W / 2;
    const panelH = Math.max(110, H * 0.16);
    const panelY = H - panelH;
    const heroY = panelY + panelH * 0.32;

    state.heroes = heroes.map((hero, i) => ({
        ...hero,
        x: centerX - heroSpacing + i * heroSpacing,
        y: heroY,
        hp: hero.baseStats.hp,
        maxHp: hero.baseStats.hp,
        atk: hero.baseStats.atk,
        atkSpeed: hero.baseStats.atkSpeed,
        atkTimer: 0,
        dead: false,
        activeSkills: []
    }));

    state.barricade = { hp: levelData.barricadeHp, maxHp: levelData.barricadeHp, dead: false };

    // Apply ascension and equipped gear effects on level start
    applyAscensionStats(state);
    applyEquippedGear(state);
}

export function applyEquippedGear(state) {
    // Gear is applied fresh each level reset, so effects are baked into hero stats
    // This is called after heroes are reset
    const { gearPool } = window._gearData || {};
    if (!gearPool) return;
    Object.values(state.equippedGear).forEach(gearId => {
        if (!gearId) return;
        const gear = gearPool.find(g => g.id === gearId);
        if (gear && typeof gear.effect === 'function') gear.effect(state);
    });
}
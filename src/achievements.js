import { saveGameState } from './utils.js';

export const ACHIEVEMENTS = [
    {
        id: 'defeat_100_monsters',
        name: 'Monster Breaker',
        requirement: 'Defeat 100 monsters',
        reward: '+25 gold',
        isComplete: stats => (stats.monstersDefeated || 0) >= 100,
        progressText: stats => `${stats.monstersDefeated || 0}/100`
    },
    {
        id: 'earn_1000_gold',
        name: 'Raid Treasurer',
        requirement: 'Earn 1,000 total gold',
        reward: '+1% permanent income',
        isComplete: stats => (stats.totalGoldEarned || 0) >= 1000,
        progressText: stats => `${Math.floor(stats.totalGoldEarned || 0)}/1,000`
    },
    {
        id: 'clear_level_1',
        name: 'Northern Victor',
        requirement: 'Clear Level 1',
        reward: 'Cosmetic badge only',
        isComplete: stats => stats.level1Cleared === true,
        progressText: stats => stats.level1Cleared ? 'Done' : 'Not yet'
    },
    {
        id: 'equip_first_gear',
        name: 'Battle Ready',
        requirement: 'Equip first gear piece',
        reward: '+25 gold',
        isComplete: stats => stats.firstGearEquipped === true,
        progressText: stats => stats.firstGearEquipped ? 'Done' : 'Not yet'
    },
    {
        id: 'party_level_5',
        name: 'Seasoned Warband',
        requirement: 'Reach party level 5 in combat',
        reward: '+1% permanent income',
        isComplete: stats => stats.partyLevel5Reached === true,
        progressText: stats => stats.partyLevel5Reached ? 'Done' : 'Not yet'
    },
    {
        id: 'collect_5_gear',
        name: 'Hoard Keeper',
        requirement: 'Collect 5 gear pieces',
        reward: '+5% offline gold',
        isComplete: stats => (stats.gearPiecesCollected || 0) >= 5,
        progressText: stats => `${stats.gearPiecesCollected || 0}/5`
    }
];

const REWARD_EFFECTS = {
    defeat_100_monsters: { gold: 25 },
    earn_1000_gold: { incomePercent: 1 },
    clear_level_1: { cosmetic: true },
    equip_first_gear: { gold: 25 },
    party_level_5: { incomePercent: 1 },
    collect_5_gear: { offlineGoldPercent: 5 }
};

export function ensureAchievementState(state) {
    if (!state.achievementStats) state.achievementStats = {};
    if (!state.achievements) state.achievements = {};
    if (!state.achievements.claimed) state.achievements.claimed = {};
    if (!state.achievements.ready) state.achievements.ready = {};
    if (!state.achievementRewards) state.achievementRewards = {};
    if (typeof state.achievementRewards.incomePercent !== 'number') state.achievementRewards.incomePercent = 0;
    if (typeof state.achievementRewards.offlineGoldPercent !== 'number') state.achievementRewards.offlineGoldPercent = 0;

    state.achievementStats.monstersDefeated = state.achievementStats.monstersDefeated || 0;
    state.achievementStats.totalGoldEarned = state.achievementStats.totalGoldEarned || 0;
    if (state.achievementStats.migratedGoldSnapshot !== true) {
        state.achievementStats.totalGoldEarned = Math.max(state.achievementStats.totalGoldEarned, state.gold || 0);
        state.achievementStats.migratedGoldSnapshot = true;
    }
    state.achievementStats.gearPiecesCollected = state.achievementStats.gearPiecesCollected || 0;
    state.achievementStats.level1Cleared = state.achievementStats.level1Cleared === true;
    state.achievementStats.firstGearEquipped = state.achievementStats.firstGearEquipped === true;
    state.achievementStats.partyLevel5Reached = state.achievementStats.partyLevel5Reached === true;
}

export function grantGold(state, amount, countsTowardAchievements = true) {
    if (!amount || amount <= 0) return;
    ensureAchievementState(state);
    state.gold += amount;
    if (countsTowardAchievements) {
        state.achievementStats.totalGoldEarned += amount;
    }
}

export function recordMonsterDefeated(state) {
    ensureAchievementState(state);
    state.achievementStats.monstersDefeated += 1;
}

export function checkAchievements(state) {
    ensureAchievementState(state);
    const stats = state.achievementStats;

    stats.gearPiecesCollected = Math.max(stats.gearPiecesCollected || 0, (state.gearInventory || []).length);
    stats.firstGearEquipped = stats.firstGearEquipped || Object.values(state.equippedGear || {}).some(Boolean);
    stats.level1Cleared = stats.level1Cleared || (state.highestUnlockedLevel || 0) >= 1;
    stats.partyLevel5Reached = stats.partyLevel5Reached || ((state.party && state.party.level) || 1) >= 5;

    ACHIEVEMENTS.forEach(achievement => {
        if (!state.achievements.claimed[achievement.id] && achievement.isComplete(stats)) {
            state.achievements.ready[achievement.id] = true;
        }
    });
}

export function getAchievementList(state) {
    checkAchievements(state);
    return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        progress: achievement.progressText(state.achievementStats),
        ready: state.achievements.ready[achievement.id] === true,
        claimed: state.achievements.claimed[achievement.id] === true
    }));
}

export function claimAchievement(state, achievementId) {
    checkAchievements(state);
    if (!state.achievements.ready[achievementId] || state.achievements.claimed[achievementId]) return false;

    const reward = REWARD_EFFECTS[achievementId] || {};
    if (reward.gold) grantGold(state, reward.gold, false);
    if (reward.incomePercent) state.achievementRewards.incomePercent += reward.incomePercent;
    if (reward.offlineGoldPercent) state.achievementRewards.offlineGoldPercent += reward.offlineGoldPercent;

    state.achievements.claimed[achievementId] = true;
    state.achievements.ready[achievementId] = false;
    saveGameState(state);
    return true;
}

export function getAchievementIncomeMultiplier(state) {
    ensureAchievementState(state);
    return 1 + (state.achievementRewards.incomePercent || 0) / 100;
}

export function getAchievementOfflineMultiplier(state) {
    ensureAchievementState(state);
    return 1 + (state.achievementRewards.offlineGoldPercent || 0) / 100;
}

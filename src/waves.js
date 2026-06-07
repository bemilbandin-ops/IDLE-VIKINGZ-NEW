import { uuid, saveGameState } from './utils.js';
import { checkAchievements, getAchievementIncomeMultiplier, getAchievementOfflineMultiplier, grantGold, recordMonsterDefeated } from './achievements.js';
import { monsters } from '../data/monsters.js';
import { levels } from '../data/levels.js';
import { heroes } from '../data/heroes.js';
import { rollBossGearDrop, rollGearDrops } from '../data/gear.js';
import { getW, getH } from './canvas.js';
import { autoPickRandomSkill, getValidSkillChoices } from './skills.js';
<<<<<<< HEAD
=======
import { HERO_IDS, getHeroDisplayName, grantFirstClearShards, rollRandomShardDrop, normalizeHeroAscensions, normalizeShards, normalizeFirstClearRewards } from './ascension.js';
import { getExpNeededForPartyLevel } from './progression.js';
>>>>>>> d12e53c (hp bars, more levels etc)

function getCombatTopBorderY(H) {
    const hudH = Math.max(52, H * 0.07);
    return hudH + 10;
}
<<<<<<< HEAD
=======

const BOSS_GOLD_MULTIPLIER = 3;
const BOSS_EXP_MULTIPLIER = 2;
const BOSS_SHARD_DROP_CHANCE = 0.45;
const BOSS_SHARD_AMOUNT = 2;

function getLevelDataForMonster(monster) {
    return levels[monster.levelIndex ?? 0] || {};
}

function isBossWaveNumber(waveNumber) {
    return waveNumber % 10 === 0;
}

function showBossWarning(state, waveNumber) {
    state.bossWarningsShown = state.bossWarningsShown || {};
    if (state.bossWarningsShown[waveNumber]) return;
    state.bossWarningsShown[waveNumber] = true;

    const W = getW();
    const H = getH();
    addFloatingText(state, W / 2, H * 0.24, 'BOSS APPROACHING', '#ff7a18', -18, { fontSize: 26, fadeRate: 0.35, shadowBlur: 10 });
}
>>>>>>> d12e53c (hp bars, more levels etc)

export function spawnWave(state, levelData) {
    const levelIndex = state.currentLevel;
    const W = getW();
    const H = getH();
    const monsterPool = levelData.monsterPool || levels[levelIndex].monsterPool;
    const waveNumber = state.currentWave + 1;
    const isBossWave = isBossWaveNumber(waveNumber);
    const count = isBossWave ? 1 : 2 + state.currentWave;

<<<<<<< HEAD
=======
    if (isBossWave) showBossWarning(state, waveNumber);

>>>>>>> d12e53c (hp bars, more levels etc)
    const edgePad = Math.max(34, W * 0.045);
    const spawnWidth = W - edgePad * 2;
    const startX = edgePad;
    const topBorderY = getCombatTopBorderY(H);

    for (let i = 0; i < count; i++) {
        const defId = isBossWave ? 'boss' : monsterPool[Math.floor(Math.random() * monsterPool.length)];
        const monsterDef = monsters.find(m => m.id === defId);

        const x = startX + (spawnWidth / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 18;
        const y = topBorderY - monsterDef.size.h * 0.95 - i * 22;

        state.monsters.push({
            id: uuid(),
            defId,
            x,
            y,
            hp: monsterDef.baseStats.hp * (levels[levelIndex].hpMult || 1),
            maxHp: monsterDef.baseStats.hp * (levels[levelIndex].hpMult || 1),
            atk: monsterDef.baseStats.atk * (levels[levelIndex].atkMult || 1),
            speed: monsterDef.baseStats.speed * 2.5,
            baseSpeed: monsterDef.baseStats.speed * 2.5,
            w: monsterDef.size.w,
            h: monsterDef.size.h,
            state: 'moving',
            attackTimer: 0,
            attackDelay: 0.8 + Math.random() * 0.4,
            attackDelayUsed: false,
            statusEffects: [],
            dead: false,
            rewardTextSpawned: false,
            expReward: monsterDef.expReward,
            goldReward: monsterDef.goldReward * (levels[levelIndex].goldMult || 1),
            isBoss: isBossWave,
            bossGoldMultiplier: isBossWave ? BOSS_GOLD_MULTIPLIER * (levelData.bossGoldMultiplier || 1) : 1,
            bossExpMultiplier: isBossWave ? BOSS_EXP_MULTIPLIER * (levelData.bossExpMultiplier || 1) : 1,
            waveIndex: state.currentWave,  // track which wave this monster belongs to
            levelIndex
        });
    }
}

function buildSkillChoices(state) {
    const chosenIds = new Set((state.party.activeSkills || []).map(s => s && s.id));
    const pool = [];
    heroes.forEach(heroDef => {
        if (!Array.isArray(heroDef.skillPool)) return;
        heroDef.skillPool.forEach(skill => {
            if (skill && !chosenIds.has(skill.id)) pool.push(skill);
        });
    });
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return getValidSkillChoices(pool.slice(0, 3));
<<<<<<< HEAD
}

function triggerSkillChoice(state) {
    const choices = buildSkillChoices(state);

    if (state.autoPickSkills) {
        autoPickRandomSkill(state, choices);
        return;
    }

    if (choices.length === 0) {
        state.pendingSkillChoice = false;
        state.skillChoices = [];
        return;
    }

    state.pendingSkillChoice = true;
    state.skillChoices = choices;
}

const EXP_PER_LEVEL = 60;
=======
}

function triggerSkillChoice(state) {
    const choices = buildSkillChoices(state);

    if (state.autoPickSkills) {
        autoPickRandomSkill(state, choices);
        return;
    }

    if (choices.length === 0) {
        state.pendingSkillChoice = false;
        state.skillChoices = [];
        return;
    }

    state.pendingSkillChoice = true;
    state.skillChoices = choices;
}

>>>>>>> d12e53c (hp bars, more levels etc)
const BASE_EXP_REWARD_SCALE = 0.6;
const EXP_GAIN_MULTIPLIER = 1.2;

function getMonsterExpReward(monster) {
<<<<<<< HEAD
    return monster.expReward * BASE_EXP_REWARD_SCALE * EXP_GAIN_MULTIPLIER;
=======
    const bossMultiplier = monster.isBoss ? (monster.bossExpMultiplier || BOSS_EXP_MULTIPLIER) : 1;
    return monster.expReward * BASE_EXP_REWARD_SCALE * EXP_GAIN_MULTIPLIER * bossMultiplier;
}

function formatRewardAmount(amount) {
    const rounded = Math.round((Number(amount) || 0) * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

function addFloatingText(state, x, y, text, color = '#f0c040', vy = -30, options = {}) {
    state.floatingTexts = state.floatingTexts || [];
    state.floatingTexts.push({ x, y, text, color, vy, alpha: 1, ...options });
}

function spawnRewardFloatingTexts(state, monster, goldAmount, expAmount) {
    if (monster.rewardTextSpawned) return;
    monster.rewardTextSpawned = true;

    const baseY = monster.y - monster.h * 0.35;
    addFloatingText(state, monster.x - 6, baseY - 12, `+${formatRewardAmount(goldAmount)}g`, '#f0c040', -34);
    addFloatingText(state, monster.x + 8, baseY + 4, `+${formatRewardAmount(expAmount)} EXP`, '#7ec8e3', -30);
}

function grantBossRareRewards(state, monster) {
    if (!monster.isBoss || monster.bossRareRewardsGranted) return;
    monster.bossRareRewardsGranted = true;

    const levelData = getLevelDataForMonster(monster);
    const shardChance = levelData.bossShardDropChance ?? BOSS_SHARD_DROP_CHANCE;
    const shardAmount = levelData.bossShardAmount ?? BOSS_SHARD_AMOUNT;

    if (Math.random() < shardChance) {
        normalizeShards(state);
        const heroId = HERO_IDS[Math.floor(Math.random() * HERO_IDS.length)];
        state.shards[heroId] += shardAmount;
        state.pendingShardRewards = state.pendingShardRewards || [];
        state.pendingShardRewards.push({ type: 'boss', heroId, amount: shardAmount });
        addFloatingText(state, monster.x, monster.y - monster.h * 0.85, `+${shardAmount} ${getHeroDisplayName(heroId)} shards`, '#7ec8e3', -24);
    }

    const gearDrop = rollBossGearDrop();
    if (gearDrop) {
        state.gearInventory = state.gearInventory || [];
        state.pendingGearRewards = state.pendingGearRewards || [];
        if (!state.gearInventory.includes(gearDrop.id)) state.gearInventory.push(gearDrop.id);
        state.pendingGearRewards.push(gearDrop);
        addFloatingText(state, monster.x, monster.y - monster.h * 1.1, 'GEAR FOUND!', '#d090ff', -22);
    }
}

function addPartyExp(state, amount) {
    if (!state.party) state.party = { level: 1, exp: 0, activeSkills: [] };
    state.party.exp += amount;

    while (state.party.exp >= getExpNeededForPartyLevel(state.party.level)) {
        const xpNeeded = getExpNeededForPartyLevel(state.party.level);
        state.party.level++;
        state.party.exp -= xpNeeded;
        triggerSkillChoice(state);
    }
}


function defeatMonster(state, monster) {
    if (!monster || monster.dead) return;

    triggerShatterIfNeeded(state, monster);
    monster.dead = true;
    recordMonsterDefeated(state);

    const incomeMult = (1 + (state.permanentUpgrades.astrid.income + state.permanentUpgrades.hilda.income + state.permanentUpgrades.bjorn.income) * 0.05) * getAchievementIncomeMultiplier(state);
    const bossGoldMultiplier = monster.isBoss ? (monster.bossGoldMultiplier || BOSS_GOLD_MULTIPLIER) : 1;
    const goldReward = Math.floor(monster.goldReward * bossGoldMultiplier * incomeMult);
    const expReward = getMonsterExpReward(monster);

    grantGold(state, goldReward);
    state.sessionGold += goldReward;
    addPartyExp(state, expReward);
    spawnRewardFloatingTexts(state, monster, goldReward, expReward);
    grantBossRareRewards(state, monster);
}

function triggerShatterIfNeeded(state, monster) {
    const hilda = state.heroes?.find(h => h.id === 'hilda');
    if (!hilda?.shatter || monster.shatterTriggered) return;
    const chilled = monster.statusEffects?.some(e => e.type === 'chilled' || e.type === 'frozen');
    if (!chilled) return;
    monster.shatterTriggered = true;
    state.combatEffects = state.combatEffects || [];
    state.combatEffects.push({ type: 'shatter', x: monster.x, y: monster.y, age: 0, duration: 0.55 });
    for (const other of state.monsters || []) {
        if (other.dead || other.id === monster.id) continue;
        if (Math.hypot(other.x - monster.x, other.y - monster.y) <= 70) {
            other.hp -= 50;
            state.floatingTexts = state.floatingTexts || [];
            state.floatingTexts.push({ x: other.x, y: other.y - other.h * 0.5, text: 'SHATTER', color: '#9eefff', vy: -30, alpha: 1 });
        }
    }
>>>>>>> d12e53c (hp bars, more levels etc)
}

export function updateMonsters(state, dt) {
    const H = getH();
    const barricadeY = H * 0.7;

    state.monsters.forEach(monster => {
        if (monster.dead) return;

        let speedMult = 1;
        let isFrozen = false;
        const activeEffects = [];

        monster.statusEffects = monster.statusEffects.filter(effect => {
            effect.duration -= dt;
            if (effect.duration > 0) {
                activeEffects.push(effect);
                if (effect.type === 'chilled' || effect.type === 'frozen') {
                    speedMult = Math.min(speedMult, effect.speedMult);
                    if (effect.type === 'frozen') isFrozen = true;
                }
            }
            return effect.duration > 0;
        });

        if (isFrozen) {
            monster.statusEffects = activeEffects;
            return;
        }

        const effectiveSpeed = monster.speed * speedMult;

        // If monster has reached barricade, stop moving and attack on a timer
        if (monster.y + monster.h >= barricadeY) {
            // Pin monster just above barricade so it doesn't clip through
            monster.y = barricadeY - monster.h;

            // Check if hero projectiles killed this monster while it was at the barricade
            if (monster.hp <= 0) {
<<<<<<< HEAD
                monster.dead = true;
                recordMonsterDefeated(state);
                const incomeMult = (1 + (state.permanentUpgrades.astrid.income + state.permanentUpgrades.hilda.income + state.permanentUpgrades.bjorn.income) * 0.05) * getAchievementIncomeMultiplier(state);
                const goldReward = Math.floor(monster.goldReward * incomeMult);
                grantGold(state, goldReward);
                state.sessionGold += goldReward;
                const scaledExp = getMonsterExpReward(monster);
                state.party.exp += scaledExp;
                while (state.party.exp >= EXP_PER_LEVEL) {
                    state.party.level++;
                    state.party.exp -= EXP_PER_LEVEL;
                    triggerSkillChoice(state);
                }
=======
                defeatMonster(state, monster);
>>>>>>> d12e53c (hp bars, more levels etc)
                return;
            }

            // Initial attack delay before first hit
            monster.attackTimer = (monster.attackTimer || 0) + dt;
            if (!monster.attackDelayUsed) {
                if (monster.attackTimer < monster.attackDelay) return;
                monster.attackDelayUsed = true;
                monster.attackTimer = 0;
            }

            // Attack every 1 second
            const ATTACK_INTERVAL = 1.0;
            if (monster.attackTimer >= ATTACK_INTERVAL) {
                monster.attackTimer -= ATTACK_INTERVAL;
                state.barricade.hp -= monster.atk;
                if (state.barricade.hp <= 0) state.barricade.dead = true;
            }
            return;
        }

        monster.y += effectiveSpeed * dt;

        if (monster.hp <= 0) {
<<<<<<< HEAD
            monster.dead = true;
            recordMonsterDefeated(state);
            const incomeMult = (1 + (state.permanentUpgrades.astrid.income + state.permanentUpgrades.hilda.income + state.permanentUpgrades.bjorn.income) * 0.05) * getAchievementIncomeMultiplier(state);
            const goldReward = Math.floor(monster.goldReward * incomeMult);
            grantGold(state, goldReward);
            state.sessionGold += goldReward;

            const scaledExp = getMonsterExpReward(monster);
            state.party.exp += scaledExp;

            while (state.party.exp >= EXP_PER_LEVEL) {
                state.party.level++;
                state.party.exp -= EXP_PER_LEVEL;
                triggerSkillChoice(state);
            }
=======
            defeatMonster(state, monster);
>>>>>>> d12e53c (hp bars, more levels etc)
        }
    });
}

export function checkWaveComplete(state, dt) {
    const TOTAL_WAVES = 20;

    if (state.levelComplete || state.levelFailed) return;
    if (state.pendingSkillChoice) return;

    // Count only monsters from the CURRENT wave (by waveIndex)
    const currentWaveMonsters = state.monsters.filter(m => m.waveIndex === state.currentWave);
    if (currentWaveMonsters.length === 0) return; // wave not spawned yet

    const deadInCurrentWave = currentWaveMonsters.filter(m => m.dead).length;
    const aliveInCurrentWave = currentWaveMonsters.length - deadInCurrentWave;

    // Seamless: spawn next wave once 50% of current wave is dead
    // Only do this once per wave (tracked by waveSeamlessTriggered per wave number)
    if (!state.seamlessTriggeredForWave || state.seamlessTriggeredForWave < state.currentWave) {
        if (deadInCurrentWave >= Math.ceil(currentWaveMonsters.length * 0.5)) {
            state.seamlessTriggeredForWave = state.currentWave;
            if (state.currentWave + 1 < TOTAL_WAVES) {
                state.currentWave++;
                spawnWave(state, levels[state.currentLevel]);
            } else if (aliveInCurrentWave === 0) {
                // All waves done and last wave is dead
                triggerVictory(state);
            }
        }
    }

    // Final check: all waves spawned and all monsters dead
    if (state.currentWave >= TOTAL_WAVES - 1) {
        const allDead = state.monsters.every(m => m.dead);
        if (allDead) triggerVictory(state);
    }
}

function triggerVictory(state) {
    if (state.levelComplete) return;
    const gearDrops = rollGearDrops(true);
    gearDrops.forEach(g => {
        if (!state.gearInventory.includes(g.id)) state.gearInventory.push(g.id);
    });
    state.pendingGearRewards = [...(state.pendingGearRewards || []), ...gearDrops];

    const shardRewards = [...(state.pendingShardRewards || [])];
    const firstClearReward = grantFirstClearShards(state, state.currentLevel);
    if (firstClearReward) shardRewards.push(firstClearReward);
    const randomShardDrop = rollRandomShardDrop(state);
    if (randomShardDrop) shardRewards.push(randomShardDrop);
    state.pendingShardRewards = shardRewards;
    state.levelCompletedShardHero = shardRewards.length > 0 ? shardRewards[shardRewards.length - 1].heroId : null;
    state.levelComplete = true;
    checkAchievements(state);
    if (state.currentLevel >= state.highestUnlockedLevel) {
        state.highestUnlockedLevel = state.currentLevel + 1;
    }
    checkAchievements(state);
    saveGameState(state);
}

export function onLevelFailed(state) {
    const gearDrops = rollGearDrops(false);
    gearDrops.forEach(g => {
        if (!state.gearInventory.includes(g.id)) state.gearInventory.push(g.id);
    });
<<<<<<< HEAD
    state.pendingGearRewards = gearDrops;
=======
    state.pendingGearRewards = [...(state.pendingGearRewards || []), ...gearDrops];
>>>>>>> d12e53c (hp bars, more levels etc)
    checkAchievements(state);
    saveGameState(state);
}

export function initWaveTracking(state) {
    state.seamlessTriggeredForWave = -1;
}

export function loadProgress(state) {
    try {
        const raw = localStorage.getItem('vikingfall_save');
        if (!raw) return;
        const save = JSON.parse(raw);
        if (typeof save.highestUnlockedLevel === 'number') state.highestUnlockedLevel = save.highestUnlockedLevel;
        if (typeof save.gold === 'number') state.gold = save.gold;
        if (save.shards) state.shards = save.shards;
        normalizeShards(state);
        if (save.heroAscensions) state.heroAscensions = save.heroAscensions;
        normalizeHeroAscensions(state);
        if (save.firstClearShardRewards) state.firstClearShardRewards = save.firstClearShardRewards;
        normalizeFirstClearRewards(state);
        if (save.permanentUpgrades) state.permanentUpgrades = save.permanentUpgrades;
        if (save.equippedGear) state.equippedGear = save.equippedGear;
        if (save.gearInventory) state.gearInventory = save.gearInventory;
        if (save.achievementStats) state.achievementStats = save.achievementStats;
        if (save.achievements) state.achievements = save.achievements;
        if (save.achievementRewards) state.achievementRewards = save.achievementRewards;
        checkAchievements(state);
        state.autoPickSkills = save.autoPickSkills === true;
<<<<<<< HEAD
=======
        state.gameSpeed = state.autoPickSkills ? 2 : 1;
>>>>>>> d12e53c (hp bars, more levels etc)

        // Compute offline gold
        if (save.lastSeen) {
            const elapsed = (Date.now() - save.lastSeen) / 1000;
            if (elapsed >= 60) {
                const cappedSeconds = Math.min(elapsed, 12 * 3600);
                const rates = [20, 30, 45, 65, 90, 120, 155, 195, 240, 290, 345];
                const rate = rates[Math.min(save.highestUnlockedLevel || 0, rates.length - 1)];
                const offlineGold = Math.floor(rate * getAchievementIncomeMultiplier(state) * getAchievementOfflineMultiplier(state) * cappedSeconds / 3600);
                if (offlineGold > 0) {
                    const offlineHours = Math.floor(elapsed / 3600);
                    const offlineMins = Math.floor((elapsed % 3600) / 60);
                    state.pendingOfflineGold = offlineGold;
                    state.pendingOfflineTime = offlineHours > 0 ? `${offlineHours}h ${offlineMins}m` : `${offlineMins}m`;
                }
            }
        }
    } catch(e) {
        console.warn('Could not load progress:', e);
    }
}
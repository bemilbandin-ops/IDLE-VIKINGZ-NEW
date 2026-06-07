import { uuid, saveGameState } from './utils.js';
import { monsters } from '../data/monsters.js';
import { levels } from '../data/levels.js';
import { heroes } from '../data/heroes.js';
import { rollGearDrops } from '../data/gear.js';
import { getW, getH } from './canvas.js';
import { autoPickRandomSkill, getValidSkillChoices } from './skills.js';

function getCombatTopBorderY(H) {
    const hudH = Math.max(52, H * 0.07);
    return hudH + 10;
}

export function spawnWave(state, levelData) {
    const levelIndex = state.currentLevel;
    const W = getW();
    const H = getH();
    const monsterPool = levelData.monsterPool || levels[levelIndex].monsterPool;
    const isBossWave = (state.currentWave + 1) % 10 === 0;
    const count = isBossWave ? 1 : 2 + state.currentWave;

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
            expReward: monsterDef.expReward,
            goldReward: monsterDef.goldReward * (levels[levelIndex].goldMult || 1),
            waveIndex: state.currentWave  // track which wave this monster belongs to
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
const BASE_EXP_REWARD_SCALE = 0.6;
const EXP_GAIN_MULTIPLIER = 1.2;

function getMonsterExpReward(monster) {
    return monster.expReward * BASE_EXP_REWARD_SCALE * EXP_GAIN_MULTIPLIER;
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
                monster.dead = true;
                const incomeMult = 1 + (state.permanentUpgrades.astrid.income + state.permanentUpgrades.hilda.income + state.permanentUpgrades.bjorn.income) * 0.05;
                const goldReward = Math.floor(monster.goldReward * incomeMult);
                state.gold += goldReward;
                state.sessionGold += goldReward;
                const scaledExp = getMonsterExpReward(monster);
                state.party.exp += scaledExp;
                while (state.party.exp >= EXP_PER_LEVEL) {
                    state.party.level++;
                    state.party.exp -= EXP_PER_LEVEL;
                    triggerSkillChoice(state);
                }
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
            monster.dead = true;
            const incomeMult = 1 + (state.permanentUpgrades.astrid.income + state.permanentUpgrades.hilda.income + state.permanentUpgrades.bjorn.income) * 0.05;
            const goldReward = Math.floor(monster.goldReward * incomeMult);
            state.gold += goldReward;
            state.sessionGold += goldReward;

            const scaledExp = getMonsterExpReward(monster);
            state.party.exp += scaledExp;

            while (state.party.exp >= EXP_PER_LEVEL) {
                state.party.level++;
                state.party.exp -= EXP_PER_LEVEL;
                triggerSkillChoice(state);
            }
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
    state.pendingGearRewards = gearDrops;

    if (Math.random() < 0.1) {
        const heroIds = ['astrid', 'hilda', 'bjorn'];
        const randomHero = heroIds[Math.floor(Math.random() * heroIds.length)];
        state.shards[randomHero]++;
        state.levelCompletedShardHero = randomHero;
    } else {
        state.levelCompletedShardHero = null;
    }
    state.levelComplete = true;
    if (state.currentLevel >= state.highestUnlockedLevel) {
        state.highestUnlockedLevel = state.currentLevel + 1;
    }
    saveGameState(state);
}

export function onLevelFailed(state) {
    const gearDrops = rollGearDrops(false);
    gearDrops.forEach(g => {
        if (!state.gearInventory.includes(g.id)) state.gearInventory.push(g.id);
    });
    state.pendingGearRewards = gearDrops;
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
        if (save.permanentUpgrades) state.permanentUpgrades = save.permanentUpgrades;
        if (save.equippedGear) state.equippedGear = save.equippedGear;
        if (save.gearInventory) state.gearInventory = save.gearInventory;
        state.autoPickSkills = save.autoPickSkills === true;

        // Compute offline gold
        if (save.lastSeen) {
            const elapsed = (Date.now() - save.lastSeen) / 1000;
            if (elapsed >= 60) {
                const cappedSeconds = Math.min(elapsed, 12 * 3600);
                const rates = [20, 30, 45, 65];
                const rate = rates[Math.min(save.highestUnlockedLevel || 0, rates.length - 1)];
                const offlineGold = Math.floor(rate * cappedSeconds / 3600);
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
export const ASCENSION_TIERS = [
    { id: 'common', name: 'Common', costToNext: 20, statMultiplier: 1.00, color: '#aaaaaa' },
    { id: 'rare', name: 'Rare', costToNext: 40, statMultiplier: 1.15, color: '#4a8fa8' },
    { id: 'epic', name: 'Epic', costToNext: 60, statMultiplier: 1.35, color: '#9b4de0' },
    { id: 'legendary', name: 'Legendary', costToNext: 100, statMultiplier: 1.65, color: '#f0a020' },
    { id: 'einherjar', name: 'Einherjar', costToNext: null, statMultiplier: 2.00, color: '#f0d060' }
];

export const HERO_IDS = ['astrid', 'hilda', 'bjorn'];
export const FIRST_CLEAR_SHARD_REWARD = 10;
export const RANDOM_SHARD_DROP_CHANCE = 0.18;
export const RANDOM_SHARD_DROP_AMOUNT = 2;

export function createDefaultHeroAscensions() {
    return HERO_IDS.reduce((acc, id) => {
        acc[id] = 0;
        return acc;
    }, {});
}

export function normalizeHeroAscensions(state) {
    state.heroAscensions = state.heroAscensions || createDefaultHeroAscensions();
    HERO_IDS.forEach(id => {
        const tier = Number(state.heroAscensions[id]);
        state.heroAscensions[id] = Number.isFinite(tier) ? Math.max(0, Math.min(tier, ASCENSION_TIERS.length - 1)) : 0;
    });
}

export function normalizeShards(state) {
    state.shards = state.shards || {};
    HERO_IDS.forEach(id => {
        const amount = Number(state.shards[id]);
        state.shards[id] = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    });
}

export function normalizeFirstClearRewards(state) {
    state.firstClearShardRewards = state.firstClearShardRewards || {};
}

export function getAscensionTier(state, heroId) {
    normalizeHeroAscensions(state);
    return ASCENSION_TIERS[state.heroAscensions[heroId] || 0] || ASCENSION_TIERS[0];
}

export function getNextAscensionTier(state, heroId) {
    normalizeHeroAscensions(state);
    const index = state.heroAscensions[heroId] || 0;
    return ASCENSION_TIERS[index + 1] || null;
}

export function getAscensionCost(state, heroId) {
    return getAscensionTier(state, heroId).costToNext;
}

export function canAscendHero(state, heroId) {
    normalizeHeroAscensions(state);
    normalizeShards(state);
    const cost = getAscensionCost(state, heroId);
    return cost !== null && state.shards[heroId] >= cost;
}

export function ascendHero(state, heroId) {
    if (!canAscendHero(state, heroId)) return false;
    const cost = getAscensionCost(state, heroId);
    state.shards[heroId] -= cost;
    state.heroAscensions[heroId] += 1;
    return true;
}

export function applyAscensionStats(state) {
    normalizeHeroAscensions(state);
    (state.heroes || []).forEach(hero => {
        const tier = getAscensionTier(state, hero.id);
        hero.ascensionTier = tier.id;
        hero.ascensionName = tier.name;
        hero.ascensionMultiplier = tier.statMultiplier;
        hero.maxHp *= tier.statMultiplier;
        hero.hp = hero.maxHp;
        hero.atk *= tier.statMultiplier;
        hero.atkSpeed *= 1 + ((tier.statMultiplier - 1) * 0.35);
    });
}

export function grantFirstClearShards(state, levelIndex) {
    normalizeShards(state);
    normalizeFirstClearRewards(state);
    const key = String(levelIndex);
    if (state.firstClearShardRewards[key]) return null;

    const heroId = HERO_IDS[levelIndex % HERO_IDS.length];
    state.shards[heroId] += FIRST_CLEAR_SHARD_REWARD;
    state.firstClearShardRewards[key] = true;
    return { type: 'firstClear', heroId, amount: FIRST_CLEAR_SHARD_REWARD };
}

export function rollRandomShardDrop(state) {
    normalizeShards(state);
    if (Math.random() >= RANDOM_SHARD_DROP_CHANCE) return null;
    const heroId = HERO_IDS[Math.floor(Math.random() * HERO_IDS.length)];
    state.shards[heroId] += RANDOM_SHARD_DROP_AMOUNT;
    return { type: 'random', heroId, amount: RANDOM_SHARD_DROP_AMOUNT };
}

export function getHeroDisplayName(heroId) {
    if (heroId === 'astrid') return 'Astrid';
    if (heroId === 'hilda') return 'Hilda';
    if (heroId === 'bjorn') return 'Bjorn';
    return heroId;
}

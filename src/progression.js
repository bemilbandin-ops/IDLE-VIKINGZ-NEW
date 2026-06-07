const PARTY_LEVEL_XP_BASE = 45;
const PARTY_LEVEL_XP_GROWTH = 1.11;

export function getExpNeededForPartyLevel(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    return Math.floor(PARTY_LEVEL_XP_BASE * Math.pow(PARTY_LEVEL_XP_GROWTH, safeLevel - 1));
}

// Gear system — 3 gear slots: Weapon, Armor, Relic
// Each piece has rarity: common, rare, epic
// Effects apply to all heroes or party

export const GEAR_SLOTS = ['weapon', 'armor', 'relic'];

export const gearPool = [
    // ── WEAPONS ─────────────────────────────────────────────────
    { id: 'rusty_blade',    slot: 'weapon', name: 'Rusty Blade',      rarity: 'common', icon: '🗡',
      desc: '+8% ATK',       effect: (state) => { state.heroes.forEach(h => h.atk *= 1.08); } },
    { id: 'iron_axe',       slot: 'weapon', name: 'Iron Axe',         rarity: 'common', icon: '🪓',
      desc: '+12% ATK Speed', effect: (state) => { state.heroes.forEach(h => h.atkSpeed *= 1.12); } },
    { id: 'silver_bow',     slot: 'weapon', name: 'Silver Bow',       rarity: 'rare',   icon: '🏹',
      desc: '+20% ATK',       effect: (state) => { state.heroes.forEach(h => h.atk *= 1.20); } },
    { id: 'thunder_hammer', slot: 'weapon', name: 'Thunder Hammer',   rarity: 'rare',   icon: '🔨',
      desc: '+18% ATK & Speed', effect: (state) => { state.heroes.forEach(h => { h.atk *= 1.18; h.atkSpeed *= 1.10; }); } },
    { id: 'mjolnir',        slot: 'weapon', name: "Mjölnir's Shard",  rarity: 'epic',   icon: '⚡',
      desc: '+35% ATK',       effect: (state) => { state.heroes.forEach(h => h.atk *= 1.35); } },

    // ── ARMOR ────────────────────────────────────────────────────
    { id: 'leather_vest',   slot: 'armor',  name: 'Leather Vest',     rarity: 'common', icon: '🥋',
      desc: '+15% Barricade HP', effect: (state) => { state.barricade.maxHp = Math.floor(state.barricade.maxHp * 1.15); state.barricade.hp = Math.min(state.barricade.hp + Math.floor(state.barricade.maxHp * 0.15), state.barricade.maxHp); } },
    { id: 'chain_mail',     slot: 'armor',  name: 'Chain Mail',       rarity: 'common', icon: '🛡',
      desc: '+10% Income',    effect: (state) => { ['astrid','hilda','bjorn'].forEach(id => state.permanentUpgrades[id].income = (state.permanentUpgrades[id].income||0) + 1); } },
    { id: 'rune_shield',    slot: 'armor',  name: 'Rune Shield',      rarity: 'rare',   icon: '🔵',
      desc: '+25% Barricade HP', effect: (state) => { state.barricade.maxHp = Math.floor(state.barricade.maxHp * 1.25); state.barricade.hp = Math.min(state.barricade.hp + Math.floor(state.barricade.maxHp * 0.25), state.barricade.maxHp); } },
    { id: 'valhalla_plate', slot: 'armor',  name: 'Valhalla Plate',   rarity: 'epic',   icon: '⚔',
      desc: '+35% Barricade HP & +10% ATK', effect: (state) => { state.barricade.maxHp = Math.floor(state.barricade.maxHp * 1.35); state.barricade.hp = Math.min(state.barricade.hp + Math.floor(state.barricade.maxHp * 0.35), state.barricade.maxHp); state.heroes.forEach(h => h.atk *= 1.10); } },

    // ── RELICS ───────────────────────────────────────────────────
    { id: 'lucky_coin',     slot: 'relic',  name: 'Lucky Coin',       rarity: 'common', icon: '🪙',
      desc: '+20% Gold income', effect: (state) => { ['astrid','hilda','bjorn'].forEach(id => state.permanentUpgrades[id].income = (state.permanentUpgrades[id].income||0) + 2); } },
    { id: 'rune_stone',     slot: 'relic',  name: 'Rune Stone',       rarity: 'common', icon: '🪨',
      desc: '+15% ATK Speed', effect: (state) => { state.heroes.forEach(h => h.atkSpeed *= 1.15); } },
    { id: 'odin_eye',       slot: 'relic',  name: "Odin's Eye",       rarity: 'rare',   icon: '👁',
      desc: '+25% ATK Speed', effect: (state) => { state.heroes.forEach(h => h.atkSpeed *= 1.25); } },
    { id: 'yggdrasil_leaf', slot: 'relic',  name: 'Yggdrasil Leaf',   rarity: 'epic',   icon: '🌿',
      desc: '+30% ATK & +30% Speed', effect: (state) => { state.heroes.forEach(h => { h.atk *= 1.30; h.atkSpeed *= 1.30; }); } },
];

export const RARITY_COLORS = {
    common: '#aaaaaa',
    rare: '#4a8fa8',
    epic: '#9b4de0'
};

export const RARITY_GLOW = {
    common: '#cccccc',
    rare: '#7ec8e3',
    epic: '#d090ff'
};

// Pick random gear drops — weighted by rarity
// win = true gives slightly better odds
export function rollGearDrops(win) {
    const epicChance  = win ? 0.10 : 0.04;
    const rareChance  = win ? 0.35 : 0.22;

    const drops = [];
    const numDrops = win ? (Math.random() < 0.5 ? 2 : 1) : (Math.random() < 0.35 ? 1 : 0);

    for (let i = 0; i < numDrops; i++) {
        const r = Math.random();
        let rarity = 'common';
        if (r < epicChance) rarity = 'epic';
        else if (r < epicChance + rareChance) rarity = 'rare';

        const candidates = gearPool.filter(g => g.rarity === rarity);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (pick && !drops.find(d => d.id === pick.id)) drops.push(pick);
    }
    return drops;
}

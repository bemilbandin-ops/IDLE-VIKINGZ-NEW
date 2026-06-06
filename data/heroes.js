export const heroes = [
    {
        id: 'astrid',
        name: 'Astrid',
        title: 'The Archer',
        spriteKey: 'hero_astrid',
        baseStats: { hp: 150, atk: 25, atkSpeed: 1.2 },
        projectileType: 'arrow',
        ascension: { stars: 0, maxLevel: 20 },
        skillPool: [
            { id: 'astrid_1', name: 'Eagle Eye', description: '+25% ATK damage', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.atk *= 1.25; } },
            { id: 'astrid_2', name: 'Swift Quiver', description: '+30% ATK speed', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.atkSpeed *= 1.3; } },
            { id: 'astrid_3', name: 'Double Shot', description: 'Each attack fires 2 arrows', type: 'projectile_modifier', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.doubleShot = true; } },
            { id: 'astrid_4', name: 'Piercing Arrow', description: 'Arrows pass through enemies (hits all in line)', type: 'projectile_modifier', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.projectilePiercing = true; } },
            { id: 'astrid_5', name: 'Hunter\'s Mark', description: 'First arrow on each enemy deals 2x damage', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.huntersMark = true; } },
            { id: 'astrid_6', name: 'Headshot', description: '15% chance for arrows to deal 3x damage', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.headshotChance = 0.15; } },
            { id: 'astrid_7', name: 'Volley', description: 'Every 5th attack fires 5 arrows in a spread', type: 'periodic', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.volleyAttack = true; } },
            { id: 'astrid_8', name: 'Iron Tips', description: '+10 flat damage (scales well with multi-hit)', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'astrid'); if (h) h.flatDamage = (h.flatDamage || 0) + 10; } }
        ]
    },
    {
        id: 'hilda',
        name: 'Hilda',
        title: 'The Völva',
        spriteKey: 'hero_hilda',
        baseStats: { hp: 100, atk: 20, atkSpeed: 0.7 },
        projectileType: 'frostbolt',
        ascension: { stars: 0, maxLevel: 20 },
        skillPool: [
            { id: 'hilda_1', name: 'Deep Freeze', description: 'Slow becomes a 2s full freeze (monster stops completely)', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.chillIsFreeze = true; } },
            { id: 'hilda_2', name: 'Arctic Burst', description: 'Frostbolt explodes on hit — splash damage to enemies within 60px', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.arcticBurst = true; } },
            { id: 'hilda_3', name: 'Twin Bolt', description: 'Each cast fires 2 frostbolts side by side', type: 'projectile_modifier', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.twinBolt = true; } },
            { id: 'hilda_4', name: 'Glacial Touch', description: 'Chilled enemies take +20% damage from all sources', type: 'party', effect: (state) => { state.glacialTouch = true; } },
            { id: 'hilda_5', name: 'Permafrost', description: 'Chill duration increased to 6s', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.chillDuration = 6; } },
            { id: 'hilda_6', name: 'Blizzard', description: 'Every 4th frostbolt hits ALL enemies on screen for half damage', type: 'periodic', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.blizzard = true; } },
            { id: 'hilda_7', name: 'Shatter', description: 'Frozen/chilled enemies that die explode, dealing 50 splash dmg', type: 'conditional', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.shatter = true; } },
            { id: 'hilda_8', name: 'Ice Lance', description: '+40% frostbolt damage', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'hilda'); if (h) h.atk *= 1.4; } }
        ]
    },
    {
        id: 'bjorn',
        name: 'Bjorn',
        title: 'The Thunderbringer',
        spriteKey: 'hero_bjorn',
        baseStats: { hp: 250, atk: 45, atkSpeed: 0.5 },
        projectileType: 'lightning_axe',
        ascension: { stars: 0, maxLevel: 20 },
        skillPool: [
            { id: 'bjorn_1', name: 'Overcharge', description: '+40% ATK damage', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.atk *= 1.4; } },
            { id: 'bjorn_2', name: 'Chain Lightning', description: 'Axe hits chain to 2 additional nearby targets', type: 'projectile_modifier', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.chainLightningTargets = 2; } },
            { id: 'bjorn_3', name: 'Static Discharge', description: 'When Bjorn hits an enemy, 10% chance to release a shockwave (50px AoE)', type: 'on_hit', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.staticDischargeChance = 0.10; } },
            { id: 'bjorn_4', name: 'Storm Call', description: 'Every 4th attack strikes 3 random enemies with lightning bolts', type: 'periodic', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.stormCall = true; } },
            { id: 'bjorn_5', name: 'Conductive Armor', description: 'All party members gain +15% ATK speed as lightning infuses the field', type: 'party', effect: (state) => { state.heroes.forEach(h => h.atkSpeed *= 1.15); } },
            { id: 'bjorn_6', name: 'Mjolnir\'s Echo', description: 'Axes now return to Bjorn, hitting enemies a second time on the way back', type: 'projectile_modifier', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.boomerangAxe = true; } },
            { id: 'bjorn_7', name: 'Frenzy', description: '+50% ATK speed, but decreases base HP by 10%', type: 'stat_boost', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) { h.atkSpeed *= 1.5; h.hp *= 0.9; } } },
            { id: 'bjorn_8', name: 'Superconductor', description: 'Enemies hit by lightning take 25% increased damage from Astrid and Hilda', type: 'conditional', effect: (state) => { const h = state.heroes.find(hero => hero.id === 'bjorn'); if (h) h.superconductorActive = true; } }
        ]
    }
];
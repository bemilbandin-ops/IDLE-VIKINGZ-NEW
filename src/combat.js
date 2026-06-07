import { createArrow, createProjectile } from './projectiles.js';
import { getH } from './canvas.js';

function liveMonsters(state) {
    return state.monsters.filter(m => !m.dead);
}

function getFrontTarget(state) {
    return liveMonsters(state).sort((a, b) => b.y - a.y)[0];
}

function addEffect(state, effect) {
    state.combatEffects = state.combatEffects || [];
    state.combatEffects.push({ id: Date.now() + Math.random(), age: 0, duration: 0.6, ...effect });
}

function damageMonster(state, monster, amount, sourceHeroId, text, color) {
    if (!monster || monster.dead) return;
    let dmg = amount;
    if (state.glacialTouch && monster.statusEffects?.some(e => e.type === 'chilled' || e.type === 'frozen')) dmg *= 1.2;
    if (monster.superconducted && (sourceHeroId === 'astrid' || sourceHeroId === 'hilda')) dmg *= 1.25;
    monster.hp -= dmg;
    if (text) {
        state.floatingTexts = state.floatingTexts || [];
        state.floatingTexts.push({ x: monster.x, y: monster.y - monster.h * 0.5, text, color, vy: -30, alpha: 1 });
    }
}

function createFrostbolt(hero, target, options = {}) {
    return createProjectile(hero, target, {
        ...options,
        type: 'frostbolt',
        speed: 1000,
        chillOnHit: true,
        chillIsFreeze: !!hero.chillIsFreeze,
        chillDuration: hero.chillDuration || 3,
        arcticBurst: !!hero.arcticBurst
    });
}

function createLightningAxe(hero, target, options = {}) {
    return createProjectile(hero, target, {
        ...options,
        type: 'lightning_axe',
        speed: 1200,
        chainLightningTargets: hero.chainLightningTargets || 0,
        staticDischargeChance: hero.staticDischargeChance || 0,
        boomerang: !!hero.boomerangAxe,
        superconductorActive: !!hero.superconductorActive
    });
}

function fireAstrid(state, hero, target) {
    hero.attackCount = (hero.attackCount || 0) + 1;
    const volley = hero.volleyAttack && hero.attackCount % 5 === 0;
    const count = volley ? 5 : hero.doubleShot ? 2 : 1;
    const spread = volley ? 0.24 : hero.doubleShot ? 0.07 : 0;
    const mid = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
        const proj = createArrow(hero, target, getH(), {
            angleOffset: (i - mid) * spread,
            offsetX: (i - mid) * 7,
            pierce: !!hero.projectilePiercing,
            visualSkill: volley ? 'volley' : hero.doubleShot ? 'double_shot' : null
        });
        if (proj) state.projectiles.push(proj);
    }
    if (volley) addEffect(state, { type: 'volley', x: target.x, y: target.y, duration: 0.7 });
}

function fireHilda(state, hero, target) {
    hero.attackCount = (hero.attackCount || 0) + 1;
    const blizzard = hero.blizzard && hero.attackCount % 4 === 0;
    if (blizzard) {
        const targets = liveMonsters(state);
        targets.forEach((monster, i) => {
            const proj = createFrostbolt(hero, monster, {
                damage: hero.atk * 0.5,
                offsetX: (i % 5 - 2) * 7,
                visualSkill: 'blizzard'
            });
            if (proj) state.projectiles.push(proj);
        });
        addEffect(state, { type: 'blizzard', x: target.x, y: target.y, duration: 1.0 });
        return;
    }

    const count = hero.twinBolt ? 2 : 1;
    const mid = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
        const proj = createFrostbolt(hero, target, {
            offsetX: (i - mid) * 15,
            angleOffset: (i - mid) * 0.05,
            visualSkill: hero.twinBolt ? 'twin_bolt' : null
        });
        if (proj) state.projectiles.push(proj);
    }
}

function fireBjorn(state, hero, target) {
    hero.attackCount = (hero.attackCount || 0) + 1;
    const storm = hero.stormCall && hero.attackCount % 4 === 0;
    if (storm) {
        const targets = liveMonsters(state).sort(() => Math.random() - 0.5).slice(0, 3);
        targets.forEach(monster => {
            damageMonster(state, monster, hero.atk * 0.85, hero.id, 'STORM', '#ffe84a');
            if (hero.superconductorActive) {
                monster.superconducted = true;
                monster.superconductTimer = 5;
            }
            addEffect(state, { type: 'lightning_strike', x: monster.x, y: monster.y, duration: 0.45 });
        });
    }

    const proj = createLightningAxe(hero, target, { visualSkill: storm ? 'storm_call' : null });
    if (proj) state.projectiles.push(proj);
}

export function heroAttackTick(state, dt) {
    state.heroes.forEach(hero => {
        if (hero.dead) return;

        hero.atkTimer = (hero.atkTimer || 0) + dt;
        const interval = 1 / hero.atkSpeed;

        if (hero.atkTimer >= interval) {
            hero.atkTimer -= interval;
            const target = getFrontTarget(state);
            if (!target) return;

            if (hero.id === 'astrid') fireAstrid(state, hero, target);
            else if (hero.id === 'hilda') fireHilda(state, hero, target);
            else if (hero.id === 'bjorn') fireBjorn(state, hero, target);
        }
    });
}

export function updateFloatingTexts(state, dt) {
    state.floatingTexts = state.floatingTexts.filter(text => {
        text.y += text.vy * dt;
        text.alpha -= dt * (text.fadeRate ?? 0.8);
        return text.alpha > 0;
    });
}

import { getW, getH } from './canvas.js';
import { getHeroPanelY } from './ui.js';

const BASE_CRIT_CHANCE = 0.05;
const ASTRID_CRIT_CHANCE = 0.08;
const CRIT_MULTIPLIER = 2;

function getMonsterMovementForAim(target, projectileSpeed) {
    const H = getH();
    const barricadeY = H * 0.7;

    if (!target || target.dead) return { vx: 0, vy: 0, moving: false };

    const atBarricade = target.y + target.h >= barricadeY - 2;
    const attackingBarricade = target.state === 'attacking' || target.attackDelayUsed || (target.attackTimer || 0) > 0;
    if (atBarricade || attackingBarricade) return { vx: 0, vy: 0, moving: false };

    let speedMult = 1;
    for (const effect of target.statusEffects || []) {
        if (effect.type === 'frozen') return { vx: 0, vy: 0, moving: false };
        if (effect.type === 'chilled') speedMult = Math.min(speedMult, effect.speedMult ?? 1);
    }

    const vy = (target.speed || target.baseSpeed || 0) * speedMult;
    if (Math.abs(vy) < 20) return { vx: 0, vy: 0, moving: false };

    // Never lead beyond the barricade. If the projectile would arrive after the monster
    // has stopped, aim at the stop position instead of below/behind the monster.
    const stopY = barricadeY - target.h;
    if (target.y + target.h < barricadeY && vy > 0 && projectileSpeed > 0) {
        return { vx: 0, vy, moving: true, stopY };
    }

    return { vx: 0, vy, moving: true };
}

function aimAtTarget(heroX, spawnY, target, projectileSpeed) {
    const movement = getMonsterMovementForAim(target, projectileSpeed);
    if (!movement.moving) return { x: target.x, y: target.y };

    const dx = target.x - heroX;
    const dy = target.y - spawnY;
    const distance = Math.hypot(dx, dy);
    const travelTime = distance / Math.max(1, projectileSpeed || 1);

    // Short enough to help moving targets, capped so a behavior change cannot cause
    // arrows/frostbolts to predict far past the monster.
    const leadTime = Math.min(travelTime, 0.35);
    let aimY = target.y + movement.vy * leadTime;
    if (movement.stopY !== undefined) aimY = Math.min(aimY, movement.stopY);

    return { x: target.x + movement.vx * leadTime, y: aimY };
}

export function createProjectile(hero, targetMonster, options = {}) {
    if (!targetMonster) return null;

    const H = getH();
    const type = options.type || hero.projectileType || 'arrow';
    const speed = options.speed || (type === 'frostbolt' ? 1000 : type === 'lightning_axe' ? 1200 : 1400);
    const spawnY = options.spawnY ?? getHeroPanelY(H);
    const spawnX = hero.x + (options.offsetX || 0);
    const aim = aimAtTarget(spawnX, spawnY, targetMonster, speed);
    let dx = aim.x - spawnX;
    let dy = aim.y - spawnY;
    const baseAngle = Math.atan2(dy, dx) + (options.angleOffset || 0);
    dx = Math.cos(baseAngle);
    dy = Math.sin(baseAngle);

    const damage = (hero.atk || 0) + (hero.flatDamage || 0);
    const size = type === 'frostbolt' ? { w: 14, h: 14 } : type === 'lightning_axe' ? { w: 22, h: 14 } : { w: 6, h: 14 };

    return {
        id: Date.now() + Math.random(),
        ownerId: hero.id,
        type,
        x: spawnX,
        y: spawnY,
        vx: dx * speed,
        vy: dy * speed,
        damage: options.damage ?? damage,
        w: options.w || size.w,
        h: options.h || size.h,
        hitRadius: options.hitRadius || (type === 'frostbolt' ? 12 : type === 'lightning_axe' ? 14 : 10),
        angle: baseAngle,
        dead: false,
        pierce: !!options.pierce,
        hitIds: [],
        chillOnHit: !!options.chillOnHit,
        chillIsFreeze: !!options.chillIsFreeze,
        chillDuration: options.chillDuration,
        arcticBurst: !!options.arcticBurst,
        chainLightningTargets: options.chainLightningTargets || 0,
        staticDischargeChance: options.staticDischargeChance || 0,
        boomerang: !!options.boomerang,
        returning: false,
        superconductorActive: !!options.superconductorActive,
        visualSkill: options.visualSkill || null
    };
}

export function createArrow(hero, targetMonster, H, options = {}) {
    return createProjectile(hero, targetMonster, { ...options, type: 'arrow', speed: 1400, spawnY: getHeroPanelY(H) });
}

function addFloatingText(state, x, y, text, color = '#f0c040') {
    state.floatingTexts = state.floatingTexts || [];
    state.floatingTexts.push({ x, y, text, color, vy: -28, alpha: 1 });
}

function getCritChance(hero, sourceHeroId) {
    if (sourceHeroId === 'astrid') return hero?.critChance ?? ASTRID_CRIT_CHANCE;
    return hero?.critChance ?? BASE_CRIT_CHANCE;
}

function applyDamage(state, monster, amount, sourceHeroId, tags = {}) {
    if (!monster || monster.dead) return;
    let dmg = Number.isFinite(amount) ? amount : 0;

    if (state.glacialTouch && monster.statusEffects?.some(e => e.type === 'chilled' || e.type === 'frozen')) dmg *= 1.2;
    if (monster.superconducted && (sourceHeroId === 'astrid' || sourceHeroId === 'hilda')) dmg *= 1.25;

    monster.hp -= dmg;

    if (tags.superconductorActive) {
        monster.superconducted = true;
        monster.superconductTimer = 5;
    }

    if (tags.showText) addFloatingText(state, monster.x, monster.y - monster.h * 0.4, tags.showText, tags.color);
}

function findNearbyMonsters(state, source, radius, limit, excludeIds = []) {
    const blocked = new Set(excludeIds);
    return state.monsters
        .filter(m => !m.dead && !blocked.has(m.id))
        .map(m => ({ m, d: Math.hypot(m.x - source.x, m.y - source.y) }))
        .filter(item => item.d <= radius)
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .map(item => item.m);
}

function addCombatEffect(state, effect) {
    state.combatEffects = state.combatEffects || [];
    state.combatEffects.push({ id: Date.now() + Math.random(), age: 0, duration: 0.55, ...effect });
}

function handleOnHit(state, proj, monster) {
    const hero = state.heroes.find(h => h.id === proj.ownerId);
    const sourceId = proj.ownerId;

    let damage = proj.damage;
    if (sourceId === 'astrid') {
        if (hero?.huntersMark && !monster.astridMarked) {
            monster.astridMarked = true;
            damage *= 2;
            addFloatingText(state, monster.x, monster.y - monster.h * 0.6, 'MARK x2', '#ffda55');
        }
        if (hero?.headshotChance && Math.random() < hero.headshotChance) {
            damage *= 3;
            addFloatingText(state, monster.x, monster.y - monster.h * 0.8, 'HEADSHOT', '#fff0a0');
        }
    }

    const critChance = getCritChance(hero, sourceId);
    if (Math.random() < critChance) {
        damage *= CRIT_MULTIPLIER;
        addFloatingText(state, monster.x, monster.y - monster.h * 1.0, 'CRIT!', '#ffec70');
    }

    applyDamage(state, monster, damage, sourceId, { superconductorActive: proj.superconductorActive });

    if (proj.chillOnHit) {
        monster.statusEffects = monster.statusEffects || [];
        const freeze = proj.chillIsFreeze;
        monster.statusEffects.push({
            type: freeze ? 'frozen' : 'chilled',
            duration: freeze ? 2 : (proj.chillDuration || 3),
            speedMult: freeze ? 0 : 0.4
        });
    }

    if (proj.arcticBurst) {
        addCombatEffect(state, { type: 'frost_burst', x: monster.x, y: monster.y, radius: 60, duration: 0.45 });
        for (const other of findNearbyMonsters(state, monster, 60, 99, [monster.id])) {
            applyDamage(state, other, proj.damage * 0.55, sourceId, { showText: 'BURST', color: '#9eefff' });
        }
    }

    if (proj.chainLightningTargets > 0) {
        const chained = findNearbyMonsters(state, monster, 150, proj.chainLightningTargets, [monster.id]);
        for (const other of chained) {
            applyDamage(state, other, proj.damage * 0.65, sourceId, { superconductorActive: proj.superconductorActive, showText: 'CHAIN', color: '#ffe84a' });
            addCombatEffect(state, { type: 'lightning_chain', x1: monster.x, y1: monster.y, x2: other.x, y2: other.y, duration: 0.35 });
        }
    }

    if (proj.staticDischargeChance > 0 && Math.random() < proj.staticDischargeChance) {
        addCombatEffect(state, { type: 'shockwave', x: monster.x, y: monster.y, radius: 55, duration: 0.4 });
        for (const other of findNearbyMonsters(state, monster, 55, 99, [monster.id])) {
            applyDamage(state, other, proj.damage * 0.5, sourceId, { showText: 'SHOCK', color: '#ffe84a' });
        }
    }
}

export function updateCombatEffects(state, dt) {
    state.combatEffects = (state.combatEffects || []).filter(effect => {
        effect.age = (effect.age || 0) + dt;
        return effect.age < effect.duration;
    });

    for (const monster of state.monsters || []) {
        if (monster.superconductTimer) {
            monster.superconductTimer -= dt;
            if (monster.superconductTimer <= 0) {
                monster.superconductTimer = 0;
                monster.superconducted = false;
            }
        }
    }
}

export function updateProjectiles(state, dt) {
    const W = getW();
    const H = getH();

    for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const proj = state.projectiles[i];
        if (proj.dead) {
            state.projectiles.splice(i, 1);
            continue;
        }

        if (proj.boomerang && !proj.returning && proj.hitIds?.length) {
            const hero = state.heroes.find(h => h.id === proj.ownerId);
            if (hero) {
                proj.returning = true;
                proj.pierce = true;
                const dx = hero.x - proj.x;
                const dy = getHeroPanelY(H) - proj.y;
                const dist = Math.max(1, Math.hypot(dx, dy));
                const speed = 1200;
                proj.vx = dx / dist * speed;
                proj.vy = dy / dist * speed;
                proj.hitIds = [];
            }
        }

        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        if (proj.type === 'log' || proj.type === 'lightning_axe') {
            proj.angle = Math.atan2(proj.vy, proj.vx);
        }

        for (const monster of state.monsters) {
            if (monster.dead) continue;
            if (proj.hitIds?.includes(monster.id)) continue;

            const expandedHitRadius = proj.hitRadius || Math.max(8, Math.min(monster.w, monster.h) * 0.18);
            const hit = proj.x + proj.w / 2 > monster.x - monster.w / 2 - expandedHitRadius &&
                        proj.x - proj.w / 2 < monster.x + monster.w / 2 + expandedHitRadius &&
                        proj.y + proj.h / 2 > monster.y - monster.h / 2 - expandedHitRadius &&
                        proj.y - proj.h / 2 < monster.y + monster.h / 2 + expandedHitRadius;

            if (hit) {
                proj.hitIds = proj.hitIds || [];
                proj.hitIds.push(monster.id);
                handleOnHit(state, proj, monster);
                if (!proj.pierce && !proj.boomerang) proj.dead = true;
                break;
            }
        }

        if (proj.returning) {
            const hero = state.heroes.find(h => h.id === proj.ownerId);
            if (hero && Math.hypot(proj.x - hero.x, proj.y - getHeroPanelY(H)) < 26) proj.dead = true;
        }

        if (proj.x < -100 || proj.x > W + 100 || proj.y < -100 || proj.y > H + 100) {
            proj.dead = true;
        }
    }
}

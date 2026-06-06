import { createArrow } from './projectiles.js';
import { getH } from './canvas.js';
import { getHeroPanelY } from './ui.js';

// Predict intercept point given projectile speed and monster's downward movement
function predictIntercept(heroX, spawnY, target, projSpeed) {
    const dx = target.x - heroX;
    const dy = target.y - spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: target.x, y: target.y };
    const travelTime = dist / projSpeed;
    return { x: target.x, y: target.y + target.speed * travelTime };
}

function createFrostbolt(hero, target) {
    if (!target) return null;
    const speed = 1000;
    const spawnY = getHeroPanelY(getH());
    const aim = predictIntercept(hero.x, spawnY, target, speed);
    const dx = aim.x - hero.x;
    const dy = aim.y - spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;
    return {
        id: Date.now() + Math.random(),
        ownerId: hero.id,
        type: 'frostbolt',
        x: hero.x,
        y: spawnY,
        vx: dx / dist * speed,
        vy: dy / dist * speed,
        damage: hero.atk,
        w: 14,
        h: 14,
        dead: false,
        chillOnHit: true
    };
}

function createLightningAxe(hero, target) {
    if (!target) return null;
    const speed = 1200;
    const spawnY = getHeroPanelY(getH());
    const aim = predictIntercept(hero.x, spawnY, target, speed);
    const dx = aim.x - hero.x;
    const dy = aim.y - spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;
    return {
        id: Date.now() + Math.random(),
        ownerId: hero.id,
        type: 'lightning_axe',
        x: hero.x,
        y: spawnY,
        vx: dx / dist * speed,
        vy: dy / dist * speed,
        damage: hero.atk,
        w: 22,
        h: 14,
        angle: Math.atan2(dy, dx),
        dead: false
    };
}

export function heroAttackTick(state, dt) {
    state.heroes.forEach(hero => {
        if (hero.dead) return;

        hero.atkTimer = (hero.atkTimer || 0) + dt;
        const interval = 1 / hero.atkSpeed;

        if (hero.atkTimer >= interval) {
            hero.atkTimer -= interval;

            const target = state.monsters
                .filter(m => !m.dead)
                .sort((a, b) => b.y - a.y)[0];

            if (!target) return;

            let proj = null;
            if (hero.id === 'astrid') {
                proj = createArrow(hero, target, getH());
            } else if (hero.id === 'hilda') {
                proj = createFrostbolt(hero, target);
            } else if (hero.id === 'bjorn') {
                proj = createLightningAxe(hero, target);
            }

            if (proj) {
                state.projectiles.push(proj);
            }
        }
    });
}

export function updateFloatingTexts(state, dt) {
    state.floatingTexts = state.floatingTexts.filter(text => {
        text.y += text.vy * dt;
        text.alpha -= dt * 0.8;
        return text.alpha > 0;
    });
}

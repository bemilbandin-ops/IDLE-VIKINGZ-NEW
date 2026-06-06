import { getW, getH } from './canvas.js';
import { getHeroPanelY } from './ui.js';

// Predict where a monster will be when a projectile arrives, so we lead our shots.
// Returns {x, y} of the intercept point.
function predictIntercept(heroX, spawnY, target, projSpeed) {
    // Monster moves straight down at its current speed
    const dx = target.x - heroX;
    const dy = target.y - spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: target.x, y: target.y };

    // Estimate travel time, then predict monster's future position
    // Use iterative solve: t = dist / projSpeed, future_y = target.y + speed * t
    // One iteration is good enough for game purposes
    const travelTime = dist / projSpeed;
    const futureY = target.y + target.speed * travelTime;

    return { x: target.x, y: futureY };
}

export function createArrow(hero, targetMonster, H) {
    if (!targetMonster) return null;

    const speed = 1400;
    const spawnY = getHeroPanelY(H);
    const aim = predictIntercept(hero.x, spawnY, targetMonster, speed);
    const dx = aim.x - hero.x;
    const dy = aim.y - spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;

    return {
        id: Date.now() + Math.random(),
        ownerId: hero.id,
        type: 'arrow',
        x: hero.x,
        y: spawnY,
        vx: dx / dist * speed,
        vy: dy / dist * speed,
        damage: hero.atk,
        w: 6,
        h: 14,
        angle: Math.atan2(dy, dx),
        dead: false
    };
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

        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        if (proj.type === 'log' || proj.type === 'lightning_axe') {
            proj.angle = Math.atan2(proj.vy, proj.vx);
        }

        // Collision with monsters
        for (const monster of state.monsters) {
            if (monster.dead) continue;

            const hit = proj.x + proj.w / 2 > monster.x - monster.w / 2 &&
                        proj.x - proj.w / 2 < monster.x + monster.w / 2 &&
                        proj.y + proj.h / 2 > monster.y - monster.h / 2 &&
                        proj.y - proj.h / 2 < monster.y + monster.h / 2;

            if (hit) {
                monster.hp -= proj.damage;
                proj.dead = true;

                if (proj.chillOnHit) {
                    monster.statusEffects = monster.statusEffects || [];
                    monster.statusEffects.push({
                        type: 'chilled',
                        duration: 3,
                        speedMult: 0.4
                    });
                }
                break;
            }
        }

        if (proj.x < -100 || proj.x > W + 100 || proj.y < -100 || proj.y > H + 100) {
            proj.dead = true;
        }
    }
}

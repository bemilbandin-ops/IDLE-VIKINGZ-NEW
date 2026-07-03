# Viking Idle Game — Agent Workflow & Build Plan


---

## Project Overview

A browser-based idle/auto-battle game with a Viking aesthetic.
- 3 named heroes fight simultaneously, each with a unique ranged attack style
- Monsters descend from the top of the screen toward a barricade in front of the heroes
- Each game level = 20 waves of monsters
- Party shares an EXP pool; on level up, player picks 1 of 3 skill upgrade cards
- Skill upgrades reset each game level — every run starts fresh from level 1
- Between game levels: spend gold to permanently upgrade heroes, collect hero-specific shards to ascend heroes
- 3 prototype levels now; architecture supports infinite scaling

---

## Tech Stack (decided)

| Concern | Choice | Reason |
|---|---|---|
| Language | Vanilla JS (ES Modules) | No build step, easy to hand-edit sprites/data |
| Rendering | HTML5 Canvas (single canvas) | Smooth animation, full layout control |
| Styling | CSS + CSS Variables | Viking theme tokens, no framework needed |
| Data | JS config files (heroes.js, monsters.js, levels.js) | Easy to extend, no backend needed |
| Persistence | localStorage | Simple save/load between sessions |
| Sprites | Image files (player-provided) | Drop PNGs in, game uses them automatically |

---

## File Structure

```
/viking-game/
├── index.html
├── style.css
├── main.js                  ← entry point, game loop
├── /src/
│   ├── canvas.js            ← canvas setup, draw utilities, projectile rendering
│   ├── gameState.js         ← single source of truth for all state
│   ├── combat.js            ← attack logic, damage, death, projectiles
│   ├── projectiles.js       ← projectile movement, collision, special effects
│   ├── waves.js             ← wave spawning, progression
│   ├── levelUp.js           ← EXP, level-up triggers, skill choice UI
│   ├── barricade.js         ← barricade HP, visual, death logic
│   ├── ui.js                ← HUD: wave counter, hero HP bars, gold, skill indicators
│   ├── screens.js           ← title, level select, upgrade, game over
│   ├── upgrades.js          ← between-run upgrade logic (gold/shards)
│   └── utils.js             ← helpers: random, clamp, lerp, formatGold
├── /data/
│   ├── heroes.js            ← hero definitions (stats, skills, ascension, projectile type)
│   ├── monsters.js          ← monster definitions (HP, ATK, speed, EXP, statusEffects)
│   └── levels.js            ← level configs (waves, monster pools, scaling)
├── /assets/
│   ├── /sprites/            ← you add: astrid.png, hilda.png, bjorn.png, etc.
│   ├── /projectiles/        ← you add: arrow.png, frostbolt.png, log.png (optional)
│   ├── /ui/                 ← you add: frame borders, buttons, icons
│   └── /audio/              ← optional later
└── (localStorage keys documented in gameState.js)
```

---

## The Three Heroes

### Astrid — The Archer
**Playstyle:** Fast, reliable, single-target damage. Workhorse of the party.
- **Attack:** Fires an arrow at the nearest enemy. Fast attack speed.
- **Projectile:** Arrow travels quickly in a straight line, hits first enemy in path.
- **Base stats:** Medium HP, high ATK Speed (1.2/s), medium ATK damage
- **Sprite key:** `hero_astrid`

**Skill pool (8 cards, drawn randomly on level up):**
| ID | Name | Effect |
|---|---|---|
| astrid_1 | Eagle Eye | +25% ATK damage |
| astrid_2 | Swift Quiver | +30% ATK speed |
| astrid_3 | Double Shot | Each attack fires 2 arrows |
| astrid_4 | Piercing Arrow | Arrows pass through enemies (hits all in line) |
| astrid_5 | Hunter's Mark | First arrow on each enemy deals 2x damage |
| astrid_6 | Headshot | 15% chance for arrows to deal 3x damage |
| astrid_7 | Volley | Every 5th attack fires 5 arrows in a spread |
| astrid_8 | Iron Tips | Arrows deal +10 flat damage (scales well with multi-hit) |

---

### Hilda — The Völva (Frost Mage)
**Playstyle:** Area control. Slows enemies, stacks debuffs, disrupts waves.
- **Attack:** Fires a frostbolt that slows the target on hit.
- **Projectile:** Frostbolt travels at medium speed, hits first enemy in path. On hit: applies Chilled (−30% move speed for 3s).
- **Base stats:** Lower HP, medium ATK Speed (0.7/s), medium ATK damage + slow
- **Sprite key:** `hero_hilda`

**Status effect — Chilled:**
- Reduces monster move speed by 30% for 3 seconds
- Visual: blue tint on affected monster, snowflake particle above
- Multiple Chilled hits refresh the duration (do not stack multiplier unless upgraded)

**Skill pool (8 cards):**
| ID | Name | Effect |
|---|---|---|
| hilda_1 | Deep Freeze | Slow becomes a 2s full freeze (monster stops completely) |
| hilda_2 | Arctic Burst | Frostbolt explodes on hit — splash damage to enemies within 60px |
| hilda_3 | Twin Bolt | Each cast fires 2 frostbolts side by side |
| hilda_4 | Glacial Touch | Chilled enemies take +20% damage from all sources |
| hilda_5 | Permafrost | Chill duration increased to 6s |
| hilda_6 | Blizzard | Every 4th frostbolt hits ALL enemies on screen for half damage |
| hilda_7 | Shatter | Frozen/chilled enemies that die explode, dealing 50 splash dmg |
| hilda_8 | Ice Lance | +40% frostbolt damage |

---

### Bjorn — The Hurler
**Playstyle:** Slow, powerful, crowd-clearing. Launches a rolling log that travels the full screen.
- **Attack:** Hurls a log/barrel that rolls upward from Bjorn's position to the top of the screen, dealing damage to every enemy it passes through.
- **Projectile:** Log rolls upward slowly, hits ALL enemies in its path (like a bowling ball). Wide hitbox (~40px). 
- **Base stats:** High HP, very low ATK Speed (0.3/s), very high ATK damage per hit
- **Sprite key:** `hero_bjorn`

**Skill pool (8 cards):**
| ID | Name | Effect |
|---|---|---|
| bjorn_1 | Heavy Log | +50% log damage |
| bjorn_2 | Boulder | Log becomes a boulder — 2x hitbox width, slightly slower |
| bjorn_3 | Splinter | Log explodes on reaching the top — 80px splash damage to any remaining enemies |
| bjorn_4 | Double Barrel | Each throw launches 2 logs side by side |
| bjorn_5 | Unstoppable | Log no longer slows down after hitting enemies |
| bjorn_6 | Flaming Log | Log deals bonus fire damage and leaves a 1s burn trail |
| bjorn_7 | Quick Hurl | +40% ATK speed (still slow, but meaningfully faster) |
| bjorn_8 | Titan's Grip | Every 3rd log deals 3x damage |

---

## Skill Card System — Design Rules

These rules apply to ALL heroes and govern how the level-up system works:

1. **Card pool per hero:** 8 skills. On each level up, draw 3 random cards from skills NOT yet taken this run.
2. **Cards are run-scoped:** All acquired skills reset when a game level ends (win or lose). Every run starts from scratch.
3. **Skill cards can belong to one hero or be party-wide.** Hero-specific cards only appear when that hero is alive.
4. **Modifier grammar:** Skills follow a shared grammar so new cards are easy to add:
   - `stat_boost`: multiplier on a stat (ATK, speed, HP)
   - `on_hit`: triggers an additional effect when the hero's projectile hits
   - `projectile_modifier`: changes the projectile itself (size, count, path)
   - `periodic`: fires an extra effect every N attacks
   - `conditional`: effect triggers under a specific condition (on kill, on crit, on freeze)
   - `party`: applies to all heroes or the barricade
5. **Each skill has:** `id`, `heroId` (or `'party'`), `name`, `description`, `type` (from grammar above), `effect` (function that mutates state)

---

## Projectile System — Specification

All heroes are ranged. Projectiles are tracked objects in `state.projectiles[]`.

```
Each projectile:
{
  id,
  ownerId,        ← which hero fired it
  type,           ← 'arrow' | 'frostbolt' | 'log'
  x, y,           ← current position
  vx, vy,         ← velocity per second
  damage,
  width, height,  ← hitbox
  piercing,       ← bool — does it continue after hitting an enemy?
  onHitEffects[], ← list of effect functions to call on each hit
  dead            ← remove from array when true
}
```

**Collision:** Each frame, check projectile hitbox against all living monster hitboxes. On collision, call `onHitEffects`, deal damage, then mark projectile dead (unless piercing).

**Log special case:** Log is always piercing. Its `vy` is negative (moves upward). It starts at Bjorn's X position and travels to Y=0 (top of screen), then dies.

**Frostbolt special case:** On hit, push a `statusEffect: { type: 'chilled', duration: 3, speedMult: 0.7 }` onto the target monster's `statusEffects[]` array.

---

## Game Mechanics — Specification

### Combat Screen Layout
```
┌─────────────────────────────────────────────┐
│  Wave: 3/20              Gold: 120  Lvl: 4  │  ← HUD top bar
├─────────────────────────────────────────────┤
│                                             │
│   👹  👹❄️  👹  👹   ← monsters move down  │
│                                             │
│        →→ [arrow] →→   ← projectiles       │
│                                             │
│         🪨 BARRICADE 🪨                     │
│                                             │
│   🏹 Astrid  🌀 Hilda  🪵 Bjorn            │
│   [HP bar]  [HP bar]  [HP bar]              │
└─────────────────────────────────────────────┘
```

### Hero Stats (all ranged, each has unique attack pattern)
- **HP** — health pool
- **ATK** — base damage per projectile hit
- **ATK Speed** — attacks per second
- **Level** — resets each game level, max cap based on ascension tier
- **activeSkills[]** — skills picked this run (resets each game level)

### Ascension System
| Stars | Max Level | Shard Cost to Ascend |
|---|---|---|
| 0★ | 20 | — |
| 1★ | 40 | 10 shards |
| 2★ | 60 | 25 shards |
| 3★ | 80 | 50 shards |

Hero shards are hero-specific (Astrid shards only ascend Astrid). Shard drops are rare (10% chance per completed level, for a random hero).

### Barricade
- Starts each wave with fixed HP (scales per game level)
- Monsters target barricade first; when dead, they attack heroes directly
- Visual: 3 damage stages (full / cracked / broken) drawn as canvas overlays
- Resets each wave — barricade is rebuilt between waves

### Wave Structure
- 20 waves per game level
- Monster count per wave: `2 + waveIndex + levelModifier`
- Between waves: 3-second pause, heroes regenerate 10% HP, barricade resets
- Boss wave: wave 10 and wave 20 → 1 large boss (5x HP, 2x ATK, slower, larger sprite)
- After wave 20: level complete → loot screen → upgrade screen

### EXP & In-Level Leveling
- Shared EXP pool across the party
- EXP awarded per monster kill
- `expToNextLevel(partyLevel) = 50 * partyLevel * 1.2`
- On level up: game pauses, show 3 random skill cards, player picks one
- Skills apply instantly for the rest of the run
- Party level resets to 1 at the start of each game level
- In-level max party level: 30

### Gold & Shards (between runs)
- **Gold**: drops from monsters, persists after run, used in upgrade screen
- **Shards**: rare, hero-specific, used only to ascend that hero
- Permanent upgrades (per hero, gold cost scales with purchase count):
  - ATK +5%
  - HP +5%
  - ATK Speed +3%

### Monster Behavior
- Move straight downward at constant speed
- Status effects (Chilled, Frozen) modify move speed or stop movement temporarily
- Attack barricade when in range; attack nearest hero when barricade is dead
- Death: disappear, spawn floating gold/EXP text, push to `state.floatingTexts`
- Boss monsters: 5x HP, 2x ATK, 0.5x speed, 2x size

---

## Build Tasks — Sequential Agent Workflow

Each task has a clear goal, explicit instructions, and a review checkpoint.
**The agent MUST verify all checkboxes before moving to the next task.**

---

### TASK 1 — Project Scaffold & Config Files
**Goal:** Create the file structure, HTML shell, and all data config files.

**Instructions:**
1. Create all folders and files listed in the File Structure section above
2. `index.html`: single canvas element (id="gameCanvas"), link style.css, link main.js as type="module"
3. `style.css`: CSS variables — Viking palette: `--color-bg: #1a1008`, `--color-gold: #c8962a`, `--color-steel: #8a9ba8`, `--color-red: #8b1a1a`, `--color-frost: #7ec8e3`. Google Font: 'Cinzel' for headings, 'Crimson Text' for body. Canvas fills viewport.
4. `data/heroes.js`: Export array of 3 hero definition objects — Astrid, Hilda, Bjorn. Each object has: `id`, `name`, `title`, `spriteKey`, `baseStats: { hp, atk, atkSpeed }`, `projectileType` ('arrow'|'frostbolt'|'log'), `skillPool: []` (array of 8 skill objects per hero as specified above), `ascension: { stars: 0, maxLevel: 20 }`
5. `data/monsters.js`: Export array of 5 monster definition objects: grunt, archer, berserker, shaman, boss. Each has: `id`, `name`, `spriteKey`, `baseStats: { hp, atk, speed }`, `expReward`, `goldReward`, `size: { w, h }`
6. `data/levels.js`: Export array of 3 level configs. Each has: `id`, `name`, `monsterPool` (array of monster ids), `hpMult`, `atkMult`, `barricadeHp`, `goldMult`
7. `src/utils.js`: Export `random(min,max)`, `clamp(val,min,max)`, `lerp(a,b,t)`, `formatGold(n)`, `uuid()` (returns short unique string for projectile IDs)

**Review Checkpoint:**
- [ ] Open index.html in browser — blank page loads, no console errors
- [ ] Console: `import('./data/heroes.js').then(m => console.log(m.default))` logs array of 3 hero objects
- [ ] Each hero object has skillPool with exactly 8 skills
- [ ] All files exist and have no syntax errors (VS Code shows no red underlines)
- [ ] CSS variables are defined and `body` background is dark (`--color-bg`)

**✅ Confirm all checkboxes pass before Task 2**

---

### TASK 2 — Game State & Main Loop
**Goal:** Central state object and a working requestAnimationFrame game loop.

**Instructions:**
1. `src/gameState.js`: Export a single `state` object and a `resetLevelState(state, levelIndex)` function. State contains:
   - `screen`: `'title'|'combat'|'levelup'|'loot'|'upgrade'`
   - `currentLevel`: 0–2
   - `currentWave`: 0–19
   - `party`: `{ level: 1, exp: 0, activeSkills: [] }`
   - `heroes[]`: live hero instances (copy from data/heroes.js with current hp, atkTimer, dead: false, activeSkills: [])
   - `monsters[]`: active monster instances on screen
   - `projectiles[]`: active projectile instances
   - `barricade`: `{ hp, maxHp, dead: false }`
   - `floatingTexts[]`: `{ text, x, y, alpha, vy }`
   - `statusEffects[]`: active effects per monster (stored on monster object)
   - `gold`: total accumulated gold
   - `shards`: `{ astrid: 0, hilda: 0, bjorn: 0 }`
   - `permanentUpgrades`: `{ astrid: { atk:0, hp:0, atkSpeed:0 }, hilda: {...}, bjorn: {...} }`
   - `sessionGold`: gold earned this run (reset each level start)
   - `debugMode`: false
2. `src/canvas.js`: Get canvas and 2d context. Export `ctx`, `W` (canvas width), `H` (canvas height). Set canvas to fill window. On resize, update W and H. Draw a solid `--color-bg` colored rectangle each frame to clear.
3. `main.js`: Import state, canvas. Track `lastTime` for delta. Start `requestAnimationFrame` loop. Each frame: calculate `dt = (now - lastTime) / 1000` (dt in seconds, clamped to max 0.1 to prevent spiral of death). Call `update(dt)` and `draw()`. Export `window.gameState = state` for debugging. Log FPS to console every 5 seconds.

**Review Checkpoint:**
- [ ] Browser shows dark canvas background, no errors
- [ ] Console logs ~60 FPS every 5 seconds
- [ ] `window.gameState` is accessible in browser console
- [ ] `gameState.screen` can be changed in console without crashing
- [ ] Canvas resizes correctly when browser window is resized

**✅ Confirm all checkboxes pass before Task 3**

---

### TASK 3 — Title Screen & Level Select
**Goal:** Functional title and level select screens drawn on canvas.

**Instructions:**
1. `src/screens.js`:
   - `drawTitleScreen(ctx, W, H)`: Draw dark background, "VIKINGFALL" title in Cinzel font (large, gold colored), subtitle "Defend the Gates", decorative horizontal lines above and below title (simulate rune border using short vertical tick marks), "Click to Begin" text (pulsing opacity animation using `Date.now()`).
   - `drawLevelSelectScreen(ctx, W, H, state)`: Draw 3 level cards evenly spaced. Each card: rectangle with border, level name, difficulty label. Locked levels (index > highestUnlockedLevel) show a lock icon (draw as simple canvas shape). Unlocked levels highlight on hover.
2. Click/Enter on title → `state.screen = 'levelSelect'`
3. Click unlocked level card → set `state.currentLevel`, call `resetLevelState(state, index)`, set `state.screen = 'combat'` (combat draws blank for now)
4. Track `state.highestUnlockedLevel` (starts at 0, increments on level completion)
5. Mouse position tracking: add `mousemove` listener on canvas, store `state.mouse = { x, y }` (used for hover effects)

**Review Checkpoint:**
- [ ] Title screen renders with title text, subtitle, decorative border lines, and pulsing "Click to Begin"
- [ ] Clicking title transitions to level select
- [ ] Level 1 card is clickable and highlighted on hover
- [ ] Levels 2 and 3 are visually locked/greyed
- [ ] Clicking Level 1 sets `state.screen` to `'combat'` and `state.currentLevel` to 0
- [ ] No console errors on any transition

**✅ Confirm all checkboxes pass before Task 4**

---

### TASK 4 — Combat Layout & Static Rendering
**Goal:** Draw the full combat screen with heroes, barricade, and HUD — no logic yet.

**Instructions:**
1. `src/ui.js`:
   - `drawHUD(ctx, W, H, state)`: Top bar (height ~60px) — dark background strip. Left: "Wave X / 20". Center: party level "Lvl X". Right: gold amount with coin icon (draw as small yellow circle).
   - `drawHeroPanel(ctx, W, H, state)`: Bottom strip (height ~120px). For each of 3 heroes: draw a placeholder rect (80×80px, colored by hero — gold/blue/brown), hero name below, HP bar below name. Heroes evenly spaced horizontally, centered.
   - `drawBarricade(ctx, W, H, state)`: Draw barricade rect centered horizontally at ~70% down the canvas. Width ~60% of canvas. HP bar above it. 3 visual stages based on `barricade.hp / barricade.maxHp`: >66% = solid rect, 33–66% = rect with 2 diagonal crack lines, <33% = rect with 4 crack lines and slight red tint.
2. `src/canvas.js`: Add helper `drawHealthBar(ctx, x, y, w, h, pct, color)` — draws grey background rect, colored fill rect based on pct.
3. Monster zone: just draw "Wave will begin shortly" text in upper area for now.
4. All layout positions defined as fractions of W and H — no hardcoded pixel values.

**Review Checkpoint:**
- [ ] Combat screen shows: HUD bar at top, 3 hero placeholders at bottom with HP bars and names, barricade centered above heroes
- [ ] HP bars render correctly at different values (test by setting `state.barricade.hp` in console)
- [ ] Barricade shows 3 visual crack stages correctly
- [ ] Layout looks reasonable at both 1280×720 and 1920×1080
- [ ] Hero HP bars show correct colors (not all the same color)

**✅ Confirm all checkboxes pass before Task 5**

---

### TASK 5 — Monster Spawning & Movement
**Goal:** Monsters spawn at top and move downward; status effects slow them.

**Instructions:**
1. `src/waves.js`:
   - `spawnWave(state, levelData)`: Create monster instances from level's monster pool. Instance has: `{ id: uuid(), defId, x, y, hp, maxHp, atk, speed, baseSpeed, w, h, state: 'moving', attackTimer: 0, statusEffects: [], dead: false }`. Spawn spread across center 70% of canvas width, staggered (not all at Y=0 at once — offset by 20px * index).
   - `updateMonsters(state, dt)`: For each living monster: apply status effects (reduce speed if chilled, stop if frozen — tick down durations). Move monster down by `effectiveSpeed * dt`. When monster Y >= barricade Y, set `monster.state = 'attacking'`.
2. `src/canvas.js`: Add `drawMonster(ctx, monster)` — draws colored rect (blue for frozen, normal color otherwise), blue tint overlay if chilled, HP bar above, monster name label.
3. In `main.js` `update(dt)`: call `updateMonsters(state, dt)`
4. In `main.js` `draw()`: loop `state.monsters` and call `drawMonster` for each non-dead monster
5. Auto-spawn wave 1 when combat screen first loads (for testing)

**Review Checkpoint:**
- [ ] Monsters appear at top and move smoothly downward
- [ ] Monsters are staggered (not spawning all at exact same Y)
- [ ] Monsters stop moving when they reach barricade Y position
- [ ] Test Chilled effect: manually push a statusEffect onto a monster in console, verify it slows
- [ ] Monster HP bars visible above each monster
- [ ] 10 monsters on screen with no visible frame drops (FPS stays near 60)

**✅ Confirm all checkboxes pass before Task 6**

---

### TASK 6 — Projectile System & Hero Attacks
**Goal:** Each hero fires their unique projectile; projectiles travel and hit monsters.

**Instructions:**
1. `src/projectiles.js`:
   - `updateProjectiles(state, dt)`: Move each projectile by `vx*dt, vy*dt`. Check collision with each living monster using rect overlap. On collision: call all `onHitEffects` functions, deal damage to monster, mark projectile dead unless `piercing: true`. Remove projectiles that are off-screen or dead.
   - `createArrow(hero, targetMonster)`: Returns a projectile object. Arrow travels from hero position toward target monster position. Fast velocity (~600px/s). Not piercing. `onHitEffects: []`
   - `createFrostbolt(hero, targetMonster, state)`: Like arrow but slower (~350px/s). Not piercing. `onHitEffects: [applyChillEffect]`. `applyChillEffect(monster, state)` pushes `{ type: 'chilled', duration: 3, speedMult: 0.7 }` onto `monster.statusEffects`.
   - `createLog(hero, state)`: Returns a projectile. Starts at Bjorn's X position, bottom of play area. Travels straight upward (`vy = -250`). Wide hitbox (40px wide). `piercing: true`. `onHitEffects: []`
2. `src/combat.js`:
   - `heroAttackTick(state, dt)`: For each living hero, increment `hero.atkTimer += dt`. When timer >= `1/hero.atkSpeed`: find best target (nearest monster for Astrid/Hilda, any monster on screen for Bjorn — log always goes straight up). Call the appropriate `create*` function and push result to `state.projectiles`. Reset timer.
   - Astrid and Hilda target: nearest monster by Y position (closest to bottom)
   - Bjorn: always fires straight up from his X position regardless of monster location
3. `src/canvas.js`: Add `drawProjectiles(ctx, state)` — for each projectile draw a colored rect: arrows = thin horizontal yellow rect, frostbolts = small blue circle, logs = brown horizontal wide rect.
4. In `update(dt)`: call `heroAttackTick`, then `updateProjectiles`
5. In `draw()`: call `drawProjectiles`

**Review Checkpoint:**
- [ ] Astrid fires arrows toward nearest monster at ~1.2 attacks/second
- [ ] Hilda fires frostbolts — monsters hit by frostbolt visibly slow down (blue tint, reduced speed)
- [ ] Bjorn fires a wide log straight upward at ~0.3 attacks/second
- [ ] Log hits ALL monsters it passes through (piercing)
- [ ] Arrows and frostbolts disappear on first hit (not piercing)
- [ ] Projectiles disappear when they go off-screen
- [ ] Monster HP bars decrease when hit
- [ ] FPS stays near 60 with multiple projectiles active

**✅ Confirm all checkboxes pass before Task 7**

---

### TASK 7 — Monster Combat & Deaths
**Goal:** Monsters deal damage to barricade and heroes; deaths handled cleanly.

**Instructions:**
1. `src/combat.js` — add:
   - `monsterAttackTick(state, dt)`: For each monster in `'attacking'` state: increment `monster.attackTimer += dt`. When timer >= `1/monster.atkSpeed`: if barricade alive, deal ATK to barricade. Else deal ATK to random living hero. Reset timer.
   - `handleDeaths(state)`: Check all monsters — if `hp <= 0`: mark `dead: true`, push floating gold text and EXP text to `state.floatingTexts`, add gold to `state.sessionGold`, add EXP via `addExp(state, monster.expReward)`. Check barricade — if `hp <= 0` set `barricade.dead = true`. Check heroes — if `hp <= 0` mark `dead: true`.
2. `src/canvas.js`:
   - `drawFloatingTexts(ctx, state)`: For each floating text, draw text at (x, y) with current alpha. Each frame in update: move `vy * dt` (upward), reduce `alpha -= dt * 0.8`. Remove when alpha <= 0.
   - Dead heroes: draw hero rect with 50% black overlay and an X mark.
3. `updateFloatingTexts(state, dt)` in update loop

**Review Checkpoint:**
- [ ] Monsters that reach barricade begin attacking it — barricade HP visibly decreases
- [ ] When barricade dies, monsters attack heroes — hero HP decreases
- [ ] Monsters killed by projectiles disappear and show "+N gold" and "+N exp" floating text
- [ ] Floating texts rise and fade out over ~1 second
- [ ] Dead heroes show greyed out with overlay, stop being targeted for attacks, their hero still occupies their slot
- [ ] Game does not crash when all heroes are dead (handles gracefully)

**✅ Confirm all checkboxes pass before Task 8**

---

### TASK 8 — EXP, Level Up & Skill Cards
**Goal:** Party gains EXP, triggers level-up overlay, player picks a skill that takes effect immediately.

**Instructions:**
1. `src/levelUp.js`:
   - `addExp(state, amount)`: Add to `state.party.exp`. While `exp >= expToNextLevel(state.party.level)`: subtract threshold, increment level, call `triggerLevelUp(state)`.
   - `expToNextLevel(level) = Math.floor(50 * level * 1.2)`
   - `triggerLevelUp(state)`: Set `state.screen = 'levelup'`. Build card draw pool from ALL heroes' skill pools, filter out already-acquired skill IDs. Randomly pick 3. Store in `state.pendingSkillCards`.
   - `drawLevelUpScreen(ctx, W, H, state)`: Draw semi-transparent dark overlay. Title: "LEVEL UP — Choose a Skill". Show 3 cards side by side, each ~200px wide: border rect, hero name tag, skill name, skill description. Highlight card under mouse cursor. 
   - `selectSkill(state, skillId)`: Find skill in hero data. Call `skill.apply(state)` (each skill has an apply function that mutates state). Push skill id to `state.party.activeSkills`. Clear `state.pendingSkillCards`. Set `state.screen = 'combat'`.
2. Each skill's `apply(state)` function is defined inline in `data/heroes.js`. Examples:
   - `astrid_1` (Eagle Eye): `state.heroes.find(h => h.id==='astrid').atk *= 1.25`
   - `hilda_1` (Deep Freeze): `state.heroes.find(h => h.id==='hilda').chillIsFreeze = true`
   - `bjorn_1` (Heavy Log): `state.heroes.find(h => h.id==='bjorn').atk *= 1.5`
3. The `combat.js` and `projectiles.js` must check for these flags when creating effects (e.g. if `hilda.chillIsFreeze`, the chill effect sets `speedMult: 0` and `duration: 2` instead of default)

**Review Checkpoint:**
- [ ] Kill monsters → EXP accumulates → level up overlay appears (game pauses, monsters stop moving)
- [ ] 3 skill cards are shown with name and description
- [ ] Cards highlight on hover
- [ ] Clicking a card closes overlay and resumes combat
- [ ] Skill effect is applied: test Eagle Eye — Astrid's damage visibly increases (use debug mode to show ATK stat)
- [ ] Level up can trigger multiple times in one game level
- [ ] The same skill cannot appear twice in one run
- [ ] Party level displayed in HUD updates correctly

**✅ Confirm all checkboxes pass before Task 9**

---

### TASK 9 — Wave Progression & Level Completion
**Goal:** All 20 waves run in sequence; level ends with loot screen.

**Instructions:**
1. `src/waves.js`:
   - Track `state.waveCleared`: set true when `state.monsters.every(m => m.dead)`
   - When wave cleared: start 3-second timer (`state.waveTransitionTimer`). During timer, show "Next Wave in X..." in center screen. When timer ends: heal all living heroes by 10% maxHp, reset barricade HP, increment `state.currentWave`, spawn next wave (or trigger loot if wave 20 done).
   - Boss wave logic: if `(waveIndex + 1) % 10 === 0`, spawn 1 boss monster from the level's monster pool boss variant instead of normal wave.
2. `src/screens.js` — `drawLootScreen(ctx, W, H, state)`:
   - Dark panel in center: "Victory!" header
   - Show: "Gold earned: X", "Shards found: X [hero name]" (or "No shards this run" if none)
   - Shard drop: `Math.random() < 0.1` on level complete → pick random hero → +1 to their shards
   - "Continue" button → `state.screen = 'upgrade'`
3. `src/waves.js` — `resetForNextLevel(state)`: reset party level to 1, exp to 0, activeSkills to [], hero levels to 1, re-apply permanent upgrades to fresh hero stats.

**Review Checkpoint:**
- [ ] Wave counter in HUD increments each wave
- [ ] "Next Wave in X..." countdown visible between waves
- [ ] Hero HP partially recovers between waves
- [ ] Barricade resets HP between waves
- [ ] Wave 10 spawns a boss (larger, higher HP)
- [ ] Wave 20 completion shows loot screen with gold total
- [ ] "Continue" button works and transitions to upgrade screen

**✅ Confirm all checkboxes pass before Task 10**

---

### TASK 10 — Upgrade Screen, Persistence & Game Over
**Goal:** Between-run upgrades, save/load, game over screen. Full loop playable.

**Instructions:**
1. `src/upgrades.js` — `drawUpgradeScreen(ctx, W, H, state)`:
   - Show all 3 heroes in a row, each with: name, current stats (ATK, HP, ATK Speed), shard count, star rating
   - For each hero: 3 upgrade buttons (ATK +5%, HP +5%, ATK Speed +3%). Each button shows current cost. Grey out if not enough gold.
   - Ascend button per hero: only active if `hero.ascension.stars < 3` AND `hero at max level` AND `shards >= ascendCost`. Show star rating change.
   - "Back to Map" button → `state.screen = 'levelSelect'`
2. `buyUpgrade(state, heroId, type)`: Deduct gold, increment `state.permanentUpgrades[heroId][type]`. Cost formula: `baseCost * (1.4 ^ purchaseCount)` — baseCost: ATK=80, HP=60, ATK Speed=100.
3. `ascendHero(state, heroId)`: Deduct shards, increment `hero.ascension.stars`, set new `maxLevel` per ascension table.
4. `src/gameState.js` — add `saveGame(state)` and `loadGame()`:
   - Save: `localStorage.setItem('vikingGameSave', JSON.stringify({ gold, shards, permanentUpgrades, highestUnlockedLevel, heroAscensions }))`
   - Load: parse and merge into default state on startup
   - Auto-save on: level complete, upgrade purchase, ascension
5. `src/screens.js` — `drawGameOverScreen(ctx, W, H, state)`:
   - "Your Heroes Have Fallen" title
   - Gold earned this run
   - Two buttons: "Try Again" (restart same level, keep gold), "Retreat" (go to upgrade screen)

**Review Checkpoint:**
- [ ] Upgrade screen shows all 3 heroes with stats and upgrade buttons
- [ ] Buying upgrade deducts correct gold amount and stat visibly changes
- [ ] Cannot buy upgrade without enough gold (button greyed/disabled)
- [ ] Ascend button only active when conditions are met
- [ ] Refresh browser → gold, upgrades, shards, and unlocked levels all restored
- [ ] All 3 heroes dying triggers game over screen
- [ ] "Try Again" restarts the same level; "Retreat" goes to upgrade screen
- [ ] "Back to Map" from upgrade screen works

**✅ Confirm all checkboxes pass before Task 11**

---

### TASK 11 — Polish, Debug Mode & Full Loop Test
**Goal:** Visual polish; debug overlay; verify full game loop plays cleanly end-to-end.

**Instructions:**
1. Polish items:
   - Chilled monsters: draw blue snowflake (❄ character or simple 6-line star shape) above them
   - Frozen monsters: draw icy blue full-rect overlay with 70% opacity
   - Bjorn's log: give it a slight rotation animation as it rolls (increment `projectile.angle += 5 * dt`, use `ctx.save/rotate/restore` when drawing)
   - Barricade: add wooden plank lines drawn across the rect (5 horizontal lines, evenly spaced)
   - Wave transition: fade canvas to black over 0.3s, then fade back in when next wave spawns
   - HUD gold: when gold increases, briefly scale the gold text up (0.2s spring animation)
2. Debug mode (toggle with `D` key):
   - Show FPS top-right
   - Show each hero's ATK, ATK Speed, HP values above their slot
   - Show projectile hitbox outlines
   - Show monster count, active projectile count
3. Full loop test: play through Title → Level 1 → all 20 waves → Loot → Upgrade → Level 2 → Game Over → Try Again → Level 1 again. Verify save/load works throughout.

**Review Checkpoint:**
- [ ] Frozen monsters show icy overlay, chilled monsters show snowflake
- [ ] Bjorn's log visibly rotates as it travels
- [ ] Barricade has plank-line texture
- [ ] Wave fade transition works without flickering
- [ ] Press D → debug overlay appears with FPS and hero stats
- [ ] Full game loop plays without any console errors
- [ ] Completing Level 1 unlocks Level 2 on the level select screen
- [ ] Save/load verified: close and reopen browser mid-upgrade and state is restored

**✅ Full prototype complete — ready for sprite integration**

---

## After Task 11 — Sprite Integration Guide

All hero and monster draw calls already have placeholder rects. To add sprites:

```js
// In canvas.js — add sprite cache
const spriteCache = {};
export function loadSprite(key, path) {
  const img = new Image();
  img.src = path;
  img.onload = () => { spriteCache[key] = img; };
}

export function drawSprite(ctx, key, x, y, w, h, flipX = false) {
  const img = spriteCache[key];
  if (!img) { drawPlaceholderRect(ctx, x, y, w, h); return; }
  if (flipX) {
    ctx.save(); ctx.scale(-1,1);
    ctx.drawImage(img, -x-w, y, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
}
```

**Sprite naming convention (drop into /assets/sprites/):**
- `hero_astrid.png` — Astrid sprite (facing right or forward)
- `hero_hilda.png` — Hilda sprite
- `hero_bjorn.png` — Bjorn sprite
- `monster_grunt.png`, `monster_archer.png`, `monster_berserker.png`, `monster_shaman.png`, `monster_boss.png`
- `projectile_arrow.png`, `projectile_frostbolt.png`, `projectile_log.png` (optional — placeholders work fine)

Monsters face downward. If sprite faces right, set `flipX: false`. Sprites are drawn centered on the entity's x, y position.


---

## Scaling Notes (Post-Prototype)

- **Infinite levels:** `levels.js` exports a `generateLevel(n)` function using formulas: `monsterHp = base * (1 + n*0.15)`, `gold = base * (1 + n*0.1)`. Levels 4+ use this instead of hardcoded objects.
- **More heroes:** Add to `heroes.js` array. Combat, upgrade, and loot screens iterate the array — no hardcoded hero counts anywhere.
- **More skill modifiers:** Add to a hero's `skillPool` in `heroes.js`. The `apply(state)` function pattern handles everything — no changes needed in `levelUp.js`.
- **Audio:** Add `src/audio.js`. All combat events (hit, level up, wave clear) already have hook comments (`// TODO: playSound('hit')`). Implement once rest is stable.
- **Sprite animation:** Replace `drawImage` call with a frame counter per entity: `entity.frame += fps * dt`, `srcX = Math.floor(entity.frame % totalFrames) * frameWidth`.
- **More status effects:** Add to the statusEffects grammar in `projectiles.js`. Burn, poison, stun all follow the same `{ type, duration, ... }` pattern as Chilled.

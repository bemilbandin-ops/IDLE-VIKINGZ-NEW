# Modern Gritty Viking Redesign Design

Date: 2026-06-11

## Goal

Make Vikingfall feel like a modern, polished 2D browser game instead of a prototype with MSPaint-like or pixelated graphics. The new direction is modern gritty Viking fantasy: smooth illustrated assets, distinct animated monsters, war-camp UI materials, and clearer game flows.

The redesign should keep the current plain JavaScript and canvas architecture. It should not introduce a framework rewrite.

## Current Context

The project already has a canvas game loop and a runtime SVG overlay:

- `src/canvas.js` draws the background, old canvas monster shapes, particles, and projectiles.
- `src/ui.js` draws the combat HUD, hero panel, barricade, run stats, and torches.
- `src/screens.js` draws title, level select, upgrades, shop, gear, achievements, victory, defeat, and skill choice overlays.
- `assets/sprites.js` generates hero and monster SVGs as data URIs.
- `assets/visualPatch.js` draws the newer SVG heroes and monsters over the canvas.

The heroes are the strongest visual reference. They have readable faces, gear, weapons, color identity, and glow accents. The monsters are currently too similar to each other and rely on simple shared silhouettes. The UI also uses many emoji-like symbols, generic gold borders, and panel treatments that do not feel cohesive.

## Visual Direction

The target is smooth modern 2D art with gritty Viking materials:

- Charred wood, carved timber, leather, hide, iron brackets, worn bronze, ash, snow, torchlight.
- Smooth SVG rendering and layered shapes, not pixel art.
- Muted dark base palette with controlled warm torch accents and limited magic accents.
- Strong silhouettes and readable gameplay shapes.
- Fewer emoji-style icons. Replace them with code-drawn or SVG-style marks that match the game.

The redesign must remove the intentional pixelated canvas presentation. The game should feel crisp and animated rather than blocky.

## Monster SVG Redesign

Each monster gets a unique, layered SVG in `assets/sprites.js`. They should share the same broad tone as the current heroes: outlined, stylized, readable at small sizes, and equipped with enough detail to feel handcrafted.

### Grunt

Role: basic raider.

Visuals:

- Hunched raider body.
- Battered round shield.
- Crude axe or short weapon.
- Leather/iron armor.
- Warm torch-orange accents.

Animation hooks:

- Slow idle sway.
- Small shield bob.
- Hit flash around shield/body.

### Archer

Role: fast ranged enemy.

Visuals:

- Lean fur-hooded silhouette.
- Bow clearly visible.
- Narrow face or glowing eye slit.
- Cold blue steel accents.

Animation hooks:

- Light bob and bow-hand motion.
- Subtle draw-back pose through rotation or squash, as long as the visual sprite still aligns with the existing hitbox.

### Berserker

Role: heavy melee brute.

Visuals:

- Wide shoulders, larger torso.
- Red war paint.
- Animal-hide shoulder shape or horned helm silhouette.
- Heavy cleaver/axe.

Animation hooks:

- Heavier sway than other monsters.
- Slight forward lean.
- Stronger hit recoil.

### Shaman

Role: magic support enemy.

Visuals:

- Dark robe.
- Crooked staff.
- Bone charms and hanging talismans.
- Muted violet rune glow, not neon overload.

Animation hooks:

- Staff/orb pulse.
- Small floating charm movement.

### Boss

Role: warlord/chieftain threat.

Visuals:

- Oversized warlord or giant chieftain.
- Iron crown, helm, or trophy antlers.
- Trophy bones and heavy armor.
- Ember eyes.
- Larger shoulders and more visual mass than all standard monsters.

Animation hooks:

- Slower, heavier idle motion.
- Stronger shadow and boss HP treatment.
- More dramatic hit flash.

## Combat Visual Polish

Combat should be more readable and alive:

- Remove `image-rendering: pixelated` from the canvas CSS.
- Keep SVG sprites smooth and scale them with intentional proportions.
- Improve monster HP bars so they feel like part of the same war-camp UI.
- Improve hit feedback with brief flash, recoil, particles, and readable damage text.
- Preserve chilled/frozen gameplay states, but represent them through icy overlays and reduced motion rather than simple symbol labels alone.
- Keep hero readability. Do not reduce the quality of the current hero sprites.
- Tune glow usage so it supports gameplay feedback without making the whole screen arcade-neon.

## UI/UX Structural Redesign

The UI should feel like one cohesive game interface, not separate canvas experiments.

### Title Screen

Change the title screen into a war-camp command screen:

- Strong game title.
- Main navigation presented as carved war-table options, not generic stacked buttons.
- Gold and auto-skill controls should be visible but visually secondary.
- Achievements indicator should feel like a small command badge.

### Level Select

Change level select into a campaign/battle board:

- Use carved map/card styling.
- Make locked, unlocked, difficulty, and boss levels clearer.
- Replace primary emoji level icons with matching simple SVG/canvas marks. Minor inline reward symbols may remain only where replacing them would not materially improve the screen.
- Keep click targets stable and understandable.

### Hero Upgrades

Change hero upgrades into a roster hall:

- Three hero cards with stronger visual identity.
- Upgrade rows should be readable and compact.
- Ascension status should be visually distinct from regular upgrades.
- Reduce clutter and repeated decoration.

### Shop, Gear, Achievements

These overlays should share a consistent component system:

- Modal backdrop.
- Panel frame.
- Header.
- Rows/cards.
- Primary and secondary buttons.
- Disabled states.
- Hover states.

Gear and shop can still have different accent colors, but they should feel like parts of the same game.

### Combat HUD

Improve combat HUD hierarchy:

- Top bar: wave, party level/XP, gold, quit, auto-skill.
- Right run ledger: tighter and less visually heavy.
- Bottom hero bench: clear hero identity, HP, level, and status.
- Barricade: more integrated into the scene, with better material and damage readability.

### Skill Choice Popup

Change skill choices into etched tablets:

- Three strong cards.
- Clear hero association.
- Skill type and description remain readable.
- Hover/selection state feels tactile.
- Avoid emoji as the main icon treatment.

## Architecture Plan

Keep the current app structure, but improve drawing boundaries where needed:

- Add or consolidate reusable visual helpers for panels, buttons, labels, bars, and icon marks.
- Keep game state in `src/gameState.js` only.
- Keep draw functions parameterized by `ctx`, `W`, `H`, and state data.
- Avoid a framework migration.
- Keep asset generation inside `assets/sprites.js` unless a separate SVG helper module becomes clearly simpler.
- Avoid unrelated refactors.

Likely implementation areas:

- `style.css`: remove pixelated rendering and update base canvas behavior.
- `assets/sprites.js`: replace monster SVG generation with higher-quality unique SVGs.
- `assets/visualPatch.js`: tune sprite scales, animation offsets, chilled/frozen rendering, HP bars, and combat overlay polish.
- `src/screens.js`: redesign menu screens and shared screen components.
- `src/ui.js`: redesign combat HUD, hero panel, run stats, barricade treatment.
- `src/canvas.js`: reduce old geometric monster visibility where the SVG overlay is the intended renderer; tune background, particles, and combat effects as needed.

## Testing And Verification

Verification should include:

- Open the game locally.
- Check title, level select, combat, hero upgrades, shop, gear, achievements, skill choice, victory, and defeat.
- Confirm no missing imports or undefined helper functions.
- Confirm click targets still match the redesigned UI.
- Confirm monster SVGs load for grunt, archer, berserker, shaman, and boss.
- Confirm chilled/frozen states remain visible.
- Confirm mobile/narrow viewport does not clip critical controls.
- Confirm rendering is no longer intentionally pixelated.

If no package scripts exist, manual browser verification is acceptable, but syntax/module loading must still be checked through the browser console or an equivalent local run.

## Out Of Scope

- No framework rewrite.
- No gameplay balance changes unless required by UI layout.
- No new hero system.
- No new levels or monsters beyond replacing the existing monster visuals.
- No persistence format changes.

# Refactoring Suggestions

A review of code duplication, dead code, and maintainability improvements for the Vikingfall codebase.

## Summary

| Priority | Category | Issue | Files Affected | Effort |
|----------|----------|-------|---------------|--------|
| High | Deduplication | Duplicate `formatGold()` function | `utils.js`, `ui.js` | Low |
| High | Deduplication | Duplicate `hexToRgb()` function | `canvas.js`, `ui.js` | Low |
| High | Deduplication | Duplicate `roundRect()` function | `canvas.js`, `screens.js`, `ui.js` | Low |
| Medium | Dead Code | No-op `lightenHex()` function | `canvas.js` | Low |
| Medium | Duplication | Click handler recalculates draw dimensions | `screens.js` | Medium |
| Medium | Consolidation | Multiple localStorage save functions | `screens.js`, `waves.js` | Medium |
| Low | Performance | Hex-to-RGB parsing in hot paths | `screens.js`, `ui.js` | Medium |
| Low | Documentation | Confusing status effect comment | `waves.js` | Low |

---

## 1. Duplicate `formatGold()` Function

### Location
- `src/utils.js:13-17`
- `src/ui.js:405-409`

### Current State
```javascript
// utils.js
export function formatGold(n) {
    if (n >= 1000000) return Math.floor(n / 1000000) + 'M';
    if (n >= 1000) return Math.floor(n / 1000) + 'K';
    return Math.floor(n).toString();
}

// ui.js - slightly different (missing Math.floor for thousands)
function formatGold(n) {
    if (n >= 1000000) return Math.floor(n / 1000000) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.floor(n).toString();
}
```

### Suggestion
Remove the local version in `ui.js` and import from `utils.js`. The `utils.js` version is more consistent (integer output).

---

## 2. Duplicate `hexToRgb()` Function

### Location
- `src/canvas.js:230-233`
- `src/ui.js:398-403`

### Current State
Both implementations are identical:
```javascript
function hexToRgb(hex) {
    if (!hex || hex.length < 7) return '128,128,128';
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
}
```

### Suggestion
- Move to `utils.js` and export
- Remove local copies from `canvas.js` and `ui.js`
- Import where needed

---

## 3. Duplicate `roundRect()` Function

### Location
- `src/canvas.js:219-228`
- `src/screens.js:781-790` (with additional validation)
- `src/ui.js:388-396`

### Current State
Three nearly identical implementations of the same canvas helper.

### Suggestion
- Consolidate into `utils.js` as a shared helper
- Note: `screens.js` has slight edge-case handling (`w < 2*r` and `h < 2*r`) that should be preserved

---

## 4. Dead Code: No-op `lightenHex()` Function

### Location
- `src/canvas.js:230-233`

### Current State
```javascript
function lightenHex(color, amount) {
    // Simple brightness boost via rgba
    return color;
}
```

### Suggestion
Either:
1. Remove entirely if unused (check for references)
2. Implement actual lightening logic
3. Rename to `identity()` if placeholder for future work

---

## 5. Click Handler Recalculates Draw Dimensions

### Location
- `src/screens.js:668-776`

### Current State
The `handleClick()` function recalculates panel dimensions (`pW`, `pH`, `pX`, `pY`) that are already computed in:
- `drawShopOverlay()` 
- `drawHeroUpgradeOverlay()`

This creates a maintenance burden - changes to draw logic must be mirrored in click logic.

### Suggestion
Extract dimension calculations into shared helper functions:
```javascript
function getShopPanelDims(W, H) {
    return {
        pW: Math.min(W * 0.58, 500),
        pH: H * 0.72,
        pX: W / 2 - pW / 2,
        pY: H / 2 - pH / 2
    };
}
```

---

## 6. Consolidated LocalStorage Save Functions

### Location
- `src/screens.js:815-820`
- `src/waves.js:145-157`

### Current State
Three separate save functions with overlapping functionality:
- `saveGold()` - saves gold only
- `savePermanentUpgrades()` - saves upgrades only
- `saveProgress()` - saves full state

### Suggestion
Consolidate into a single `saveGameState()` utility in `utils.js` that handles all save operations atomically.

---

## 7. Hex-to-RGB Parsing in Hot Paths

### Location
- `screens.js` and `ui.js` - UI draw loops

### Current State
`hexToRgb()` is called every frame for UI elements (buttons, panels, text).

### Suggestion
- Pre-compute RGB values at initialization time
- Store both hex and rgb in config objects
- Or cache results in a Map to avoid repeated parsing

---

## 8. Confusing Status Effect Comment

### Location
- `src/waves.js:59-63`

### Current State
```javascript
// Target the monster furthest down (lowest y = highest on screen = closest)
// Actually monsters move DOWN so highest y value = closest to barricade = highest threat
const target = state.monsters
    .filter(m => !m.dead)
    .sort((a, b) => b.y - a.y)[0]; // Sort by highest y (furthest down)
```

### Suggestion
Clean up the contradictory comments. The implementation is correct (sorts by highest y). Suggested replacement:
```javascript
// Target monster closest to barricade (highest y value)
const target = state.monsters
    .filter(m => !m.dead)
    .sort((a, b) => b.y - a.y)[0];
```

---

## Impact Assessment

| Change | Breaking Change | Tests Needed | Notes |
|--------|-----------------|--------------|-------|
| 1-3 | No | None | Import/export changes only |
| 4 | No | None | Removal or implementation |
| 5 | No | Manual UI testing | Logic remains identical |
| 6 | No | localStorage verification | Behavior preserved |
| 7 | No | Performance testing | Micro-optimization |
| 8 | No | None | Comment-only cleanup |

## Recommended Implementation Order

1. **Low-risk cleanup**: Remove dead code (#4), fix comments (#8)
2. **Deduplication**: Consolidate utility functions (#1-3)
3. **Architecture**: Refactor click handler (#5)
4. **Performance**: Cache RGB conversions (#7)
# FONT_SCALE_STARTUP_MATRIX — Wave 0

## Live

Default production measure used browser default prefs → `--ui-font-scale ≈ 1`  
Observed: `html/body` compute body **17px** early and final on all five routes (`fontDelta=0`).

## Static contract (gates — all scales)

Canonical formula (critical + sync + deferred):

```css
html { font-size: calc(100% * var(--ui-font-scale, 1)); }
body { font-size: 1.0625rem; }
```

Product scales from `mj-theme-boot`:

| Pref | --ui-font-scale | Expected root @16px UA | Body rem effect |
|---|---:|---:|---|
| clamp-low | 0.85 | 13.6px | scaled rem |
| صغير | 0.92 | 14.72px | scaled rem |
| متوسط | 1.00 | 16px | 17px body |
| كبير | 1.08 | 17.28px | scaled rem |
| senior | 1.16 | 18.56px | scaled rem |
| clamp-high | 1.35 | 21.6px | scaled rem |

Historical bug (CLOSED R1): absolute `html{font-size:16px}` after sync nullified scale → grow/shrink.  
Gate proof: `test:startup-typography-fouc-p0` / `p2`.

## Residual

FONT_FALLBACK_SETTLING (family stack) ≠ font-size jump. Wave 3 tunes size-adjust only with measure.

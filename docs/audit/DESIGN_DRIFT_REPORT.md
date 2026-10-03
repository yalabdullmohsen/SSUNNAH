# DESIGN_DRIFT_REPORT

Generated: 2026-10-03T08:28:50.129Z

## Scores

- consistencyScore: **88**
- driftScore: **12**
- authorityAdoptionRatio: **41%**

## Debt vs ceilings

| Metric | Current | Ceiling | Status |
|---|---:|---:|---|
| hexInCss | 7022 | 7022 | ✅ |
| boxShadowDecls | 1010 | 1010 | ✅ |
| borderRadiusPxDecls | 429 | 429 | ✅ |
| rgbHslInCss | 2087 | 2087 | ✅ |
| important | 4747 | 4747 | ✅ |
| rawButtonFiles | 102 | 102 | ✅ |

## Top divergence sources

- **cards**: bypass=208 · adoption=9%
- **forms**: bypass=177 · adoption=7%
- **buttons**: bypass=100 · adoption=71%
- **lists**: bypass=74 · adoption=10%
- **tabs**: bypass=72 · adoption=3%

## Easiest wins

- **tables**: امتصاص 14 ملفًا يتجاوز السلطة — عائد سريع على adoption
- **navigation**: امتصاص 1 ملفًا يتجاوز السلطة — عائد سريع على adoption
- **modals**: امتصاص 1 ملفًا يتجاوز السلطة — عائد سريع على adoption

## Missing authority maps

- none

## Weak exit signals

- none

## Rogue signal proxies

- hex / rgbHsl / boxShadowDecls / borderRadiusPx tracked by visual-system-inventory
- component bypass tracked by authority-coverage-report
- growth beyond ceilings = drift (absorption-only reductions allowed)

Drift auto-detect: **CLEAR**

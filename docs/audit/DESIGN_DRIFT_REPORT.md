# DESIGN_DRIFT_REPORT

Generated: 2026-10-05T17:49:31.652Z

## Scores

- consistencyScore: **89**
- driftScore: **11**
- authorityAdoptionRatio: **47%**

## Debt vs ceilings

| Metric | Current | Ceiling | Status |
|---|---:|---:|---|
| hexInCss | 5224 | 5546 | ✅ |
| boxShadowDecls | 982 | 982 | ✅ |
| borderRadiusPxDecls | 338 | 391 | ✅ |
| rgbHslInCss | 1959 | 1959 | ✅ |
| important | 4715 | 4720 | ✅ |
| rawButtonFiles | 14 | 45 | ✅ |

## Top divergence sources

- **cards**: bypass=198 · adoption=9%
- **forms**: bypass=146 · adoption=24%
- **lists**: bypass=73 · adoption=10%
- **tabs**: bypass=69 · adoption=7%
- **tables**: bypass=13 · adoption=43%

## Easiest wins

- **tables**: امتصاص 13 ملفًا يتجاوز السلطة — عائد سريع على adoption
- **buttons**: امتصاص 13 ملفًا يتجاوز السلطة — عائد سريع على adoption
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

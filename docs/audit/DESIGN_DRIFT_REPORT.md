# DESIGN_DRIFT_REPORT

Generated: 2026-10-06T19:03:55.857Z

## Scores

- consistencyScore: **90**
- driftScore: **10**
- authorityAdoptionRatio: **48%**

## Debt vs ceilings

| Metric | Current | Ceiling | Status |
|---|---:|---:|---|
| hexInCss | 5212 | 5212 | ✅ |
| boxShadowDecls | 1002 | 1002 | ✅ |
| borderRadiusPxDecls | 349 | 349 | ✅ |
| rgbHslInCss | 1970 | 1970 | ✅ |
| important | 4704 | 4704 | ✅ |
| rawButtonFiles | 3 | 3 | ✅ |

## Top divergence sources

- **cards**: bypass=202 · adoption=9%
- **forms**: bypass=147 · adoption=23%
- **lists**: bypass=74 · adoption=9%
- **tabs**: bypass=68 · adoption=8%
- **tables**: bypass=13 · adoption=43%

## Easiest wins

- **tables**: امتصاص 13 ملفًا يتجاوز السلطة — عائد سريع على adoption
- **buttons**: امتصاص 2 ملفًا يتجاوز السلطة — عائد سريع على adoption
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

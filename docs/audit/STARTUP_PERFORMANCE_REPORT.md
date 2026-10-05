# STARTUP_PERFORMANCE_REPORT

Generated: 2026-10-05T17:15:47.805Z

Sync CSS imports in main.tsx: **14**

## Ranked startup cost proxies

1. **HTML shell + critical CSS** — critical-css ≤60KiB gzip gate
2. **Sync CSS in main.tsx** — 14 imports
3. **Boot sequence / splash** — boot-sequence + splash controller gates
4. **Home hydration** — startup-pr5 hero hydration gate
5. **Deferred CSS/JS** — mainDeferred≈55

## Documented field (prod)

- CLS 0.0004
- CURRENT_PROJECT_STATUS Batch A · STARTUP_CHROME_STABLE · LHCI_HOME_MOBILE_CLOSED
- unused-css 0×3 (documented)
- forced-reflow 1×3 (documented)

## Not measured this run

- FP/FCP/LCP wall-clock
- hydration CPU ms
- startup network bytes

Budgets (performance-budget.json webVitals):

```json
{
  "lcpMs": 2500,
  "fcpMs": 1800,
  "cls": 0.05,
  "tbtMs": 100,
  "inpMs": 200,
  "ttfbMs": 800
}
```

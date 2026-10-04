# STARTUP_STYLESHEET_GRAPH — Wave 0

**Tip:** `eb2f0bdcc`  
**Sync critical CSS imports in `main.tsx`:** **14** (QUALITY_BASELINE ceiling = 14 — HELD)  
**Deferred `import()` call sites inside `loadNonCriticalCss`:** **51** (includes duplicates)

## Sync (CRITICAL path — do not grow)

1. fonts-ui.css  
2. app/styles/theme.css  
3. sunnah-foundation-tokens.css  
4. sunnah-foundation-v2.css  
5. ssunnah-theme-api.css  
6. brand-v4.css  
7. design-tokens.css  
8. breakpoints.css  
9. typography-scale.css  
10. typography-app.css  
11. index.css  
12. theme-aliases.css  
13. semantic-layer-tokens.css  
14. interaction-states.css  

Plus inline `#mj-lcp-critical` / `#mj-splash-critical` in `index.html`.

## Deferred graph issues (Wave 2)

Call-site pairs below are **mutually exclusive** by `deferAppChromeCss` (Home/Mushaf vs other) — not double-loaded on one route:

- `./styles/modern-ui-refresh.css` ×2 call sites (exclusive branches)  
- `./styles/ssunnah-ds-canonical.css` ×2  
- `./styles/sunnah-visual-language.css` ×2  
- `./styles/sunnah-geometry-system.css` ×2  

S2 change: `visual-enrichment.css` moved into heavy/non-ATF path for Home/Mushaf to cut early soft paint.  

Route-gated (present in source comments/branches):

- Home/Mushaf defer heavy identity  
- `index-deferred-pages` / reading shells / islam-intro not ATF Home  
- dark layers via `ensureDarkLayersForBoot` when boot dark  

## Live sheet counts (cold)

| Route | early | final | networkCss |
|---|---:|---:|---:|
| home | 3 | 59 | 60 |
| search | 6 | 82 | 81 |
| quran-hub | 6 | 87 | 86 |
| mushaf | 6 | 46 | 49 |
| prayer-times | 6 | 66 | 65 |

## Classification seeds for Wave 2

- CRITICAL_GEOMETRY: `#mj-lcp-critical`, sync typography/theme/index  
- EARLY_VISIBLE_STYLE: section-cards / nav tokens needed before soft paint  
- ROUTE_DEFERRED: mushaf/quran/reading/prayer page CSS  
- DECORATIVE_DEFERRED: geometry ornaments, enrichment  
- DUPLICATE_WITH_PROOF: the four duplicated deferred imports above  
- KEEP_DEFERRED_WITH_EVIDENCE: card-system after idle (must not touch html/body)

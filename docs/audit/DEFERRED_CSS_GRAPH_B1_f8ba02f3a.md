# Deferred CSS Graph — Track B1

| Field | Value |
|-------|-------|
| TASK_CLASSIFICATION | SHARED_PLATFORM |
| Branch | `cursor/deferred-css-b1-d2924d5fe` |
| Baseline commit | `f8ba02f3a20f9c0ebb18062ff4518e514686154a` (short `f8ba02f3a`) |
| Source | `artifacts/majalis/src/main.tsx` · `artifacts/majalis/src/lib/ensure-dark-layers.ts` |
| Generated (UTC) | 2026-10-05T04:49:17.416Z |

## Purpose

Inventory and classify every stylesheet in the **deferred startup graph** (dynamic `import()` from `main.tsx` plus dark-layer loader). Sync critical imports (`CRITICAL_CSS_BUDGET = 14` per `startup-deferred-css-s2-gate`) are out of scope.

## Load topology (summary)

| Mechanism | Delay | Notes |
|-----------|-------|-------|
| `scheduleNonCriticalCss` | `load` + `scheduleOnIdle(..., 2500)` | Entry to `loadNonCriticalCss` |
| `deferAppChromeCss` | `path === "/"` or `/mushaf*` | Skips early mur/ds/svl/enrichment/pages bundle |
| `loadHeavyIdentityCss` | interaction **or** 60s (Home) / 90s (Mushaf) | `design-system → final-release → card/editorial` chain |
| `wantsReadingShell` | same idle tranche | lessons/hadith/fiqh/topics/scholars/fawaid/adhkar |
| `fonts-ui-bold.css` | `setTimeout 20_000` | decorative weights |
| `ensure-dark-layers.ts` | idle / boot-dark / theme switch | single-flight promises (no duplicate module inject) |

**Import site counts:** `void import()` CSS statements in `main.tsx` = **55** (unique sheets **50**). Dark loader adds **6** sheets (`ensure-dark-layers.ts`). **Graph nodes = 56** unique deferred sheets.

**Dual-site sheets (same file, mutually exclusive branches — not removable without route regression):** `modern-ui-refresh.css`, `ssunnah-ds-canonical.css`, `visual-enrichment.css`, `sunnah-visual-language.css`, `sunnah-geometry-system.css`.

## Classification taxonomy

| Class | Meaning |
|-------|---------|
| **EARLY_VISIBLE_REQUIRED** | Needed soon after idle for chrome/interaction correctness on broad routes; not first-paint critical but visible soft-FOUC if delayed further |
| **ROUTE_DEFERRED** | Gated by route (`deferAppChromeCss`, `wantsReadingShell`, native-only, or Home/Mushaf skip) |
| **DECORATIVE_DEFERRED** | Polish, patterns, enrichment — safe to delay; no first-frame geometry contract |
| **DUPLICATE_WITH_PROOF** | Two `import()` sites in `main.tsx`; branches mutually exclusive; Vite dedupes module instance |
| **RELOAD_TO_WIN** | Cascade order or dark bundle must complete once; re-import is no-op (documented in ensure-dark-layers / final-release chain) |
| **DEAD_WITH_PROOF** | No live consumer; file removable |

## Totals (56 graph nodes)

| Class | Count |
|-------|------:|
| EARLY_VISIBLE_REQUIRED | **5** |
| ROUTE_DEFERRED | **14** |
| DECORATIVE_DEFERRED | **18** |
| DUPLICATE_WITH_PROOF | **5** |
| RELOAD_TO_WIN | **14** |
| DEAD_WITH_PROOF | **0** |
| **Sum** | **56** |

## Removals (this PR)

| Action | Rationale |
|--------|-----------|
| **None** | No `DEAD_WITH_PROOF` sheet in graph (`chunk-recovery-toast.css` already removed per PR E). Dual-site imports are contractually required (`startup-deferred-css-s2-gate`). Removing a duplicate site would change Home/Mushaf timing (reload-to-win / LHCI risk). |

## cssFiles / deferred count delta

| Metric | Before | After | Changed |
|--------|--------|-------|---------|
| `visual-system-baseline.json` `cssFiles` | 353 | 353 | **no** |
| `void import()` CSS sites in `main.tsx` | 55 | 55 | **no** |
| Unique deferred sheets (main + dark loader) | 56 | 56 | **no** |
| Sync critical CSS imports in `main.tsx` | 14 | 14 | **no** |

## Related loaders (out of graph but referenced)

| Loader | Sheets | Class |
|--------|--------|-------|
| `route-surface.ensurePrayerRouteShellCss` | `prayer-route-shell.css` | ROUTE_DEFERRED (prayer path) |
| `route-surface.prefetchPrayerRouteAssets` | `pages/prayer-times.css` | ROUTE_DEFERRED |
| Lazy route/component `import("*.css")` | 200+ additional sheets | ROUTE_DEFERRED (per-route; not startup graph) |

## Full inventory

| Sheet | Class | Loader | Route consumers | First frame | Geometry | Color | Typography | Authority / notes |
|-------|-------|--------|-----------------|-------------|----------|-------|------------|-------------------|
| `styles/z-index-layers.css` | EARLY_VISIBLE_REQUIRED | main loadNonCriticalCss (idle+2500ms) | global | no | stacking contexts for modals/nav overlays | — | — | canonical z-index tokens; sync critical excluded for gzip budget |
| `styles/motion-policy.css` | EARLY_VISIBLE_REQUIRED | main loadNonCriticalCss | global | no | — | — | — | prefers-reduced-motion + animation policy |
| `styles/visual-identity-unify.css` | RELOAD_TO_WIN | main loadNonCriticalCss | global post-idle | no | — | bridge --brand/--em to --mj-* | — | must follow critical theme-aliases; gate: visual-identity-unify-gate |
| `styles/tokens.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global idle | no | — | legacy token aliases | — | duplicate role vs design-tokens.css (sync); deferred unused-css budget |
| `styles/sunnah-identity-reset.css` | RELOAD_TO_WIN | main loadNonCriticalCss | global | no | — | identity reset overrides | wordmark/meta | after tokens.css in cascade |
| `styles/visual-layer-contrast-fix.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global | no | — | contrast patches on cards/surfaces | — | before final-release chain |
| `styles/visual-redesign-v2-tokens.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | dashboard/non-ATF | no | — | v2 dashboard tokens | — | not Home ATF per main comment |
| `styles/sections-calm-polish.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | section hubs | no | card spacing | calm section surfaces | — | pre final-release |
| `styles/ssunnah-ux-polish.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global polish | no | micro layout | — | — | ux polish layer |
| `styles/components/modern-section-shell.css` | ROUTE_DEFERRED | main loadNonCriticalCss | section heroes (PageHero consumers) | no | hero shells | hero surfaces | hero titles | component-local + deferred global |
| `styles/section-cards-theme.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | section cards | no | hub/sect cards | themed card fills | — | pairs with section hubs |
| `styles/sunnah-foundation-type.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global | no | — | — | foundation type roles (--sf2) | after sync typography-app |
| `styles/green-surface-system.css` | RELOAD_TO_WIN | main loadNonCriticalCss | global cards | no | — | green surface system (--gs-*) | — | gate: green-surface-system-gate; absorbed into card cascade |
| `styles/ssunnah-semantic-tokens.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global | no | — | semantic ss tokens | — | bridges ss theme API |
| `styles/ssunnah-card-unify.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global cards | no | card grid | unified card chrome | — | with card-matte-unify |
| `styles/card-matte-unify.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global cards | no | — | matte surfaces | — | card finish layer |
| `styles/components/badge-system.css` | ROUTE_DEFERRED | main loadNonCriticalCss | badges/chips sitewide | no | chip sizing | badge colors | label sizes | mj-chip/mj-label system |
| `styles/modern-ui-refresh.css` | DUPLICATE_WITH_PROOF | main (2 sites: !deferAppChromeCss early | deferAppChromeCss heavy) | Home/Mushaf: heavy only; other: early | Home/Mushaf: no until interaction/60-90s | soft-card/hub-tile | card surfaces | — | mutually exclusive branches; Vite single module — startup-deferred-css-s2-gate expects 2 sites |
| `styles/ssunnah-ds-canonical.css` | DUPLICATE_WITH_PROOF | main (2 sites) | same gating as modern-ui-refresh | Home/Mushaf deferred | ds-screen layouts | ds tokens | ds type | canonical ds classes; dual-site intentional |
| `styles/m2030/foundation.css` | RELOAD_TO_WIN | main loadNonCriticalCss | global | no | page grids | m2030 surfaces | — | S2 gate: no html/body authority |
| `styles/m2030/navigation.css` | EARLY_VISIBLE_REQUIRED | main loadNonCriticalCss | nav chrome (lazy NavBar/BottomNav) | partial — nav paints after lazy chunk | nav bar layout | nav surfaces | nav labels | KEEP_JUSTIFIED per DEFERRED_CSS_CONSUMER_MATRIX_V2 |
| `styles/brand-v4-contrast-fixes.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | global | no | — | contrast fixes on legacy brand-v4 | — | after sync brand-v4.css |
| `styles/a11y-release-gate.css` | ROUTE_DEFERRED | main loadNonCriticalCss | global a11y overlays | no | focus targets | contrast enforcement | — | release gate styles; not critical gzip path |
| `styles/visual-enrichment.css` | DUPLICATE_WITH_PROOF | main (2 sites: !defer early | defer heavy) | Home/Mushaf skip early | Home: no until heavy arm | decorative tiles | enrichment accents | — | S2 gate branch exclusivity |
| `styles/sunnah-visual-language.css` | DUPLICATE_WITH_PROOF | main (heavy Home/Mushaf | !defer non-home) | global SVL surfaces | Home ATF excluded | — | --svl-* surfaces | — | SVL primary palette deferred |
| `styles/sunnah-geometry-system.css` | DUPLICATE_WITH_PROOF | main (2 sites) | non-Mushaf/non-Home early; Home heavy | Mushaf excluded ATF | geo patterns | — | — | decorative geometry |
| `styles/design-system.css` | RELOAD_TO_WIN | main loadHeavyIdentityCss chain | global after idle/interaction | no | ds layouts | component colors | ds scale | parent of brand-v4-components → final-release; order enforced via .then() |
| `styles/brand-v4-components.css` | RELOAD_TO_WIN | after design-system.css | global | no | component chrome | brand components | — | must follow design-system.css |
| `styles/final-release.css` | RELOAD_TO_WIN | after brand-v4-components | global seal | no | — | cascade seal WAVE7 | — | WAVE7 CASCADE SEAL — identity-cascade-collapse-gate |
| `styles/card-decorative-strip-cleanup.css` | DECORATIVE_DEFERRED | after final-release | card strips | no | strip cleanup | — | — | post final-release only |
| `styles/modern-islamic-editorial-tokens.css` | DECORATIVE_DEFERRED | after final-release | editorial pages | no | — | editorial tokens | editorial scale | before modern-islamic-editorial.css |
| `styles/modern-islamic-editorial.css` | DECORATIVE_DEFERRED | chain after final-release | lessons/prophets/editorial | no | editorial layout | lux editorial | editorial headings | parent of card-system chain |
| `styles/card-system.css` | RELOAD_TO_WIN | after editorial.css | global cards | no | card variants | card themes | — | feeds card-system-v2 |
| `styles/card-system-v2.css` | DECORATIVE_DEFERRED | after card-system.css | global | no | v2 cards | v2 surfaces | — | extends card-system |
| `styles/app-state-v2.css` | ROUTE_DEFERRED | after card-system.css | loading/error/stale UI (AppState components) | no | state cards | state tints | state copy | StaleDataIndicator, RateLimitedState, etc. |
| `styles/islam-intro-experience.css` | ROUTE_DEFERRED | loadHeavyIdentityCss; skip Home+Mushaf | !/ && !/mushaf* | no | intro hero | intro surfaces | intro headings | StartHere/discover intro surfaces |
| `styles/components/instant-interaction.css` | EARLY_VISIBLE_REQUIRED | main loadNonCriticalCss | global interactions | no (post-idle) | touch feedback | — | — | press/hover states sitewide |
| `styles/visual-refresh-v1.css` | ROUTE_DEFERRED | main; !deferAppChromeCss only | non-Home non-Mushaf | Home: not loaded | card depth | SVL shadows/borders | card titles | depends on SVL tokens from parallel import |
| `styles/components/native-feel.css` | EARLY_VISIBLE_REQUIRED | main loadNonCriticalCss | global + native | no | native scroll/touch | — | — | test:native-feel; no framer-motion |
| `styles/m2030/interactions.css` | DECORATIVE_DEFERRED | main loadNonCriticalCss | settings/forms | no | control sizing | control states | — | m2030 interaction kit |
| `styles/index-deferred-pages.css` | ROUTE_DEFERRED | main; !deferAppChromeCss | non-Home non-Mushaf pages | Home: excluded | page-specific layouts | page themes | — | large page bundle; unify-gate owned |
| `styles/section-makarim-pattern.css` | DECORATIVE_DEFERRED | main; !deferAppChromeCss | sections with makarim pattern | no | pattern bg | decorative | — | comment: زينة أقسام |
| `styles/components/compact-sources.css` | ROUTE_DEFERRED | main; !deferAppChromeCss | detail pages with sources | no | source lists | — | citation text | CompactSources component also imports |
| `styles/m2030/pages.css` | ROUTE_DEFERRED | main; !deferAppChromeCss | m2030 page shells | Home excluded | page templates | page surfaces | — | pts/kids hub etc. |
| `styles/components/content-reading-shell.css` | ROUTE_DEFERRED | wantsReadingShell | /lessons|/hadith|/fiqh|/topics|/scholars|/fawaid|/adhkar | no | reading column | reading surface | prose shell | ContentReading / ScreenShell |
| `styles/reading-prose-system.css` | ROUTE_DEFERRED | wantsReadingShell | reading routes | no | prose measure | — | type-* scale | reading typography system |
| `styles/components/reading-section-card.css` | ROUTE_DEFERRED | wantsReadingShell | reading routes | no | rsc cards | rsc variants | — | ReadingSectionCard component |
| `styles/fonts-ui-bold.css` | DECORATIVE_DEFERRED | scheduleNonCriticalCss setTimeout 20s | global | no | — | — | Aref Ruqaa bold decorative | Amiri 700 sync; bold decorative delayed |
| `styles/capacitor-native-ux.css` | ROUTE_DEFERRED | main isNative block | Capacitor native only | native boot | safe areas | native chrome bg | — | native UX; web never loads |
| `styles/ios-edge.css` | ROUTE_DEFERRED | main isNative block | iOS Capacitor | native | edge insets/scroll | — | — | iOS WebView edge cases |
| `styles/dark-mode-recovery.css` | RELOAD_TO_WIN | ensureDarkCoreLayers | dark theme / idle ensure | light Home: no | — | dark recovery | — | dark-deferred-absorb-gate single loader |
| `styles/dark-mode-surfaces.css` | RELOAD_TO_WIN | ensureDarkCoreLayers | dark | no | dark surfaces | night surfaces | — | paired dark stack |
| `styles/dark-design-system.css` | RELOAD_TO_WIN | ensureDarkCoreLayers | dark | no | — | dark ds | — | dark-design-system-gate |
| `styles/premium-dark-refine.css` | RELOAD_TO_WIN | ensureDarkCoreLayers | dark | no | — | premium dark refine | — | dark stack terminus before luxury bundles |
| `styles/pages/luxury-night-v2.css` | RELOAD_TO_WIN | ensureLuxuryNightV2 / boot dark | dark + data-v2-night | no | — | luxury night v2 | — | App ensureDarkLuxuryBundle path |
| `styles/sunnah-identity-luxury-night.css` | RELOAD_TO_WIN | ensureIdentityLuxuryNight | App data-v2-night | no | — | identity luxury night | — | App-only dark identity |

## Critical sync imports (reference only — not deferred)

`fonts-ui.css`, `app/styles/theme.css`, `sunnah-foundation-tokens.css`, `sunnah-foundation-v2.css`, `ssunnah-theme-api.css`, `brand-v4.css`, `design-tokens.css`, `breakpoints.css`, `typography-scale.css`, `typography-app.css`, `index.css`, `theme-aliases.css`, `semantic-layer-tokens.css`, `interaction-states.css` (**14**).

## Gates touched

- `startup-deferred-css-s2-gate.test.ts` — dual-site `modern-ui-refresh` / enrichment branches
- `dark-deferred-absorb-gate.test.ts` — single dark loader
- `visual-identity-unify-gate.test.ts` — deferred unify + index-deferred-pages ownership

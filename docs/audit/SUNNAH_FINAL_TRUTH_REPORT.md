# سُنّة — Final Truth Report (Closure Audit)

| Field | Value |
|---|---|
| Captured | 2026-09-29T17:50Z |
| Tip measured | workspace = Wave 3 tip · `origin/main` = `c52bbbfd` (#2357) |
| Live production `version.json` | `c52bbbfd` (MATCH main) |
| Method | Live inventory scripts + static consumer graph · **no estimates** |
| Forbidden claims | STORE GO · FULLY COMPLETE · SUNNAH_FULL_REMEDIATION_COMPLETE |

## CURRENT STATE

**WEB_RELEASED_NATIVE_HOLD**

**VISUAL_INTERACTION_PARTIAL**

Evidence: repository still holds measurable FIXABLE_IN_REPOSITORY debt (raw buttons, public/native selects, dark `--mj-*` remaps outside allowlist, legacy CSS imports, incomplete `/my-learning` route-matrix fields). Store remains blocked by OWNER_ACTION + BLOCKED_LICENSE independent of web tip.

### Live inventory (`artifacts/majalis/src`, 2026-09-29T17:50Z)

| Metric | Live |
|---|---:|
| CSS files | **359** |
| `!important` | **4798** |
| hex (CSS) | **9103** |
| rgb/hsl (CSS) | **2217** |
| raw `<button>` files | **227** |
| raw `<button>` elements | **978** |
| official `Button` import files | **137** |
| public native `<select>` files (excl. admin) | **16** |
| admin native `<select>` files | **32** |
| Radix `Select` import files | **21** |
| UtilityScreen product KEEP | **3** |
| `mjDeclOutsideAllowlist` | **30** |
| `mjDeclarations` (all) | **215** |
| soft-card TSX consumers | **0** |
| `soft-cards.css` | **absent** |
| AppPage direct import files | **3** |
| DetailScreen consumer files | **107** |
| SectionTemplatePage consumer files | **30** |
| FieldLabel/FormLabel consumer files | **30** |
| main sync CSS imports | **23** |
| main deferred CSS import sites | **58** |

`mjDeclOutsideAllowlist` residual files only:

| File | Decls |
|---|---:|
| `premium-dark-refine.css` | 15 |
| `dark-design-system.css` | 8 |
| `dark-mode-recovery.css` | 7 |

## BEFORE VS AFTER

Historical program baselines (documented tips) vs **this live tip** — not reused as “current inventory”.

| Metric | Mid Visual/Interaction (#2346 era docs) | Post Debt W2 (docs) | **Live now** |
|---|---:|---:|---:|
| CSS files | 360 | 360 | **359** |
| soft-card consumers | bridge KEEP | 0 (import KEEP) | **0 + file deleted** |
| raw button files | 266 | 229 | **227** |
| public `<select>` files | — | 26 | **16** |
| mj-outside | — | 40 | **30** |
| UtilityScreen KEEP | — | 5 | **3** |
| Soft-cards.css | present | present | **deleted** |

Closed waves on `main` (non-exhaustive): Password Policy · Nav×Prayer · Startup cleanup · Token Absorb W1 · UtilityScreen reduction · Soft-card retirement · Visual snapshot fix · Debt W3 (#2357).

## COMPLETED

| Item | Evidence |
|---|---|
| Soft-card product retirement | consumers=0 · file deleted · gates retired |
| Soft-cards sync import removed | `main.tsx` |
| Critical hubs route fields | `/` `/search` `/quran` `/quran-hub` `/mushaf` `/prayer` `/prayer-times` `/hadith` `/lessons` `/settings` `/learning` → COMPLETE in matrix |
| UtilityScreen ≤ 3 | Settings + NotificationSettings + AdhanSettings only |
| Card authority without soft-card class | `AppCard` → `cs-card` / `ss-app-card` |
| Web tip = production tip | `version.json` = `c52bbbfd` |
| Mushaf 604 integrity (repo) | `mushaf-604-integrity-gate` PASS |
| Appearance dual/single-gold gates (repo) | display-mode + dual-appearance gates PASS |
| Bookmark editor VV contract (repo) | `mushaf-bookmark-editor-viewport-gate` PASS |

## FIXABLE_IN_REPOSITORY

(Each item once. Measurable in tree. Not device/signing/license.)

| Debt | Live evidence | Notes |
|---|---|---|
| Raw `<button>` debt | 227 files / 978 elements | Continue careful Button/IconButton/Link only |
| Public native `<select>` | 16 files | Settings/audio + Mushaf/Quran chrome; admin out of scope |
| Dark `--mj-*` remaps outside allowlist | 30 decls in 3 dark sheets | Absorb to `theme-aliases` only with dark parity |
| Dark bridge CSS still loaded | `main` + `ThemePreferenceProvider` import recovery/surfaces/design-system/premium | Import strip blocked until parity |
| Legacy runtime CSS | sync `brand-v4.css`; deferred `final-release` / `brand-v4-*` / `m2030/*` | Consumers > 0 |
| `pages/*-legacy.css` still imported | home/lessons/misc (search-legacy file present, **0** product import hits) | Port then drop |
| `visual-identity-unify` + `sections-calm-polish` still sync | `main.tsx` imports | Override_PATCH consumers remain |
| AppPage adoption low | AppPage imports **3** vs DetailScreen **107** | Page authority interim via screens |
| Route matrix `/my-learning` fields PENDING | loading/empty/error/dark/a11y PENDING | Audit closure only (page exists) |
| Mushaf chrome native selects | MiniPlayer / AudioDock / AyahActionSheet etc. | UI-only ports; content BLOCKED |
| Floating / z-index consolidation residual | inventory `floatingControlFileMentions` = 10 | Follow interaction authority |
| `div`/`span` onClick | 59 | Interaction debt |

## DEVICE_REQUIRED

Source: `docs/audit/DEVICE_QA_REGISTER.md` + live absence of device PASS artifacts.

| Surface | Class |
|---|---|
| Home cold-start FOUC / CLS on real devices | DEVICE_REQUIRED |
| Light / Dark / System matrix (iPhone/iPad/Android + Large Text) | DEVICE_REQUIRED |
| Prayer first-frame / jump CLS | DEVICE_REQUIRED |
| Prayer ↔ Home theme (confirm on device after code fix) | DEVICE_REQUIRED |
| Bottom nav / FAB collisions | DEVICE_REQUIRED |
| Mushaf chrome / keyboard / VisualViewport on device | DEVICE_REQUIRED |
| Mushaf GOLD/EMERALD native cache | DEVICE_REQUIRED |
| Search / filter sheets a11y device | DEVICE_REQUIRED |
| VoiceOver / TalkBack | DEVICE_REQUIRED |
| Split View / Large Text | DEVICE_REQUIRED |
| Prayer background / adhan delivery on device | DEVICE_REQUIRED |
| Auth flows device confirm | DEVICE_REQUIRED |

No invented device PASS rows.

## OWNER_ACTION

Source: `docs/release/OWNER_ACTIONS_CURRENT.md` (agents do not execute).

| Action | Blocks STORE GO? |
|---|---|
| Bundle ID approval | **Yes** |
| Signing certificates / profiles | **Yes** |
| ASC / Play upload credentials | **Yes** |
| Pin Store RC commit for Archive/AAB | **Yes** |
| Final App Store GO / WITHDRAW | **Yes** |
| Device matrix sign-off (prayer + mushaf) | **Yes** (with DEVICE_REQUIRED) |
| CAF/adhan exclusion decision | **Yes** (with LICENSE) |
| QPC/QUL written permission | **Yes** (with LICENSE) |
| Hisn edition permission/replace | **Yes** (with LICENSE) |
| everyayah/mp3quran offline policy | **Yes** if bundling sought |
| Madinah / Qatami adhan rights decisions | **Yes** for those assets |
| Supabase SQL migrations / MFA / leaked-password | Operational (not Store GO alone) |
| Vercel production secrets confirm | Operational |

**STORE GO is still prevented** by OWNER_ACTION + BLOCKED_LICENSE + DEVICE_REQUIRED — not by web tip alone.

## LICENSE_BLOCKERS

Source: `docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md` · `LICENSE_RISKS.md`.

| Asset class | Class | Store effect |
|---|---|---|
| QPC Quran fonts (bundled/CDN) | BLOCKED_LICENSE until written clearance | STORE HOLD |
| Madinah page images | BLOCKED_SOURCE / DO_NOT_BUNDLE | STORE HOLD if bundled |
| Hisn Muslim edition | BLOCKED_LICENSE / OWNER_ACTION | STORE HOLD |
| Adhan packs with uncertain rights | BLOCKED_LICENSE / OWNER_ACTION | STORE HOLD |
| everyayah / mp3quran bundling | STREAM_ONLY (unsigned offline) | Do not bundle |
| Library `source_missing` | BLOCKED_SOURCE | Already hidden publicly |

These **do** prevent STORE GO for a store binary. They do **not** by themselves force VISUAL_INTERACTION_BLOCKED on web.

## MUSHAF

Boundary: `docs/design/MUSHAF_CSS_BOUNDARY.md` · no Quran text / tashkeel / page-mapping edits in this audit.

| Element | Status | Evidence |
|---|---|---|
| Bookmark editor | **PARTIAL** | Feature + VV gate PASS in repo · DEVICE_REQUIRED for full sign-off |
| Divider editor | **PARTIAL** | Ayah-mark / stop coloring UI exists (`MushafSettingsSheet`); not a separate full editor product · device confirm open |
| VisualViewport | **PARTIAL** | Bookmark VV gate PASS · device keyboard/safe-area open |
| Appearance | **PARTIAL** | Repo gates PASS (display-mode / dual-appearance) · DEVICE_REQUIRED native |
| Mini Player | **PARTIAL** | Live; still uses native `<select>` in MiniPlayer/AudioDock |
| Checksum / 604 integrity | **COMPLETE** (repo) | `mushaf-604-integrity-gate` PASS · CI mushaf suite green on #2357 |
| Page mapping | **COMPLETE** (integrity) / **BLOCKED** (mutation) | Mapping version locked in authentic baseline · edits forbidden |

## ROUTES

Matrix: `docs/audit/ROUTE_QUALITY_MATRIX.json` (fields: loading · empty · error · dark · rtl · accessibility).

| Route | Status |
|---|---|
| `/` | COMPLETE (all critical fields) |
| `/search` | COMPLETE |
| `/quran-hub` | COMPLETE |
| `/mushaf` | COMPLETE |
| `/prayer-times` | COMPLETE |
| `/hadith` | COMPLETE |
| `/lessons` | COMPLETE |
| `/settings` | COMPLETE |
| `/learning` | COMPLETE |
| `/my-learning` | **PENDING** (loading/empty/error/dark/accessibility; rtl=ASSUMED_RTL) |

**Remaining PENDING (listed critical set):** `/my-learning` only.  
(Broader learning sub-routes still PENDING in matrix — out of the explicit critical list but noted.)

## VISUAL SYSTEM

| Authority | Doc status | Live control reality |
|---|---|---|
| Token Authority | AUTHORITY (`theme` + `theme-aliases` + Foundation `--sf*` / `--sf2*`) | **Yes** for declarations allowlist; night winners still re-declared in dark bridges (30 outside) |
| Dark Authority | AUTHORITY + ACTIVE compatibility | **Bridges still active**: recovery (sync), surfaces / design-system / premium (deferred) imported from `main` / ThemePreferenceProvider |
| Card Authority | AUTHORITY (`cs-card` / `ss-app-card` / AppCard) | soft-card **retired**; CSS selector leftovers COMPATIBILITY only |
| Button Authority | AUTHORITY (Button/IconButton/Link) | Adoption **137** import files; raw debt **227** files still emit `<button>` |
| Form Authority | AUTHORITY (Select/FieldLabel/FieldError) | Select adoption **21** files; **16** public native selects remain |
| Page Authority | AppPage / screens patterns | AppPage imports low (**3**); product heavily on DetailScreen (**107**) — interim, not a second design system |

### Legacy systems that still materially affect the product cascade

| Layer | Evidence | Class |
|---|---|---|
| `brand-v4.css` (sync) | `main.tsx` import | FIXABLE_IN_REPOSITORY |
| `final-release.css` (deferred) | `main.tsx` | FIXABLE_IN_REPOSITORY |
| `m2030/*` (deferred + some page imports) | `main.tsx`, HomeHeroLcp, HomeView, TopSectionBar | FIXABLE_IN_REPOSITORY |
| Dark recovery/surfaces/refine/design-system | imports live | FIXABLE_IN_REPOSITORY (parity-gated) |
| `visual-identity-unify` / `sections-calm-polish` | sync in `main.tsx` | FIXABLE_IN_REPOSITORY / COMPATIBILITY |
| `pages/*-legacy.css` (imported) | home/lessons/misc | FIXABLE_IN_REPOSITORY |
| soft-cards.css | **gone** | COMPLETE |

These are **not** new parallel design systems; they are **active legacy/override layers** on top of Foundation + aliases.

## INTERACTION SYSTEM

| Metric | Live |
|---|---:|
| rawButtonFiles | 227 |
| rawButtonElements | 978 |
| officialButtonImportFiles | 137 |
| actionButtonConsumerFiles | 7 |
| iconButtonConsumerFiles | 27 |
| divSpanOnClick | 59 |
| formButtonsMissingType | 0 |
| public native select files | 16 |
| Select import files | 21 |
| UtilityScreen KEEP | 3 |

Authority docs exist; debt budgets are decreasing-ceiling. Interaction is **not** COMPLETE_WEB while raw buttons + public selects remain material.

## FINAL STATUS

### Visual / Interaction

**VISUAL_INTERACTION_PARTIAL**

Reason: FIXABLE_IN_REPOSITORY debt remains (buttons, selects, dark outside remaps, legacy CSS cascade, `/my-learning` matrix PENDING, low AppPage adoption). Criteria for `VISUAL_INTERACTION_COMPLETE_WEB` (only DEVICE_REQUIRED + OWNER_ACTION + LICENSE left) are **not** met.

Not `VISUAL_INTERACTION_BLOCKED`: no evidence of a critical web product failure on the measured tip (CI green · production MATCH · soft-card retired · critical hubs COMPLETE).

### Product / Store envelope

**WEB_RELEASED_NATIVE_HOLD**

STORE GO remains **false**: OWNER_ACTION + BLOCKED_LICENSE + DEVICE_REQUIRED.

---

### Measurement commands (reproducible)

```bash
cd artifacts/majalis
node scripts/visual-system-inventory.mjs
node scripts/interaction-system-inventory.mjs
# plus static rg/python consumer graphs for selects / UtilityScreen / legacy / dark imports
```

### Explicit non-claims

STORE GO · FULLY COMPLETE · SUNNAH_FULL_REMEDIATION_COMPLETE · WCAG device certification · Legacy CSS fully retired · Dark bridges fully removed · Mushaf device-complete

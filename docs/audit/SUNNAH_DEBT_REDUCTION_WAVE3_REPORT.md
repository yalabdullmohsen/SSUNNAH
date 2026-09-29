# سُنّة — Debt Reduction Wave 3 Report

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w3` |
| Base | `main` + merge `cursor/debt-reduction-w2` |
| Product state | **WEB_RELEASED_NATIVE_HOLD** |
| Visual/Interaction | **VISUAL_INTERACTION_PARTIAL** |

Forbidden claims: STORE GO · VISUAL_INTERACTION_COMPLETE_WEB (not claimed).

## BEFORE

| Metric | Value (post-W2 / W3 start) |
|---|---:|
| Soft-card product TSX consumers | 0 (import KEEP) |
| `soft-cards.css` | present |
| Public native `<select>` files | 26 |
| Raw `<button>` files / elements | 229 / 983 |
| `mjDeclOutsideAllowlist` | 40 |
| UtilityScreen KEEP | 5 |
| Critical route matrix gaps | `/learning` PENDING |
| cssFiles ceiling | 360 |

## AFTER

| Metric | Value |
|---|---:|
| Soft-card product TSX consumers | **0** |
| `soft-cards.css` | **deleted** |
| Public native `<select>` files | **16** (−10) |
| Raw `<button>` files / elements | **227 / 978** |
| `mjDeclOutsideAllowlist` | **30** (−10) |
| `mjDeclarations` | **215** (was 218) |
| UtilityScreen KEEP | **3** |
| `/learning` critical fields | **COMPLETE** |
| cssFiles | **359** |
| Budgets raised? | **No** (ceilings lowered via `--write-budget`) |

## SOFT CARD STATUS

**RETIRED** — see `SOFT_CARD_RETIREMENT_WAVE3.md`. AppCard → `cs-card` / `ss-app-card`. CSS selector leftovers = COMPATIBILITY only.

## SELECT STATUS

**IMPROVED** — 26→16 public. Ports: Lessons, Research×2, Qibla, Mawarith, Prayer location/annual/times, DailyWird, Citation. Settings + Mushaf HOLD. See `SELECT_PORT_STATUS.md`.

## BUTTON STATUS

**IMPROVED** — 229→227 files · 983→978 elements. Careful only (ResearchSubmit, UpdatePassword, CitationModal). See `BUTTON_DEBT_PROGRESS.md`.

## TOKEN STATUS

**IMPROVED** — visual-identity / sections-calm already absorbed; Wave 3 moved page-shell / native-feel / thumb-zone / interaction-states / card-system `--mj-*` decls into `theme-aliases` / theme. Outside = dark bridges only (30).

## DARK STATUS

**IMPROVED (classify)** — ACTIVE: recovery, surfaces, premium-refine. COMPATIBILITY: dark-design-system, luxury-night. REMOVE_CANDIDATE: none. See `DARK_BRIDGE_REDUCTION_REPORT.md`.

## LEGACY STATUS

**IMPROVED** — `soft-cards.css` SAFE_REMOVE executed. `*-legacy.css` / brand-v4 / m2030 / final-release KEEP (consumers>0). Matrix updated.

## ROUTE MATRIX STATUS

Critical hubs Complete: Home, Search, Lessons, Hadith, Prayer, Quran, Settings, Mushaf, **Learning** (W3 closure).

## MUSHAF STATUS

UI chrome only: `--mm-ui-accent*` → `var(--mj-brand*)` on primary light/dark blocks. No Quran text / tashkeel / page mapping edits. Checksum/mapping gates unchanged intent.

## PERFORMANCE STATUS

Soft-cards sync import removed (helps critical CSS). No FOUC / theme-flash / prayer regression intended. Budgets not raised. Full critical gzip verified in `verify:ci` / build.

## REGRESSIONS

None intentional. Soft/card/utility gates retargeted to retirement contracts (not threshold softening).

## REMAINING_INTERNAL

- Public `<select>` in Settings + Mushaf chrome (16 files)
- Raw buttons still high (227 files) — careful waves only
- Dark bridge `--mj-*` remaps (30) — import strip blocked
- `pages/*-legacy.css` still imported
- brand-v4 / m2030 / final-release consumers

## DEVICE_REQUIRED

Native store hold unchanged — iOS/Android device QA for adhan/mushaf audio outside this wave.

## OWNER_ACTION

None blocking web debt wave. Review PR for soft-card retirement + Select ports.

## STORE_BLOCKERS

Unchanged from WEB_RELEASED_NATIVE_HOLD (native packaging / store checklist — not this PR).

## FINAL_STATUS

**WEB_RELEASED_NATIVE_HOLD**

**VISUAL_INTERACTION_PARTIAL**

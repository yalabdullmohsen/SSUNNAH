# سُنّة — Final Internal Closure Baseline

| Field | Value |
|---|---|
| Captured | 2026-09-29T18:10Z |
| `origin/main` tip | `dbb880426` |
| Production `version.json` | `dbb88042` (**MATCH**) |
| Latest Vercel Production | `dbb880426` (2026-09-29T18:02Z) |
| Program status (start) | `WEB_RELEASED_NATIVE_HOLD` · `VISUAL_INTERACTION_PARTIAL` |
| Method | Live GitHub + inventory scripts · **not** reused Final Truth tip alone |

## Live discovery answers

| Question | Answer |
|---|---|
| PR #2357 merged? | **Yes** → `c52bbbfd` (2026-09-29T17:47Z) |
| PR #2358 merged? | **Yes** → `5aaa5449` (2026-09-29T17:57Z) |
| PR #2359 merged? | **Yes** (docs Final Truth) |
| PR #2360 | Open docs VERIFY note · MERGEABLE · checks in progress at capture |
| main = production? | **Yes** (`dbb88042`) |
| Metrics newer than Final Truth? | Tip advanced docs-only (`c52bbbfd`→`dbb88042`); **inventory numbers unchanged** |
| Work on non-main branches? | Yes (widgets #2299 CONFLICTING; offline #1791; many local/worktrees) — **out of this program** unless merged |
| Superseded / conflict PRs? | #2299 DIRTY/CONFLICTING (native widgets); unrelated to closure |

## Live inventory (`artifacts/majalis/src`, 2026-09-29T18:10Z)

| Metric | Live |
|---|---:|
| CSS files | **359** |
| `!important` | **4798** |
| hex (CSS) | **9103** |
| rgb/hsl (CSS) | **2217** |
| raw `<button>` files | **227** |
| raw `<button>` elements | **978** |
| official `Button` import files | **137** |
| public native `<select>` files | **16** |
| admin native `<select>` files | **32** |
| Radix Select import files | **21** |
| UtilityScreen product KEEP | **3** |
| `mjDeclOutsideAllowlist` | **30** |
| `mjDeclarations` (all) | **215** |
| soft-card consumers | **0** |
| AppPage direct import files | **3** |
| DetailScreen consumers | **107** |
| SectionTemplatePage consumers | **30** |
| `div`/`span` onClick | **59** |
| form buttons missing type | **0** |
| floatingControlFileMentions | **10** |
| main sync CSS imports | **23** |
| main deferred CSS import sites | **58** |

`mjDeclOutsideAllowlist` residual only:

| File | Decls |
|---|---:|
| `premium-dark-refine.css` | 15 |
| `dark-design-system.css` | 8 |
| `dark-mode-recovery.css` | 7 |

## Scope Manifest

### Goal
Close remaining `FIXABLE_IN_REPOSITORY` debt from Final Truth under sequential PRs; advance to `VISUAL_INTERACTION_COMPLETE_WEB` only if all closure criteria pass. Keep `WEB_RELEASED_NATIVE_HOLD`. No STORE GO.

### In scope (program)
1. `/my-learning` critical route matrix → COMPLETE with real states + tests
2. Public native select finalization (justify or migrate)
3. Raw button + non-semantic interaction waves
4. Dark `--mj-*` absorb → 0 or documented ACTIVE_COMPATIBILITY
5. Dark bridge import reduction
6. Legacy CSS consumer retirement wave
7. Page Authority adapter contracts + UtilityScreen KEEP audit
8. Floating layer finalization
9. Mushaf UI-only chrome (no text/mapping)
10. Critical CSS trim within budget
11. Final matrix / a11y / inventory / report

### Out of scope
- Password Policy, Nav×Prayer, Startup Update UI, Color contrast, Soft-card (done)
- Quran text/mapping/604 geometry; prayer calculation / adhan logic
- Production SQL/RLS/secrets; store signing; license unlocks
- Blind button/select mass replace; new design systems; `!important` / raw colors
- Historical baseline mutation; debt ceiling raises; gate weakening
- Device QA PASS claims; STORE GO

### Acceptance (program end)
See PHASE 20 criteria in the execution brief. Status enums only:
`VISUAL_INTERACTION_BLOCKED` | `VISUAL_INTERACTION_PARTIAL` | `VISUAL_INTERACTION_COMPLETE_WEB` | `WEB_RELEASED_NATIVE_HOLD`.

## Closed work (do not reopen without regression)

Password Policy · Nav×Prayer Stability · Startup Update UI · Color contrast · Visual/Interaction/Card/Form authority · Soft-card retirement + file delete · UtilityScreen ≤3 · Account deletion contract · Bookmark editor VV · Quran 604 integrity · Appearance gates · Completed critical route matrix hubs · Production/main sync at capture tip.

## Required work (FIXABLE_IN_REPOSITORY)

| Item | Baseline evidence |
|---|---|
| `/my-learning` matrix PENDING | loading/empty/error/dark/a11y PENDING; rtl ASSUMED_RTL |
| Public native selects | 16 files (settings/audio/mushaf/quran chrome) |
| Raw buttons | 227 / 978 |
| div/span onClick | 59 |
| mj-outside | 30 in 3 dark sheets |
| Dark bridges still imported | recovery/surfaces/design-system/premium |
| Legacy CSS consumers | brand-v4, final-release, m2030, *-legacy, unify/polish |
| Page authority adapters | DetailScreen 107 / SectionTemplate 30 / AppPage 3 |
| Floating mentions | 10 |
| Mushaf chrome selects/UI tokens | MiniPlayer / AudioDock / AyahActionSheet etc. |
| Critical CSS headroom | prior Class-B gzip pressure on stale dist noted |

## Excluded / external

| Class | Examples |
|---|---|
| DEVICE_REQUIRED | Real-device FOUC/CLS, VoiceOver/TalkBack, Mushaf keyboard, adhan delivery |
| OWNER_ACTION | Store accounts, signing, commercial tilawa approval |
| BLOCKED_LICENSE / SOURCE / CREDENTIAL | As in Final Truth + DEVICE_QA_REGISTER |

## Risks

- Migrating prayer/adhan or Mushaf native selects without justification → a11y/regression
- Absorbing dark tokens without Light/Dark/System parity → FOUC / theme leak
- Raising CSS budgets while “retiring” legacy via copy-paste
- Declaring COMPLETE from JSON-only edits
- Parallel open PRs (#2299) conflicting with main during waves

## PR plan

| PR | Scope |
|---|---|
| **PR 1** | Baseline + `/my-learning` matrix + low-risk public selects |
| **PR 2** | Raw buttons + non-semantic (Shared/Public Core) |
| **PR 3** | Dark token absorb + bridge parity |
| **PR 4** | Legacy CSS retirement wave |
| **PR 5** | Page Authority adapters + UtilityScreen |
| **PR 6** | Floating Layer Manager |
| **PR 7** | Mushaf UI-only |
| **PR 8** | Critical CSS + final matrix + `SUNNAH_FINAL_INTERNAL_CLOSURE_REPORT.md` |

Each PR: latest main → verify → merge under protection → production smoke → next wave.

## Ceilings frozen at this baseline (do not raise)

rawButtonFiles ≤ 227 · rawButtonElements ≤ 978 · publicNativeSelectFiles ≤ 16 · mjDeclOutsideAllowlist ≤ 30 · divSpanOnClick ≤ 59 · UtilityScreen KEEP ≤ 3 · soft-card consumers = 0 · formButtonsMissingType = 0

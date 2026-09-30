# سُنّة — Repository Final Closure Baseline (PHASE 0)

| Field | Value |
|---|---|
| Captured | 2026-09-30T03:28Z |
| Method | Live Git + `inventory:interaction-system` + `inventory:visual-system` + production HTTP |
| Program status (start) | **VISUAL_INTERACTION_COMPLETE_WEB** · **WEB_RELEASED_NATIVE_HOLD** |
| Decision | Residual internal debt remains FIXABLE_IN_REPOSITORY — PR4–PR8 complete ≠ debt-free |

## CURRENT MAIN AND PRODUCTION

| Tip | SHA |
|---|---|
| `origin/main` | `d5262c77e379e2994f8e79121d30f26317153775` |
| Production `https://www.ssunnah.com/version.json` | `d5262c77` · `builtAt=2026-09-30T00:37:50.675Z` · **MATCH** |
| Home HTTP | **200** |
| Docs drift | `CURRENT_PROJECT_STATUS.md` / `FINAL_LIVE_STATE.md` still cite older tips — **live evidence wins** |

## PR4–PR8 AND FOLLOW-UPS

| PR | Role | State |
|---|---|---|
| #2367–#2371 | PR4…PR8 | **MERGED + DEPLOYED** (on main before `d5262c77`) |
| #2372 | Closure report seal | **MERGED** → tip `d5262c77` |
| #2373 | PR5 tasbeeh confirm gate harden | **OPEN** · CI in progress · not on main yet |
| #2299 · #1791 | Native widgets / mobile offline | **OPEN** · OUT OF SCOPE (DEVICE/OWNER) |

## OPEN WORK NOT ON MAIN

| Kind | Notes |
|---|---|
| Branch `cursor/pr5-tasbeeh-confirm-gate-closure` | +2 commits vs main (gate contract) — await merge |
| Many local/worktrees | Stale interaction/visual/content branches — not merged; do not absorb blindly |
| Stashes | 10+ noise/WIP stashes — ignored |

## LIVE INVENTORY (worktree @ `d5262c77`, 2026-09-30T03:28Z)

### Interaction

| Metric | Live | Debt ceiling/floor |
|---|---:|---:|
| rawButtonFiles | **211** | ceiling 211 |
| rawButtonElements | **910** | ceiling 910 |
| officialButtonImportFiles | **153** | floor 153 |
| iconButtonConsumerFiles | **31** | — |
| actionButtonConsumerFiles | **7** | floor 7 |
| divSpanOnClick | **59** | ceiling 59 |
| formButtonsMissingType | **0** | ceiling 0 |
| floatingControlFileMentions | **10** | ceiling 10 |
| buttonRelatedImportantApprox | **1262** | ceiling 1262 |
| buttonRelatedHexApprox | **1738** | ceiling 1738 |

### Visual / CSS

| Metric | Live | Debt ceiling/floor |
|---|---:|---:|
| cssFiles | **357** | ceiling 357 |
| ruleBlocksApprox | **20908** | — |
| `!important` | **4798** | ceiling 4798 |
| hexInCss | **9044** | ceiling 9044 |
| rgbHslInCss | **2205** | ceiling 2205 |
| mjDeclOutsideAllowlist | **0** | ceiling 0 |
| mjDeclarations | **193** | ceiling 193 |
| sfTokenRefs | **688** | floor 688 |
| ssTokenRefs | **722** | floor 722 |
| boxShadowDecls | **1134** | ceiling 1134 |
| zIndexRawDecls | **273** | ceiling 273 |
| borderRadiusPxDecls | **1316** | ceiling 1316 |
| inlineColorStyleMatches | **87** | ceiling 87 |
| mainSyncCssImports | **22** | — |
| mainDeferredCssImports | **58** (includes duplicates) | — |

### Critical CSS

| Metric | Value |
|---|---|
| Last documented gzip | **60129** B ≤ **61440** (margin **1311** B) |
| This capture | no fresh dist in inventory worktree — re-measure after Wave 1 build |

### Pages / Forms / Routes

| Metric | Live |
|---|---:|
| public native selects | **12** (justified residual) |
| UtilityScreen KEEP | **3** |
| routes in quality matrix | **415** |
| `search-legacy.css` | **REMOVED** (PR6) |
| ACTIVE_LEGACY page CSS | `home-legacy` · `lessons-legacy` · `misc-page-legacy` |

## INTERNAL PROBLEMS (FIXABLE_IN_REPOSITORY)

1. **Identity cascade** — sync + deferred re-load of `visual-identity-unify` / `dark-mode-recovery` to win over `final-release`; duplicate deferred imports (`card-decorative-strip-cleanup` ×2).
2. **Legacy page CSS** — three ACTIVE_LEGACY files still imported by HomeBelowFold / LessonsView / Tasbih+TopicQuiz(+OptimizedSheikhImage).
3. **Raw buttons** — 211 files / 910 elements at ceiling; public priority pages still raw.
4. **div/span onClick** — 59 at ceiling.
5. **CSS debt mass** — 4798 `!important` · 9044 hex · high sync layer count.
6. **Critical CSS margin** — only ~1.3 KiB under 60 KiB gzip.
7. **Route quality** — 415 routes; most secondary still incomplete in matrix fields.
8. **Docs tip drift** — status files cite pre-`d5262c77` SHAs.

## EXTERNAL / BLOCKED (NOT IN THIS PROGRAM)

| Class | Examples |
|---|---|
| OWNER_ACTION | Store accounts, signing, App Store / Play |
| DEVICE_REQUIRED | VoiceOver/TalkBack matrix, stale-SW device QA, screenshot matrix |
| BLOCKED_CREDENTIAL | Production signing material |
| BLOCKED_LICENSE / SOURCE | Third-party constraints |
| Native widgets #2299 | Separate dangerous-path PR |
| Mushaf text/geometry | 604 / mapping / fonts — **untouched** |
| Prayer calculation / adhan schedule | **untouched** |
| SQL / RLS / secrets | **untouched** |

## SCOPE MANIFEST BY WAVE

### WAVE 1 — Identity Cascade Collapse
- **Goal:** Reduce competing identity layers; stop reload-only-to-win where absorbable; cut duplicate deferred imports; lower hex/`!important` without FOUC.
- **Files:** `main.tsx`, identity CSS (`visual-identity-unify`, `dark-mode-recovery`, `theme-aliases`, related sync), gates, reports.
- **Tests:** identity/unify/dark-recovery gates · visual-system debt · critical CSS · verify:ci · contrast/visual as required.
- **Out:** Mushaf/prayer calc · legacy page file deletes · raw-button mass migrate · raising budgets.

### WAVE 2 — Legacy Page CSS Retirement
- **Goal:** Retire `home-legacy` / `lessons-legacy` / `misc-page-legacy` only after consumer=0 + parity.
- **Out:** Identity cascade (done in W1) · mushaf CSS.

### WAVE 3 — Raw Button / Semantic Interaction
- **Goal:** Large documented drop in raw buttons + div/span onClick on priority public surfaces via Button/IconButton/Link authority.
- **Out:** New button system · Link↔Button swaps that break semantics.

### WAVE 4+ (queued after W3 green)
- Feedback/route states completion · critical CSS margin · flicker/CLS fixables · final report.

## EXCLUSIONS

- No Design System / Token Family / Button/Card/Form/Page system additions.
- No runtime CSS-in-JS · no new `!important`/raw color · no overflow:hidden patches.
- No budget raises · no baseline history rewrites · no snapshot auto-updates.
- No force-push / admin bypass / merge of red CI.
- Do not start Wave N+1 before Wave N merged + deployed + stable.

## RISKS

| Risk | Mitigation |
|---|---|
| Removing unify/recovery deferred reload → identity flash | Absorb winners into canonical late layer first; keep reload until parity proven |
| Deferring sync CSS → FOUC | Measure critical gzip + smoke Light/Dark/System |
| Legacy CSS delete with dynamic classes | Consumer graph + gates before delete |
| Parallel open PR #2373 | Rebase Wave branch from latest main after merge |

## ACCEPTANCE (PROGRAM)

1. Each wave: focused gates + `verify:preflight` + `verify:ci` + required GitHub checks green.
2. Debt ceilings do not rise; floors do not fall.
3. `mjDeclOutsideAllowlist = 0` held.
4. Mushaf + prayer calc gates remain green.
5. Production `version.json` matches merge tip after each wave.
6. Final report lists only EXTERNAL residuals.

## IMPLEMENTATION_FROZEN

- **PHASE 0:** frozen after this document — measurements only.
- **WAVE 1:** freeze declared in `docs/design/IDENTITY_CASCADE_COLLAPSE_REPORT.md` before first product patch on that wave.

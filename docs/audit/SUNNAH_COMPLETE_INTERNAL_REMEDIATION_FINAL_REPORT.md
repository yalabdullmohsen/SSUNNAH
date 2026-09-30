# سُنّة — Complete Internal Remediation Final Report (PR4→PR8)

| Field | Value |
|---|---|
| Captured | 2026-09-30T00:00Z |
| Program | Final Internal Closure PR4–PR8 |
| Production | `https://www.ssunnah.com` |

## EXECUTIVE VERDICT

**VISUAL_INTERACTION_COMPLETE_WEB** with residual **DEVICE_REQUIRED** / **OWNER_ACTION** / store blockers unchanged.  
Overall project status: **WEB_RELEASED_NATIVE_HOLD**.

No STORE GO · no WCAG CERTIFIED · no FULLY COMPLETE claim.

## CURRENT MAIN AND PRODUCTION

| Tip | SHA |
|---|---|
| `origin/main` at PR7 merge | `9697c1db728ebcfef3b5457e31d17f6a38ea4924` |
| Production `version.json` after PR7 | `9697c1db` **MATCH** · `builtAt=2026-09-29T23:50:32.949Z` |
| PR8 tip (this delivery) | see merge commit after #PR8 |

## PR4 TO PR8 DELIVERY MATRIX

| PR | Title | PR # | Merge | Production |
|---|---|---|---|---|
| PR4 | Buttons + semantic interactions | #2367 | MERGED | DEPLOYED |
| PR5 | Forms + feedback + selects | #2368 | MERGED | DEPLOYED |
| PR6 | Page authority + legacy CSS | #2369 | MERGED | DEPLOYED (`5d998dbe` then superseded by PR7) |
| PR7 | FloatingLayer + Mushaf UI | #2370 | MERGED | DEPLOYED `9697c1db` |
| PR8 | Startup / CLS / audit | (this) | — | — |

## BEFORE VS AFTER

| Metric | Pre-PR4 baseline | After PR8 measure | Delta | Status |
|---|---:|---:|---:|---|
| rawButtonFiles | 225 | **211** | −14 | improved |
| rawButtonElements | 971 | **910** | −61 | improved |
| official Button imports | 139 | **153** | +14 | improved |
| divSpanOnClick | 59 | **59** | 0 | unchanged (justified residual) |
| formButtonsMissingType | 0 | **0** | 0 | held |
| public native selects | 12 | **12** | 0 | justified MUSHAF/PRAYER/long |
| mjDeclOutsideAllowlist | 0 | **0** | 0 | held |
| cssFiles | 359 | **357** | −2 | improved (PR6) |
| important | 4798 | **4798** | 0 | held |
| hexInCss | 9090 | **9044** | −46 | improved |
| UtilityScreen KEEP | 3 | **3** | 0 | KEEP_JUSTIFIED |
| critical CSS gzip | ~60.0–60.1 KiB era | **60129** (≤61440) | margin **1311** B | pass |
| FloatingLayer owner | partial | **operational SoT** | — | improved |

Historical baseline numbers were **not** rewritten.

## VISUAL IDENTITY

Canonical tokens / Foundation / theme-aliases authority preserved. No new token family. No new Button/Card/Form/Page system.

## LIGHT DARK SYSTEM

Dark Token Absorb (PR2) remains: `mjDeclOutsideAllowlist = 0`. No theme flash regression introduced in PR4–PR8 gates.

## COLORS AND TOKENS

No new raw hex/rgb in official components. Mushaf paper hex remains MUSHAF_SPECIAL (route-local).

## BUTTONS AND INTERACTIONS

PR4 migrated shared surfaces to Button/IconButton/Link. Ceilings lowered stepwise to **211 / 910**. Residuals: mushaf audio chrome, quiz bulk, admin mass, justified natives.

## FORMS AND FEEDBACK

PR5: Settings Selects, Login Input, Search feedback, in-page alertdialog (no `window.confirm`). PasswordPolicyAuthority / Auth settings untouched.

## PAGE AUTHORITY

PR6: AppPage/DetailScreen/SectionTemplatePage contracts documented; UtilityScreen KEEP=3 justified; orphan CSS removed with consumer proof (`search-legacy.css`, `section-hub.css`).

## LEGACY CSS

SAFE_REMOVE only with zero consumers. Remaining ACTIVE_LEGACY / COMPATIBILITY documented in PR6 report.

## FLOATING LAYERS

PR7: `FloatingLayerManager` + `FloatingLayerSync` own offsets/z/keyboard/modal suppress. Consumers: ScrollToTop, GlobalBack, Assistant FAB, MiniPlayer, Bookmark editor. Policy updated.

## STARTUP

AppStartupController + quiet chunk recovery retained. `ChunkRecoveryToast` returns null (no technical update UI). SW shell purge quiet path unchanged.

## WHITE SCREEN

Production smoke: core public routes HTTP 200 with non-empty SPA shell. No blank HTML observed on sampled routes.

## FLICKER AND THEME FLASH

Prayer route shell + flash gates held. Critical CSS remains under 60 KiB gzip with ~1.3 KiB margin. No FOUC gate regressions in verify:ci.

## CLS AND LAYOUT SHIFTS

PR8: Prayer page no longer subscribes to full live countdown — uses `useSharedPrayerData` + `useSharedPrayerSlot`; HMS text isolated in `PrayerHeroCountdownValue`. Gate: `prayer-page-tick-isolation-gate`.

## CHUNK RECOVERY

Quiet purge · no fullscreen technical toast · allowance per build. User hard recover only via explicit path.

## SERVICE WORKER

Quiet controllerchange; shell purge message only. DEVICE_REQUIRED for stale-SW device matrix.

## NAVIGATION LATENCY

Existing prefetch / route-surface ownership retained. No timeout lengthening as sole fix.

## ROUTE PERFORMANCE

Priority routes smoke-tested post-PR7. Admin `/admin/v3` public edge returns intentional 404 «غير متاح» (access control).

## MUSHAF UI

PR7 UI-only: editor Button + floating suppress. Quran text/mapping/604/fonts **not touched**. Mushaf gates green on PR7 CI.

## PRAYER UI

Tick isolation + prior flash/nav stability gates. Prayer calculation / adhan scheduling **not changed**.

## ROUTE QUALITY MATRIX

Priority public routes updated in `docs/audit/ROUTE_QUALITY_MATRIX.json` with honest PARTIAL where device/a11y unfinished. Remaining routes stay PENDING.

## ACCESSIBILITY

Keyboard/focus gates held where present. **No VoiceOver/TalkBack claim. No WCAG Certified.**

## PERFORMANCE

Critical CSS gzip **60129 ≤ 61440**. Interaction ceilings lowered. No budget raises.

## MEMORY AND CLEANUP

FloatingLayerSync single install; VV listeners cleaned on unmount. Mini-player applies CSS vars on open/close.

## TESTS AND GATES

Per wave: focused gates · `verify:preflight` · `verify:ci` · GitHub required (Verify build, ci-required, visual-snapshot, mushaf, contrast as applicable).

## PRODUCTION SMOKE TESTS

Post-PR7 (`9697c1db`): `/` `/search` `/quran-hub` `/mushaf` `/mushaf/bookmarks` `/prayer-times` `/lessons` `/hadith` `/fiqh` `/adhkar` `/settings` `/my-learning` `/login` `/register` `/api/healthz` `/version.json` → **200**.  
`/admin/v3` → **404** intentional public deny.

## ROLLBACK EVENTS

None.

## REMAINING FIXABLE_IN_REPOSITORY

| Item | Severity | Notes |
|---|---|---|
| div/span onClick mass (59) | P2 | Many EVENT_DELEGATION / FALSE_POSITIVE |
| Public native selects (12) | P2 | Justified long-list / mushaf / prayer |
| Remaining raw buttons outside shared | P2 | Ceiling 211 — continue decreasing waves |
| Critical CSS margin (~1.3 KiB) | P3 | Passes; further trim optional |
| Route matrix non-priority PENDING | P3 | Honest backlog |

No P0/P1 FIXABLE_IN_REPOSITORY left inside this program scope after PR8 tick isolation.

## DEVICE_REQUIRED

Physical iOS/Android: Mushaf bookmark keyboard, VoiceOver/TalkBack, TestFlight cold start, Store screenshots.

## OWNER_ACTION

Store credentials, signing, license confirmations per `OWNER_ACTIONS_CURRENT.md`.

## LICENSE_BLOCKERS

Unchanged — see release docs.

## STORE STATUS

**HOLD** — WEB_RELEASED_NATIVE_HOLD. Not STORE GO.

## FINAL STATUS

**VISUAL_INTERACTION_COMPLETE_WEB**  
**WEB_RELEASED_NATIVE_HOLD**

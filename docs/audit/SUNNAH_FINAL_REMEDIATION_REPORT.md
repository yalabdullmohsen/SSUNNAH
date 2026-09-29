# سُنّة — Final Remediation Report

## STATUS

**PARTIAL** → decision truth: **`WEB_RELEASED_NATIVE_HOLD`**

| Field | Value |
|---|---|
| Report date (UTC) | 2026-09-29T13:15Z |
| `origin/main` | `ff77a662` — nav route-surface P0 (#2351) |
| Production `version.json` | `ff77a662` · MATCH · `www.ssunnah.com` |
| Prior auth tip | `abd0ac4f` (#2350) — superseded by nav tip |
| Store | **HOLD** |
| Live state | `docs/audit/FINAL_REMEDIATION_LIVE_STATE.md` |

Do **not** claim: `STORE GO` · `SUNNAH_FULL_REMEDIATION_COMPLETE` · `VISUAL_INTERACTION_COMPLETE` (device) · full Legacy CSS deleted.

---

## BEFORE VS AFTER

Baselines: Interaction/Visual train + 2026-09-29 audit inventory vs tip `ff77a662` (visual-system-inventory measured).

| Metric | Mid-train / audit | Tip `ff77a662` | Delta |
|---|---:|---:|---|
| CSS files | 361 → 360 | **360** | held |
| `!important` | 4799 → 4798 | **4798** | held |
| Hex in CSS | 9164 → 9142 | **9142** | held |
| Raw button elements | 1368 → 1028 | **1028** | held |
| Official Button import files | 9 → 94 | **94** | held (floor) |
| `--sf-*` refs | 670 → 682 | **682** | held (floor) |
| Password policy on main | NO | **YES** (#2350) | FIXED |
| `route-surface` sole owner | NO | **YES** (#2351) | FIXED |
| ChunkRecoveryToast user UI | technical toast | **null** | FIXED prior |
| Production tip match | varies | **MATCH** | stable |

---

## TOKENS

| Item | Status |
|---|---|
| Authority | **AUTHORITY** — `DESIGN_TOKEN_AUTHORITY.md` (`--sf-*` / `--sf2-*`) |
| Migration matrix | `TOKEN_MIGRATION_MATRIX.md` |
| New families | **Forbidden** — none added this program |
| brand-v4 / m2030 / final-release | **LEGACY_REQUIRED** (runtime) |
| Debt ceilings | Held — not raised |

---

## THEMES

| Item | Status |
|---|---|
| Product switch | `data-theme` + `html.dark` via ThemePreferenceProvider |
| Dark authority | `DARK_MODE_AUTHORITY.md` + ACTIVE_COMPATIBILITY bridges |
| Prayer surface leak | **FIXED** — `commitRouteSurface` only (#2351) |
| Multiple night layers | Compatibility bridges remain — not a third palette |
| FOUC / device matrix | DEVICE_REQUIRED for full sign-off |

---

## BUTTONS

| Item | Status |
|---|---|
| Authority | `INTERACTION_COMPONENT_AUTHORITY.md` |
| Official Button adoption | **94** files (floor) |
| Raw `<button>` residue | **1028** elements / **266** files — **PARTIAL migration** |
| Third button system | **Not created** |

---

## FORMS

| Item | Status |
|---|---|
| Authority | `FORM_FEEDBACK_AUTHORITY.md` (#2343) |
| Primitives | Input / Textarea / Select / FormFields / Feedback V2 |
| Native `<select>` residue | **~68** TSX files still contain `<select` — **PARTIAL** |
| Password Policy Authority | **COMPLETE** — #2350 on prod |

---

## CARDS

| Item | Status |
|---|---|
| Authority | `CARD_SURFACE_AUTHORITY.md` (#2342) |
| soft-cards residue | Still referenced — **PARTIAL** |
| CardSystem V1 / V2 | V2 taxonomy exists; no third system added |
| soft-cards retirement | Not complete — FIXABLE follow-up |

---

## ROUTES

| Item | Status |
|---|---|
| AppRoutes paths | **414** (matrix JSON) |
| Public / admin | **372** / **42** |
| Per-field quality columns | Mostly **PENDING** (honest) — `ROUTE_QUALITY_MATRIX.json` |
| AppPage contract | **PARTIAL** — UtilityScreen **129** files |
| Page contract matrix | `PAGE_CONTRACT_MATRIX.md` |

---

## STARTUP

| Item | Status |
|---|---|
| Technical update UI | **Removed** from product path |
| AppUpdateManager | Present — quiet |
| AppStartupController | Present |
| Details | `PHASE3_STARTUP_FLICKER_STATUS.md` |
| Device CLS | DEVICE_REQUIRED |

---

## PRAYER

| Item | Status |
|---|---|
| Theme ownership | **FIXED** (#2351) |
| First-frame olive shell | Present (#2306 lineage) |
| Boot skeleton | `pts-boot-*` reserved |
| Calculation / adhan algorithm | **Unchanged** |
| Device / background / license | DEVICE_REQUIRED · OWNER_ACTION · BLOCKED_LICENSE as applicable |

---

## MUSHAF

| Item | Status |
|---|---|
| Quran text / mapping / tashkeel | **Untouched** |
| CSS boundary | `MUSHAF_CSS_BOUNDARY.md` — PARTIAL bridge remains |
| Keyboard / VV bookmark editor | Merged prior (`b36095db`) |
| Device matrix | DEVICE_REQUIRED |
| GOLD chrome sheets hardcode | Follow-up FIXABLE (UI tokens only) |

---

## ACCESSIBILITY

| Item | Status |
|---|---|
| Contrast gate | Passes on #2351 CI |
| Touch under-44 residue | PARTIAL (interaction audit) |
| VoiceOver / TalkBack / Large Text | DEVICE_REQUIRED |
| Thresholds | **Not lowered** |

---

## PERFORMANCE

| Item | Status |
|---|---|
| Bundle budget | Held on local `verify:ci` for #2351 |
| LHCI home | Pass on #2351 CI |
| Critical CSS vs FOUC | Tradeoff remains PARTIAL |
| Device CLS | NOT_MEASURED |

---

## TESTS

| Gate / run | Result |
|---|---|
| Local `verify:preflight` + `verify:ci` (#2351) | PASS |
| CI Verify build / ci-required / contrast / visual-snapshot (#2351) | PASS |
| `test:visual-system-debt-budget` | PASS (ceilings held) |
| `test:interaction-system-debt-budget` | PASS |
| `navigation-prayer-stability-gate` | PASS |
| Password policy tests | PASS (#2350) |

---

## REMAINING ITEMS

| Item | Class |
|---|---|
| Continue Button raw→official migration | FIXABLE_IN_REPOSITORY |
| Continue native `<select>` → Form Select on public pages | FIXABLE_IN_REPOSITORY |
| UtilityScreen → AppPage migration | FIXABLE_IN_REPOSITORY |
| soft-cards / CardSystem v1 retirement after PORT | FIXABLE_IN_REPOSITORY |
| Absorb identity/dark compatibility into fewer bridges | FIXABLE_IN_REPOSITORY |
| Drop `*-legacy.css` after class PORT | FIXABLE_IN_REPOSITORY |
| Mushaf UI token hardcodes (not text) | FIXABLE_IN_REPOSITORY |
| FloatingLayerManager runtime consolidator | FIXABLE_IN_REPOSITORY |
| FilterSheet+URL sync completion | FIXABLE_IN_REPOSITORY |
| Per-route matrix field completion | FIXABLE_IN_REPOSITORY |
| CLS / VO / Split / Large Text / Android-iOS matrix | DEVICE_REQUIRED |
| Bundle ID / signing / ASC / Play upload | OWNER_ACTION |
| Adhan / font / Hisn license decisions | BLOCKED_LICENSE / OWNER_ACTION |
| Store RC pin + GO | OWNER_ACTION (Store **HOLD**) |
| Some content source gaps | BLOCKED_SOURCE (where listed in content audits) |
| Prayer empty-cache city picker vs hero geometry parity | ACCEPTED_RISK / follow-up |

---

## FINAL TRUTH

```
WEB_RELEASED_NATIVE_HOLD
```

| Label | Allowed? |
|---|---|
| `VISUAL_INTERACTION_BLOCKED` | No — web released with authorities |
| `VISUAL_INTERACTION_PARTIAL` | Yes (device + migration residue) |
| `VISUAL_INTERACTION_COMPLETE_WEB` | **No** — UtilityScreen/soft-cards/select/legacy residue |
| `WEB_RELEASED_NATIVE_HOLD` | **Yes — declared** |
| `STORE GO` | **No** |

---

## Program phase rollup

| Phase | Result |
|---|---|
| 0 Live state | DONE — `FINAL_REMEDIATION_LIVE_STATE.md` |
| 1 Nav × Prayer | DONE — #2351 merged + prod MATCH |
| 2 Auth policy | DONE — #2350 merged + prod |
| 3 Startup/flicker | PARTIAL — product tech UI closed; device CLS open |
| 4 Tokens | AUTHORITY + matrix; migration PARTIAL |
| 5 Dark | AUTHORITY + compatibility; PARTIAL |
| 6 Buttons/Forms | AUTHORITY; residue PARTIAL |
| 7 AppPage | Matrix; UtilityScreen still dominant |
| 8 Cards | AUTHORITY; soft-cards PARTIAL |
| 9 Floating | POLICY AUTHORITY; manager consolidator follow-up |
| 10 Filters | PARTIAL |
| 11 Mushaf UI boundary | PARTIAL + DEVICE_REQUIRED |
| 12 Legacy CSS | MATRIX + PARTIAL |
| 13 Route matrix | JSON seeded (fields PENDING) |
| 14 Device QA | REGISTER created — all DEVICE_REQUIRED honest |
| 15 Inventory | Measured — ceilings held |
| 16 Gates | #2351 green; debt budgets green |
| 17 This report | DONE |

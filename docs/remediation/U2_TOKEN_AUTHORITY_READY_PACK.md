# U2 READY PACK — Token Authority Freeze

| Field | Value |
|-------|-------|
| Phase | **U2** Token Authority Freeze |
| Status | **READY_PACK_COMPLETE** (preparation only) |
| Execution | **LOCKED** until U1 = MERGED_AND_DEPLOYED + MATCH + Smoke |
| Depends on | PR #2435 (U1 LHCI graph) |
| Target artifact | `docs/design/FINAL_TOKEN_ROLE_MATRIX.md` (execution) |
| Authority SoT | `DESIGN_TOKEN_AUTHORITY.md` · `DARK_MODE_AUTHORITY.md` · `TOKEN_MIGRATION_MATRIX.md` · `SUNNAH_AUTHORITY_UNIFICATION_FINAL_MAP.md` |
| Captured tip (prep) | `origin/main` pre-#2435 land = `d9822935`; U1 head `1d5dd9f3` |
| Policy | PEOP v1 — PREPARATION ONLY · no execution PR · no code migration until EXECUTION_UNLOCKED |

---

## 1. Scope

**In**

- Freeze role → canonical token matrix (canvas … focus ring).
- Fix Dark `--color-brand-deep` semantic (Ink-readable vs Surface-deep confusion).
- Eliminate page-local global canvas writers where token exists.
- Surface-as-ink / ink-as-surface misuse hotspots (public product).
- Retire/redirect `--surface-app` / `--color-*` / `--v2-color-*` **writers** that redefine canonical meaning (bridges stay consumers).
- Gate: forbid page-local global canvas + Surface-as-Ink + Ink-as-Surface + new raw colors in migrated files.
- Exit: `TOKEN_CONTRACT_STABLE`.

**Out**

- Admin token migration train.
- Mushaf ink/paper / QPC / page mapping.
- Prayer calculation.
- Design System v3 / Theme v3 / new token family.
- Raising visual debt ceilings.
- Full deferred-identity absorption (U8).
- Button/Card collapse (U5/U6).

---

## 2. File Inventory (execution candidates)

| Path | Role | Prep class |
|------|------|------------|
| `artifacts/majalis/src/app/styles/theme.css` | Product `--mj-*` / `--color-*` / dark contract | **WRITE** (brand-deep night) |
| `artifacts/majalis/src/styles/theme-aliases.css` | Alias live-bind | **WRITE** if writer→consumer |
| `artifacts/majalis/src/styles/ssunnah-theme-api.css` | `--ss-*` bridge | KEEP bridge · audit writers |
| `artifacts/majalis/src/styles/sunnah-foundation-tokens.css` | `--sf-*` SoT | READ / KEEP |
| `artifacts/majalis/src/styles/sunnah-foundation-v2.css` | `--sf2-*` SoT | READ / KEEP |
| `artifacts/majalis/src/styles/design-tokens.css` | `--ss-*` compat | AUDIT |
| `artifacts/majalis/src/styles/visual-redesign-v2-tokens.css` | `--v2-color-*` | AUDIT global chrome consumers |
| `artifacts/majalis/src/styles/components/header-ad-slot.css` | page-local `#121816` | FIX candidate |
| `artifacts/majalis/src/styles/pages/fiqh-hub.css` | `color: var(--mj-surface-2)` | Surface-as-Ink FIX |
| `artifacts/majalis/src/lib/__tests__/dark-mode-authority-gate.test.ts` | Existing gate | EXTEND |
| `artifacts/majalis/src/lib/__tests__/*token*gate*.ts` | Closures | EXTEND / NEW |
| `docs/design/FINAL_TOKEN_ROLE_MATRIX.md` | Deliverable | **CREATE** at execution |
| `artifacts/majalis/reports/visual-system-debt-budget.json` | Ceilings | READ only · lower after measured drop |

---

## 3. Ownership Matrix

| Concern | Authority | Writer | Consumer contract |
|---------|-----------|--------|-------------------|
| Foundation literals | `--sf-*` | `sunnah-foundation-tokens.css` | No page redefine |
| Semantic product roles | `--sf2-*` | `sunnah-foundation-v2.css` | New UI prefers `--sf2-*` |
| Product theme | `--mj-*` | `theme.css` (+ aliases bind) | Public chrome/surfaces |
| Bridge | `--ss-*` → `--mj-*` / `--sf2-*` | `design-tokens` / theme-api | Bridge only · not SoT |
| Night canvas | `--surface-app` / `--mj-bg` / `--sf2-page-bg` | theme + foundation dark | No third hex |
| Mushaf paper/ink | mushaf tokens / `data-mushaf-appearance` | Mushaf CSS | **MUSHAF_SPECIAL** |
| Prayer immersive | `pts-immersive` + route-surface | route commit | **PRAYER_SPECIAL** |

---

## 4. Consumer Maps (prep snapshot)

### Family ref counts (src CSS, substring, tip prep)

| Family | ≈refs | ≈files | Class |
|--------|------:|-------:|-------|
| `--mj-*` | 9532 | 280 | PRODUCT CONTRACT |
| `--majalis-*` | 3310 | 112 | LEGACY alias stack |
| `--color-*` | 1283 | 95 | COMPAT / theme dual |
| `--ss-*` | 616 | 75 | BRIDGE |
| `--msk-*` | 588 | 39 | LEGACY (msk kit) |
| `--sf-*` | 562 | 36 | CANONICAL |
| `--v2-color-*` | 643 | 24 | COMPAT · audit chrome |
| `--sf2-*` | 243 | 11 | CANONICAL semantic |
| `--surface-app` | 71 | 30 | PRODUCT night/day canvas |
| `--color-brand-deep` | 8 | 3 | HOTFIX target |

### Known misuse (prep)

| Pattern | Evidence | Action at execution |
|---------|----------|---------------------|
| Dark `--color-brand-deep: #0E1C17` | `theme.css:445` | Remap to **ink-semantic** readable brand deep (not surface night) — align with `--mj-brand-deep` / elite-forest contract |
| Surface as ink | `fiqh-hub.css` `color: var(--mj-surface-2)` | → ink token |
| Page-local canvas hex | `header-ad-slot.css` `#121816` | → `--mj-bg` / `--surface-app` |
| Ink-as-background false positives | many `color: var(--sf2-text-*)` | KEEP (regex noise) — execution uses precise `background:.*--mj-ink` scan |

---

## 5. Authority Analysis

Required role matrix (U2 deliverable columns):

Canonical Token · Light Source · Dark Source · Existing Aliases · Legacy Aliases · Current Consumers · Retirement Condition

Roles: canvas · background · ink · muted ink · surface · elevated · inset · border · hairline · brand · on-brand · accent · on-accent · destructive · on-destructive · success · warning · error · focus ring.

Draft mapping (prep — finalize at execution):

| Role | Canonical | Light | Dark |
|------|-----------|-------|------|
| canvas | `--sf2-page-bg` / `--mj-bg` / `--surface-app` | ivory contract | `#0F1613` |
| ink | `--sf2-text-primary` / `--mj-ink` | deep green ink | `#EDE8DF` |
| muted ink | `--sf2-text-muted` / `--mj-muted` | | |
| surface | `--sf2-card-bg` / `--mj-surface` | | `#1B2421` |
| elevated | `--sf2-elevated-bg` / `--mj-surface-2` | | |
| brand | `--sf2-action-primary` / `--mj-brand` | emerald | remapped emerald |
| brand-deep (readable) | `--mj-brand-deep` | deep emerald | **NOT** `#0E1C17` surface |
| on-brand | `--mj-on-brand` / `--color-on-brand` | | |
| focus ring | `--sf2-focus-ring` | | |

---

## 6. Legacy Analysis

| Layer | Status | Retirement condition |
|-------|--------|----------------------|
| `--majalis-*` | ACTIVE_COMPATIBILITY | consumer→`--mj-*`/`--sf2-*` = 0 |
| `--msk-*` | ACTIVE_COMPATIBILITY | same |
| `--v2-color-*` in global chrome | DEFERRED_IDENTITY leak risk | no chrome writer after FP |
| `--color-*` dual in theme | KEEP as product dual map | must not redefine meaning of `--mj-*` |
| brand-v4 / m2030 | LEGACY_REQUIRED | U8 consumer=0 |

---

## 7. Security Impact

- Token-only CSS/theme — **no** auth/handler/API change.
- Risk: contrast regression if brand-deep night becomes too light/dark → mitigated by Color Contrast + on-brand gates.
- CSP / inline: unchanged if no new inline styles.

---

## 8. Accessibility Impact

- Positive if brand-deep night becomes readable ink on surfaces.
- Must keep AA on brand CTAs (existing `test:on-brand-contrast`, Color contrast Playwright).
- Focus ring role must stay visible in Light/Dark/System.

---

## 9. Performance Impact

- No intentional bundle growth.
- Avoid moving large sheets into sync entry (U1 unused-css still **150ms** selected on CI #2435 — follow-up if U1 closure requires ≤80).
- themeMutAfterFP must remain 0 (U3 owns pipeline; U2 must not add writers).

---

## 10. Route Impact

| Route group | Token touch | Notes |
|-------------|-------------|-------|
| Home / Search / Quran Hub | chrome/canvas | Smoke after land |
| Mushaf | **NO** paper/ink | MUSHAF_SPECIAL |
| Prayer | immersive keep | no calc change |
| Lessons / Hadith / Fiqh | surface/ink misuse fixes | targeted |
| Admin | **OUT of U2** | separate train |

---

## 11. Admin Impact

None in execution scope. Admin may consume `--mj-*` indirectly — no Admin PR.

---

## 12. Test Matrix

| Test | When |
|------|------|
| `test:dark-mode-authority` | required |
| `test:on-brand-contrast` / Color contrast CI | required |
| `test:visual-system-debt-budget` | required · no ceiling raise |
| `test:visual-system-authority` | required |
| NEW: token-role / no page-local canvas gate | add at execution |
| `test:closure-pr2-dark-token-absorb` | regression |
| `verify:preflight` → `verify:ci` | before push |
| Mushaf measure/gates | must stay green |
| Production smoke: `/` `/search` `/quran-hub` `/mushaf` `/prayer-times` | after MATCH |

---

## 13. Rollback Plan

1. Revert U2 squash commit on main (or revert PR).
2. Confirm `version.json` rolls with auto-deploy.
3. No DB/migration/native — CSS/theme only.
4. Keep Foundation files untouched if patch limited to `theme.css` + page hotspots.

---

## 14. Deployment Risk

| Factor | Level | Note |
|--------|-------|------|
| Visual flash | MED | brand-deep / canvas remap |
| Contrast fail | MED | gates catch |
| Mushaf | LOW | boundary freeze |
| Perf LHCI | LOW–MED | do not re-inflate entry CSS |
| Path lane | mixed likely | full visual checks |

---

## 15. Smoke Plan (post MATCH)

Viewport 390×844 · cache disabled · Light + Dark + System:

1. `/` — canvas/ink/header/CTA
2. `/search` — chrome
3. `/quran-hub` — chrome
4. `/mushaf` — paper/ink unchanged
5. `/prayer-times` — immersive
6. Sample fiqh hub (surface-as-ink fix)

Assert: no console errors · contrast smoke · themeMutAfterFP=0 if measured.

---

## 16. Exit Criteria → `TOKEN_CONTRACT_STABLE`

1. `FINAL_TOKEN_ROLE_MATRIX.md` merged with all roles filled.
2. Dark `--color-brand-deep` is ink-semantic (documented + gated).
3. No new page-local global canvas hex in public product files touched.
4. Surface-as-ink / ink-as-surface hotspots in scope fixed or KEEP_JUSTIFIED.
5. Bridge files do not act as competing writers for canonical roles.
6. Debt ceilings not raised; lowered only after measured drop.
7. verify:ci + required checks + MATCH + Smoke PASS.
8. Status string: **TOKEN_CONTRACT_STABLE**.

---

## U1 handoff note (live CI #2435)

| Audit | Contract | CI optimistic | Job |
|-------|----------|---------------|-----|
| unused-css-rules | ≤80 | **150** | SUCCESS (warn) |
| unused-javascript | ≤500 | **300** | SUCCESS |
| forced-reflow-insight | score≥1 | runs 1/0/0 | SUCCESS (warn) |

→ U1 **MERGED** with LHCI job green; numeric unused-css contract **not** met on CI. Classify leftover as **EXISTING_MAIN_DEBT / CSS_GRAPH_LEAK** for U1 follow-up or absorb into U4 chrome graph — **do not** raise threshold. Do not claim `LHCI_HOME_MOBILE_CLOSED` until ≤80 proven on CI or production remeasure.

---

## Execution unlock checklist

- [ ] #2435 on `main`
- [ ] Main CI PASS
- [ ] Auto Deploy SUCCESS
- [ ] `version.json` MATCH head main
- [ ] Production Smoke PASS
- [ ] Then: branch from latest main · execute U2 only

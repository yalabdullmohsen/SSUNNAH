# سُنّة — Repository Closure Report (Wave 1)

## FINAL_STATUS

**`WEB_RELEASED_NATIVE_HOLD`** · visual state: **`VISUAL_INTERACTION_PARTIAL`**

Do **not** claim: `STORE GO` · `VISUAL_INTERACTION_COMPLETE_WEB` · `SUNNAH_FULL_REMEDIATION_COMPLETE`

| Field | Value |
|---|---|
| Wave branch | `cursor/repo-closure-w1` |
| Base tip | `68e42f8f` |
| Authorities reused | Token · Dark · Card · Button · Form · Page · Legacy · Mushaf boundary |

---

## COMPLETED

| Item | Evidence |
|---|---|
| UtilityScreen retirement wave | 128 → **9** KEEP · matrix + `no-new-utility-screen` gate |
| Redundant AppPage/SectionTemplate wrappers removed | 23 UNWRAP |
| Content mark shells → DetailScreen | 96 REPLACE |
| FloatingLayerManager (operational offsets) | `lib/floating-layer-manager.ts` + ScrollToTop sync |
| Critical route matrix fields | Home/Quran/Prayer/Lessons/Hadith/Search/Settings/Mushaf/Learn filled |
| Dark bridge inventory | `DARK_MODE_BRIDGE_INVENTORY.md` (no mass delete) |
| Card migration status doc | `CARD_MIGRATION_STATUS.md` |
| Dawah contact form controls | Input/Textarea/Button + text-base (selects still native, labeled) |

---

## IMPROVED

| Metric | Before (68e42f8f / prior report) | After (this wave) |
|---|---:|---:|
| UtilityScreen product consumers | 128–129 | **9** |
| Raw `<button` elements | 1028 | **1027** |
| Official Button adoption (contact) | — | +1 call site |
| Critical ROUTE_QUALITY fields PENDING | yes | **filled** for core set |
| Floating offsets | scattered | centralized helper |

Unchanged this wave (honest): CSS files 360 · !important 4798 · hex 9142 · soft-card refs ~169 · native select files 68 · mj-outside 129 · dark bridge file count.

---

## REMAINING_INTERNAL (FIXABLE_IN_REPOSITORY)

1. Soft-cards.css still required (AppCard bridge) — PORT class consumers then drop.  
2. DetailScreen interim → AppPage/PageHeader where hubs need full contract.  
3. Tokens absorb: `visual-identity-unify` / `sections-calm-polish` → `--sf2-*` (mj-outside↓).  
4. Dark bridge reduction after parity (no mass delete).  
5. Native `<select>` public PORT (~68 files).  
6. Raw button debt waves (1027 → down by tens/PR).  
7. FilterSheet+URL sync completion.  
8. Mushaf UI token hardcodes (not text).  
9. Legacy CSS SAFE_REMOVE after consumer=0.  
10. Critical CSS trim under 60KiB gzip with margin.

---

## DEVICE_REQUIRED

See `DEVICE_QA_REGISTER.md` — iPhone/iPad/Android · VO/TalkBack · Large Text · Split · CLS · Mushaf gestures · Prayer background.

---

## OWNER_ACTION

Bundle ID · signing · ASC/Play · Store RC pin · license decisions (fonts/adhan/Hisn) — `OWNER_ACTIONS_CURRENT.md`.

---

## LICENSE_BLOCKERS / STORE_BLOCKERS

BLOCKED_LICENSE rows + Store **HOLD** until OWNER_ACTION + DEVICE_REQUIRED clear.  
No STORE GO from this wave.

---

## BEFORE_VS_AFTER

| Area | Result |
|---|---|
| UtilityScreen | **Major drop** (−119) |
| Soft-cards | Documented; not retired |
| Tokens/Dark/Legacy CSS file count | Stable (no unsafe delete) |
| Buttons/Selects | Minimal (1 button); selects labeled only |
| Route matrix critical | Improved |
| Budgets | **Not raised** |
| New token/card/button systems | **None** |
| New !important | **None** |

---

## REGRESSIONS

Targeted: typecheck · no-new-utility-screen · screen patterns still export UtilityScreen for KEEP.  
Full `verify:ci` required before merge.

---

## FINAL_STATUS (repeat)

```
WEB_RELEASED_NATIVE_HOLD
VISUAL_INTERACTION_PARTIAL
```

`VISUAL_INTERACTION_COMPLETE_WEB` requires soft-cards retirement + select/button debt cuts + token absorb + AppPage beyond DetailScreen interim.

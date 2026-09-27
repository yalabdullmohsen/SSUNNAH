# WAVE — Platform Registry Gaps W1

| Field | Value |
|---|---|
| Branch | `cursor/platform-registry-gaps-w1` |
| Base | `origin/main` @ Platform Section Registry W1 (#2319) |
| State | **implementation** |
| Programs | 1 (close REGISTRY_GAP) · 2 (preserve IA mapping) |

## Scope Manifest

| Field | Value |
|---|---|
| Wave | PLATFORM_REGISTRY_GAPS_W1 |
| Priority | P0 |
| Objective | `listRegistryGaps() === []` without parallel directory nav seeds |
| Previous wave | PLATFORM_SECTION_REGISTRY_W1 |
| Confirmed defects | `institutions`, `historic-mosques`, `adab-talab-ilm` marked REGISTRY_GAP |
| Root cause | Product honesty overlay; directories already consolidated under `islam-guide`; adab route live without SEED |
| Sections affected | institutions · historic-mosques · adab-talab-ilm |
| Routes affected | `/islamic-directory` (canonical for dirs) · `/adab-talab-ilm` |
| Content sources | None new |
| License state | N/A |
| Files modified | `section-product-catalog.ts` · `sections.registry.ts` · gate · `package.json` (wire gate into `test:sections-gates`) · product docs · this wave doc |
| Files excluded | Search index · UI redesign · religious text · nav-prayer WIP · arabic-w1 worktree |
| Content / religious impact | None |
| Search impact | None (no index mutation) |
| Navigation impact | Adds `adab-talab-ilm` to NAV surfaces; directories stay on `islam-guide` only |
| Visual / performance / a11y / Capacitor | None intentional |
| Rollback | Revert commit |
| Focused tests | `platform-section-registry-w1-gate.test.ts` |
| Full verification | `verify:preflight` → `verify:ci` |
| External blockers | None |

## Delivered

1. **Directories:** product entries `institutions` + `historic-mosques` → `registrySectionId: islam-guide`, canonical `/islamic-directory`, `PUBLISHED`. No new SEEDS (avoids competing with HIDDEN_FROM_NAV children).
2. **آداب طالب العلم:** SEED `adab-talab-ilm` after `akhlaq` (order 59), icon `BookUser` (unique), surfaces NAV, hub sections.
3. Docs + gate assert **zero REGISTRY_GAP**.

## Explicit non-changes

- No fabricated COMPLETE curriculum
- No parallel `/institutions` or `/islamic-landmarks` nav cards
- No Quran/Hadith/source edits
- No search index rebuild

## Next safe waves

1. Kuwait lessons data model (Program 4)
2. Arabic grammar Wave 2 with approved source
3. Shubuhat center provenance
4. IA UI alignment (drawer/home) in one PR

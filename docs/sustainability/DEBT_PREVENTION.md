# DEBT_PREVENTION

Prevent regressions across visual · architecture · state · route · performance · documentation drift.

## Drift → gate map

| Drift class | Prevention gate(s) | Must remain in `test:ci-unit` or verify:ci |
|---|---|---|
| Visual / design | `test:visual-redesign-v2-tokens` · `test:global-design-system-authority` · `test:global-component-authority` | yes |
| Architecture / ownership | `test:platform-architecture-excellence` · `test:architecture-excellence-pr1` | yes |
| State | platform ownership + query-key authority (existing) | yes |
| Routes / IA | `verify:route-registry` · section / fiqh hub gates | yes |
| Performance | bundle budget · LHCI · mushaf measure · runtime excellence | yes |
| Accessibility / contrast | `test:a11y-contrast-100` · on-brand contrast | yes |
| Product feedback parity | `test:product-completeness-baseline` | yes |
| Documentation authority | `test:release-and-long-term-sustainability` | yes |

## Hard rules

1. **No debt ceiling raise** — budgets locked in architecture-excellence-pr1.
2. **No gate weakening** — do not delete registry entries without replacement authority.
3. **No unknown debt** — classify STABLE / SCALABLE / SPECIAL_CASE / KEEP_JUSTIFIED / DEVICE_REQUIRED / OWNER_ACTION.
4. New feature PR must name which authority docs + gates cover it.
5. Forbidden program actions listed in `authority-manifest.json` → `forbiddenInThisProgram`.

## Registry source of truth

`docs/sustainability/authority-manifest.json` → `debtPreventionGates`

DEBT_PREVENTION_COMPLETE

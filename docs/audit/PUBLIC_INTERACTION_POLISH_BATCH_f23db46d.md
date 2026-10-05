# Public Interaction Polish Batch (BATCH B)

TASK_CLASSIFICATION: SHARED_PLATFORM

## Scope

- `QuranOpenMushafCard` raw `<button>` → official `Button`
- University compare disabled: remove opacity-only cue
- Truncation `title` on UniversityCard / RecommendationWidget / CitationModal
- Native `window.confirm` KEEP (MF4 evidence)

## Metrics

| Metric | Before | After |
|---|---:|---:|
| rawButtonFiles | 49 | **48** |
| rawButtonElements | 181 | **180** |
| officialButtonImportFiles | 313 | **314** |

Ceilings lowered to measured. Floors raised. NO_CEILING_RAISE. NO_GATE_WEAKENING.

## Gates

- `pnpm run test:public-interaction-polish-batch`
- `pnpm run test:ui2-polish-a11y`
- `pnpm run test:interaction-system-debt-budget`

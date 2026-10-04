# PR E — Dead CSS removal (+ physical extract hold)

| Field | Value |
|---|---|
| Branch | `cursor/design-authority-pr-e-dead-css-component-authority` |
| Base | `origin/main` `55a81e79c` (after PR A) |

## Deleted (DEAD_WITH_PROOF_AND_REMOVED)

| File | Proof |
|---|---|
| `styles/pages/fiqh-council-section.css` | No product import; FiqhCouncil pages gone; routes redirect `/fiqh`; completeness gate asserts absence |

## Physical component-authority.css

**Attempted then reverted.** Extracting the COMPONENT region into a new file kept cssFiles at 356 but raised `buttonRelatedImportantApprox` 1138→1142 because the interaction scanner counts the first 400 button chunks **per file**. Splitting surfaces more `!important` that were previously past the per-file cap.

| Decision | Classification |
|---|---|
| Do not raise ceiling 1138 | NO_DEBT_CEILING_RAISE |
| Do not ship extract while metric regresses | KEEP_WITH_EVIDENCE logical COMPONENT region |
| cssFiles after dead delete | **355** (room created for a future extract after real button `!important` reduction) |

## Still deferred

- Physical `component-authority.css` after reducing button-related `!important` by ≥4 (or scanner whole-graph mode with no ceiling raise)
- `feature-authority-*` files
- PRs B/C/D token + compatibility retirement

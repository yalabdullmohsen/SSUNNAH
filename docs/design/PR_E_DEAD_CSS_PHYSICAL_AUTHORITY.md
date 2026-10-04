# PR E — Dead CSS removal + physical authority

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-e-dead-css-physical-authority` |
| Base | `origin/main` `d49cd5736` |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Dead CSS removed (with proof)

| File | Proof |
|---|---|
| `styles/pages/more-page.css` | No runtime import; `/more` redirects; zero TSX class consumers |
| `styles/components/chunk-recovery-toast.css` | No runtime import; `ChunkRecoveryToast` returns `null` |

## Physical authority

Multi-file extract (`component-authority.css` etc.) remains **forbidden** by
`css-authority-graph-gate` while interaction per-file chunking would raise
`buttonRelatedImportantApprox` above 1138.

Accepted physical model (enforced):

- Single sheet `design-system.css` with labeled regions:
  - `COMPONENT_AUTHORITY`
  - `FEATURE_AUTHORITY` / `PUBLIC_FEATURE_AUTHORITY`
  - `ACCOUNT_FEATURE_AUTHORITY`
  - `ADMIN_FEATURE_AUTHORITY`
  - FOUNDATION seal (`html` after FEATURE)

Route pages remain sole owners for search/auth/tasbih chrome (PRs C–D).

## Metrics

cssFiles: 355 → 353 (ceiling may lower). No new CSS file. No ceiling raise.

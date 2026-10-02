# LHCI Home Mobile — Batch A local close

| Field | Value |
|-------|-------|
| Base tip | `c1cec798` (+ Batch A patch) |
| Measured | local preview `http://127.0.0.1:24216/` |
| Tool | `@lhci/cli@0.15.1` · `lighthouserc.cjs` · 3 runs |
| Thresholds | `lhci-thresholds.cjs` **unchanged** |
| Patch | home-only: design-system→final-release on first interaction OR 60s after load |

## Numeric contract

| Audit | Required | Runs | Selected | Result |
|-------|----------|------|----------|--------|
| unused-css-rules | ≤ 80 | 0 / 0 / 0 | **max=0** / median=0 | **PASS** |
| unused-javascript | ≤ 500 (min) | 430 / 430 / 430 | **430** | **PASS** |
| forced-reflow-insight | score ≥ 1 **all runs** | 1 / 1 / 1 | all 1 | **PASS** |

## Exit

**LHCI_HOME_MOBILE_CLOSED** on local Batch A tip. Production tip re-proof required after merge/deploy.

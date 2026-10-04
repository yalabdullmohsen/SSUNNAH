# LONG_TERM_GOVERNANCE

Multi-year operating model for سُنّة.

## Pillars

| Pillar | Cadence | Authority | Gate family |
|---|---|---|---|
| Features / journeys | Every product PR | PRODUCT_COMPLETENESS_BASELINE | product-completeness |
| Design | Every UI PR | DESIGN_* · VISUAL_REDESIGN_V2 | visual · component · design-system |
| Architecture / state | Structural PRs | PLATFORM_* · STATE_ARCHITECTURE | platform-architecture |
| Performance | Perf / mushaf / bundle PRs | ARCHITECTURE + RUNTIME baselines | bundle · LHCI · mushaf · runtime |
| Accessibility | UI + token PRs | a11y / contrast contracts | a11y-contrast · on-brand |
| Observability | Client/ops changes | OBSERVABILITY_CONTRACT · platform-health | platform + p2-observability |
| Documentation | Any authority change | DOCUMENTATION_AUTHORITY + manifest | sustainability gate |
| Release / store | Owner-triggered only | RELEASE_* · store checklists | human + DEVICE_REQUIRED |

## Contribution contract

1. Branch from latest `main`.
2. Focused tests → `verify:preflight` → one `verify:ci`.
3. Squash-merge; wait for Production MATCH (`version.json`).
4. Never weaken gates or raise ceilings to pass CI.
5. Never touch Quran mapping / prayer calc / search ranking / Prod SQL / store uploads unless owner program explicitly allows.

## Knowledge continuity

- Humans: `docs/sustainability/*` + `docs/project-knowledge/*`
- Agents: AGENTS.md · 20_AI_AGENT_MEMORY · authority-manifest.json
- Ops: OPERATIONS_PLAYBOOK · PRODUCTION_RUNBOOK

## Sustainability KPI (qualitative)

- Unknown debt = 0 at program close
- Auto Deploy verifies tip after merge
- Authority docs stay linked from REPO_INDEX

LONG_TERM_GOVERNANCE_ESTABLISHED

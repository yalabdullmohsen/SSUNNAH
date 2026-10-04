# DOCUMENTATION_AUTHORITY

Canonical map — prefer these paths over scattered audit snapshots.

Machine index: `docs/sustainability/authority-manifest.json`

## Authority table

| Concern | Canonical docs | Enforced by |
|---|---|---|
| Platform architecture | `docs/platform/PLATFORM_*` · OWNERSHIP · STATE | `test:platform-architecture-excellence` |
| Product journeys / feedback | `docs/product/PRODUCT_COMPLETENESS_BASELINE.md` | `test:product-completeness-baseline` |
| Runtime / Mushaf fluidity | `docs/performance/RUNTIME_EXCELLENCE_BASELINE.md` | `test:application-experience-runtime-excellence` |
| Design language / tokens | `docs/design/DESIGN_*` · VISUAL_REDESIGN_V2 | visual / component / design-system gates |
| Routes / sections | `docs/product/SECTION_REGISTRY.md` · INFORMATION_ARCHITECTURE | route-registry · section gates |
| Search architecture | `docs/design/UNIFIED_SEARCH_ARCHITECTURE.md` | search quality / normalize gates (**no ranking edits**) |
| Mushaf QA | `docs/qa/MUSHAF_*` · project-knowledge/09 | mushaf measure + unit gates |
| Prayer / Adhan | project-knowledge/10 · `docs/qa/PRAYER_ADHAN_*` | prayer-engine-p0 (**no calc edits**) |
| Observability / ops | OBSERVABILITY_CONTRACT · OPERATIONS_PLAYBOOK | platform-health + ops workflows |
| Release truth | RELEASE_READINESS_TRUTH · CURRENT_RELEASE_TRUTH · this pack | sustainability gate |
| Long-term knowledge | `docs/project-knowledge/00–20` + KNOWLEDGE_INDEX.json | sustainability gate existence checks |
| Debt prevention | `docs/sustainability/DEBT_PREVENTION.md` | gate registry in manifest |

## Lifecycle docs

| Lifecycle | Doc |
|---|---|
| Day-to-day PR | Developer-Guide · verify:preflight → verify:ci |
| Deploy / MATCH | OPERATIONS_PLAYBOOK · PRODUCTION_RUNBOOK |
| Rollback | RELEASE_ROLLOUT_AND_ROLLBACK · ROLLBACK_RUNBOOK |
| Future iOS/Android | IOS_RELEASE_CHECKLIST · ANDROID_RELEASE_CHECKLIST (no builds in this program) |
| Multi-year governance | LONG_TERM_GOVERNANCE.md |

## Missing ownership rule

If a new domain ships without a row above, add it to `authority-manifest.json` **and** this table in the same PR.

DOCUMENTATION_AUTHORITY_COMPLETE

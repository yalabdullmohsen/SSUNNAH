# SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY

**Status:** ACTIVE  
**Mode:** QUEUED_AUTONOMOUS_MULTI_PR_EXECUTION_FROM_LATEST_MAIN  
**Token authorities only:** `--sf-*` · `--ss-*` · `--mj-*`  
**Forbidden:** fourth design-token family · mass delete · ceiling raise · Quran/prayer/search ranking edits · Prod SQL · Builds/TestFlight/App Store

## Permanent platform identity

سُنّة = multi-surface product:

1. WEB_PLATFORM  
2. IOS_APPLICATION  
3. APP_STORE_PRODUCT  
4. SHARED_PLATFORM  

Every PR/report must include:

- `TASK_CLASSIFICATION`
- `WEB_IMPACT`
- `IOS_APPLICATION_IMPACT`
- `APP_STORE_PRODUCT_IMPACT`
- `SHARED_PLATFORM_IMPACT`

Companion enforcement: `docs/governance/SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL.md` · gate `test:platform-separation`.

## Definition of CLEAN

CLEAN means one authority per concern, no competing visual systems, no zero-consumer compatibility layers, no undocumented special cases, no unknown internal debt — not “delete everything”.

## Inventory artifacts (Phase 0–1)

Generated under `artifacts/majalis/reports/eradication/`:

- `FULL_STYLE_DEPENDENCY_GRAPH.json`
- `CSS_LOAD_ORDER_MAP.json`
- `TOKEN_ALIAS_GRAPH.json`
- `COMPONENT_CONSUMER_MAP.json`
- `ROUTE_TO_STYLE_MAP.json`
- `WEB_IOS_SHARED_OWNERSHIP_MAP.json`
- `FULL_VISUAL_BASELINE.json`
- `HEX_FILE_RANKING.json`

Human summary: `docs/design/eradication/FULL_VISUAL_BASELINE.md`

Regenerate:

```bash
pnpm --filter @workspace/majalis run inventory:application-layer-eradication
```

Gate:

```bash
pnpm --filter @workspace/majalis run test:application-layer-eradication
```

## Layer classification vocabulary

`CANONICAL_AUTHORITY` · `ACTIVE_COMPATIBILITY` · `ABSORB_NOW` · `KEEP_TEMPORARILY` · `SPECIAL_CASE` · `DEAD_WITH_PROOF` · `DUPLICATE_WITH_PROOF` · `IOS_ONLY` · `WEB_ONLY` · `SHARED_PLATFORM` · `APP_STORE_ONLY`

## Delivery train

| PR | Scope |
|---|---|
| A | Inventory + baseline + governance groundwork |
| B | Token aliases + CSS layer absorption wave 1 |
| C | Color absorption (highest-impact public surfaces) |
| D | Heroes + Cards |
| E | Lists + Tables |
| F | Buttons + Forms + Interaction |
| G | Navigation + Tabs + Search + Filters |
| H | Modals + Feedback + a11y |
| I | Performance + Mushaf safe cleanup |
| J | Proven dead code + final reconciliation |

## KEEP_JUSTIFIED policy

Allowed only with: exact file · selector/component · active consumer · technical reason · attempted replacement · failure evidence · risk · regression gate · review trigger · platform classification.

## Exit markers (do not claim early)

`FULL_STYLE_DEPENDENCY_GRAPH_COMPLETE` · `SINGLE_TOKEN_AUTHORITY_ESTABLISHED` · `CSS_LAYERS_MINIMIZED` · `RELOAD_TO_WIN_ZERO` · `GLOBAL_COLOR_AUTHORITY_CONSOLIDATED` · component/system singles · `PROVEN_DEAD_CODE_REMOVED` · `PLATFORM_SEPARATION_ENFORCED` · `DESIGN_DRIFT_PREVENTED` · `UNKNOWN_INTERNAL_DEBT = 0`

Do **not** emit `REPOSITORY_CLEAN` until every exit condition is met with evidence.

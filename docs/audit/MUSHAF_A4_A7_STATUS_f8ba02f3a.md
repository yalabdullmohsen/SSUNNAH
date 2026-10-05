# MUSHAF A4–A7 status (tip `f8ba02f3a`)

`TASK_CLASSIFICATION: SHARED_PLATFORM_WITH_IOS_DEVICE_BOUNDARY`  
`RISK_SCOPE: mushaf-reader / mushaf-shared (web); iOS Capacitor inherits web bundle only.

Forbidden claims: **MUSHAF_SILKY**, DEVICE_TESTED, STORE_GO — not asserted here.

## Context (already on tip before this branch)

| Track | Status | Evidence |
|---|---|---|
| A1 ownership | FIXED | `mushaf-ownership-a1-gate.test.ts` |
| A2 telemetry | FIXED | `mushaf-turn-telemetry.ts` |
| A3 ±2 font prefetch idle | FIXED | `useQpcPageFont.ts` + `NewMushafReader` |

## A4 — lock taxonomy (this branch)

| Lock kind | Owner | Classification |
|---|---|---|
| VISUAL_READINESS | `stableView` + `useMushafResourceGate` (current page) | KEEP — correct to wait active page font+layout |
| INTERACTION_LOCK | `pagerSettled` + `PrefetchPage.selectionEnabled` | KEEP — ayah tap frozen during pan/product lock |
| SETTLE_LOCK | `useMushafPager.locking` + `SETTLE_MS` | KEEP_JUSTIFIED |
| AUDIO_STATE_LOCK | `bottomStackFrozen` + `freezeStackMode` | KEEP — layout stability during dock/ayah bar |
| PRODUCT_TURN | `pageTurnLockRef` → target font+layout | MUSHAF_SPECIAL |
| Remote ±2 font | `enqueueFarPrefetch` idle queue | **Does not** gate `edgesDisabled` or ayah interaction on settled current page |

Code: `artifacts/majalis/src/features/mushaf-reader/mushaf-lock-ownership.ts`

## A5 — subscriptions (this branch)

| Before | After | Measurement |
|---|---|---|
| ~1 `useMushafHighlightKeys` per verse line (~15/pane) | 1 hook per `MushafPage` pane; lines receive `highlightKeys` prop | `mushaf-fluidity-audit` WORD_SYNC severity → PARTIAL/page-level; gate `mushaf-a4-a6-refine-gate` |

Word-level hooks remain **absent** on production verse layer (madinah archive still has legacy hooks — out of `/mushaf` path).

## A6 — offscreen work (this branch)

| Item | Status |
|---|---|
| `content-visibility: auto` on off panes | KEEP (existing CSS) |
| `inert` on neighbor sheets when `settled` | KEEP (existing `MushafPager`) |
| `syncHighlights={false}` on prefetch panes | KEEP (existing) |
| `AyahSelectionOverlay` mount | **IMPROVED** — not mounted when `selectionEnabled=false` (turn + neighbors) |

Further DOM virtualization (single sheet) = **DEVICE_REQUIRED** / architecture — not attempted.

## A7+ (not in scope)

| Item | Class |
|---|---|
| Main-thread long tasks / FPS during 25–100 page turns | DEVICE_REQUIRED |
| iOS widget / native adhan | IOS_ONLY |
| MUSHAF_SILKY product claim | **FORBIDDEN** without device pack |

## Gates run (branch)

- `node --import tsx src/lib/__tests__/mushaf-a4-a6-refine-gate.test.ts`
- `node --import tsx src/lib/__tests__/mushaf-fluidity-optimization-gate.test.ts`
- `node --import tsx src/lib/__tests__/wave6-mushaf-fluidity-gate.test.ts`

Exit: `MUSHAF_A4_A6_REFINE_REPO` (repository); silky/device exit **not** claimed.

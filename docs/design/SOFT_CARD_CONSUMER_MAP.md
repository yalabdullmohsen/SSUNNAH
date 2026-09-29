# Soft-card Consumer Map — Debt Reduction Wave 2

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Baseline (#2354 / W1 tip) | **52** product TSX consumers (excl. `AppCard`, `main.tsx` import) |
| After Wave 2 | **0** product TSX consumers |

## Authority bridge (allowed)

| File | Role |
|---|---|
| `components/design-system/AppCard.tsx` | Injects `soft-card soft-card--on-light` for DOM parity |
| `main.tsx` | Deferred `import("./styles/soft-cards.css")` — KEEP until AppCard leaves bridge |
| `styles/soft-cards.css` | Runtime KEEP |

## Migration rule applied

Every former consumer dropped direct `soft-card*` classNames. Surfaces keep domain classes (`hadith-card`, `ads-card`, `hub-card`, …) covered by `card-system.css` / hub CSS. `HadithCard` / `mj.Card` / `ElevatedSurface` compose `AppCard` where needed.

## Consumer → authority (summary)

| Former pattern | Replacement |
|---|---|
| `<article className="… soft-card …">` (Hadith) | `AppCard as="article"` |
| `mj.Card` | `AppCard` inside `mj.tsx` |
| `ElevatedSurface` redundant classes | Dropped; AppCard supplies surface |
| Domain cards / panels / sections | Class strip only; domain CSS + card-system retain parity |

## Explicit non-claim

`SOFT_CARDS_RETIRED` / deleting `soft-cards.css` import — **not** declared (AppCard still bridges).

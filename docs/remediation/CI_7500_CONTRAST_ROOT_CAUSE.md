# CI #7500 — Color contrast root cause

| Field | Value |
|---|---|
| Run | [#7500](https://github.com/yalabdullmohsen/majalis/actions/runs/36337428754) (`36337428754`) |
| Commit | `eaf221e463bd7e5d14f04c969cfcff3f32a00529` (merge #2308 admin Wave 1 → main) |
| Failed job | Color contrast (Playwright) |
| Dependent | Verify build · ci-required (cascade only) |
| On-brand contrast | **success** |

## Exact failure (gate table)

| Route | Selector | FG | BG | Ratio | Required | Text |
|---|---|---|---|---|---|---|
| `/quran-knowledge` [dark] | `.hub-card__title` | `#15382D` | `#24302B` | **1.07:1** | 4.5:1 | فهرس القرآن |

Artifact screenshot: `color-contrast-failures/fail-1790530803595.png`.

Warning (non-blocking in that run): `/hadith/arbaeen-love-of-allah` [light] title ≈ 1.57:1 (large-title band).

## Required-gate step

`Contrast gates must not skip when...` failed because `CONTRAST_OUTCOME=failure`.  
On-brand was `success`. This is **not** an unexpected skip / path-lane miss — the gate executed and reported 1/506 hard fail.

## Shared product root cause

Dark hub entry cards (`.hub-card` + `.soft-card--on-light`) paint an elevated night surface ≈ `#24302B`, while title color resolves to Foundation **rich ink** `#15382D` (light-surface primary) via token / `ss-text--card-title` / inherit bridges — not via an intentional on-ink dark token.

Later Wave 3 (`cs2-nav__title` + `color: inherit` on `.hub-card.cs2-host`) can keep the same failure mode unless dark titles are pinned to night ink.

## Fix direction

1. Pin dark `.hub-card` title/desc/meta (and CS2 host titles) to night on-ink (`#edf5f0` / Foundation night ink).  
2. Stop inheriting light rich-ink onto dark elevated hub surfaces.  
3. Focused gate asserting the pair.

## Non-claims

Admin Unicode / seven-center nav already merged in #2308 — this fix does not re-litigate that scope.  
No threshold weakening · no route skip · no snapshot update required for this pair.

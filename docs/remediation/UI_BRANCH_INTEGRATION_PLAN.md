# UI Branch Integration Plan

## Inventory (2026-09-27)

| PR | Branch | Base | Focus | CI blocker | Mergeable |
|---|---|---|---|---|---|
| #2307 | merged | main | tawhid dark contrast | — | **Merged** → `a9e7bf87` |
| #2306 | merged | main | prayer first-frame shell | — | **Merged** |
| #2302 | merged | main | Hadith Phase 1 registry/counts | — | **Merged** |
| #2304 | `cursor/homepage-redesign` | main | homepage redesign | contrast NOT_FOUND + scroll gate | MERGEABLE |
| #2305 | `cursor/lessons-experience-redesign` | main | lessons redesign | HARD_WHITE_BG | MERGEABLE |

## Overlap

| Area | Overlap risk |
|---|---|
| Semantic tokens / tawhid | Resolved on main (#2307) — no competing token PRs |
| Homepage vs lessons CSS | Low — distinct surfaces |
| Prayer shell | Already on main (#2306) |

## Safe merge order

1. ~~Shared contrast (#2307)~~ done — main green
2. ~~Prayer flash (#2306)~~ done
3. ~~Hadith Phase 1 (#2302)~~ done
4. **Homepage #2304** (after contrast/scroll fixes land green)
5. **Lessons #2305** (after HARD_WHITE_BG fix; rebase if main moved)

Do not merge while Color contrast is red. One canonical color fix only (#2307).

## Rebase policy

Both open branches rebased onto `origin/main` (`a9e7bf87`+) with force-with-lease after fixes. No force-push to protected `main`.

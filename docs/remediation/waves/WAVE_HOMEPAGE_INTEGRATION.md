# WAVE — Homepage Integration (#2304)

| Field | Value |
|---|---|
| Branch | `cursor/homepage-redesign` |
| State | **IN CI** after gate fixes |
| Preserve | Search-first compact home, single hero CTA, hide scroll-to-top until meaningful scroll |

## CI blockers fixed

1. Contrast NOT_FOUND `.m2030-btn--ghost` → assert `.hw3-chip--lead`
2. ScrollToTop source gate → `scrollY > 720`

## Acceptance

Color contrast + visual-snapshot + Verify build green on PR before merge.

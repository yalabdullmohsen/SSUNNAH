# WAVE — Lessons Integration (#2305)

| Field | Value |
|---|---|
| Branch | `cursor/lessons-experience-redesign` |
| State | **IN CI** after HARD_WHITE_BG fix |
| Preserve | Compact cards, sticky filters, overflow actions, detail redesign |

## CI blocker fixed

`background: #fff` ×3 → `var(--surface-card, var(--mj-surface))` in `lessons.css`.

## Acceptance

Color contrast green; no threshold/skip changes. Merge after #2304 if both green, or independently once main still green.

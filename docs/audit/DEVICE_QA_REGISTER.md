# DEVICE QA REGISTER — سُنّة

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Rule | No invented device numbers · no STORE GO from web-only evidence |
| Classification | Remaining items = **DEVICE_REQUIRED** unless proven in repo |

## Matrix (status)

| Surface | iPhone | iPad | Android | VoiceOver | TalkBack | Large Text | Split View | Notes |
|---|---|---|---|---|---|---|---|---|
| Home cold start FOUC | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — | DEVICE_REQUIRED | — | Code FOUC mitigations present; CLS not measured |
| Light / Dark / System | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — | DEVICE_REQUIRED | — | Authority on web; device matrix open |
| Prayer first frame / jump | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — | — | — | Boot skeleton in code; device CLS open |
| Prayer ↔ Home theme leak | CODE_FIXED (#2351) | DEVICE_REQUIRED confirm | DEVICE_REQUIRED | — | — | — | — | Prefetch leak closed on main/prod |
| Bottom nav collisions / FAB | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — | — | — | Floating policy exists |
| Mushaf chrome / keyboard / VV | PARTIAL (web+VV fix merged) | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | DEVICE_REQUIRED | DEVICE_REQUIRED | No Quran text changes |
| Mushaf GOLD/EMERALD | CODE_OK web | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — | — | — | Native cache Class B |
| Search / filters sheets | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | |
| Auth signup / password checklist | CODE_FIXED (#2350) | — | — | DEVICE_REQUIRED | — | — | — | Confirm email flows on device |
| Prayer background / adhan | DEVICE_REQUIRED | — | DEVICE_REQUIRED | — | — | — | — | + OWNER_ACTION / LICENSE |

## How to close a DEVICE_REQUIRED row

1. Record device model + OS + build (`version.json` commit).  
2. Attach screenshot or screen recording path under `/opt/cursor/artifacts` or release evidence.  
3. Flip cell to `PASS` / `FAIL` with date — never to PASS without artifact.

## Non-claims

Device-complete · WCAG certification · STORE GO

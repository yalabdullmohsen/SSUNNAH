# WAVE — Search Blocked Exclude W1

| Field | Value |
|---|---|
| Branch | `cursor/search-blocked-exclude-w1` |
| Base | `origin/main` @ Kuwait Lessons Model (#2321) |
| Programs | 23 (search integrity) · 10 (sects قريبًا) |

## Defect

Public index included `app:sects` → `/islamic-sects` while the section is `comingSoon` / product `COMING_SOON` + `searchStatus: EXCLUDED`.

## Fix

- `public-search-blocklist.ts` — SSOT for COMING_SOON + blocked prefixes + safe product EXCLUDED hubs
- Index generator skips blocked hrefs; remove hardcoded `app:sects`
- Validate + integrity gate assert blocked destinations count as invalid
- Knowledge scope no longer matches `/islamic-sects`

## Non-changes

- No religious content
- No fabricated COMPLETE claims
- Shared hubs (`/discover-islam`, `/assistant`, notifications) not blanket-blocked

## Verification

`generate:search-index` · `test:search-route-integrity` · `verify:ci`

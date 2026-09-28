# Phase 6 — Owner Actions Checklist

Agents must **not** execute these. Evidence updates only after owner confirmation.

| Action | Class | Where | Required evidence | If skipped |
|---|---|---|---|---|
| Reconcile Android `applicationId` with Capacitor/iOS OR accept dual-ID store strategy | REQUIRED_BEFORE_STORE_SUBMISSION | Play Console + Gradle decision | Written decision | Wrong listing / update path |
| Provide iOS signing team / profiles | REQUIRED_BEFORE_TESTFLIGHT | Apple Developer / Xcode | Archive succeeds | No TestFlight |
| Provide Android Play App Signing / keystore access | REQUIRED_BEFORE_STORE_SUBMISSION | Play Console | AAB uploadable | No Play release |
| ASC metadata + privacy nutrition labels | REQUIRED_BEFORE_STORE_SUBMISSION | App Store Connect | Screenshots + declarations | HOLD |
| Play metadata + Data safety | REQUIRED_BEFORE_STORE_SUBMISSION | Play Console | Form complete | HOLD |
| Review account / demo notes | REQUIRED_BEFORE_STORE_SUBMISSION | ASC | Working reviewer login | Review rejection risk |
| QPC / QUL written redistribution clearance | REQUIRED_BEFORE_STORE_SUBMISSION | Rights desk | Letter/URL | Strip fonts or HOLD |
| Hisn edition permission or replace | REQUIRED_BEFORE_STORE_SUBMISSION | Rights desk | Permission or replacement | HOLD |
| Adhan / CAF / offline audio rights | REQUIRED_BEFORE_STORE_SUBMISSION | Legal | Allowlist | Keep DO_NOT_BUNDLE |
| Supabase MFA + leaked-password protection | REQUIRED_BEFORE_PUBLIC_ROLLOUT | Supabase Auth | Dashboard toggles | Elevated risk |
| Confirm production secrets (Vercel, push, VAPID) | REQUIRED_BEFORE_PUBLIC_ROLLOUT | Vercel / Firebase / APNs | Checklist signed | Feature degradation |
| Universal links / assetlinks live | REQUIRED_BEFORE_PUBLIC_ROLLOUT | DNS + hosting | curl AASA/assetlinks | Deep link failures |
| Mushaf device matrix sign-off | REQUIRED_BEFORE_TESTFLIGHT | Physical devices | Dated matrix | DEVICE_REQUIRED open |
| Prayer/Adhan device matrix sign-off | REQUIRED_BEFORE_TESTFLIGHT | Physical devices | Dated matrix | DEVICE_REQUIRED open |
| Pin Store RC commit | REQUIRED_BEFORE_STORE_SUBMISSION | Release process | SHA in STORE_SOURCE_COMMIT | Wrong binary |
| Final owner GO / WITHDRAW | REQUIRED_BEFORE_PUBLIC_ROLLOUT | Owner | Explicit decision | No STORE GO by agents |
| Post-release monitoring watch | POST_RELEASE | Ops | Build-correlated metrics | Slow incident response |

## Current classification summary

- STORE STATUS: **HOLD**  
- Final agent decision available after green `release:verify`: **TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS** (not STORE GO)

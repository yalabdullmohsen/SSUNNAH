# OWNER ACTIONS CURRENT — سُنّة

**Updated:** 2026-10-02 (BUILD_55 auth hardening)  
**Live web tip:** see `CURRENT_PROJECT_STATUS.md`  
**Build 55 truth:** `docs/store-release/BUILD_55_TRACEABILITY.md`  
**Device evidence procedure:** `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md`  
**Rule:** Agents must **not** execute these. Record only.

| action | why | evidence | exact system | consequence if not done | safe rollback |
|---|---|---|---|---|---|
| **Rotate App Store review account password** (`REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION`) | Password was previously embedded in client source; rotate after hardening merge | `review-notes.md` · ASC Review Notes | Supabase Auth + App Store Connect Review Notes only | Prior literal may remain usable by anyone who saw old client | Revoke/rotate again; never commit new password |
| Paste rotated review password **only** into ASC Review Notes | Reviewers need login without client secret | `ASC_REVIEW_NOTES_PASTE.txt` (placeholder) | App Store Connect | Apple review login friction | Update ASC notes; keep git password-free |
| Device re-cert auth on build **> 55** (`CAPACITOR_AUTH_REQUIRES_DEVICE_RECERTIFICATION`) | Build 55 binary lacks Keychain adapter / credential removal | `BUILD_55_TRACEABILITY.md` · T-034 | Physical iPhone/iPad + TestFlight | Cannot claim `IOS_AUTH_CERTIFIED` | Re-test after next Archive |
| Approve Bundle ID for store builds | Binary identity must match Apple/Google accounts | `STORE_100_PERCENT_READINESS.md` unchecked | Apple Developer / Play Console | Cannot ship store binary | Keep current non-store IDs |
| Provide signing certificates / profiles | Required for Archive/AAB | same | Xcode / Play App Signing | No TestFlight/AAB | Do not embed secrets in repo |
| App Store Connect / Play credentials for upload | Human-operated upload | same | ASC / Play Console | No store submission | Revoke tokens if leaked |
| Decide CAF / adhan asset exclusion for store binary | Unresolved redistribution risk for non-CC0 packs | `STORE_ASSET_MANIFEST.md` · `LICENSE_RISKS.md` | Store RC build pipeline | HOLD remains | Revert to system-default sounds |
| Written QPC / QUL redistribution permission | Fonts in binary need clearance | `LICENSE_RISKS.md` · `docs/LICENSES.md` | KFGQPC/QUL license desk | Must ship without disputed fonts or stay HOLD | Strip fonts from store flavor |
| Written Hisn Muslim edition permission or replace corpus | Edition rights | `LICENSE_RISKS.md` | Rights holder | Remove/replace Hisn-derived packing | Feature-flag off |
| everyayah / mp3quran offline policy | ToS unsigned for bundling | `LICENSE_RISKS.md` | Provider ToS | Keep live streaming only | Kill-switch audio |
| Approve or permanently reject madinah adhan rights | `rights_uncertain` | `prayer-audio-rights-registry.ts` | Legal/owner | Remains hidden from production UI | Keep `approvedForProduction: false` |
| Approve or keep rejected qatami adhan | Celebrity/name risk | same | Legal/owner | Remains blocked | Keep rejected |
| Apply hosted SQL migrations (staging→prod) with backup | Schema/runtime jobs | `docs/REQUIRES_EXPLICIT_APPROVAL.md` | Supabase SQL Editor / approved CLI | Some `/api/readyz` paths may 503 | Use documented `*_ROLLBACK.sql` |
| Enable Auth MFA for admin accounts | Admin security | same | Supabase Auth dashboard | Elevated account risk | Disable MFA only via dashboard |
| Enable leaked-password protection | Auth hardening | same | Supabase Auth dashboard | Weaker password policy | Toggle off in dashboard |
| Confirm Vercel production secrets set | Assistant/API server needs | Vercel project settings | Vercel | Feature degradation, not silent license bypass | Rotate/remove secrets |
| Pin Store RC commit for Archive/AAB | Tip `5e99cd7c` ≠ automatic store pin | `CURRENT_PROJECT_STATUS.md` + store readiness | Release process | Wrong binary shipped | Rebuild from recorded pin only |
| Device matrix sign-off (prayer + mushaf) | Cannot be simulated fully | `WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md` + `DEVICE_QA_REGISTER.md` | Physical devices | DEVICE_REQUIRED rows stay open | Re-test after fixes |
| Final App Store GO / WITHDRAW | Legal+product authority | Store readiness | Owner | No submission | Withdraw build in ASC |
| ASC: category · copyright · Contests answer · paste listing | T-048 readiness OWNER rows | `APP_STORE_READINESS_REPORT.md` · checklist | ASC | Cannot submit listing | Keep drafts in repo |
| ASC Privacy nutrition labels = PrivacyInfo | Must not assume console answers | `APP_STORE_PRIVACY_ANSWERS_DRAFT.md` | ASC | Privacy mismatch rejection | Re-sync from PrivacyInfo |
| Capture Store RC screenshots iPhone/Max/iPad | All sets MISSING | `store/screenshots/README.md` | Device/simulator + ASC | No listing visuals | Retake from Store RC only |
| ASC export compliance + demo credentials re-verify | Forms/credentials console-only | review-notes.md · Info.plist encryption flag | ASC | Review delays | Update notes per build |
| App Group `group.com.yousef.majlisilm` on App+LA+Widget store profiles | T-049 export failed without App Groups on store profiles | `TESTFLIGHT_INTERNAL_CERTIFICATION_REPORT.md` · export-attempt.log | Apple Developer portal | Cannot export/upload TF IPA | Re-export after profile refresh |
| App Store profile for `PrayerWidget` + TF upload | Missing widget store profile; no TF build | same | ASC / Xcode Organizer | Install/Smoke stay FAIL | Upload from pinned `STORE_SOURCE_COMMIT` only |
| Complete TF Internal + device matrix/a11y/perf evidence for iOS RC | T-050 blocked: Binary/Install/Smoke/Device FAIL | `IOS_RELEASE_CANDIDATE_REPORT.md` | ASC + physical devices | `IOS_RELEASE_CANDIDATE_READY` remains false | Re-cert from same pin after evidence |

## Not owner-blocked (agents may continue)

- Truth/docs sync  
- License **guards** and manifests (without flipping uncertain→approved)  
- Hiding `source_missing` from public UI  
- Publication guards for DRAFT/NEEDS_SOURCE  
- Admin v3 build behind `/admin`  
- Deep-link fixes, performance within budgets  
- Device **runbooks** and CI contract tests  

## Contact path

Owner executes dashboard/CLI steps; agent updates evidence checkboxes only after owner provides confirmation artifact (screenshot, ticket id, or signed note).

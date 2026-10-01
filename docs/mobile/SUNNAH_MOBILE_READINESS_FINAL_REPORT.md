# سُنّة — Mobile Readiness Final Report (MRMP v1)

| Field | Value |
|-------|-------|
| Report status | **LIVING** (M14 aggregation incomplete) |
| Program | `docs/mobile/MRMP_V1_MASTER_PROGRAM.md` |
| Contract | `docs/mobile/MOBILE_SUCCESS_CONTRACT.md` |
| Tracker | `docs/mobile/MRMP_V1_TRACKER.md` |
| Chartered | 2026-10-01 |
| Web tip at charter | `2c8aa1ae` (main = production MATCH) |
| **Executive Verdict** | **MOBILE_PARTIALLY_READY** |

## Executive Verdict

طبقة Capacitor/iOS موجودة ومربوطة بـ`webDir: dist`، وبوابات iOS ثابتة في المستودع، لكن **لا يوجد** دليل TestFlight/Play Internal ولا مصفوفة أجهزة مكتملة ولا شهادة مصحف/أذان على جهاز.  
هوية أندرويد (`com.majlisilm.app`) لا تطابق Capacitor/iOS (`com.yousef.majlisilm`) — حاجز M1/M12.

لذلك: **ليس** `IOS_RELEASE_CANDIDATE_READY` ولا `ANDROID_RELEASE_CANDIDATE_READY` ولا `STORE_GO`.

ما يحدد نجاح المستخدم غالبًا:

```text
هل المصحف سريع؟
هل الأذان يعمل؟
هل التطبيق يعمل دون اتصال؟
هل الإشعارات تصل؟
هل التطبيق مستقر على الأجهزة؟
```

وليس إغلاق unused-css على الويب وحده.

## Native Architecture

| Item | Status | Evidence |
|------|--------|----------|
| Capacitor config | PRESENT | `artifacts/majalis/capacitor.config.json` · appId `com.yousef.majlisilm` |
| iOS project | PRESENT | `artifacts/majalis/ios/App` · bundle `com.yousef.majlisilm` |
| Android project | PRESENT | `artifacts/majalis/android/app` · applicationId `com.majlisilm.app` **≠** appId |
| Expo mobile package | OUT OF SCOPE | `artifacts/majalis-mobile` excluded from root build |
| M1 exit | OPEN | → `NATIVE_ARCHITECTURE_CERTIFIED` |

## Startup

| Item | Status |
|------|--------|
| Cold/Warm/Resume matrix | DEVICE_REQUIRED |
| No white/blank/reload | UNPROVEN on device |
| Theme flash on native | PARTIAL web work (U3/U4) · native unproven |
| M2 exit | OPEN → `APP_SHELL_STABLE` |

## Authentication

| Item | Status |
|------|--------|
| Login/Register/Logout | WEB paths exist · native matrix OPEN |
| Session recovery / expired / offline start | OPEN |
| M4 exit | OPEN → `AUTH_CERTIFIED` |

## Offline

| Item | Status |
|------|--------|
| Route offline matrix | NOT_STARTED |
| M5 exit | OPEN → `OFFLINE_READY` |

## Push

| Item | Status |
|------|--------|
| FG/BG/killed/cold/tap/deep link | DEVICE_REQUIRED |
| M8 exit | OPEN → `PUSH_CERTIFIED` |

## Prayer

| Item | Status |
|------|--------|
| Background / terminated / lock screen | DEVICE_REQUIRED (see STORE_100% HOLD) |
| Adhan delivery | DEVICE_REQUIRED |
| M7 exit | OPEN → `PRAYER_NOTIFICATION_CERTIFIED` |
| Reuse | `docs/store-release/STORE_100_PERCENT_READINESS.md` · `artifacts/majalis/docs/IOS_ADHAN_LIMITS.md` |

## Mushaf

| Item | Status |
|------|--------|
| 25/50/100 page turns | DEVICE_REQUIRED |
| Audio ON/OFF · search · bookmarks · tafsir | DEVICE_REQUIRED |
| FPS/Memory/CPU/crashes | DEVICE_REQUIRED |
| M6 exit | OPEN → `MUSHAF_MOBILE_CERTIFIED` |
| Sacred boundary | Quran text/mapping/QPC untouched |

## Performance

| Item | Status |
|------|--------|
| Startup/nav/search/mushaf/prayer metrics | DEVICE_REQUIRED |
| Memory/Battery/CPU/Frames | DEVICE_REQUIRED |
| M11 exit | OPEN → `PERFORMANCE_CERTIFIED` |

## Accessibility

| Item | Status |
|------|--------|
| VoiceOver | DEVICE_REQUIRED |
| TalkBack | DEVICE_REQUIRED |
| M9 exit | OPEN → `ACCESSIBILITY_CERTIFIED` |

## Device Matrix

| Class | Status |
|-------|--------|
| iPhone modern/mid/small | EMPTY |
| iPad portrait/landscape/split | EMPTY |
| Android modern/mid/budget | EMPTY |
| M10 exit | OPEN → `DEVICE_MATRIX_COMPLETE` |

## Store Readiness

| Item | Status | Notes |
|------|--------|-------|
| Apple certs/provisioning/ASC/privacy | OWNER | `docs/qa/IOS_RELEASE_CHECKLIST.md` |
| Google signing/Play/App Links/privacy | OWNER | `docs/qa/ANDROID_RELEASE_CHECKLIST.md` |
| Store 100% readiness | **HOLD** | `docs/store-release/STORE_100_PERCENT_READINESS.md` |
| TestFlight | NOT uploaded | |
| Play Internal | NOT uploaded | |
| M12 exit | OPEN → `STORE_READY` |

## Release Candidate

| Item | Status |
|------|--------|
| TestFlight RC | BLOCKED |
| Play Internal RC | BLOCKED |
| M13 exit | OPEN → `RELEASE_CANDIDATE_CERTIFIED` |

## Remaining Risks (top)

1. **HARD** — Android applicationId ≠ iOS/Capacitor appId.  
2. **HARD** — No device evidence for Mushaf long session / Prayer / Push.  
3. **OWNER** — Signing + store accounts + Bundle ID final decision.  
4. **SOFT** — Web UNIFIED remaining debt (does not replace M*).  

## Final Status

```text
MOBILE_PARTIALLY_READY
```

Next: merge MRMP charter → execute **M1** certification on an independent branch/PR.

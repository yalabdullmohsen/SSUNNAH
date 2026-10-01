# SUNNAH MOBILE READINESS MASTER PROGRAM (MRMP v1)

| Field | Value |
|-------|-------|
| Program | **MRMP v1** — قطار تطبيق مستقل |
| Product | سُنّة · Capacitor shell over `artifacts/majalis` |
| Relationship to web | **PARALLEL · NOT SUBORDINATE** to UNIFIED U0–U13 |
| Forbidden coupling | لا تنتظر إغلاق unused-css/LHCI/web visual debt قبل بدء M* |
| Shared hard boundaries | Quran integrity · Prayer calculation · no Mushaf text edits |
| Current program verdict | See `SUNNAH_MOBILE_READINESS_FINAL_REPORT.md` |
| Policy | Evidence over estimates · device artifacts required · no store upload without OWNER |

## Why a separate train

مؤشرات نجاح التطبيق تختلف جذريًا عن مؤشرات نجاح الويب:

| Web UNIFIED (U*) | Mobile MRMP (M*) |
|------------------|------------------|
| unused-css / LHCI / tokens | Cold start / resume / no white screen |
| Theme pipeline / CLS | Deep links / push / adhan background |
| Button/Card authority | Offline / long Mushaf session / memory |
| Production web MATCH | TestFlight + Play Internal + device matrix |

إغلاق U* يُحسّن الويب المغذّي للـWebView، لكنه **لا يُصرّح** `IOS_RELEASE_CANDIDATE_READY`.

## Final target ladder (only these statuses)

```text
MOBILE_NOT_READY
MOBILE_PARTIALLY_READY
IOS_RELEASE_CANDIDATE_READY
ANDROID_RELEASE_CANDIDATE_READY
STORE_SUBMISSION_READY
STORE_GO
```

ممنوع إعلان `STORE_GO` بلا أدلة M1–M14 + Owner approval.

## Mobile Success Contract

المصدر الملزم: `docs/mobile/MOBILE_SUCCESS_CONTRACT.md`.

كل بند ☐ حتى دليل جهاز/متجر. لا نسب تقديرية.

## Phase map

| Phase | Exit code | One-pager |
|-------|-----------|-----------|
| M1 Native Architecture Certification | `NATIVE_ARCHITECTURE_CERTIFIED` | `phases/M01_NATIVE_ARCHITECTURE.md` |
| M2 Startup & App Shell | `APP_SHELL_STABLE` | `phases/M02_STARTUP_APP_SHELL.md` |
| M3 Deep Link Certification | `DEEP_LINKS_CERTIFIED` | `phases/M03_DEEP_LINKS.md` |
| M4 Authentication Certification | `AUTH_CERTIFIED` | `phases/M04_AUTHENTICATION.md` |
| M5 Offline Strategy | `OFFLINE_READY` | `phases/M05_OFFLINE.md` |
| M6 Mushaf Mobile Program | `MUSHAF_MOBILE_CERTIFIED` | `phases/M06_MUSHAF_MOBILE.md` |
| M7 Prayer & Adhan | `PRAYER_NOTIFICATION_CERTIFIED` | `phases/M07_PRAYER_ADHAN.md` |
| M8 Push Notifications | `PUSH_CERTIFIED` | `phases/M08_PUSH.md` |
| M9 Accessibility | `ACCESSIBILITY_CERTIFIED` | `phases/M09_ACCESSIBILITY.md` |
| M10 Device Matrix | `DEVICE_MATRIX_COMPLETE` | `phases/M10_DEVICE_MATRIX.md` |
| M11 Performance Certification | `PERFORMANCE_CERTIFIED` | `phases/M11_PERFORMANCE.md` |
| M12 Store Readiness | `STORE_READY` | `phases/M12_STORE_READINESS.md` |
| M13 Release Candidate Verification | `RELEASE_CANDIDATE_CERTIFIED` | `phases/M13_RELEASE_CANDIDATE.md` |
| M14 Final Mobile Report | report COMPLETE | `SUNNAH_MOBILE_READINESS_FINAL_REPORT.md` |

## Execution order when app is P0

إذا كان التطبيق الأولوية الأولى للمشروع (قرار مالك):

```text
1. U2 Token Freeze          (ويب — إن لم يُغلق؛ يقلل وميض WebView)
2. U3 Theme Pipeline        (ويب — themeMutAfterFP)
3. U4 Startup Chrome        (ويب — CLS/chrome)
4. M1 Native Architecture
5. M6 Mushaf Mobile
6. M7 Prayer & Adhan
7. M5 Offline
8. M8 Push
9. M10 Device Matrix
10. M11 Performance
11. M12 Store Readiness
12. M13 Release Candidate
13. Store Go
```

ملاحظات ترتيب:

- U2–U4 تبقى قطارات ويب؛ تُنفَّذ بالتوازي الآمن مع تحضير M1 دون دمج نطاقات في PR واحد.
- M2 (App Shell) يبدأ فور `NATIVE_ARCHITECTURE_CERTIFIED` أو بالتوازي التحضيري مع M1.
- M3/M4 يمكن تحضيرهما أثناء M6/M7 دون PR تنفيذي مختلط.
- U1 LHCI numeric / U5–U13 **ليست** بوابة دخول لـ M6–M7.

## Operating rules (MRMP)

1. **Train isolation:** PR واحد لكل مرحلة M* (أو حزمة شهادة واحدة موثّقة) — لا خلط مع UNIFIED U5–U13.
2. **Device evidence:** أي خروج M6/M7/M10/M11 يحتاج Artifact + Build + OS + Commit + Date + Tester + Result.
3. **No fake green:** ممنوع رفع عتبات ويب لإخفاء فشل أصلي؛ ممنوع ادعاء TestFlight بلا رفع.
4. **Mushaf/Prayer sacred:** نفس حدود القرآن والصلاة كما في UNIFIED — لا تعديل نص/حساب.
5. **Reuse existing:** ابدأ من `docs/qa/IOS_RELEASE_CHECKLIST.md` · `docs/qa/ANDROID_RELEASE_CHECKLIST.md` · `docs/store-release/*` · `docs/ios/IOS_NATIVE_VALIDATION.md` · `docs/audits/ios-stability-audit.md`.
6. **Owner gates:** Signing · ASC/Play secrets · Bundle ID decision · Store GO = OWNER only.

## Native identity (live snapshot at charter)

| Surface | Value | Note |
|---------|-------|------|
| Capacitor `appId` | `com.yousef.majlisilm` | `capacitor.config.json` |
| iOS `PRODUCT_BUNDLE_IDENTIFIER` | `com.yousef.majlisilm` | matches Capacitor |
| Android `applicationId` | `com.majlisilm.app` | **MISMATCH** — M1/M12 HARD |
| `webDir` | `dist` | cap sync from web build |
| Expo package | `artifacts/majalis-mobile` | **OUT of MRMP** (excluded from root build) |

## Tracker

Living board: `docs/mobile/MRMP_V1_TRACKER.md`.

## Final report

`docs/mobile/SUNNAH_MOBILE_READINESS_FINAL_REPORT.md` — يُحدَّث عند إغلاق كل مرحلة، ويُجمَّع نهائيًا في M14.

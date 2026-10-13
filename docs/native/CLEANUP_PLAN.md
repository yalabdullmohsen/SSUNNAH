# CLEANUP_PLAN — بقايا التطبيق القديم (Capacitor/WebView)

جرد بالأدلة (grep على الكود وworkflows وpackage.json وvercel.json) على رأس native-app. الأحجام = KB كما في git.
القاعدة: لا حذف لما تقرؤه main أو workflow يعمل عليها أو بناء الموقع أو `ios-native`/`SunnahNative` أو lanes `native_beta`/`native_release`.

## ملاحظة جوهرية
مشروع `ios-native/SunnahApp` يبني من `artifacts/majalis/ios/App/{SunnahNative,SunnahDataKit,SunnahPrayer,Shared,SunnahWidgetKit,PrayerWidget}`
(انظر `ios-native/scripts/generate-xcodeproj.rb`)، فمجلد `ios/App` **مشترك** وليس قديمًا بالكامل.
والتطبيق القديم نفسه (`ios/App/App` + `App.xcodeproj`) تقرؤه عشرات بوابات الموقع (انظر أدناه) فحذفه = تعطيل فحوص على main.

## (أ) قديم فقط وغير مرجَع — يُحذف
| المسار | الحجم | من يستعمله |
|---|---|---|
| `artifacts/majalis/ios/App/ExportOptions-AppStore.plist` | 4 | لا أحد (grep خارج docs: صفر مراجع) |

## (ب) الموقع/Vercel/CI الإنتاج — ممنوع لمسه
- `artifacts/majalis/src/**` (استيرادات `@capacitor/*` ضمن كود الموقع)، `artifacts/majalis/package.json`، `capacitor.config.ts/json` (يقرؤها `test-identity.mjs` وبوابات)، `vercel.json`، `pnpm-workspace.yaml`، `app/`، `api/`، `supabase/`.
- `artifacts/majalis/scripts/*` المرتبطة بـpackage.json: `prepare-ios.sh`، `release-ios.sh`، `generate-capacitor-assets.sh`، `native-prune-web-only.mjs`، `test-ios-capacitor-gates.mjs` (يُشغَّل من `ci:local` على main)، `test-ios-notifications.mjs`، `release-candidate-check.mjs`.
- `artifacts/majalis/src/lib/__tests__/*ios*-gate.test.ts` (تقرأ `ios/App/App/*` و`App.xcodeproj`).

## (ج) مشترك أو غير مؤكد — يبقى
| المسار | الحجم | السبب |
|---|---|---|
| `ios/App/App` | 8484 | هدف Capacitor القديم، لكن تقرؤه بوابات الموقع: `native-offline-audio-gate`، `phase6-release-readiness-gate`، `ios-build-version-traceability-gate`، `startup-ios-native-splash-s6-gate`، `check-swift-tokens`، `verify-adhan-caf-durations`… وmanifest الأذان |
| `ios/App/App.xcodeproj` | 72 | يقرؤه 8+ اختبارات + `Fastfile` (`IOS_PROJECT`) + lanes `beta`/`build_only` |
| `ios/App/CapApp-SPM` | 16 | يُذكر في `ios-testflight-deploy.yml` (workflow على main، يدوي) |
| `ios/App/SunnahWeb` | 28 | `test-ios-capacitor-gates.mjs` (ci:local على main) + `NativeShellGate.swift` |
| `ios/App/UpdatesView.swift` | 4 | في `App.xcodeproj`؛ ويطابق `/api/updates` الحي |
| `ios/App/PrayerLiveActivity`, `WidgetSnapshotHarness` | 28 / 600 | تقرؤهما بوابات وسكربت `ios-widget-snapshot.sh` وSunnahWidgetPlatform |
| `ios/debug.xcconfig`, `ios/.gitignore`, `ios/build/native-metadata` | 4 | `native-metadata` تقرؤه `Fastfile` (native_release) |
| `ios/App/{SunnahNative,SunnahDataKit,SunnahPrayer,Shared,SunnahWidgetKit,PrayerWidget}` | 2000/28/184/56/104/188 | **التطبيق الجديد نفسه** |
| `.github/workflows/ios-capacitor-gates.yml` | — | يعمل على main عند push (مسارات ios/**)؛ حذفه تعطيل فحص |
| `.github/workflows/ios-testflight-deploy.yml` | — | يدوي، يستعمل lane `beta` القديم؛ يُقرَّر مع المالك |
| lanes `beta` و`build_only` في `fastlane/Fastfile` | — | يستعملهما workflow أعلاه؛ تُحذف معه فقط |
| `artifacts/majlisilm-flutter` | 456 | `DEPRECATED.md` لكنه مذكور في `pnpm-workspace.yaml` (بناء الموقع) و`PLATFORMS.md` |

## خطة المرحلة 2 (تحتاج موافقة المالك — لا تُنفَّذ الآن)
حذف التطبيق القديم فعليًا (≈8.7MB) يتطلب في commit واحد قابل للتراجع: إزالة `ios/App/App`+`App.xcodeproj`+`CapApp-SPM`+`SunnahWeb`، وlanes `beta`/`build_only`، وworkflow `ios-testflight-deploy`، وتعديل/حذف البوابات التي تقرؤها (`test-ios-capacitor-gates.mjs` وملفات `*-gate.test.ts` المذكورة) وworkflow `ios-capacitor-gates`. هذا يمسّ فحوص CI على main فلا يجوز دون قرار صريح.

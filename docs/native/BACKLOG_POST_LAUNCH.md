## تنظيف ما بعد الإطلاق
قرار المالك (2026-10-13): مؤجَّل إلى ما بعد الإطلاق، لا يُنفَّذ قبله. المصدر: `docs/native/CLEANUP_PLAN.md` (المرحلة 2).

- الهدف: حذف التطبيق القديم فعليًا (≈8.7MB): `ios/App/App` و`App.xcodeproj` و`CapApp-SPM` و`SunnahWeb`، ولاناتا `beta`/`build_only` في Fastfile، وworkflow `ios-testflight-deploy`.
- يستلزم تعديل/حذف بوابات تقرؤها: `test-ios-capacitor-gates.mjs` (في `ci:local`) وملفات `*-gate.test.ts` المذكورة في الخطة وworkflow `ios-capacitor-gates` — أي مساس بـCI على main فيلزم قرار صريح.
- يُنفَّذ في commit واحد قابل للتراجع، على فرع من native-app، ثم يتحقق: native-quick-check وnative-release-check وswift test (240/37) وnative_beta بـupload:false.
- يبقى كما هو: كل ما يخص الموقع وVercel و`ios-native` و`SunnahNative`/`SunnahDataKit`/`SunnahPrayer`/`Shared`/`SunnahWidgetKit`/`PrayerWidget`.

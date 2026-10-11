# Deployment Decision

**القرار: موقَّع — المالك (يوسف) — 2026-10-11**

| # | القرار |
|---|---|
| 3 | **التوقيع والرفع محليًا على الماك بـ fastlane** (TestFlight ثم المراجعة). لا توقيع ولا رفع على CI، ولا أسرار توقيع في CI. وعليه **بند OWN-07 (شهادات/ملفات توقيع كأسرار CI) غير لازم** ويُلغى. |
| 5 | **لا CI ولا دقائق مدفوعة للبناء/التوقيع/الرفع:** lane `native_beta` في `fastlane/Fastfile` يعمل محليًا فقط لـ`ios-native/SunnahApp.xcodeproj` (1.2.0، بناء ≥100، TestFlight داخلي). قرار باسم المالك 2026-10-11. |
| 4 | **موقع Vercel يبقى يعمل ولا يتوقف**، لأن النسخ القديمة من التطبيق تحمّله (`server.url`). التطبيق الجديد SwiftUI لا يحمّل الويب. |

**غير محسوم في هذا القرار:** المفاضلة A/B (main → إنتاج تلقائي، أو main → معاينة مع فرع `production` يدوي) لم يقرّرها المالك؛ يبقى السلوك الحالي كما هو ولا يُغيَّر الـProduction Branch دون موافقته (بند OWN-08 مفتوح بهذا القدر فقط).

**Status:** القراران 3 و4 **DECIDED**.
**Agent posture:** do **not** change Production Branch without owner approval.  
**Store builds** may proceed from a pinned commit regardless.  
**Status:** **OWNER_ACTION** OWN-08.

## قرار المالك 2026-10-11 — بوابة البناء لفرع native-app
- لا workflow مدفوع (macos) يعمل تلقائيًا: `ios-native-macos.yml` و`ios-sunnah-native.yml` و`ios-testflight-deploy.yml` بـ`workflow_dispatch` فقط (أُزيل `schedule` أيضًا).
- `ios-capacitor-gates.yml` يتخطى فروع native-app/native-section/n2/n3/n4/claude وPRs الموجّهة لـnative-app، ويبقى على main.
- البوابة الوحيدة لـnative-app هي `scripts/native-loop.sh` المحلي؛ تتجاهل الجلسات السحابية فحوص GitHub الفاشلة على فروع الأصلي.

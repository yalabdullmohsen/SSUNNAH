# MANUAL_OWNER_ACTION — Store (1.0.0 Capacitor → 1.2.0 SwiftUI)

> محدَّث للتحول إلى SwiftUI (1.2.0): خطوات التسليم في `docs/native/store/TESTFLIGHT_STEPS.md`، والخصوصية في `PRIVACY_CHECK.md`. البنود المشطوبة غير لازمة؛ الباقي ما زال قائمًا وسبب بقائه في عمود الإجراء.

**STORE_SOURCE_COMMIT:** `ed5320b1f23c7b21d230c0698e86ce5cb8731ebc`  
**Status:** Store remains **HOLD** until items below close with evidence.

| ID | Action | Why agent cannot close | Evidence needed |
|---|---|---|---|
| OWN-01 | (قائم في 1.2.0: المصحف المضمَّن في الأصلي يعتمد البيانات نفسها) قرار المالك: استمرار استعمال خطوط QPC كما في الإصدار المنشور؛ على المالك مراجعة الترخيص قبل الإرسال (Approve or permanently exclude QPC store redistribution) | Legal | Written QUL/KFGQPC / counsel note |
| OWN-02 | **مغلق:** تنبيه صوتي بعبارة بدل الأذان (لا أذان ولا ملفات أذان في التطبيق). يبقى سماع المالك للمقاطع العشرة قبل الإطلاق — المقاطع معلّقة حتى توليدها، انظر [NOTIFICATION_VOICE.md](NOTIFICATION_VOICE.md) | Owner | سماع المقاطع + اختيار محرك TTS مرخّص تجاريًا |
| OWN-03 | Run device matrix on physical iPhone + Android | No device in this environment | `DEVICE_NOTIFICATION_MATRIX.md` rows WORKING |
| OWN-04 | Supabase: backup → approve → apply security SQL / RLS | `REQUIRES_EXPLICIT_APPROVAL` | Checklist signed |
| OWN-05 | Supabase Auth: MFA for admins + leaked-password (plan-dependent) | Dashboard only | Screenshots + date |
| OWN-06 | ~~Confirm Bundle ID~~ — محسوم: يبقى `com.yousef.majlisilm` | — | `STORE_IDENTITY_DECISION.md` موقَّع 2026-10-11 |
| OWN-07 | ~~Signing certs on CI secrets~~ — غير لازم: التوقيع والرفع محليًا بـ fastlane | — | `DEPLOYMENT_DECISION.md` موقَّع 2026-10-11 |
| OWN-08 | ~~Decide deployment policy A vs B~~ — محسوم بتوقيع `DEPLOYMENT_DECISION.md` (2026-10-11): التوقيع والرفع محليًا بـ fastlane (`native_beta`) | — | `DEPLOYMENT_DECISION.md` |
| OWN-09 | Final store submission click (**Add for Review ← Submit for Review**) | Owner only | App Store Connect |
| OWN-10 | مفتاح ASC `.p8` خارج المستودع + متغيرات `APP_STORE_CONNECT_API_KEY_*` على جهازك لتشغيل `native_beta` | أسرار، المستودع عام | بناء مرفوع في TestFlight |
| OWN-11 | ملء **App Privacy** في App Store Connect ولصق `REVIEW_NOTES.md` و`WHATS_NEW.md` (+ حساب تجريبي اختياري) | Dashboard فقط | لقطة/تاريخ |
| OWN-12 | سماع/اختبار البناء على iPhone حقيقي (TestFlight داخلي) قبل الإرسال — يشمل OWN-03 | لا جهاز هنا | `DEVICE_NOTIFICATION_MATRIX.md` |
| OWN-13 | الإشعارات البعيدة وملحقات الويدجت/Live Activity **غير مشحونة** في 1.2.0 الأصلي (لا هدف لها في `SunnahApp.xcodeproj`)؛ قرار: إبقاؤها لاحقًا أو إزالة `aps-environment` | قرار منتج | `PRIVACY_CHECK.md` §4 |

- **DATA-2:181** — عيب بيانات موروث، يحتاج قرارًا شرعيًا ومصدر Tanzil: الآية 2:181 بلا علامة نهاية (end) في بيانات QPC المصدر (6235 علامة لـ6236 آية). لم يُعدَّل أي نص؛ الاختبار الحاسم يثبّت الفجوة كما هي.

Do **not** mark Store GO while any OWN-01…OWN-03 (أو OWN-12) is open.

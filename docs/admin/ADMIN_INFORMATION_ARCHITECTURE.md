# Admin Information Architecture — Wave 1

## Top-level (فقط 7)

| # | مركز | مسار | دور |
|---|---|---|---|
| 1 | نظرة عامة | `/admin/v3` | تشغيل اليوم |
| 2 | المراجعات | `/admin/v3/reviews` | صندوق وارد تحريري |
| 3 | المحتوى | `/admin/v3/content` | مساحة محتوى موحّدة |
| 4 | التصنيف | `/admin/v3/taxonomy` | شجرة أبواب العلم |
| 5 | التحليلات | `/admin/v3/analytics` | اتجاهات وملخصات |
| 6 | المجتمع | `/admin/v3/community` | مستخدمون · بلاغات · مساهمات |
| 7 | الإعدادات | `/admin/v3/settings` | إعدادات · أتمتة · نظام · تدقيق |

## هاتف

- Bottom primary (4): نظرة عامة · مراجعات · محتوى · تصنيف  
- المزيد: تحليلات · مجتمع · إعدادات

## Aliases (توافق)

| قديم | جديد |
|---|---|
| `/admin/v3/review` | `/admin/v3/reviews` |
| `/admin/v3/users` | `/admin/v3/community` |
| `/admin/v3/notifications` | `/admin/v3/settings` |
| `/admin/v3/automation` | `/admin/v3/settings` |
| `/admin/v3/system` | `/admin/v3/settings` |
| `/admin/v3/audit` | سجل التدقيق داخل الإعدادات |

## مبادئ

- لا وجهات CRUD مشتتة في الشريط الجانبي  
- الأدوات السابقة تبقى روابط داخل المراكز (Legacy) حتى موجات الترحيل  
- الصلاحيات المعروضة توثيقية؛ RLS/خادم بلا تغيير في Wave 1

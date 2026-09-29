# Analytics Platform Report — Admin v3

المسار: `/admin/v3/analytics`  
API: `GET /api/admin/analytics-platform`  
الحالة التشغيلية للمنتج: `WEB_RELEASED_NATIVE_HOLD` · Store = HOLD

## DATA SOURCES

| المصدر | الاستخدام |
|---|---|
| `profiles` | إجمالي المستخدمين، التسجيلات (يوم/أسبوع/شهر)، سلاسل النمو، مدن المستخدمين |
| `search_analytics_events` عبر `getSearchAnalytics` | Top queries، صفر نتائج، CTR، زمن الاستجابة |
| `learning_platform_stats` RPC / كتالوج المسارات | Enrollment/Completion عند توفر RPC؛ وإلا كتالوج فقط |
| `auth.admin.listUsers` (عينة محدودة) | تأكيد البريد فقط إن كان التعداد كاملًا بلا تجاوز الصفحة |
| RUM / web-vitals / client-error | سجلات فقط — **ليست** مخزنًا قابلًا للاستعلام |

لا Mock Data · لا أرقام تقديرية · القيمة الغائبة = `NO DATA AVAILABLE`.

## DASHBOARDS

أقسام الواجهة: Executive · Auth · Content · Quran · Learning · Search · Prayer · Technical · API · Device · Geo · Retention · Realtime · Alerts.

## CHARTS

SVG داخلي (Line / Area / Bar / Pie) بلا مكتبة رسوم جديدة. Heatmap جغرافية تظهر NO DATA عند غياب الإحداثيات.

## SECURITY

- UI: `canAccessAnalyticsPlatform` → `super_admin` | `system_admin` | owner فقط.
- API: `requireAdminAccess({ permission: "analytics.read" })` + نفس قيد الدور → **403** لغيرهم (بما فيهم `analytics_viewer` و`content_manager`).
- لا بريد · لا كلمات مرور · لا توكنات · تجميع فقط.
- فئة الأمن في السجل: `ADMIN`.

## REALTIME

قسم Realtime Monitor مع auto-refresh؛ المؤشرات حاليًا NO DATA (لا presence/جلسات حية).

## RETENTION

D1 / D7 / D30 / Churn / Cohorts → NO DATA (لا جداول نشاط/cohort).

## CONTENT

مسارات معروفة للعرض المرجعي؛ عدّادات الصفحة/مدة البقاء → NO DATA (لا pageview telemetry).

## QURAN

علامات/فواصل/تقدم القراءة محلية على العميل → لا تجميع إداري → NO DATA.

## LEARNING

جاهز جزئيًا عند RPC؛ وإلا NO DATA للمقاييس السلوكية (مع عرض حجم الكتالوج كمخزون مسارات).

## SEARCH

READY/PARTIAL حسب وجود أحداث `search_analytics_events`.

## TECHNICAL

RUM/Web Vitals/Client errors = logs-only → NO DATA.

## API

لا مخزن latency/P95 دائم → NO DATA.

## DEVICE

لا مخزن أجهزة → NO DATA.

## GEO

PARTIAL عند وجود `profiles.city`؛ الدول + Heatmap → NO DATA.

## EXPORTS

CSV (UTF-8 BOM) · Excel (SpreadsheetML `.xls`) · JSON — لكل قسم أو للكل من الشريط.

## LIMITATIONS

- لا DAU/WAU/MAU بلا جدول نشاط/`last_seen`.
- لا أكواد فشل المصادقة (`weak_password`…) بلا auth event log.
- لا تنبيهات قابلة للتقييم بلا الإشارات أعلاه.
- كاش خادم 60 ثانية لتقليل الاستعلامات الثقيلة.

## NO_DATA_AREAS

`dau_wau_mau` · `auth_failure_codes` · `pageviews_content` · `quran_server_aggregate` · `prayer_usage` · `rum_web_vitals_store` · `api_latency_store` · `device_analytics` · `countries_heatmap` · `retention_cohorts` · `realtime_presence` · `alerting_evaluation`

## FINAL STATUS

**PARTIAL**

الأقسام ذات بيانات حقيقية محتملة: Executive (تسجيلات) · Search · Geo (مدن) · Learning (إن وُجد RPC).  
الباقي مُعلن NO DATA بصراحة حتى تتوفر مصادر قابلة للاستعلام.

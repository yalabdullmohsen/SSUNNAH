-- تنظيف سجلات النظام القديم (TRUNCATE للجداول الأربعة) لتخفيض حجم قاعدة الإنتاج (570MB > حد 500MB).
-- لا يُنفَّذ من ن4: يراجعه المالك ويطبّقه بنفسه (SQL Editor). الأفضل تجربته على staging أولًا.
-- الجداول: لا يقرأها تطبيق iOS ولا الويدجت (فُحص ios-native وSunnahNative: صفر مراجع). لا يمسّ محتوى ولا بيانات مستخدم.

-- 1) القياس قبل
SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND relname IN ('akp_structured_logs','automation_step_logs','akp_source_health','akp_metrics_snapshots','client_error_logs')
ORDER BY pg_total_relation_size(c.oid) DESC;
SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;

-- 1ب) أمان قبل التفريغ (قراءة فقط): أعداد الصفوف، وهل يشير إليها مفتاح أجنبي من جدول آخر (يجب أن تكون النتيجة الثانية فارغة؛ إن لم تكن فلا تنفّذ الخطوة 2 وأبلغ)
SELECT 'akp_structured_logs' t, count(*) FROM public.akp_structured_logs UNION ALL
SELECT 'automation_step_logs', count(*) FROM public.automation_step_logs UNION ALL
SELECT 'akp_source_health', count(*) FROM public.akp_source_health UNION ALL
SELECT 'akp_metrics_snapshots', count(*) FROM public.akp_metrics_snapshots;
SELECT conrelid::regclass AS referencing_table, confrelid::regclass AS referenced_table
FROM pg_constraint WHERE contype='f' AND confrelid IN ('public.akp_structured_logs'::regclass,'public.automation_step_logs'::regclass,'public.akp_source_health'::regclass,'public.akp_metrics_snapshots'::regclass);

-- 2) التفريغ: قرار المالك TRUNCATE للجداول الأربعة (كلها أقدم من 30 يومًا فلا شيء يُحفظ)، وهو يُرجع المساحة فورًا فلا حاجة لـVACUUM FULL.
TRUNCATE TABLE public.akp_structured_logs, public.automation_step_logs, public.akp_source_health, public.akp_metrics_snapshots;

-- 3) client_error_logs ليست ضمن التفريغ: يبقى ما دون 30 يومًا (اختياري، لا يُرجع المساحة حتى VACUUM FULL).
-- DELETE FROM public.client_error_logs WHERE created_at < now() - interval '30 days';
-- VACUUM FULL public.client_error_logs;

-- 4) القياس بعد: أعد استعلامي الخطوة 1.
-- إن بقي الحجم قرب 500MB: الجداول التالية سجلات أيضًا وكبيرة (mke_decisions 180k، mke_quality_reports 145k،
-- akp_review_queue 137k، content_engine_publish_audit 79k) وتحتاج مراجعة مالك قبل أي حذف (لم تُفحص هنا).

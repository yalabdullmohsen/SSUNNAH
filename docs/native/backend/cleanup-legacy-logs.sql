-- تنظيف سجلات النظام القديم (>30 يومًا) لتخفيض حجم قاعدة الإنتاج (570MB > حد 500MB).
-- لا يُنفَّذ من ن4: يراجعه المالك ويطبّقه بنفسه (SQL Editor). الأفضل تجربته على staging أولًا.
-- الجداول: لا يقرأها تطبيق iOS ولا الويدجت (فُحص ios-native وSunnahNative: صفر مراجع). لا يمسّ محتوى ولا بيانات مستخدم.
-- الحذف وحده لا يُرجع المساحة للنظام؛ شغّل الخطوة 3 (VACUUM FULL) كل جدول على حدة خارج المعاملة (يقفل الجدول لحظيًا).

-- 1) القياس قبل
SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND relname IN ('akp_structured_logs','automation_step_logs','akp_source_health','akp_metrics_snapshots','client_error_logs')
ORDER BY pg_total_relation_size(c.oid) DESC;
SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;

-- 2) الحذف (>30 يومًا فقط)
DELETE FROM public.akp_structured_logs   WHERE created_at < now() - interval '30 days';
DELETE FROM public.automation_step_logs  WHERE created_at < now() - interval '30 days';
DELETE FROM public.akp_source_health     WHERE checked_at < now() - interval '30 days';
DELETE FROM public.akp_metrics_snapshots WHERE created_at < now() - interval '30 days';
DELETE FROM public.client_error_logs     WHERE created_at < now() - interval '30 days';

-- 3) استعادة المساحة (نفّذ كل سطر منفصلًا)
VACUUM FULL public.akp_structured_logs;
VACUUM FULL public.automation_step_logs;
VACUUM FULL public.akp_source_health;
VACUUM FULL public.akp_metrics_snapshots;
VACUUM FULL public.client_error_logs;

-- 4) القياس بعد: أعد استعلامي الخطوة 1.
-- إن بقي الحجم قرب 500MB: الجداول التالية سجلات أيضًا وكبيرة (mke_decisions 180k، mke_quality_reports 145k،
-- akp_review_queue 137k، content_engine_publish_audit 79k) وتحتاج مراجعة مالك قبل أي حذف (لم تُفحص هنا).

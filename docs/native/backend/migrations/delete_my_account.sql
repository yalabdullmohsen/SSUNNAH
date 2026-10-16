-- migration: delete_my_account (حذف الحساب — مطلب 5.1.1(v))
-- تاريخ التطبيق على الإنتاج: غير مُثبَت. قائمة هجرات مشروع الإنتاج (ngmvmlulzacrlicuagyp، قراءة فقط 2026-10-16) لا تحوي إدخالًا لهذه الدالة؛ على المالك كتابة التاريخ الفعلي هنا: ____-__-__.
-- المطابقة: النص أدناه هو محتوى delete-account.sql حرفيًا (مُنسَّق الأسطر فقط). أنه نفسه المنفَّذ على الإنتاج لم يُتحقق منه (يلزم pg_get_functiondef بأمر المالك).
-- مراجعة الأمان (من النص): SECURITY DEFINER ✔، search_path = '' ✔ (كل المراجع مؤهَّلة بالمخطط)، auth.uid() فقط بلا معاملات ✔، revoke من public وanon ✔، grant لـ authenticated ✔.
-- لا يُنفَّذ على الإنتاج من أي نافذة بلا أمر المالك. للتوثيق والتراجع فقط.
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  delete from public.achievements where user_id = uid;
  delete from public.knowledge_recommendations where user_id = uid;
  delete from public.lesson_ratings where user_id = uid;
  delete from public.lesson_registrations where user_id = uid;
  delete from public.mke_notification_jobs where user_id = uid;
  delete from public.search_analytics_events where user_id = uid;
  delete from public.study_sessions where user_id = uid;
  delete from public.user_search_preferences where user_id = uid;
  delete from public.governance_user_roles where user_id = uid;
  delete from public.client_error_logs where user_id = uid::text;
  delete from public.open_api_keys where owner_id = uid::text;
  delete from public.open_webhooks where owner_id = uid::text;
  update public.sheikhs set profile_id = null where profile_id = uid;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

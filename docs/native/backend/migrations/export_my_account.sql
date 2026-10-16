-- migration: export_my_account (تصدير بيانات الحساب)
-- تاريخ التطبيق على الإنتاج: 2026-10-16 (هجرة 20261016034230 export_my_account في قائمة هجرات الإنتاج، قراءة فقط). طلب المالك كتابة 2026-10-15؛ الدليل يقول 10-16 فاعتُمد.
-- المطابقة: النص أدناه هو محتوى export-account.sql دون كتلة الاختبار (تبقى في الملف الأصلي). أنه نفسه المنفَّذ لم يُتحقق منه حرفيًا (يلزم pg_get_functiondef بأمر المالك).
-- مراجعة الأمان (من النص): SECURITY DEFINER ✔، search_path = '' ✔، auth.uid() فقط ✔، stable، revoke من public وanon ✔، grant لـ authenticated ✔؛ يستثني is_admin/is_super_admin/is_owner وreviewer_id.
-- لا يُنفَّذ على الإنتاج من أي نافذة بلا أمر المالك.
create or replace function public.export_my_account() returns jsonb language plpgsql security definer set search_path = '' stable as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at) from auth.users u where u.id = uid),
    'profile', (select to_jsonb(p) - 'is_admin' - 'is_super_admin' - 'is_owner' from public.profiles p where p.id = uid),
    'achievements', coalesce((select jsonb_agg(to_jsonb(t)) from public.achievements t where t.user_id = uid), '[]'::jsonb),
    'bookmarks', coalesce((select jsonb_agg(to_jsonb(t)) from public.bookmarks t where t.user_id = uid), '[]'::jsonb),
    'content_ratings', coalesce((select jsonb_agg(to_jsonb(t)) from public.content_ratings t where t.user_id = uid), '[]'::jsonb),
    'lesson_ratings', coalesce((select jsonb_agg(to_jsonb(t)) from public.lesson_ratings t where t.user_id = uid), '[]'::jsonb),
    'lesson_registrations', coalesce((select jsonb_agg(to_jsonb(t)) from public.lesson_registrations t where t.user_id = uid), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(to_jsonb(t)) from public.notifications t where t.user_id = uid), '[]'::jsonb),
    'reading_resume', coalesce((select jsonb_agg(to_jsonb(t)) from public.reading_resume t where t.user_id = uid), '[]'::jsonb),
    'scholar_follows', coalesce((select jsonb_agg(to_jsonb(t)) from public.scholar_follows t where t.user_id = uid), '[]'::jsonb),
    'study_plans', coalesce((select jsonb_agg(to_jsonb(t)) from public.study_plans t where t.user_id = uid), '[]'::jsonb),
    'user_homepage_prefs', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_homepage_prefs t where t.user_id = uid), '[]'::jsonb),
    'user_interest_profiles', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_interest_profiles t where t.user_id = uid), '[]'::jsonb),
    'user_learning_library', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_learning_library t where t.user_id = uid), '[]'::jsonb),
    'user_learning_notes', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_learning_notes t where t.user_id = uid), '[]'::jsonb),
    'user_notes', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_notes t where t.user_id = uid), '[]'::jsonb),
    'user_progress', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_progress t where t.user_id = uid), '[]'::jsonb),
    'user_saved_citations', coalesce((select jsonb_agg(to_jsonb(t)) from public.user_saved_citations t where t.user_id = uid), '[]'::jsonb),
    'user_submissions', coalesce((select jsonb_agg(to_jsonb(t) - 'reviewer_id') from public.user_submissions t where t.user_id = uid), '[]'::jsonb)
  );
end $$;
revoke all on function public.export_my_account() from public, anon;
grant execute on function public.export_my_account() to authenticated;


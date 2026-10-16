-- تصدير بيانات الحساب (مطلب الخصوصية) بلا اعتماد على الموقع: يستدعيه التطبيق عبر POST /rest/v1/rpc/export_my_account.
-- نفس نمط delete_my_account: SECURITY DEFINER، search_path فارغ، auth.uid() فقط (لا معاملات)، التنفيذ لـ authenticated فقط.
-- لا يُنفَّذ من ن4: يطبّقه المالك. يستثني حقول الصلاحيات الداخلية (is_admin…) ومعرّف المراجع ولا يلمس أي حساب آخر.
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

-- اختبار بمعاملة تُلغى دائمًا (يُلصق في SQL Editor أو MCP): ينشئ الدالة داخل DO ثم يتحقق ثم يرفع استثناءً للتراجع، فلا يبقى شيء.
-- لا يستعمل أي حساب حقيقي: uid عشوائي غير موجود => يجب أن تعود كل المصفوفات فارغة، وبلا claims يجب أن يفشل بـ 28000.
-- (انسخ نص الدالة أعلاه داخل DO قبل سطر التحقق، أو نفّذها ثم ألغِ المعاملة.)
begin;
  -- ضع هنا create or replace function … (أعلاه) ثم:
  select set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid()::text, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select jsonb_typeof(public.export_my_account()->'bookmarks') as must_be_array,
         jsonb_array_length(public.export_my_account()->'bookmarks') as must_be_zero,
         (public.export_my_account()->'profile') is null as no_profile_for_unknown_user;
rollback;

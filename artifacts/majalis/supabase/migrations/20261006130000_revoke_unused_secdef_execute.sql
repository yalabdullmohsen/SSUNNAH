-- سحب EXECUTE من anon/authenticated/PUBLIC لدوال SECURITY DEFINER التي لا يستدعيها التطبيق
-- عبر مفتاح المستخدم. search_path مثبّت أصلًا (pg_catalog, private) على كلها.
-- مستثناة عمدًا (تعتمد عليها سياسات RLS فيجب أن تبقى قابلة للتنفيذ لمن يقيّم السياسة):
--   public.is_admin()                      — anon + authenticated
--   public.profile_privileges_unchanged()  — authenticated (سياسة profiles_update_self)
-- get_similar_users / upsert_user_interest: يستدعيهما lib/api-handlers/recommendations.js عبر service_role فقط.
-- idempotent: يتخطى الدالة إن لم تكن موجودة (staging لا يحوي كل الدوال).
DO $$
DECLARE sig text;
BEGIN
  FOREACH sig IN ARRAY ARRAY[
    'public.increment_fiqh_item_views(text)',
    'public.record_lesson_view(uuid)',
    'public.accept_family_invite(text)',
    'public.revoke_family_link(uuid)',
    'public.get_similar_users(uuid, integer)',
    'public.upsert_user_interest(uuid, uuid, numeric)'
  ] LOOP
    IF to_regprocedure(sig) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    END IF;
  END LOOP;
END $$;

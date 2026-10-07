-- P1b (الآمن فقط) — قرار المالك 2026-10-07: بلا حذف فهارس غير مستخدمة وبلا دمج سياسات.
-- 1) auth_rls_initplan: لفّ auth.uid() بـ(select auth.uid()) — دلالة مطابقة، يُقيَّم مرة لكل استعلام لا لكل صف.
-- 2) duplicate_index: public.content_relations فيه فهرسان متطابقان على (to_ref_id) — يُحذف `idx_content_relations_to` ويبقى `content_relations_to_ref_id_idx`.
-- مُحصَّن بالشروط: no-op على staging الذي لا يحوي هذه الجداول.

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sr_reviews' and policyname = 'صفوف المستخدم نفسه'
  ) then
    alter policy "صفوف المستخدم نفسه" on public.sr_reviews
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

-- الفهرسان متطابقان تمامًا (btree على to_ref_id) وليس أيٌّ منهما سند قيد؛ يبقى واحد يغطي مفتاح to_ref_id_fkey.
drop index if exists public.idx_content_relations_to;

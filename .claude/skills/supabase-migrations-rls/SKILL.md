---
name: supabase-migrations-rls
description: قاعدة بيانات Supabase: migrations وRLS وstaging. استخدمها عند أي تعديل مخطط أو سياسة أو SQL.
---

# Supabase
- Migrations إضافية وقابلة للتراجع فقط، في `supabase/migrations/`؛ التحقق: `pnpm run db:migration:verify` (و`:fresh` و`:upgrade`) عبر `scripts/db-migration-verify.mjs`.
- RLS: لا `FOR ALL USING (true)` على بيانات المستخدم ولا إضعاف لأي سياسة؛ البوابة `test:supabase-policy-audit`. المرجع: `docs/Database.md` و`docs/Security.md` و`docs/store-release/SUPABASE_SECURITY_PLAN.md`.
- التطبيق على الإنتاج عبر `.github/workflows/supabase-migrations.yml` بـ`workflow_dispatch` وapply=true فقط؛ لا SQL على الإنتاج دون أمر المالك، وstaging أولًا (sunnah-staging).
- المتصفح/الجوال يستعملان المفتاح العام (anon) فقط؛ لا مفاتيح في المستودع (عام).

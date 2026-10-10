---
name: security-public-repo
description: الأمان في مستودع عام (الأسرار، Supabase RLS، صلاحيات الإدارة، سلسلة التوريد). استخدمها عند لمس المصادقة أو الأسرار أو قاعدة البيانات أو سير العمل.
---

# الأمان

- المستودع **عام**: لا مفاتيح ولا شهادات (`.p8/.p12/.cer/.mobileprovision`) ولا `.env`. الأسرار في GitHub Secrets. قبل أي commit افحص الإضافات بحثًا عن أنماط المفاتيح.
- المراجع: `docs/Security.md`، `docs/security/THREAT_MODEL.md`، `SUPABASE_RLS_MATRIX.md`، `API_SECRET_MATRIX.md`، `RELEASE_SUPPLY_CHAIN_REPORT.md`.
- Supabase: migrations إضافية قابلة للتراجع؛ لا إضعاف لـRLS؛ staging (`sunnah-staging`) قبل الإنتاج؛ لا SQL على الإنتاج دون أمر المالك. دوال `SECURITY DEFINER` لا تُمنح لـanon إلا لضرورة موثقة (`reports/tech-debt.md` S1).
- الإدارة: التحقق على الخادم دائمًا لا على الواجهة (`ADMIN_SERVER_AUTHORIZATION_CLOSURE_REPORT.md`).
- لا force-push ولا `reset --hard` ولا تعديل وسوم الأمان على PR بلا إذن.
- الإفصاح عن ثغرة: أبلغ المالك فورًا ولا تنشرها في PR عام قبل الإصلاح.

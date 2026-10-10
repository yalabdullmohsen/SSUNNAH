---
name: vercel-deploy-verify
description: النشر على Vercel والتحقق منه بعد الدمج. استخدمها بعد دمج PR أو عند سؤال هل نُشر التغيير.
---

# النشر والتحقق
- المسار: PR → Auto-merge squash (`.github/workflows/auto-merge-to-main.yml`) بعد Verify build → Vercel + `.github/workflows/auto-deploy.yml`. المرجع: `docs/Deployment.md` (Production path / Health after deploy).
- التحقق: `curl -sL https://majlisilm.com/version.json` ثم قارن `commitSha` بـSHA الدمج؛ إن تغيّر فعلًا علّق على الـPR: «@yalabdullmohsen ✅ تم النشر — SHA: <SHA> — <عنوان المهمة>».
- ممنوع: دمج مع بناء فاشل، `--admin`، دفع مباشر لـmain، تعطيل فحص. فشل الفحص: إصلاح ومحاولة واحدة ثم أبلغ.
- نشر الويب يغيّر ما يحمّله غلاف iOS (يحمّل الموقع البعيد)؛ إصدار المتجر نفسه يحتاج بناءً منفصلًا بإذن المالك (انظر مهارة release-1-1-0).

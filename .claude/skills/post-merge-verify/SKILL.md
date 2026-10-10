---
name: post-merge-verify
description: التحقق من النشر بعد الدمج إلى main (Vercel وversion.json والمسارات الحرجة). استخدمها بعد كل دمج قبل أن تعلن أن المهمة اكتملت.
---

# التحقق بعد الدمج

المهمة لا تكتمل بالدمج وحده (`CLAUDE.md` بوابة الإغلاق). بعد الدمج:

1. **الدمج**: تأكد أن PR حالته `merged` وأن آخر commit على `main` هو دمجك (REST: `gh api repos/{owner}/{repo}/pulls/N`؛ GraphQL غير متاح في هذه الجلسات).
2. **النشر**: راجع workflow `auto-deploy.yml` وحالة نشر Vercel (أداة Vercel أو `gh run list`)؛ وانتظر اكتماله بدل افتراضه.
3. **الإصدار**: `version.json` المنشور يحمل commit الدمج؛ قارنه بـ`git rev-parse origin/main`.
4. **الصحة**: `scripts/post-deploy-smoke.ts` على المسارات الحرجة (`reports/critical-routes-http-audit.json`) وراجع سجلات الأخطاء الحديثة بعد النشر.
5. **الفشل**: لا تعلن النجاح. حدّد السبب من السجل الفعلي واتبع `ci-failure-rootcause`؛ وإن لزم تراجع فبـ`revert` جديد لا force-push.
6. وضّح في التقرير (`final-report-ar`) هل التغيير يحتاج نسخة متجر أم يكفيه نشر الويب.

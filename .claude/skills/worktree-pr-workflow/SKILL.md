---
name: worktree-pr-workflow
description: سير العمل: worktree وPR واحد وحدوده والدمج. استخدمها عند بدء أي مهمة أو فتح PR أو الدمج.
---

# سير العمل
- فرع وصفي جديد من أحدث main لكل مهمة، في worktree مستقل؛ PR واحد لكل مهمة وتُحدَّث بدل فتح سلسلة. حدّ أقصى PRان مفتوحان (`.claude/rules/git-ci-release.md`).
- حدود PR: ≤40 ملفًا و≤400 سطر محذوف؛ قسّم إن زاد. لا تقارير مولّدة (`docs/audit/*` و`docs/design/*` و`reports/*`) إلا عمدًا (تُطلق وسوم danger-path).
- worktree جديد يحتاج رابط node_modules؛ لا تشغّل pnpm داخل worktree مربوط (يكسر node_modules الرئيسية)؛ استخدم `--lockfile-only` عند الحاجة.
- الدمج: Ready → Auto-merge squash؛ لا force-push ولا `reset --hard` ولا `git clean -fd`. ملفات `reports/changed-scope-*` و`instagram-quota.json` يعدّلها hook: `git checkout --` قبل الالتزام.
- رسالة الالتزام بالعربية؛ التحقق بعد النشر في مهارة vercel-deploy-verify.

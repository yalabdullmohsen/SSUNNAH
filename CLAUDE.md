# بروتوكول التنفيذ

## الفرع
- فرع وصفي جديد من أحدث main لكل جلسة. استثناء: في worktree على `automation/content` أو `automation/tasks` ابقَ على الفرع نفسه دائمًا.
- PR واحد لكل مهمة؛ حدّثه بدل فتح سلسلة PRs.

## التنفيذ
- أصلح السبب الجذري؛ لا ترقيع (هوامش سالبة، إخفاء، تعطيل وظائف).
- أعد استخدام المكونات الموجودة؛ لا مكتبات جديدة بلا مبرر قوي.
- اجمع تغييرات الواجهة المتقاربة في PR واحد بدل PRs صغيرة كثيرة، فكل PR يعني دورة CI كاملة.
- شغّل gates الواجهة (axe، visual-snapshot، layout) محليًا قبل الدفع، حتى لا يفشل الـPR على CI ويعاد.
- `pnpm run ci:local` يشغّل ui-ratchet والاختبارات المتأثرة بملفاتك (كلها إن تغيّر `src/design-system`) ويوقف الدفع عند الفشل؛ فعّله مرة بـ`bash scripts/install-ci-local-hook.sh`.
- ممنوع اختبار مصدري يثبّت اسم مكوّن (`assert.match(src, /AppCard/)`)؛ تحقق من السلوك (render/ARIA/RTL/تباين) أو من العقد المشترك `no-source-pinned-component-names` (القائمة من `scripts/ui-legacy-list.mjs`).

## بوابة الإغلاق (بعد كل مهمة)
1. اختبارات موجهة + build بلا أخطاء، وتحقق عملي (RTL والجوال).
2. commit برسالة عربية ثم push.
3. الفشل: حتى 10 دورات إصلاح، ثم وثّق وانتقل للمستقلة.
4. المهمة لا تكتمل إلا بالدمج إلى `main` والنشر: PR Ready → Auto-merge squash (`.github/workflows/auto-merge-to-main.yml`) بعد Verify build → تحقق النشر (Vercel + `auto-deploy.yml` و`version.json`). إن تعذّر Auto-merge بعد نجاح البوابة: ادفع لـmain بعد build محلي ناجح. لا تطلب دمجًا يدويًا.
   - `scripts/content-runner.sh` على مساره التصميمي؛ نافذتا automation تدفعان عبر `scripts/commit-and-push-branch.sh`.
5. اقترب انتهاء الوقت: أكمل الجارية فقط.

## التقرير النهائي (عربي، مرة واحدة)
لكل مهمة: هل دُمجت ونُشرت (commit/`version.json`)، ما فشل وسببه، القرارات، والمتبقي.

# Git وCI والإصدار

- المستودع **عام**: لا أسرار أو مفاتيح أو شهادات (.p8/.p12/.cer/.mobileprovision) أبدًا. الأسرار في GitHub Secrets أو خارج المستودع.
- لا force-push ولا `reset --hard` ولا `git clean -fd`. وسما `risky:manual-review` و`blocked:danger-path` موافَق عليهما مسبقًا متى نجحت كل الفحوص (انظر CLAUDE.md «الدمج والنشر»).
- كل مهمة في worktree من آخر main، وPR مستقل. حد أقصى مهمتين ثقيلتين وPRين مفتوحين في نفس الوقت.
- لا تُدخل تقارير مولّدة (docs/audit/*، docs/design/*، reports/*) إلى PR إلا عمدًا — تُطلق وسوم danger-path.
- ≤40 ملفًا و≤400 سطر محذوف لكل PR؛ قسّم إن زاد.
- لا Build ولا رفع لـ TestFlight أو App Store Connect دون إذن المالك. وضّح إن احتاج التعديل نسخة متجر (Swift/ويدجيت/إضافات أصلية).
- قاعدة البيانات: migrations إضافية قابلة للتراجع، ولا إضعاف لـ RLS، ولا SQL على الإنتاج دون أمر المالك (staging أولًا: sunnah-staging).
- لا ادعاء STORE_GO أو UNIFIED_100 أو اجتياز جهاز من محاكي دون أدلة.

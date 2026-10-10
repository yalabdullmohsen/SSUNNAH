# حماية موارد الجهاز المحلي (ماك 8GB)

| الأداة | الوظيفة |
|---|---|
| `scripts/hooks/pre-push` | خفيف افتراضيًا: CSS integrity + eslint للملفات المتغيّرة + `ci:local` + preflight. بلا vite build/tsc كامل/playwright. الكامل: `CI_LOCAL_FULL=1 git push`. التثبيت: `bash scripts/install-pre-push-hook.sh` |
| `scripts/heavy.sh <أمر>` | يغلّف أي أمر ثقيل بالقفل الواحد + `NODE_OPTIONS=--max-old-space-size=1536` |
| `scripts/ci-local-lock.sh` | قفل واحد + حارس ذاكرة: ينتظر ≥1200MB متاحة (free+speculative+inactive) حتى 10 دقائق ثم يُشغّل مع تحذير. المتغيرات: `CI_LOCAL_MIN_FREE_MB`, `CI_LOCAL_MEM_WAIT`, `CI_LOCAL_MEM_GUARD=0` |
| `~/.majalis-tools/memguard.sh` (launchd `com.majalis.memguard`، كل 120ث) | يقتل vite preview/dev وChromium الخاص بـPlaywright وnode ثقيلًا (vite/tsc/playwright/vitest/tsx/eslint) عمره >20د وليس حاملًا للقفل. لا يمسّ Xcode/Simulator/claude/Chrome المستخدم/ما عمره <3د. السجل: `~/.majalis-tools/memguard.log`، معاينة: `MEMGUARD_DRY=1` |

## حصة Actions
المستودع `PUBLIC` ⇒ دقائق GitHub-hosted القياسية غير محتسبة على الحصة؛ لا خطر 60%. (واجهة الفوترة تحتاج صلاحية `user` للـgh — لم تُمنح.) الفحوص المطلوبة على GitHub لم تتغيّر.

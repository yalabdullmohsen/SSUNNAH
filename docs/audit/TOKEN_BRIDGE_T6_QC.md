# T6 — تقاعد أسماء التوافق الخاصة ببوابتي الجودة والحوكمة

**القاعدة:** `442ce963e` (T5). **البوابة:** `pnpm --filter @workspace/majalis run test:token-bridge-t6`.

## المحذوف (صفر مستهلكين `var()`؛ فحص rg على `src` و`public` و`index.html` و`scripts` شاملًا نصوص TS)

| الرمز | الملف | البديل القانوني | العقد المُرحَّل |
|---|---|---|---|
| `--ds-muted` | design-tokens.css | `--text-muted` | test-quality-campaign-gate.mjs |
| `--ds-danger` | design-tokens.css | `--danger` | test-quality-campaign-gate.mjs |
| `--ds-success` | design-tokens.css | `--success` | test-quality-campaign-gate.mjs |
| `--ds-durationFast` | ssunnah-ds-canonical.css | `--motion-fast` | ssunnah-ds-governance-gate |
| `--ds-transition-slow` (تصريحان) | design-system.css | `--motion-slow` | لا بوابة |
| `--ds-text` (الاسم الدقيق) | brand-v4.css | `--text` | لا بوابة |

لا تصاريح داكنة لهذه الرموز (كانت في كتلة `:root` الفاتحة فقط). البدائل القانونية مُصرَّحة في الوضعين الفاتح والداكن.

## لم يُغيَّر

- `--ds-base`: صفر مستهلكين، لكن ثلاث بوابات تثبّت القيمة `16px` المطلقة (css-authority-graph وT3 وstartup-typography-fouc). البديل الأقرب `--fs-base: 1rem` يتغيّر مع `--ui-font-scale`، فلا يساويه. ترحيل العقد إليه يُضعف البوابة، ولذلك أبقيناه.

## البوابات

- quality-campaign: صارت تشترط الأسماء القانونية **مُصرَّحًا بها**، لا مجرد وجود نصّها، وتمنع رجوع الأسماء المتقاعدة.
- governance: تشترط `--motion-fast: <n>ms` في design-tokens.css، وتمنع رجوع `--ds-durationFast`.
- T1 وT4 وT5: انتقل ما كانت تشترط بقاءه إلى الأسماء القانونية.
- `css-authority-graph`: قسم «rule-text preservation vs origin/main» يقارن الملف بـ`origin/main`. يفشل الآن على كتلتي `:root` المعدّلتين، وكذلك فشل في سابقة T4 (#2601). سيعود إلى النجاح وحده بعد الدمج، وهو غير مربوط بـCI.

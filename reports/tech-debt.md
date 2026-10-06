# سجل الديون التقنية — سُنّة

آخر تحديث: 2026-10-06 · الترتيب: أمان ← أخطاء للمستخدم ← أداء ← تنظيف

## نتيجة الحصر (المصادر النظيفة)

| المصدر | النتيجة |
|---|---|
| TypeScript (`tsc --noEmit`) | 0 أخطاء |
| ESLint (`src`) | 0 أخطاء، 0 تحذيرات |
| Issues وPRs المفتوحة | لا شيء |
| TODO/FIXME/HACK | لا ديون حقيقية؛ المطابقات كلها داخل اختبارات تمنع الـplaceholders أو سكربتات تدقيق |
| الاختبارات (`pnpm test`) | ناجحة بالكامل (EXIT=0) |

## أمان

| # | الدين | الحالة |
|---|---|---|
| S1 | Supabase: 3 دوال `SECURITY DEFINER` قابلة للتنفيذ من `anon` (`increment_fiqh_item_views`، `is_admin`، `record_lesson_view`) و8 من `authenticated` | يحتاج قرارك |
| S2 | Supabase: حماية كلمات المرور المسرّبة معطّلة (Auth) | يحتاج قرارك |
| S3 | Supabase: امتدادان في schema `public` (`pg_trgm`، `vector`) | يحتاج قرارك |
| S4 | Supabase: 85 جدولًا بـRLS مفعّل بلا سياسات (INFO — يعني الرفض الكامل لغير service role) | يحتاج قرارك |

## أخطاء للمستخدم

| # | الدين | الحالة |
|---|---|---|
| U1 | أخطاء Vercel runtime: الاستعلام عبر MCP أعاد 403 ولا CLI لـvercel مثبّت | يحتاج قرارك (صلاحية/تثبيت CLI) |

## أداء

| # | الدين | الحالة |
|---|---|---|
| P1 | Supabase: 121 مفتاحًا أجنبيًا بلا فهرس، 224 فهرسًا غير مستخدم، فهرس مكرر واحد، `auth_rls_initplan` واحد، 667 تنبيه `multiple_permissive_policies` | يحتاج قرارك (تعديل مخطط الإنتاج) |
| P2 | سقوف CSS في `reports/*-debt-budget.json` (`!important` 4720، hex 5546، rgb/hsl 1959، …) | مؤجَّل: خفضها يلمس الشكل البصري ويحتاج قياسًا حيًا؛ قيدك بعدم تغيير الهوية |

## تنظيف

| # | الدين | الحالة |
|---|---|---|
| C1 | اعتماديات `artifacts/majalis` بلا أي مرجع نصي: `hls.js`، `@hookform/resolvers`، `@radix-ui/react-avatar`، `@radix-ui/react-context-menu`، `@radix-ui/react-dropdown-menu`، `@radix-ui/react-toggle-group`، `@tailwindcss/typography`، `embla-carousel-react`، `input-otp`، `react-day-picker`، `tw-animate-css` | ✅ PR جاهز (التحقق: tsc وvite build ناجحان) |
| C2 | تحديثات patch لاعتماديات Capacitor وRadix | بعد C1 |

(استُثنيت الحزم الخاصة بالمنصة: `@rollup/rollup-darwin-arm64`، `@tailwindcss/oxide-darwin-arm64`، `lightningcss-darwin-arm64`، `@capacitor/ios`.)

## يحتاج قرارك

S1–S4 وU1 وP1: كلها تمسّ قاعدة الإنتاج `ngmvmlulzacrlicuagyp` أو صلاحيات خارجية، فلم أنفّذ منها شيئًا.

## سجل الإغلاق

(يُحدَّث بعد كل PR)

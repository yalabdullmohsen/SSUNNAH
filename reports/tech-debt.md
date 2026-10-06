# سجل الديون التقنية — سُنّة

آخر تحديث: 2026-10-07 · الترتيب: أمان ← أخطاء للمستخدم ← أداء ← تنظيف

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
| S1 | Supabase: دوال `SECURITY DEFINER` قابلة للتنفيذ من `anon`/`authenticated` | ✅ أُغلق جزئيًا: سُحب EXECUTE من 6 دوال لا يستدعيها التطبيق بمفتاح المستخدم (`increment_fiqh_item_views`، `record_lesson_view`، `accept_family_invite`، `revoke_family_link`، `get_similar_users`، `upsert_user_interest`) وأُعطيت لـservice_role فقط؛ search_path كان مثبّتًا أصلًا. **بقيت عمدًا** `is_admin` (anon+authenticated) و`profile_privileges_unchanged` (authenticated) لأن 170+ سياسة RLS تستدعيهما؛ سحبها يكسر قراءة الجداول العامة. الحل الدائم: نقلهما إلى schema خاص مع إعادة كتابة السياسات (يحتاج قرارك) |
| S2 | Supabase: حماية كلمات المرور المسرّبة معطّلة (Auth) | ⏳ خطوة يدوية في اللوحة: Authentication ← Sign In / Providers ← Password security ← فعّل «Prevent use of leaked passwords» (ميزة خطة Pro فأعلى؛ الحساب الحالي Hobby على Vercel ولم أتحقق من خطة Supabase) |
| S3 | Supabase: امتدادان في schema `public` (`pg_trgm`، `vector`) | يحتاج قرارك |
| S4 | Supabase: 85 جدولًا بـRLS مفعّل بلا سياسات | ✅ صُنّفت: كل جداول public (+85) RLS **مفعّل** عليها ولا جدول معطّل، فلا شيء لتفعيله. بلا سياسات = رفض كامل لـanon/authenticated ويعمل service_role فقط (مقصود لجداول الخطوط الخلفية)؛ لم أضف سياسات حتى لا أفتح بياناتها |

## أخطاء للمستخدم

| # | الدين | الحالة |
|---|---|---|
| U1 | أخطاء Vercel runtime: الاستعلام عبر MCP أعاد 403 ولا CLI لـvercel مثبّت | يحتاج قرارك (صلاحية/تثبيت CLI) |

## أداء

| # | الدين | الحالة |
|---|---|---|
| P1 | Supabase: 121 مفتاحًا أجنبيًا بلا فهرس | ✅ أُغلق: أُنشئ 121 فهرسًا (migration `20261006130100`) على staging ثم الإنتاج |
| P1b | Supabase: 224 فهرسًا غير مستخدم، فهرس مكرر، `auth_rls_initplan`، 667 تنبيه `multiple_permissive_policies` | مؤجَّل بقرارك |
| P2 | سقوف CSS في `reports/*-debt-budget.json` (`!important` 4720، hex 5546، rgb/hsl 1959، …) | مؤجَّل: خفضها يلمس الشكل البصري ويحتاج قياسًا حيًا؛ قيدك بعدم تغيير الهوية |

## تنظيف

| # | الدين | الحالة |
|---|---|---|
| C1 | اعتماديات `artifacts/majalis` بلا أي مرجع نصي: `hls.js`، `@hookform/resolvers`، `@radix-ui/react-avatar`، `@radix-ui/react-context-menu`، `@radix-ui/react-dropdown-menu`، `@radix-ui/react-toggle-group`، `@tailwindcss/typography`، `embla-carousel-react`، `input-otp`، `react-day-picker`، `tw-animate-css` | ✅ أُغلق (PR #2687) |
| C2 | تحديثات patch لحزم Radix (10 حزم) | ✅ أُغلق (PR #2688) |
| C3 | تحديثات patch: tailwind/tailwind-merge/adhan/dexie/compression/sharp/@types/leaflet | ✅ أُغلق (PR #2698، lockfile فقط). **بقيت** إضافات Capacitor الست: تمس حزمة iOS (بوابة TestFlight) — المرحلة 2 بقرارك |

| C4 | الكود الميت | ✅ أُغلق جزئيًا (PR #2697): knip بلا إعداد أعطى 989 «غير مستخدم» أغلبها وهمي (api/، scripts، imports ديناميكية)؛ بعد تصفية src/*.ts(x) وفحص المراجع عبر المستودع حُذفت 5 ملفات فقط. **بقي**: إعداد knip برسم نقاط الدخول (api/*، scripts/*، vite، vercel) لحصر دقيق — المرحلة 2 |

## ديون اختبارية مكتشفة (بوابات حمراء خارج CI)

| # | الدين | الحالة | المرحلة |
|---|---|---|---|
| T1 | `app-web-boundary-gate` (window.location.assign في الرئيسية وPrayerHero) | ✅ أُغلق (PR #2696) | 1 |
| T2 | `content-audit-b059-coverage-matrix-gate` (inventory ينقصه 15 قسمًا حيًا) | ✅ أُغلق (PR #2696) | 1 |
| T3 | `content-depth-audit-gate`: نص «لا نتائج» انتقل إلى strings.ts | ✅ أُغلق (PR #2696) | 1 |
| T4 | نفس البوابة: نبذ الأنبياء الـ25 أقل من 40 كلمة (`briefBio`) | يحتاج قرارك: محتوى شرعي يُكتب ويُراجَع، لا يُولَّد آليًا | — |
| T5 | `card-contrast-aa-root-gate` و`ci-7500-hub-card-dark-contrast-gate` (رموز --cs-* قديمة) | مفتوح: بوابات قديمة لهوية سابقة؛ تحتاج تحديثًا للهوية الحالية أو حذفًا | 2 |
| T6 | `visual-debt-v1-gate`: `lessons-sections-v2.css` فيه 18 `!important` > سقف 17 | مفتوح (يرتبط بـP2) | 2 |
| T7 | `scripts/test-no-homepage-leak.mjs`: 190 كتابًا بلا صفحة prerender (المكتبة محذوفة) | مفتوح: تحديث السكربت لمصدر الكتب الحالي | 2 |


(استُثنيت الحزم الخاصة بالمنصة: `@rollup/rollup-darwin-arm64`، `@tailwindcss/oxide-darwin-arm64`، `lightningcss-darwin-arm64`، `@capacitor/ios`.)

## يحتاج قرارك

- U1 (Vercel runtime errors: 403)، S3 (امتدادان في public)، P1b، وC3/C4.
- S1: نقل `is_admin`/`profile_privileges_unchanged` لـschema خاص (يعيد كتابة السياسات).
- ملاحظة: staging ليس نسخة كاملة (9 جداول ودالة SECURITY DEFINER واحدة)، فاختبار staging اقتصر على سلامة الـmigration وقراءات anon؛ والتحقق الفعلي كان على الإنتاج: عدّ صفوف anon قبل/بعد متطابق (lessons 325، hadith 333، qa 370، rulings 690، …).

## سجل الإغلاق

- C1: PR #2687 — مدموج (فحوص CI ناجحة).
- C2: PR #2688 — مدموج (فحوص CI ناجحة).
- S1/S4/P1: migrations `20261006130000` و`20261006130100` طُبّقت على staging ثم الإنتاج (2026-10-06).
- حذف قسم العلماء: PR #2695 (مسارات /scholars تحوَّل إلى /sections؛ بيانات scholars-profiles باقية).
- T1–T3: PR #2696 — مدموج. C4: PR #2697. C3: PR #2698 — مدموج.
- الصفحات الداخلية (زر رجوع + عناوين 28px): PR #2700.

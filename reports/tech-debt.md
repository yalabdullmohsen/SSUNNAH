# سجل الديون التقنية — سُنّة

آخر تحديث: 2026-10-07 (المرحلة 3) · الترتيب: أمان ← أخطاء للمستخدم ← أداء ← تنظيف

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
| P1b | Supabase: initplan + فهرس مكرر + فهارس غير مستخدمة + سياسات متعددة | ✅ الآمن فقط بقرار المالك (2026-10-07): لفّ `auth.uid()` في سياسة `sr_reviews` (الوحيدة المرصودة فعلًا؛ تقدير سابق بـ147 كان تعدادًا خاطئًا) وحذف `idx_content_relations_to` المطابق لـ`content_relations_to_ref_id_idx`؛ طُبّق على staging ثم الإنتاج (migration `20261007100000`). **لم** تُحذف الفهارس غير المستخدمة (345) ولم تُدمج السياسات (667) بقرار المالك |
| P2 | سقوف CSS في `reports/*-debt-budget.json` (`!important` 4720، hex 5546، rgb/hsl 1959، …) | مؤجَّل: خفضها يلمس الشكل البصري ويحتاج قياسًا حيًا؛ قيدك بعدم تغيير الهوية |

## تنظيف

| # | الدين | الحالة |
|---|---|---|
| C1 | اعتماديات `artifacts/majalis` بلا أي مرجع نصي: `hls.js`، `@hookform/resolvers`، `@radix-ui/react-avatar`، `@radix-ui/react-context-menu`، `@radix-ui/react-dropdown-menu`، `@radix-ui/react-toggle-group`، `@tailwindcss/typography`، `embla-carousel-react`، `input-otp`، `react-day-picker`، `tw-animate-css` | ✅ أُغلق (PR #2687) |
| C2 | تحديثات patch لحزم Radix (10 حزم) | ✅ أُغلق (PR #2688) |
| C3 | تحديثات patch | ✅ غير Capacitor أُغلق (PR #2698). **Capacitor (6 إضافات): مؤجَّل إلى إصدار iOS القادم بقرار المالك**؛ عند التنفيذ تُحدَّث إضافة واحدة في كل مرة، ولا بناء ولا رفع TestFlight إلا بإذنه |

| C4 | الكود الميت | ✅ المرحلة 3 بقرار المالك: PRs #2704–#2714 و#2718 و#2719 (12 دفعة)، كل دفعة ≤400 سطر (استثناءان: QaPage 405 وLearningPathTreeEditor 779، ملف واحد لا يقبل التقسيم)، وأُزيل من البوابات والسكربتات المرجع إلى الملف المحذوف فقط، وخُفِّضت أرضيتا officialButtonImportFiles وsfTokenRefs (#2716) لأن المحذوف كان يستورد Button ويستخدم رموز --sf. **استُبقيت عمدًا** (ليست كودًا ميتًا فعليًا): `citation-schema` (تتحقق منه verify-citations)، `fiqhSearch` و`lessonSearch` (تستوردهما سكربتات تدقيق وقت التشغيل)، `IosAppCtaSlot` و`seo-app-jsonld` (جاهزان للربط بعد رابط App Store، مؤكَّد ببوابة ios-app-discovery)، `SearchSuggestions` (فجوة P0 «ربط» في search-excellence — قرار منتج)، `marks-contract` ×3 (أقفال حوكمة: RELEASE_BLOCKER_CRITICAL وmodifySubmittedBuild:false)، `mushaf-internal-perf-contract` (منطقة المصحف)، `tarikh-islami-data` (بيانات محتوى). بقيت حزمتا `@radix-ui/react-menubar` وreact-navigation-menu بلا مستخدم (حذفهما يعدّل lockfile) |

## ديون اختبارية مكتشفة (بوابات حمراء خارج CI)

| # | الدين | الحالة | المرحلة |
|---|---|---|---|
| T1 | `app-web-boundary-gate` (window.location.assign في الرئيسية وPrayerHero) | ✅ أُغلق (PR #2696) | 1 |
| T2 | `content-audit-b059-coverage-matrix-gate` (inventory ينقصه 15 قسمًا حيًا) | ✅ أُغلق (PR #2696) | 1 |
| T3 | `content-depth-audit-gate`: نص «لا نتائج» انتقل إلى strings.ts | ✅ أُغلق (PR #2696) | 1 |
| T4 | نبذ الأنبياء الـ25 أقل من 40 كلمة (`briefBio`) في `content-depth-audit-gate` | ✅ أُغلق بقرار المالك (2026-10-07): تُقبل النبذ القصيرة باستثناء موثّق في الاختبار وDECISIONS.md (سببه: محتوى شرعي صحّحه المالك في #2703 والطول ليس معيارًا؛ حدّ أدنى 8 كلمات فقط للتحقق أنها نص حقيقي). لا نبذ جديدة ولا إطالة | — |
| T5 | `card-contrast-aa-root-gate` و`ci-7500-hub-card-dark-contrast-gate` (رموز --cs-* قديمة) | ✅ أُغلق: حُدّثت التأكيدات لتطابق الرموز الحالية (--mj-white، --mss-on-hero، سطح hub-card من --surface) دون إضعافها | 2 |
| T6 | `visual-debt-v1-gate` | ✅ أُغلق: حُذف `background-color !important` المكرر في lessons-sections-v2 (سقف 16)، و9999px→رمز pill في final-release، وتحديث --sf-radius-lg إلى 28px | 2 |
| T7 | `scripts/test-no-homepage-leak.mjs` | ✅ أُغلق بحذف السكربت: يفحص صفحات prerender للكتب والعلماء وكلاهما محذوف من المنتج، وهو خارج CI | 2 |


(استُثنيت الحزم الخاصة بالمنصة: `@rollup/rollup-darwin-arm64`، `@tailwindcss/oxide-darwin-arm64`، `lightningcss-darwin-arm64`، `@capacitor/ios`.)

## شرح القرارات المعلّقة (لا تُنفَّذ قبل رد المالك)

| # | ما هو | الخطر | التوصية |
|---|---|---|---|
| S1 | دالتان `SECURITY DEFINER` (`is_admin`، `profile_privileges_unchanged`) قابلتان للتنفيذ من anon/authenticated لأن 170+ سياسة RLS تستدعيهما | منخفض: تكشفان قيمة منطقية عن المستدعي نفسه لا بيانات؛ لكنهما سطح قابل للتعداد | تركهما الآن؛ الحل الدائم نقلهما لـschema خاص مع إعادة كتابة السياسات في نافذة صيانة مخطَّطة واختبار قراءة الجداول العامة قبل/بعد |
| S2 | حماية كلمات المرور المسرّبة معطّلة في Supabase Auth | متوسط: يمكن اختيار كلمة مرور موجودة في تسريبات | تفعيلها من اللوحة إن سمحت الخطة (ميزة Pro)؛ وإلا فحص HIBP بـk-anonymity من العميل. لا أثر على المستخدمين الحاليين |
| S3 | امتدادا `pg_trgm` و`vector` في schema `public` | منخفض: تحذير advisor (تعارض أسماء/تعريض دوال عبر PostgREST) | تركهما؛ نقلهما لـschema `extensions` قد يكسر البحث والفهارس، فيُختبر البحث أولًا إن لزم |
| P1b | 224 فهرسًا غير مستخدم + فهرس مكرر + `auth_rls_initplan` + 667 تنبيه `multiple_permissive_policies` | أداء فقط؛ التغيير متوسط الخطر (حذف فهرس قد يبطّئ استعلامًا نادرًا، ودمج السياسات قد يغيّر الصلاحيات) | تنفيذ الآمن فقط: لفّ `auth.uid()` بـ`(select auth.uid())` (دلالة مطابقة) وحذف الفهرس المكرر؛ وإبقاء غير المستخدم حتى تتجمع إحصاءات أطول، وعدم دمج السياسات |
| U1 | تعذّر قراءة أخطاء Vercel runtime (MCP أعاد 403 ولا CLI) | نقطة عمياء لأخطاء الإنتاج | منح رمز Vercel صلاحية السجلات أو تثبيت `vercel` CLI وتسجيل الدخول، ثم أقرأ أخطاء آخر 7 أيام وأصنّفها |

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

## ملحق C4 — ملفات src ميتة (بلا مستورِد غير الاختبارات)

- `src/components/AdminQuickEdit.tsx`
- `src/components/IosAppCtaSlot.tsx`
- `src/components/SearchSuggestions.tsx`
- `src/components/ShareButton.tsx`
- `src/components/admin/AdminDisplayText.tsx`
- `src/components/admin/review-hub/WaveformAudioPlayer.tsx`
- `src/components/brand/MajlisWordmark.tsx`
- `src/components/home/DailyWirdCard.tsx`
- `src/components/home/HomeAboutSection.tsx`
- `src/components/home/HomeExplorePlatform.tsx`
- `src/components/home/HomeLiveStatsStrip.tsx`
- `src/components/home/HomeQuickAccessV2.tsx`
- `src/components/home/HomeSacredOfDay.tsx`
- `src/components/home/HomeStartHereSection.tsx`
- `src/components/home/HomeUpcomingCourses.tsx`
- `src/components/layout/ContentHubLayout.tsx`
- `src/components/lessons/LessonScheduleGroup.tsx`
- `src/components/majlis/MainNavigationScreen.tsx`
- `src/components/motion/SmoothImage.tsx`
- `src/components/prayer/PrayerCountdownChip.tsx`
- `src/components/quran/SurahList.tsx`
- `src/components/sections/SectionsGrids.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/features/mushaf-reader/mushaf-internal-perf-contract.ts`
- `src/features/mushaf-reader/mushaf-return-context.ts`
- `src/hooks/useAutoHideBottomNav.ts`
- `src/hooks/useOfflineContent.ts`
- `src/lib/architecture-excellence/marks-contract.ts`
- `src/lib/citation-schema.ts`
- `src/lib/fiqh/fiqhSearch.ts`
- `src/lib/lessons/lessonSearch.ts`
- `src/lib/prayer-notifications/store-device-harness.ts`
- `src/lib/prayer-time-engine.ts`
- `src/lib/section-topics-expand.ts`
- `src/lib/seo-app-jsonld.ts`
- `src/lib/spacing-authority.ts`
- `src/lib/tarikh-islami-data.ts`
- `src/lib/typography-authority.ts`
- `src/lib/whole-app-excellence/marks-contract.ts`
- `src/lib/world-class-polish/marks-contract.ts`
- `src/pages/account/MemorizePage.tsx`
- `src/views/QaPage.tsx`
- `src/views/StartHerePage.tsx`
- `src/views/admin/learning-paths/LearningPathTreeEditor.tsx`
- المرحلة 3 (C4): PRs #2704–#2714 و#2718 و#2719 وأرضيات #2716؛ حالة الدمج حسب CI.

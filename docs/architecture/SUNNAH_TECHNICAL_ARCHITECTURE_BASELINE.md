# مشروع سُنّة — ملف البنية التقنية (Baseline دائم)

| Field | Value |
|---|---|
| الاسم الرسمي | **سُنّة** |
| النطاق الإنتاجي | `https://www.ssunnah.com` (canonical) · aliases: `ssunnah.com`, `majlisilm.com` |
| GitHub | `yalabdullmohsen/majalis` |
| جذر Git | monorepo pnpm (`pnpm-workspace.yaml`) — **ليس** مجلد `artifacts/majalis` وحده |
| منتج الويب/المتجر | `artifacts/majalis` |
| مصدر الحقيقة الحي للإصدار | `docs/release/CURRENT_PROJECT_STATUS.md` |
| جرد تقنيات تفصيلي سابق | `docs/architecture/TECHNOLOGY_INVENTORY.md` |
| فهرس المسارات | `docs/REPO_INDEX.md` |
| تاريخ هذا الملف | 2026-09-28 |
| قاعدة القياس | كود المستودع + `package.json` + `capacitor.config.ts` + `PLATFORMS.md` — **ليس** افتراضات Flutter/Firebase |

> **مهم:** التطبيق **ليس Flutter**. لا يوجد `pubspec.yaml` لمسار الإنتاج. المسار الرسمي = **React + Vite + Capacitor**.

---

## 1) معلومات عامة

| بند | الواقع |
|---|---|
| اسم المشروع | سُنّة |
| النطاق | `www.ssunnah.com` |
| تطبيقات الإنتاج | **Web** + **iOS/Android عبر Capacitor** (غلاف حول نفس حزمة الويب) |
| غلاف Expo | `artifacts/majalis-mobile` — **مجمَّد / ليس مسار المتجر** |
| Flutter | `artifacts/majlisilm-flutter` — **مهجور** · `artifacts/mushafi` مرجع تسميع قادم فقط |
| Website Live | نعم — النشر عبر Vercel على `main` (`artifacts/majalis`) |
| App Store / Play | مسار Capacitor موجود · حالة الإطلاق الرسمية الحالية: **STORE HOLD** (انظر `docs/release/*`) — لا تُعلَن STORE GO من هذا الملف |
| اتجاه الواجهة | عربي RTL أولاً |

---

## 2) التقنية المستخدمة (مجاب من الكود)

```text
Frontend Mobile (المتجر):
  Capacitor 8 حول artifacts/majalis (نفس React/Vite)
  iOS: artifacts/majalis/ios · Android: artifacts/majalis/android
  appId: com.yousef.majlisilm · server.url → https://www.ssunnah.com
  Plugins: App, Browser, Haptics, Keyboard, Local/Push Notifications,
           Preferences, SplashScreen, StatusBar
  Expo (majalis-mobile): مجمَّد — ليس مسار المتجر
  Flutter: مهجور — ليس مسار المتجر

Frontend Web:
  React 19 + TypeScript + Vite 7
  Router: wouter
  Styling: Tailwind CSS 4 + طبقات CSS (tokens / brand / m2030 / SVL)
  Icons: lucide-react · UI primitives: Radix (جزئي)
  State: React state/context + TanStack Query (محدود) · لا Redux/Zustand
  Forms: react-hook-form + zod (حيث اللزوم)
  Animation: CSS / native-feel · framer-motion ممنوع في المنتج (بوابة)

Backend / API:
  Vercel Serverless تحت artifacts/majalis/api + lib/api-dispatch.mjs
  طبقة أمن مركزية (api-security-*) · fail-closed بدون أسرار
  Express صغير: artifacts/api-server (push/notifications — منفصل عن مسار الويب الأساسي)
  AI اختياري: @anthropic-ai/sdk عبر مسارات /api/assistant (سر خادم)

Database:
  Supabase (Postgres مستضاف) — العميل: @supabase/supabase-js
  lib/db (Drizzle) = placeholder فارغ تقريباً — ليس DB محلي للإنتاج
  Migrations/SQL: supabase/ + artifacts/supabase — تطبيق يدوي/مالك

Authentication:
  Supabase Auth (email وغيرها حسب المشروع المستضاف)
  AuthProvider في الواجهة · تأكيد البريد مفعّل على الإنتاج الحي تاريخياً

Notifications:
  Capacitor Local Notifications (أذان/تذكير محلي)
  Capacitor Push Notifications + مسار الإشعارات عبر api-server / NOTIFICATION_SECRET
  لا OneSignal في مسار الإنتاج المثبت

Storage (عميل):
  localStorage · Capacitor Preferences · Dexie (IndexedDB)
  Service Worker مخصص للكاش/الأوفلاين
  أصول ثابتة تحت public/data/*

Analytics:
  RUM محلي + موافقة cookies · POST /api/rum
  تحليل بحث داخلي (Admin) — ليس Google Analytics كاعتماد أساسي مثبت
  لا Mixpanel/PostHog/Firebase Analytics مثبتة كمسار إنتاج

Crash Reporting:
  لا Sentry في package.json المنتج
  ErrorBoundary + تقارير خطأ محلية (error-report)

Hosting:
  Vercel — مشروع majalis-majalis (Root: artifacts/majalis)
  Auto Deploy على push إلى main
  GitHub Actions: Verify build · auto-merge · auto-deploy · iOS workflows
```

### متغيرات بيئة أساسية (أسماء فقط)

| اسم | دور |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | عميل البيانات/auth |
| `ANTHROPIC_API_KEY` | مساعد AI (خادم) |
| `ADMIN_API_SECRET` / `CRON_SECRET` | حماية Admin/Cron (معزولان) |
| `TELEGRAM_WEBHOOK_SECRET` | webhook |
| `NOTIFICATION_SECRET` / VAPID | دفع |
| `SUPABASE_SERVICE_ROLE_KEY` | عمليات خادم فقط |
| `UPSTASH_REDIS_*` | حدود معدل موزّعة |

تفاصيل: `docs/security/API_SECRET_MATRIX.md` · `docs/project-knowledge/16_ENVIRONMENTS_AND_EXTERNAL_SERVICES.md`

---

## 3) هيكل المشروع الفعلي

```text
majlis-app/                          ← جذر Git / pnpm workspace
├── artifacts/
│   ├── majalis/                     ← ★ المنتج الوحيد للويب + Capacitor
│   │   ├── src/                     ← React app
│   │   │   ├── main.tsx · App.tsx · AppRoutes.tsx
│   │   │   ├── pages/               ← مجالات: quran, worship, fiqh, hadith, lessons, …
│   │   │   ├── views/               ← صفحات مسطّحة كثيرة + Admin Legacy
│   │   │   ├── admin-v3/            ← لوحة Admin v3
│   │   │   ├── components/ · features/ · entities/ · core/ · lib/
│   │   │   ├── app/router · styles · hooks · context
│   │   ├── api/ · lib/              ← Vercel functions + handlers
│   │   ├── public/data/             ← JSON محتوى/بحث/حديث/فقه…
│   │   ├── content/                 ← مصادر محتوى (فقه وغيرها)
│   │   ├── ios/ · android/          ← مشاريع Capacitor الأصلية
│   │   ├── capacitor.config.ts
│   │   └── vercel.json
│   ├── api-server/                  ← Express push (منفصل)
│   ├── majalis-mobile/              ← Expo مجمَّد
│   ├── majlisilm-flutter/           ← Flutter مهجور
│   ├── mushafi/                     ← مرجع تسميع قادم (لا حذف)
│   ├── supabase/ · data/ · pitch/promo/mockup…
├── api/                             ← re-exports جذرية لبعض مسارات Vercel
├── lib/                             ← api-client-react · api-spec · db placeholder
├── supabase/                        ← SQL / سياسات
├── scripts/                         ← verify:ci · release · ops
├── docs/                            ← معرفة المنتج + الإصدار + العمارة
├── .github/workflows/               ← CI/CD
├── package.json · pnpm-workspace.yaml · pnpm-lock.yaml
└── fastlane/                        ← iOS release tooling
```

**لا يوجد** جذر منفصل `mobile/` / `web/` بأسلوب Flutter. «الموبايل» = Capacitor داخل `artifacts/majalis`.

### أوامر تشغيل أساسية

```bash
# ويب
PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run dev
PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build

# بوابات
pnpm run verify:preflight
pnpm run verify:ci
pnpm run release:verify   # عند مسار الإطلاق

# أصلي بعد بناء الويب
pnpm --filter @workspace/majalis exec cap sync ios
```

---

## 4) المكتبات الأساسية (فعلية — ليست قائمة افتراض)

### تستخدم في مسار الإنتاج

| مكتبة | دور |
|---|---|
| `react` / `react-dom` 19 | UI |
| `vite` + `@vitejs/plugin-react` | بناء |
| `wouter` | توجيه |
| `typescript` ~5.9 | أنواع |
| `tailwindcss` 4 | تنسيق |
| `@tanstack/react-query` | حالة خادم محدودة |
| `@supabase/supabase-js` | بيانات/Auth |
| `@capacitor/*` | غلاف أصلي |
| `dexie` | IndexedDB |
| `zod` · `react-hook-form` | تحقق/نماذج |
| `lucide-react` · Radix UI | أيقونات/بدائيات |
| `adhan` | حساب المواقيت |
| `hls.js` | بث صوتي عند الحاجة |
| `@upstash/ratelimit` + redis | حماية API |
| `@vercel/functions` | وظائف Vercel |
| `@anthropic-ai/sdk` | مساعد (خادم) |
| `@playwright/test` | E2E/بوابات |
| `eslint` + `jsx-a11y` | جودة/وصولية |

### ليست مسار الإنتاج (شائع الخطأ)

| تقنية | الحالة في سُنّة |
|---|---|
| Flutter / Riverpod / Bloc | **لا** — Flutter مهجور |
| Firebase Auth / Firestore | **لا** كاعتماد أساسي |
| OneSignal / RevenueCat / Algolia | **غير مثبتة** كمسار إنتاج |
| FastAPI / Django / Nest منفصل | **لا** — API = Vercel handlers |
| Next.js كمنتج حي | **لا** — المنتج Vite (قد توجد بقايا تاريخية غير مسار النشر) |

---

## 5) الخدمات المرتبطة

| خدمة | الاستخدام |
|---|---|
| **Vercel** | استضافة الويب + Serverless API · مشروع `majalis-majalis` |
| **Supabase** | Postgres + Auth + RLS · قراءة/كتابة من المتصفح بمفتاح anon |
| **GitHub Actions** | CI · auto-merge · auto-deploy · بوابات iOS |
| **Apple Developer / ASC** | توقيع/TestFlight — OWNER_ACTION · STORE HOLD |
| **Google Play** | applicationId موجود — توقيع OWNER_ACTION · STORE HOLD |
| **Upstash Redis** | حدود معدل API (عند ضبط الأسرار) |
| **Anthropic** | مساعد AI اختياري |
| **Telegram webhook** | اختياري محمي بسر |
| **CDN صوت قرآن** | مصادر خارجية (everyayah / mp3quran …) عبر CSP |
| Cloudflare / AWS / Firebase / OneSignal / Brevo / Resend / Algolia | **ليست** أعمدة مثبتة لمسار الإنتاج الأساسي في هذا الجرد |

---

## 6) أقسام التطبيق (تنقّل + مجالات)

### الشريط السفلي (Bottom Nav) — مصدر: `BottomNavBar` / سجل الأقسام

| تبويب | مسارات أساسية | الوظيفة |
|---|---|---|
| الرئيسية | `/` | مدخل يومي، روابط سريعة، محتوى بارز |
| مركز القرآن | `/quran-hub` · `/mushaf` · `/quran-knowledge` | مصحف، معرفة قرآنية، أدوات قراءة |
| الدروس | `/lessons` | دروس علمية ومسارات تعلم |
| الصلاة | `/prayer-times` | مواقيت، أذان محلي، تذكير |
| الأقسام / المزيد | `/sections` · `/more` | فهرس الأقسام (فقه، حديث، أذكار، بحث، إعدادات…) |

### مجالات محتوى مهمة (ليست كلها تبويباً سفلياً)

| قسم | أمثلة مسارات | وظيفة |
|---|---|---|
| المصحف | `/mushaf` · `/mushaf/bookmarks` | قراءة صفحة، فواصل/علامات، موضع قراءة، صوت |
| الحديث | `/hadith` + بيانات `public/data/hadith*` | متون/بحث حديث |
| الفقه | `/fiqh` + `public/data/fiqh` | كتب/أبواب فقه |
| البحث | `/search` | فهرس مولَّد + شظايا بحث |
| الأذكار / عبادة | `/adhkar` وغيرها تحت worship | ورد وأذكار |
| التعلّم | `/my-learning` · `/study-room` · مسارات | تقدّم المستخدم |
| الحساب | `/login` · `/register` · `/settings` · خصوصية | جلسة وإعدادات |
| أوفلاين | `/offline` | مركز محتوى/كاش |

سجل الأقسام التفصيلي: `artifacts/majalis/src/config/sections.registry.ts`.

---

## 7) لوحة التحكم

### Admin v3 (المسار الحديث) — `/admin/v3`

| مركز | مسار | وظيفة |
|---|---|---|
| نظرة عامة | `/admin/v3` | تشغيل يومي، مراجعات، إجراءات سريعة |
| المراجعات | `/admin/v3/reviews` | صندوق وارد تحريري |
| المحتوى | `/admin/v3/content` | دروس/مشايخ/فوائد/أسئلة (CRUD موجات) |
| التصنيف | `/admin/v3/taxonomy` | أبواب العلم والترتيب |
| التحليلات | `/admin/v3/analytics` | أداء/بحث/اعتدال |
| المجتمع | `/admin/v3/community` | مستخدمون، بلاغات، مساهمات |
| الإعدادات | `/admin/v3/settings` | لوحة، أتمتة، نظام، تدقيق |

مصدر التنقّل: `artifacts/majalis/src/admin-v3/nav.ts`.

### Admin Legacy — `/admin` و `/admin/legacy`

ما زال موجوداً لأقسام لم تكتمل هجرتها (دروس، تصنيفات، مستخدمون، إشعارات، تحليل بحث…).  
**لا يُحذف** قبل اكتمال parity مع v3. الجرد: `docs/admin/LEGACY_ADMIN_INVENTORY.md`.

حماية الكتابة: طبقة API الأمنية + JWT/RBAC/أسرار خادم — fail-closed.

---

## 8) أولويات المشروع الحالية (موثّقة للوكلاء)

### حرجة (استقرار منتج)

```text
أداء المصحف وقياساته (mushaf-measure / mushaf-gates)
سرعة الإقلاع واستعادة الـchunks (AppStartupController · chunk-recovery)
تقليل الوميض والقفزات (Zero Flicker / layout shift)
استقرار سلسلة الأذان والإشعارات المحلية
تباين الألوان وRTL وDark Mode كبوابات CI
```

### عالية (اكتمال منصة)

```text
اكتمال/صدق قسم الحديث والمصادر
تحسين البحث الموحّد والشظايا
Admin v3 parity مع Legacy
تجربة الدورات/الدروس ومسارات التعلّم
توافق API مع النسخة المنشورة (fail-closed + backward compatible)
```

### نمو (بعد استقرار الإطلاق)

```text
SEO / prerender / sitemap (موجود جزئياً — توسيع جودة)
ASO وبيانات المتجر بعد رفع HOLD
الاحتفاظ والإشعارات الذكية (بعد اعتماد الخصوصية/الأسرار)
مراقبة أخطاء إنتاجية (Sentry = قرار مالك — غير مثبت الآن)
```

### خارج المستودع (لا يغلقها الوكيل وحده)

```text
STORE HOLD: تراخيص أصول · توقيع Apple/Play · مصفوفات أجهزة حقيقية
أسرار Vercel / شهادات النشر
```

---

## 9) نقاط ضعف معمارية معروفة (للسجل الدائم)

| نقطة | ملاحظة |
|---|---|
| تراكب CSS/tokens | عدة أنظمة بصرية متزامنة — تنظيف مرحلي |
| `views/` ضخمة + `pages/` مجالات | ازدواج مسارات تاريخي |
| Admin Legacy + v3 | هجرة غير مكتملة |
| Expo/Flutter في المستودع | ضوضاء معرفية — مجمَّدان |
| لا Sentry | ضعف مراقبة أعطال الإنتاج |
| TypeScript `strict: false` جزئياً | ترقية تدريجية |
| Capacitor يحمّل الويب الحي | الاعتماد على استقرار `www.ssunnah.com` |
| ازدواج `@types/react` web/Expo | معروف · `skipLibCheck` |

---

## 10) ملفات اقرأها أولاً في أي جلسة وكيل

1. `docs/REPO_INDEX.md`  
2. `docs/release/CURRENT_PROJECT_STATUS.md`  
3. هذا الملف  
4. `docs/architecture/TECHNOLOGY_INVENTORY.md`  
5. `AGENTS.md` + `docs/AGENT_THROUGHPUT.md`  
6. عند الإطلاق: `docs/release/RELEASE_READINESS_TRUTH.md`

---

## 11) شجرة جذر مختصرة (قياس حي)

```text
package.json                 ← workspace scripts (verify:ci …)
pnpm-workspace.yaml
artifacts/majalis/package.json   ← ★ اقرأ هذا لمعرفة deps المنتج
artifacts/majalis/capacitor.config.ts
artifacts/majalis/src/
artifacts/api-server/
lib/
docs/
scripts/
.github/workflows/
supabase/
```

**لا يوجد `pubspec.yaml` لمسار سُنّة الإنتاج.**  
لقائمة التبعيات الحية: `artifacts/majalis/package.json`.

---

## تحديث هذا الملف

حدّث عند تغيّر: مكدس أساسي · مسار متجر · خدمة خارجية جديدة · قرار إهلاك منصة · تغيير نطاق الإنتاج.  
لا تخلط حالة STORE المؤقتة مع وصف المكدس الدائم — حالة الإطلاق تُقرأ من `CURRENT_PROJECT_STATUS.md`.

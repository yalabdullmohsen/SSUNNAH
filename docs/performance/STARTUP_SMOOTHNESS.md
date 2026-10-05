# STARTUP_SMOOTHNESS — دخولية ناعمة بلا قفزات خط أو تخطيط

**البوابة:** `pnpm --filter @workspace/majalis run test:startup-smoothness`
(`artifacts/majalis/src/lib/__tests__/startup-smoothness-gate.test.ts`)

## منهجية القياس

- بناء إنتاج محلي + `vite preview` + Playwright Chromium (macOS)، 390×844 @2x، جوال/لمس.
- خنق واقعي: CPU ×4 + Fast 3G (RTT 562ms، ≈1.4Mbps)، كاش معطّل، Service Worker محجوب.
- لكل مسار (`/`, `/quran-hub`, `/prayer-times`, `/mushaf`, `/lessons`) × (نهاري/ليلي عبر `majalis-theme`):
  - شريط لقطات (screencast) كل 100ms لأول 3s ثم كل 250ms حتى 12s.
  - `PerformanceObserver(layout-shift)` مع المصادر (العنصر + المستطيل قبل/بعد).
  - الخط **المرسوم فعلًا** للعناوين وتسميات الشريط السفلي (`CSS.getPlatformFontsForNode`) كل 300ms، وأحداث `document.fonts`.
  - تغيّرات `data-theme`/`class` على `<html>`، ولون خلفية `body`، وهندسة الهيدر/الشريط السفلي، وتوقيت شاشة الدخول.

## الأسباب الجذرية المكتشفة

| # | السبب | الدليل المقاس |
|---|-------|---------------|
| 1 | **تبديل خط بعد أول رسم**: أوجه Amiri العربية معرّفة مضمّنة في `index.html` ثم **مُعاد تعريفها** في `fonts-ui.css` (حزمة `index-*.css`) و`critical-first-paint.css` (وجه `400` بواصفات مختلفة). وصول الحزمة بعد FCP يُنشئ FontFace جديدًا يُحمَّل من الكاش داخل فترة الحجب فيُستبدل الخط رغم `font-display: optional`. | عنوان `/`: `Geeza Pro` عند 1.6s ثم `Amiri` عند 4.5s مع تغيّر ارتفاع 64→57px |
| 2 | **البديل المعايَر لا يعمل إطلاقًا**: `local("Geeza Pro")`/`local("Noto Naskh Arabic")` أسماء عائلات، و`local()` يطابق الاسم الكامل/PostScript فقط → `MajlisAmiriFallback`/`MajlisFallback` في حالة `error`، فيُرسم الخط الاحتياطي بلا `size-adjust` ولا وزن عريض مطابق. | `document.fonts`: `MajlisAmiriFallback … error` في كل المسارات |
| 3 | **ارتفاع الشريط السفلي يتأرجح** 64→67→62→64px: قاعدة `padding-bottom: max(.35rem, inset)` في `sunnah-identity-responsive-a11y.css` تُطبَّق مؤقتًا قبل أن تهزمها `navigation.css`/`final-release.css` (`!important`)، والحرج بلا `height` ثابت. | layout-shift على `nav.bottom-nav` عند 6.0s و8.4s و10.3s |
| 4 | **هيدر الإقلاع (ChromeNavFallback) بلا تخطيط**: `.navbar-v3__inner` كان `display:block` حتى تصل الطبقات المؤجلة، فتنزل `__end` إلى y=65 ثم تقفز إلى y=18. | CLS **0.0293** على `/quran-hub` و`/lessons` عند ≈9.7s |
| 5 | **وميض خلفية**: `app-shell-v2.css` يُحمَّل قبل `visual-redesign-v2-tokens.css` فيستعمل fallback ‎`#f9f8f4`‎ ثم يعود إلى ‎`#F8F6F1`‎. | `body` يتغيّر مرتين (6.0s ثم 7.1s) على `/`, `/quran-hub`, `/lessons` |

غير موجود (مُتحقَّق): **صفر** تغيّر لسمة الثيم بعد أول رسم في كل المسارات والوضعين — سكربت `mj-theme-boot` هو المصدر الوحيد قبل أول رسم؛ وCapacitor `launchAutoHide:false` + `SplashScreen.hide({fadeOutDuration})` بعد الجاهزية؛ لون شاشة الدخول = لون اللوحة.

## الإصلاحات

1. مصدر وحيد لأوجه Amiri العربية والبدائل في `#mj-lcp-critical` (`index.html`)؛ حُذفت إعادة التعريف من `fonts-ui.css` و`critical-first-paint.css` (بقيت أوجه Amiri **اللاتينية** في `fonts-ui.css` كما كانت — لا تتقاطع مع العربية).
2. بدائل معايَرة بأسماء `local()` صحيحة ولكل وزن:
   - `MajlisAmiriFallback` = Noto Naskh Arabic (Android/Linux) — `size-adjust: 97%` (المعايرة السابقة) + وجه عريض.
   - `MajlisFallback` = Geeza Pro (iOS/macOS) — معايَر بعرض نص عربي مقابل Amiri: عادي **92.6%**، عريض **79.1%**؛ `ascent/descent` = مقاييس Amiri ÷ size-adjust.
3. الشريط السفلي: `height` ثابت = `64px + safe-area` و`padding-top:.2rem` منذ أول رسم (= القيم النهائية في `final-release.css`)، وحُذفت قاعدة الـpadding المؤقتة.
4. `chrome-boot-ph.css` (متزامن مع `App`) يمنح هيدر الإقلاع شبكة NavBar النهائية (3 أعمدة، gap 10px، 56px).
5. fallback خلفية v2 في `src/styles/pages/*-v2.css` = `var(--mj-bg)` بدل ‎`#f9f8f4`‎.
6. حجم CSS المضمّن بقي ضمن ميزانية 14KiB (حُذف تكرار `--m2030-pad`).

## قبل / بعد (CPU ×4 + Fast 3G، 390×844)

| المسار | الوضع | CLS قبل | CLS بعد | تبديل خط العناوين | تغيّر الثيم | تغيّر خلفية body (نهاري) |
|---|---|---:|---:|---|---:|---|
| `/` | نهاري | 0.0043 | 0.0055 | 1 → 1 (انظر المتبقي) | 0 → 0 | 2 → **0** |
| `/` | ليلي | 0.0046 | 0.0054 | 1 → 1 | 0 → 0 | — |
| `/quran-hub` | نهاري | **0.0372** | **0.0066** | 0 → 0 | 0 → 0 | 2 → **0** |
| `/quran-hub` | ليلي | **0.0373** | **0.0067** | 0 → 0 | 0 → 0 | — |
| `/prayer-times` | نهاري/ليلي | 0.0066 | 0.0066 | 0 → 0 | 0 → 0 | انتقال سطح مقصود |
| `/mushaf` | نهاري/ليلي | 0 | 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| `/lessons` | نهاري | **0.0372** | **0.0066** | 0 → 0 | 0 → 0 | 2 → **0** |
| `/lessons` | ليلي | **0.0373** | **0.0067** | 0 → 0 | 0 → 0 | — |

- قفزات ارتفاع الشريط السفلي (62↔67px): 3 → **0**.
- البديل المعايَر: `error` → يعمل (Geeza Pro/Noto بمقاييس Amiri).
- زمن الوصول لإطار مستقر: الهيكل ثابت عند زوال شاشة الدخول (≈4.2s تحت الخنق)؛ ما يتغيّر بعدها هو الطلاء التدريجي لطبقات الهوية المؤجلة (ألوان/ظلال) حتى ≈10–12s، بلا إزاحات تخطيط تُذكر.

## المتبقي (موثّق، خارج نطاق هذا التغيير)

- `/`: عنوان الهيرو المُصيَّر مسبقًا يُستبدل بعنوان React بعد ≈140ms من زوال شاشة الدخول؛ العقدة الجديدة تُرسم بـAmiri (Chromium يستخدم خط `optional` المحمَّل للعقد الجديدة). الخطوة التالية: ربط إخفاء شاشة الدخول على `/` بتركيب الهيرو الحقيقي (يتطلب تعديل `mj-theme-boot` وتحديث hash الـCSP في `vercel.json`).
- `lrf-skel` (هيكل المسار) يزاح ≈6px عند وصول `final-release.css` (`.lrf-wrap{padding-block}`) — CLS ≈0.0066.
- `/prayer-times`: `body` يمر بلون شفاف لحظيًا بين سطحَي الإقلاع والصلاة (لون `html` نفسه ظاهر).
- سلسلة CSS الهوية المؤجلة (~60 ملفًا) ما زالت تعيد طلاء الألوان تدريجيًا؛ دمجها حزمةً واحدة مشروع مستقل.
- التحقق على جهاز iOS فعلي (WKWebView) مطلوب لتأكيد أسماء `local()` لـGeeza Pro.

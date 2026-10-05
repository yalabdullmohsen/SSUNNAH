# APP_VS_WEB_BOUNDARY — الفصل بين التطبيق الأصلي والموقع

> البوابة: `pnpm --filter @workspace/majalis run test:app-web-boundary`
> (`artifacts/majalis/src/lib/__tests__/app-web-boundary-gate.test.ts`)

## 1. الحقيقة المعمارية (بالدليل)

- تطبيق iOS غلاف Capacitor 8 يحمّل **الموقع الحيّ** `https://www.ssunnah.com`
  (`capacitor.config.ts` → `server.url`). أي أن **حزمة JavaScript واحدة** تعمل على الويب
  وداخل التطبيق؛ والفصل الفعلي وقت التشغيل يتم بكشف `window.Capacitor`.
- الملف المحلي الوحيد الذي يقرؤه التطبيق من حزمته هو صفحة الخطأ
  `server.errorPath = native-load-error.html` (تُحمَّل من `capacitor://localhost` عند تعذّر الشبكة —
  `CAPInstanceConfiguration.errorPathURL`). وهي مكتفية ذاتيًا (CSS/JS مضمّنان).
- قبل هذا التغيير كان `cap sync ios` ينسخ **كل** `dist/` (صفحات SEO المولّدة مسبقًا، sitemap/robots/feed،
  sw.js وmanifest، `data/` ‏~88MB، `fonts/` ‏~95MB، `audio/`…) إلى `ios/App/App/public`
  ولا يحذف منها إلا خطوط QPC (`native-strip-qpc-fonts`) — أي عشرات/مئات الميغابايت ميتة داخل IPA.

## 2. التصنيف

| الطبقة | أمثلة | الحارس |
|---|---|---|
| **ويب فقط** | Service Worker (`lib/service-worker.ts`، `public/sw.js`)، `PwaInstallBanner`، Web Push (`lib/push-notifications.ts`)، دعوة App Store (`IosAppCta`)، تذييل الموقع، صفحات SEO المولّدة، sitemap/robots/feed/manifest | `isWeb()` / `!isNative` + `IS_NATIVE_BUILD` |
| **تطبيق فقط** | StatusBar/Keyboard/Haptics/Browser/LocalNotifications (‏`@capacitor/*` باستيراد ديناميكي)، `purgeNativeWebRuntimeCaches`، حارس الروابط `installInAppNavigationGuard`، صفحة `native-load-error.html` | `isNativeApp()` / `isNative` |
| **مشترك** | كل الصفحات والمحتوى والمنطق | — |

## 3. وحدة الحدّ الواحدة — `src/lib/native-platform.ts`

- `isNativePlatform()` / `getNativePlatform()` — كشف وقت التشغيل عبر `window.Capacitor` بلا `@capacitor/core`.
- `BUILD_TARGET` / `IS_NATIVE_BUILD` — ثابت وقت البناء من `VITE_TARGET` (يعرّفه `vite.config.ts` عبر `define`
  دائمًا كنصّ ثابت → طيّ الشرط وحذف الفرع الميت).
- `isNativeApp()` = `IS_NATIVE_BUILD || isNativePlatform()`؛ `isWeb()` = نقيضه.
- `APP_HOSTS` / `isAppHost()` — قائمة نطاقاتنا الوحيدة (كانت مكررة في `capacitor-utils.ts` و`in-app-navigation.ts`).
- `capacitor-utils.ts` يبقى واجهة التوافق (`isNative`, `isNativeApp`, `openExternalUrl`, haptics).

قاعدة: وحدة ويب فقط تُستورد بـ`lazy(import())` محروسة بـ`import.meta.env.VITE_TARGET === "native" ? null : …` **مكتوبًا في موضع الاستخدام** (الثابت المستورد `IS_NATIVE_BUILD` لا يطويه Rollup عبر الوحدات — مُثبت بالقياس) وتُركَّب بشرط `!isNative`.

## 4. أوامر البناء لكل هدف

| الهدف | الأمر | المخرج |
|---|---|---|
| الموقع (Vercel) | `pnpm --filter @workspace/majalis run build` | `dist/` (كما هو، بلا تغيير) |
| غلاف iOS | `pnpm run prepare:ios` أو `pnpm run mobile:sync` أو workflows ‏`ios-native-macos.yml`/`ios-testflight-deploy.yml` | `cap sync ios` ← ينسخ `dist/` ثم **خطاف `capacitor:copy:after`** يشغّل `scripts/native-prune-web-only.mjs` |
| متغيّر البناء الأصلي (تحقق/مستقبل الحزمة المحلية) | `pnpm run build:native-variant` (بعد `build` لتوليد البيانات) | `dist-native/` (`VITE_TARGET=native`، لا يمسّ `dist/`) |

خطاف Capacitor يعمل تلقائيًا بعد كل `cap copy`/`cap sync` من أي مسار، فلا حاجة لتعديل كل سكربت/‏workflow.

## 5. الملفات المستبعدة من webDir الأصلي (`native-prune-web-only.mjs`)

- **وضع remote-shell** (الحالي — `server.url` مضبوط): يُبقى فقط
  `index.html` (شرط `cap`/‏`prepare-ios.sh`) + `native-load-error.html` + `cordova.js` + `cordova_plugins.js` + `plugins/` + `.gitkeep`.
  كل ما عداها يُحذف: `assets/`، صفحات المسارات المولّدة مسبقًا، `data/`، `fonts/`، `audio/`، `sounds/`، `brand/`،
  `sitemap*.xml`، `robots.txt`، `feed.xml`، `sw.js`، `quran-engine-sw.js`، الـmanifests، `offline.html`، `404.html`، `.well-known/`…
- **وضع local-bundle** (إن أُزيل `server.url` مستقبلًا): يُحذف ما هو ويب حصرًا فقط
  (`WEB_ONLY_FILES` + `sitemap-*.xml` + `*.map`) ويُبقى `assets/` و`data/`.
- أمان: يتوقّف بخطأ إن غابت صفحة الخطأ؛ `--dry-run` للتقرير فقط.

أصوات الأذان في `ios/App/App/Sounds` (خارج `public/`) لا تتأثر.

## 6. إصلاحات السياق الأصلي في الشيفرة المشتركة

- `window.open` لرابط خارجي داخل التطبيق كان يمرّ إلى `createWebViewWith` في Capacitor → `UIApplication.open` (يغادر التطبيق إلى Safari).
  الآن يُوجَّه إلى `openExternalUrl` (‏SFSafariViewController داخل التطبيق)؛ روابط نطاقنا تبقى تنقّلًا داخليًا.
- `NewMushafReader`: ‏`window.location.assign("/mushaf/bookmarks")` (إعادة تحميل كاملة للغلاف) → `navigateTo`.
- `PwaInstallBanner` لم يعد يُركَّب داخل التطبيق (كان يحمّل CSS وchunk بلا فائدة).
- دعوة «حمّل التطبيق» (`IosAppCta`) وعبارة رابط التحميل في «عن سُنّة» للموقع فقط.
- البوابة تمنع: إعادة التحميل الكامل لمسار داخلي، والروابط المطلقة لنطاقنا خارج لوحة الإدارة، وتكرار قائمة النطاقات.

## 7. إجراءات المالك / الجهاز المتبقية

1. تشغيل `pnpm run prepare:ios` على Mac ومراجعة سطر `native-prune-web-only: … قبل/بعد` ثم أرشفة في Xcode والتأكد من صغر IPA.
2. اختبار يدوي على جهاز: وضع الطيران عند الإقلاع → تظهر `native-load-error.html` وتعمل «إعادة المحاولة».
3. اختبار رابط خارجي (مصدر/موقع مؤسسة) → يفتح داخل التطبيق لا في Safari.
4. (قرار منتج) إن أُريد عمل التطبيق دون شبكة لاحقًا: إزالة `server.url` وبناء `build:native-variant` كـwebDir — الوضع local-bundle جاهز في السكربت.

# LINKS_AUDIT — جرد الروابط وعوائق النطاق (سُنّة 1.2.0)

> فُحصت الروابط بـ`curl -L` في 2026-10-16. أداة WebFetch لم تُستخدم، فما لم يُفحص بـcurl مكتوب «لم يُتحقق». لا تعديل على كود الويب ولا Swift في هذا الملف؛ التغييرات المطلوبة موثّقة أدناه لنوافذ أخرى.

## 1) الجدول

| الرابط / النطاق | أين يظهر | على ssunnah.com؟ | الحالة (2026-10-16) | الأثر |
|---|---|---|---|---|
| `yalabdullmohsen.github.io/sunnah-legal/privacy.html` | `APPSTORE_METADATA.md:14`، `OWNER_CHECKLIST.md:39`، `PRIVACY_CHECK.md:42` (رابط الخصوصية في ASC) | لا (GitHub Pages) | 200 | سليم |
| `yalabdullmohsen.github.io/sunnah-legal/support.html` | `APPSTORE_METADATA.md:13` (رابط الدعم في ASC) | لا | 200 | سليم |
| `…/sunnah-legal/terms.html` | لا يظهر في أي ملف | لا | **404** (لا صفحة شروط) | لا عائق: ASC لا يشترط رابط شروط لتطبيق مجاني بلا اشتراك |
| `https://www.ssunnah.com` (+ `ssunnah.com`, `majlisilm.com`, `www.majlisilm.com`) | `REVIEW_NOTES.md:14,17,32`؛ التطبيق: `RemoteTransport.swift:12,40`، `AccountTexts.swift:178` (`siteURL`)، `Route.swift:48-49`، `WebLinkPolicy.swift:25-26`، `SunnahPrayerDeepLink.swift:9`، `UpdatesView.swift:17`، `NativeShellGate.swift:20`، `NativeNotificationsGate.swift:10`؛ entitlements applinks (`SunnahApp.entitlements:7-10`) | نعم | **402 للنطاقات الأربعة** | انظر العوائق |
| `www.ssunnah.com/privacy` (يفتحه التطبيق من شاشات القانوني ومركز الخصوصية على `siteURL`) | `AccountLegalScreens`، `AccountPrivacyCenterScreen`، `PRIVACY_CHECK.md:46` | نعم | 402 | **عائق**: سياسة الخصوصية يجب أن تكون قابلة للفتح من داخل التطبيق (5.1.1(i)) |
| `www.ssunnah.com/api/*` و`/data/*` (محتوى جديد، تحديثات، اقتباسات) | `RemoteTransport.swift:53`، `REVIEW_NOTES.md:32` | نعم | 402 | المحتوى المضمّن يعمل دون اتصال؛ الجديد يعرض حالة فارغة. ليس عائقًا للمراجعة، لكنه يعطّل «المحتوى الجديد» |
| `info@ssunnah.com` (العنوان الرسمي بقرار يوسف)، `apple.review@ssunnah.com` | `AccountTexts.swift:177`، `REVIEW_NOTES.md:25` | بريد لا رابط | لم يُتحقق (بريد؛ يعتمد على MX للنطاق) | حساب المراجع في Supabase لا يحتاج بريدًا يعمل؛ بريد الدعم قد لا يصل إن عُلّق النطاق |
| `everyayah.com`, `mp3quran.net` (`server8.mp3quran.net`) | `AccountTexts.swift:352-353` (جدول الخوادم)؛ تشغيل التلاوة | لا | 200 | سليم، ويُذكر في فقرة الخصوصية (`PRIVACY_CHECK.md`) |

## 2) العوائق (ما يتوقف على النطاق المعلّق)

1. **رابط الخصوصية داخل التطبيق**: يفتح `www.ssunnah.com/privacy` ← 402. عائق للإطلاق (متطلب 5.1.1(i): إتاحة السياسة داخل التطبيق). رابط ASC نفسه سليم (GitHub Pages).
2. **نص REVIEW_NOTES**: يقول إن النصوص «منشورة من موقعنا www.ssunnah.com»؛ المراجع قد يفتحه فيجد 402. عدّل الصياغة أو أعد النطاق قبل الإرسال.
3. **Universal Links**: entitlements تعلن `applinks:` لأربعة نطاقات؛ ما دام النطاق معلّقًا لن تفتح روابط الويب التطبيق (لا تعطّل البناء).
4. **جلب المحتوى الحي** (`/api`, `/data`, `native-shell.json`, `native-notifications.json`): يفشل بـ402 وتسقط الشاشات إلى المضمّن/الفارغ.

## 3) بديل مقترح (قابل للاستضافة خارج Vercel)

| الحاجة | البديل | الجهد |
|---|---|---|
| سياسة الخصوصية والدعم داخل التطبيق | **GitHub Pages الموجودة فعلًا** (`yalabdullmohsen/sunnah-legal`): `privacy.html` و`support.html` تعملان (200) | تغيير ثابت واحد؛ لا حاجة لاستضافة جديدة |
| الأكثر صلابة | **شاشة داخل التطبيق** تعرض نص السياسة المضمّن (يعمل دون اتصال، ولا يسقط مع أي نطاق) مع الإبقاء على رابط GitHub Pages للنسخة الكاملة | شاشة نص واحدة (Swift) |
| `/api/*` الديناميكية | لا تُستضاف على GitHub Pages (ثابتة فقط). إما Supabase مباشرة (REST/Edge Functions) أو نطاق Vercel الأصلي `*.vercel.app` إن لم يكن معلّقًا، أو الإبقاء على المضمّن | قرار المالك |

## 4) ما يلزم لتغيير الروابط (لنوافذ أخرى، لم ينفَّذ هنا)

**التطبيق (Swift، نافذة صاحب الملفات):**
- `AccountTexts.swift:178` `siteURL` ← `https://yalabdullmohsen.github.io/sunnah-legal`، وشاشتا الخصوصية/الشروط تفتحان `…/privacy.html` بدل `/privacy` (التحقق من أن الفتح يتم بمسار `.html` لا بمسار نظيف؛ GitHub Pages لا يعيد كتابة المسارات).
- `AccountTexts.swift:177` `contactEmail`: ثابت واحد = `info@ssunnah.com` (العنوان الرسمي)؛ لا تغيير.
- `RemoteTransport.swift:12,40` و`WebLinkPolicy.swift:25-26`: إما ترك النطاق (يفشل بهدوء) أو تحويل `/api` إلى مضيف بديل بقرار المالك.
- `SunnahApp.entitlements:7-10`: لا تغيير إلزامي؛ أزل النطاقات المعلّقة إن أردت إيقاف تحقق AASA الفاشل.

**بيانات المتجر (ملفات توثيق هذا المسار، بعد قرار المالك):**
- `REVIEW_NOTES.md:14,17`: استبدل «من موقعنا www.ssunnah.com» بصياغة لا تعتمد على النطاق (مثلًا «محتوى مضمّن في التطبيق ومنقول دون تعديل من مصادره الموثّقة»)، وأزل البند `:32` حين يُحسم النطاق.
- `PRIVACY_CHECK.md:46`: حدّث سطر `siteURL` بعد تغيير Swift.
- `APPSTORE_METADATA.md:13-14` و`OWNER_CHECKLIST.md:39`: لا تغيير (سليمة).

## 5) ما لم يُتحقق
- فتح الروابط من جهاز/شبكة المراجع (فُحصت من جهاز المالك فقط).
- وجود MX عامل لـ`info@ssunnah.com`.
- محتوى `privacy.html` الحالي ومطابقته لـ`app-privacy.md` (يلزم مراجعة منفصلة).

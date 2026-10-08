# بناء TestFlight لقياس «تسميع» (داخلي)

شاشة القياس المخفية **تُجمَّع في البناء بشرط بناء** ولا تكتفي بالإخفاء:

| الطبقة | الشرط | في بناء App Store |
|---|---|---|
| Swift: أخذ عيّنات المعالج/الحرارة/البطارية، حفظ صوت الجلسة في الذاكرة، محاذاة الكلمات، `getBuildChannel` | `#if TASMEE_DIAGNOSTICS` | غير مُجمَّعة (نسخة مبسّطة لا تقرأ البطارية ولا الحرارة ولا الخيوط) |
| JS: مسار `/debug/tasmee` وبوابة النقر 7 مرات على رقم النسخة | `import.meta.env.DEV \|\| VITE_TASMEE_DIAGNOSTICS === "1"` (ثابت يُطوى عند التجميع) | تُحذف الصفحة والاستيراد الديناميكي من الحزمة |

`TASMEE_DIAGNOSTICS` مفعّل في إعداد Debug تلقائيًا. **بناء TestFlight يتم على CI فقط** بـXcode مستقر (يرفض سير العمل أي Xcode beta/RC؛ لا تُبنى أرشيفات TestFlight من Xcode التجريبي المحلي).

بناء قياس داخلي: Actions ← «iOS TestFlight Deploy» ← Run workflow ← `tasmee_diagnostics = true` (يضبط `VITE_TASMEE_DIAGNOSTICS=1` للويب و`TASMEE_DIAGNOSTICS=1` لـfastlane). وسوم `v*.*.*` تُبنى دائمًا **بلا** القياس.
محليًا للتجربة فقط (Debug على جهاز): Xcode Debug يفعّل التعريف تلقائيًا.

بناء App Store العادي: لا تُفعّل المتغيّرين. **لا ترسل بناء القياس لمراجعة App Store** (يُرفع لمجموعة TestFlight الداخلية فقط).

## فتح الشاشة على الجهاز
الإعدادات ← آخر الصفحة «النسخة الحالية» ← انقر 7 مرات متتابعة ← تُفتح «قياس التسميع». أدخل رابط manifest النموذج (من إصدار GitHub) ثم: تنزيل ← تحميل ← اختبار القدرة ← ابدأ الجلسة (١٠ دقائق افتراضيًا).
يُسجَّل لكل جلسة: التأخير (نهاية الكلمة ← الكشف)، نسبة الكشف، المعالج، thermalState، البطارية بداية/نهاية، أزمنة الفك. «نسخ JSON» لمشاركتها.

## رابط النموذج (بلا مصادقة)
`https://github.com/yalabdullmohsen/SSUNNAH/releases/download/whisper-quran-coreml-v1/model-manifest-base.json` (الأرشيف نحو 149MB، تحقّق sha256 داخل التطبيق).

## قبل تشغيل Workflow
- `gh run list --workflow "iOS TestFlight Deploy"` ولا تشغيل جارٍ، وإلا فلا `workflow_dispatch` (concurrency يلغي الجاري عند أي تشغيل جديد على نفس الـref).
- لا دمج في `ios/` أثناء التشغيل. لا رفع لـMARKETING_VERSION؛ CI يزيد رقم البناء.
- القناة تُكتشف بـ`sandboxReceipt`؛ خارج TestFlight/Debug تُغلق الشاشة (`isTasmeeDiagnosticsAllowed`).

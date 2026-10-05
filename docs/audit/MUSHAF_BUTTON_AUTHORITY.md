# سلطة الأزرار في المصحف — Mushaf Button Authority

**التاريخ:** 2026-10-05 · **البوابة:** `pnpm run test:mushaf-button-authority` (`src/lib/__tests__/mushaf-button-authority-gate.test.ts`)

## الهدف
تحويل كل وسوم `<button>` الخام في قارئ المصحف إلى `Button` الرسمي (`@/components/ui/button`) **بلا أي تغيير بصري**، دون مسّ منطق التقليب/الهندسة/الأقفال/الصوت أو بيانات القرآن.

## التصميم
- أصناف cva في `Button` خاملة في هذا التطبيق (لا `@import "tailwindcss"`) — لا قاعدة CSS تطابق `relative`/`inline-flex`/`hover-elevate`… (تحقّق بـ`rg` على `src/**/*.css`).
- الفرق الوحيد المقاس: غلاف `<span>` الذي يضعه `Button` حول الأبناء. الصنف `mushaf-btn` (المساعد `mushafButtonClass` في `src/features/mushaf-reader/mushaf-button-parity.ts`) مع القاعدة:
  ```css
  .mushaf-btn > span[class=""] { all: inherit; display: contents; }
  ```
  يجعل الغلاف شفافًا: أبناء الزر يعودون عناصر مباشرة في صندوقه، ولا تصل قواعد سلالية مثل `.mm-audio-dock__controls button span` إلى الغلاف.
- **موضع القاعدة:** `src/styles/interaction-states.css` (ملف قائم، يُحمَّل متزامنًا من `main.tsx`) — لا ملف CSS جديد (سقف cssFiles). عامّ لا محليّ لأن مكوّنات محوّلة تُركَّب خارج القارئ أيضًا: `MushafDisplayModeControl` في `/settings`، و`MushafAudioDock` عبر `QuranAudioPlayer`.
- **سمات Button الإضافية:** `data-ss-button`/`data-variant`/`data-size` لا يطابقها أي محدِّد CSS في `src/` (`data-slot="button"` في modern-ui-refresh.css لا يضعه Button). `aria-disabled="true"` عند التعطيل: القاعدة الوحيدة العامة (`dark-mode-surfaces.css`) تجمعه مع `:disabled` في نفس الإعلان (opacity 0.58) فالنتيجة مطابقة؛ والقاعدة الأخرى (`.lqp2-btn`) خارج المصحف.

## الملفات
| الملف | خام قبل | بعد |
|---|---|---|
| mushaf-reader: MushafPageArrows, MushafPageNumber, MushafDisplayModeControl, MushafPager, NewMushafReader, MushafControlsLayer | — | 0 |
| mushaf-madinah: MushafSearchSheet, MushafTafsirSheet, quran-sheet/QuranSheetShell, MushafAudioDock | — | 0 |
| mushaf-reader/MushafExitControl.tsx | 1 | 0 |
| mushaf-madinah/MushafSettingsSheet.tsx | 2 | 0 |
| mushaf-madinah/AyahActionSheet.tsx | 21 | 0 |
| mushaf-madinah/MushafControls.tsx | 10 | **10 — KEEP_JUSTIFIED** |

**MushafControls — KEEP_JUSTIFIED (LEGACY_UNMOUNTED):** يستورده `VerifiedMushafReader` و`mushaf-madinah/index.ts` فقط، ولا يستورد أيّ ملف خارج `src/features/mushaf-madinah/` (عدا الاختبارات) هذا البرميل؛ المسار الإنتاجي `/mushaf` = `MushafReaderPage → NewMushafReader` من `@/features/mushaf-reader`. لا مسار إنتاجي لقياس التكافؤ، فيبقى خامًا موثّقًا.
ملاحظة: `MushafExitControl` و`MushafSettingsSheet` و`AyahActionSheet` غير مركّبة إنتاجيًا كذلك (الأخيران عبر `VerifiedMushafReader` فقط، والأول بلا مستورد)، فتحويلها بلا أثر بصري بحكم البناء، وطُبّق عليها نفس عقد `mushafButtonClass` ليبقى سلوكها مطابقًا إن رُكّبت.

## دليل التكافؤ (computed style)
- **المنهج:** بناءان preview — BEFORE = `origin/main` (bd6eddec5) في worktree منفصل، AFTER = هذا الفرع — وPlaywright Chromium يقارن لكل `button` في الصفحة ولكل أبنائه (مع تسطيح غلاف Button) ولـ`::before`/`::after`: display، الأبعاد وmin/max، padding، margin، border (عرض/نمط/لون)، radius، background-color/image، color، font-family/size/weight/style، line-height، letter-spacing، gap، white-space، opacity، box-shadow، transform، position، z-index، inset، flex/grid، visibility، overflow، cursor، pointer-events، outline، text-decoration، vertical-align، box-sizing — إضافةً إلى `getBoundingClientRect`.
- **المصفوفة:** 390×844 و1280×800 × فاتح/داكن × السيناريوهات: فتح `/mushaf`، إظهار الشريط، لوحة «المزيد» (وتمريرها)، الإعدادات، البحث، الفهرس (158 زرًا)، شريط الصوت (dock)، الانتقال إلى صفحة (dial)، قائمة الآية (ضغط مطوّل)، ورقة التفسير من قائمة الآية، و`/settings` (بطاقات نمط العرض).
- **النتيجة:** 56 حالة (14 سيناريو × 4)، **صفر فروق** في الأنماط والمستطيلات لكل الأزرار المحوّلة وأبنائها.
  - حالة واحدة (`mobile/dark /settings`) أظهرت في تشغيلٍ إزاحة رأسية موحّدة 40px لكل العناصر وفي الاتجاهين بين تشغيلين (BEFORE أعلى مرة وأدنى مرة) دون أي فرق نمطي — محتوى غير متزامن أعلى الصفحة؛ أُعيدت 3 مرات متتالية: **0 فروق**.

## البوابات
- `test:mushaf-button-authority` (جديد): لا `<button` خام في الملفات المحوّلة، كل `Button` يمرّ عبر `mushafButtonClass`، KEEP=MushafControls (10)، قاعدة التكافؤ في interaction-states.css بلا `!important` ولا ملف CSS إضافي، و`interaction-system-inventory --check`.
- `closure-wave10-mushaf-controls-gate`: حُدّث شرط «raw مسموح في Chrome» إلى «Button رسمي + mushafButtonClass» مع حفظ القصد (أزرار مكتوبة النوع ومسمّاة).
- سقوف `reports/interaction-system-debt-budget.json`: `rawButtonFiles` 45→1، `rawButtonElements` 167→10 (القيم المقاسة).
- قائمة `test:mushaf-page-flip` كلها خضراء عدا `mushaf-audio-dock-dismiss-gate` — فاشلة على `origin/main` قبل هذا التغيير بنفس الرسالة (`onClose={() => {`)؛ وكذلك `test:mushaf-ayah-marks` و`test:mushaf-layout-bands` (مجلد artifacts مفقود) — سابقة وغير متعلقة.

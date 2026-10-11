# تسليم المصحف الأصلي (ن3 → ن4)

المصحف SwiftUI كامل (بلا WebView). الكود: `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/`.

## 1) توليد البيانات
`cd artifacts/majalis && node scripts/native/export-ios-data.mjs <out>` (≈150ث) ينتج `<out>/mushaf/{index.json,pages/NNN.json,fonts/pN.ttf}` و`MANIFEST.json` (sha256 لكل ملف + `mushafSources` لمصادر المستودع). تحويل woff2→TTF بـ`scripts/native/woff2-to-ttf.py` مع تحقق تساوي cmap وglyph وhmtx (الرسوم لا تُمسّ).

## 2) التضمين في Xcode
- أضف `<out>/mushaf` مرجعَ مجلد (blue folder) باسم `Data/mushaf` إلى Resources الهدف.
- الحجم: 188MB خام، ≈105MB مضغوطًا (zip) < 250MB ⇒ **تُحزَّم كلها بلا تنزيل**. إن ظهر في IPA الفعلي >250MB فالخطة البديلة: صفحات 1–20 مضمّنة والباقي بـURLSession في الخلفية ثم يعمل دون اتصال.

## 3) الربط بالمسار
`/quran` و`/mushaf` ← تبويب `.quran` (`AppTab.swift` / `TemplateRegistry`) ليعرض `MushafReaderView`.

## 4) البوابة الآلية (إلزامية قبل الدمج)
```
cd artifacts/majalis/ios/App/SunnahNative
MUSHAF_DATA=<out>/mushaf MUSHAF_SRC=<repo>/artifacts/majalis swift test --filter MushafGateTests
```
تقارن: 114 سورة، 6236 آية، 604 صفحة، كلمات كل صفحة وترتيبها وline_number وcode_v2، وsha256 للبيانات والخطوط مقابل المصدر، وحلّ كل glyph في خط صفحته. **الاختبار يُتخطّى بلا المتغيرين؛ التخطي ليس نجاحًا** — اضبطهما في CI.

## 5) ملاحظات بيانات
- 2:181 بلا علامة نهاية في المصدر (مسجَّل في MANUAL_OWNER_ACTION.md؛ لا تعديل).
- بعض `code_v2` فيها U+0020 (تُترك كما هي).
- معرّفات الكلمات غير رتيبة عبر الأسطر في 54 صفحة؛ الترتيب معتمد داخل السطر.

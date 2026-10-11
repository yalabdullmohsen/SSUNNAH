# قواعد الجلسات السحابية — تحويل «سُنّة» إلى SwiftUI

## 1) من أنت
جلسة سحابية مسؤولة عن **قسم واحد** في `docs/native/FEATURE_PARITY.md` لتحويل تطبيق «سُنّة» إلى SwiftUI كامل.
اقرأ أولًا (على فرع `native-app`):
- `docs/native/FEATURE_PARITY.md`
- `docs/native/ROUTE_TEMPLATE_MAP.json`
- `docs/native/DATA_CONTRACT.md`
- `docs/architecture/IOS_NATIVE_PROGRAM.md`
- كود الحزمة `artifacts/majalis/ios/App/SunnahNative` (`Sources/SunnahNative/Templates/`) والمولّد `artifacts/majalis/scripts/generate-native-screens.mjs`

معرّفات الأقسام (مجلد قسمك): `sirah` `aqidah` `fiqh` `library` `quran` `account` `learn` `hadith` `adhkar`.

## 2) ما تنفّذه
1. شغّل المولّد لقسمك (`--out` إلى مجلد مؤقت ثم انسخ ملفات قسمك فقط).
2. اكتب نماذج `Codable` ومحوّلات بيانات حسب `DATA_CONTRACT.md`.
3. اكتب الشاشات الخاصة التي لا يناسبها قالب.
4. اكتب اختبارات وحدة.

## 3) أين تكتب
- فقط داخل `Sources/SunnahNative/Sections/<قسمك>/` و`Tests/` — **بملفات جديدة**.
- لا تعدّل `ScreenTemplate` ولا `AppRouter` ولا الرموز (Design) ولا أي ملف مشترك.
- لا لون ولا مسافة ولا خط مكتوبًا يدويًا: `Sunnah.*` فقط.

## 4) نقص في قالب
اكتبه في `docs/native/requests/<قسمك>.md` لـن2 ولا تعدّل القالب.

## 5) التسليم
- ادفع على فرع `native-section/<قسمك>` وافتح PR بوسم `native-section`.
- لا تؤشّر `[x]` في الجرد: ن4 تؤشّر بعد البناء والفحص.

## 6) لا بناء هنا
لا تستطيع بناء SwiftUI في جلستك: اكتب بحذر، وأرفق في وصف الـPR قائمة بما لم تتحقق منه. أخطاء البناء تصلك تعليقًا من ن4 على الـPR فأصلحها.

## 7) المحتوى
لا محتوى شرعيًا جديدًا. كل النصوص من الملفات المحزومة فقط، وما لم يُصدَّق في التصدير لا يُعرض. نصوص الخصوصية والتراخيص تُنقل حرفيًا.

## قبول الـPR (ن4)
ملف مشترك معدَّل ⇒ لا يُدمج إلا من ن2 أو ن3. دفعات البناء كل 3–4 ساعات: دمج PRs الموسومة `native-section` في فرع مؤقت وبناء تحت القفل؛ الناجح يُدمج ويُؤشَّر `[x]` ويُحدَّث `native-progress`.

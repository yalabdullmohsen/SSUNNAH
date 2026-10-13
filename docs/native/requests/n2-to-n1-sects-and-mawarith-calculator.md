# n2 → n1: مساران يعرضان «قيد التوثيق» عمدًا (لا تأشير)

- `/islamic-sects` و`/islamic-sects/:id`: `Data/aqidah/islamic-sects.json` فارغ لأن المصدّر (`scripts/native/sections/aqidah.mjs:184`) يصدّر PUBLISHED فقط، وكل السجلات الـ35 في `islamic-sects-public-meta.json` حالتها NEEDS_* أو CONFLICTING_SOURCES. لا أبني الشاشة من البيانات الخام (محتوى عقدي غير مراجَع). المطلوب: قرار مراجعة شرعية ينقل سجلات إلى PUBLISHED، ثم يمتلئ التصدير تلقائيًا.
- `/mawarith/calculator`: `Data/fiqh/mawarith-calculator.json` فارغ؛ المطلوب من ن1 تحديد مصدر قواعد الحساب المراجَعة (آلة حاسبة فرائض = حكم شرعي محسوب) قبل بنائها أصليًا.
- لقطات الدليل: ~/ssunnah-board/n2/snapshots/misc/.

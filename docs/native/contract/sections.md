## 6) أقسام التصدير (`scripts/native/sections/*.mjs`)
كل قسم ملف مستقل يُحمَّل تلقائيًا قبل كتابة المنافيست (`export-ios-data.mjs` يشغَّل عبر `node --import tsx`). الإخراج في `ios-native/Data/<قسم>/<اسم>.json` بالأسماء التي يتوقعها كود SunnahNative.


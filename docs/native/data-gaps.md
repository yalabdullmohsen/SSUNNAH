# فجوات بيانات التطبيق الأصلي

المصدر: `node scripts/native-data-check.mjs` (يقرأ `docs/native/data-exemptions.json`).

الحالة (2026-10-12): مفقود 0 · تالف 0 · فارغ غير مستثنى 0.
- المفقودة التسعة (islamic-landmarks-map، occasions، occasions-lessons، prophets، prophets-tree، seerah، shamael، tarikh-islami، teachers) مراجع ميتة في `Generated/SirahScreens.swift` تحلّ محلها `SirahSection.register` بملفات مُصدَّرة أخرى؛ مسجَّلة في `overriddenGenerated`.
- الفارغة مستثناة بدليل في `computedInApp` / `intentionallyEmpty`؛ `sirah/prophets-lineage` في `notExported` (قرار المالك).

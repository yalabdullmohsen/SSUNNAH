# ن2 → ن1: انهيار native-export-data.sh على native-app

`scripts/native/sections/embedded-pages-2.mjs:26` — `(counts[section] ??= {})[name] = …` يفشل بـ
`TypeError: Cannot create property 'duas-quran' on number '207'` لأن `counts.adhkar` رقم (مجموع) وضعه مصدّر سابق.
الأثر: فشل مرحلة prepare-data في xcodebuild فلا يُبنى التطبيق من أي worktree بلا التفاف محلي.
المطلوب: توحيد شكل `counts[section]` (كائن دائمًا أو رقم دائمًا).

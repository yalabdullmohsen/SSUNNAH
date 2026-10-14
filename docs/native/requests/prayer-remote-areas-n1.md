# مرجع الأوقاف (ن1)

إحداثيات السالمي والصبية وكبد ومبارك الكبير جُلبت من OSM (المصدر بجانب كل إحداثية في `ReferenceCities.swift`).
تقويم الأوقاف: يُحوَّل ملف الوزارة بـ`node scripts/native-awqaf-to-json.mjs <ملف.csv|.xlsx.csv> <out>` إلى `Tests/SunnahPrayerTests/Resources/awqaf-calendar.json` ثم `swift test --filter KuwaitAreasTests` (±1د). السكربت يقبل CSV (صدّر Excel/PDF-table إلى CSV أولًا).

# فجوات بيانات التطبيق الأصلي

مصدر القائمة: `node scripts/native-data-check.mjs` على تصدير كامل جديد (`NATIVE_DATA_DIR=<out>`)، بعد الاستثناءات في `docs/native/data-exemptions.json`. البيانات المُلتزَمة في `ios-native/Data` قد تكون قديمة؛ التصدير الجديد هو المرجع.

## WARN-EMPTY — للأخذ من ن1 أو ن4 (7؛ 6 بعد #3042)
- [ ] `aqidah/discover-islam-contact.json`
- [ ] `library/academic-research-assistant.json`
- [ ] `library/academic-research-submit.json`
- [ ] `library/islamic-directory.json`
- [x] `library/sources.json` — صُدِّر في #3042 (56 مصدرًا)
- [ ] `sirah/seerah-phases.json`
- [ ] `sirah/shamail.json`

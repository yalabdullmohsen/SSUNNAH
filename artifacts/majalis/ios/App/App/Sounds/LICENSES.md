# تراخيص ملفات الصوت (iOS)

> **قاعدة:** لا يُضاف ملف صوت دون سطر هنا فيه المصدر والترخيص. لا يُخمَّن ترخيص. الحالة «غير موثّق» = **حاجب للإصدار** حتى يؤكّد المالك المصدر أو يُستبدل الملف بمرخّص.

| الملف | المصدر | الترخيص | الحالة |
|---|---|---|---|
| adhan-seq-makkah-01…04.caf | تسجيل أذان مكة — مشتق من `public/audio/adhan` (مستودع `mohsalvi/adhan-audio`) | بلا ترخيص معلن في المستودع | غير موثّق — حاجب |
| adhan-short-makkah.caf, adhan-short-makkah-fajr.caf | مشتق من `public/audio/adhan` (مستودع `mohsalvi/adhan-audio`) | بلا ترخيص معلن | غير موثّق — حاجب |
| adhan-short-egypt.caf, adhan-short-aqsa.caf, adhan-short-takbeerat.caf | مشتق من `public/audio/adhan` (مستودع `mohsalvi/adhan-audio`) | بلا ترخيص معلن | غير موثّق — حاجب |
| adhan-short-field.caf, adhan-short-field-full.caf | مشتق من `public/audio/adhan` | غير معلن | غير موثّق — حاجب |
| prayer_*.caf (aqsa, clear, default, egypt, makkah, quiet, soft, takbeerat) | مشتقة من ملفات الأذان أعلاه أو مولَّدة | غير موثّق | غير موثّق — حاجب |
| tone-chime, tone-fajr, tone-nada, tone-nasim, tone-qatra | نغمات التطبيق | غير موثّق | غير موثّق — حاجب |
| alarm-clear, prayer-alert, short-ring, soft-ring | نغمات تنبيه قصيرة | غير موثّق | غير موثّق — حاجب |

## ملفات ناقصة (placeholders — بانتظار ملفات مرخّصة من المالك)

- أصوات أذكار بصوت رجل (صباح/مساء/بعد الصلاة): **غير موجودة**؛ التذكير يستخدم النغمات أعلاه.
- أذان الفجر المنفصل: `adhan-short-makkah-fajr.caf` موجود لكنه غير موثّق الترخيص.

## قيود التحويل
`afconvert -f caff -d ima4 -c 1 in.wav out.caf` — الحد ≤29 ثانية، والتحقق: `afinfo out.caf`.

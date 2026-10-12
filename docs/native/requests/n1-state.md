# حالة ن1 (2026-10-12)

## حزمة المتجر (قبل /clear)
- #3050 (حزمة 1.2.0) و#3055 (lane native_release + OWN-01 مغلق) مدموجان. PR التالي: دعم مفتاح ASC بـPATH أو Base64 في native_beta/native_release، سكربت لقطات `ios-native/scripts/capture-store-screenshots.sh` + `docs/native/store/SCREENSHOTS.md` (لم يُشغَّل؛ ن4 بعد بناء Release)، فحص رابط الخصوصية (سليم: /privacy على www.ssunnah.com).
- لا طلبات تصدير جديدة من ن2 في docs/native/requests/ حتى الآن (آخر تعديل للمجلد #3044).
- بانتظار المالك/ن4: تشغيل `native_release` dry-run ثم `submit:true`؛ App Privacy وPrivacy Policy URL يدويًا؛ ن4: حذف NSMicrophone/NSMotion غير المستعملين وaps-environment عند التصدير.


## صُدِّر (مدموج)
- learn: institutions 44 (قيد المراجعة بلا إخفاء)، durus-imaniyya 205، durus-mutanawwia 372، sirah/fikr-waqia 105، fawaid 1128، annual-courses 63 (#3010)
- quran/ulum-quran 79 (#3012)
- quran-tracks: tilawa-reciters وcircles (#3031)
- فحص اقتباسات القرآن (#3035): توثيق فقط في docs/native/QURAN_QUOTE_FIXES.md؛ لا تعديل لنص شرعي، والتطبيق يطابق الموقع حرفيًا
- fiqh: sujood-sahw 8، arkan 5، arkan-iman 6، fadail-aamal 108، tawba 51، fiqh-qawaid 58 (#3017)

## فارغ مقصود (مسجَّل في DATA_CONTRACT)
- worship، mawarith-calculator، prayer-times: محسوبة داخل التطبيق
- competitions: لا مسابقات حاليًا
- islamic-sects: 35 سجلًا NEEDS_* غير منشورة في الموقع

## خارج نطاقي
- library (مُصدَّرة من ن4 على main) والأقسام الصغيرة (ن4)، seerah-phases وshamail (ن3)
- 852 سؤالًا بلا مرجع، و471 قصة بلا مصادر: بانتظار المالك

## المتبقي عندي
- حساب نسبتي من 212، مراجعة PRs بوسم native-section؛ لا بنود تطبيق أصلي في docs/program/BACKLOG.md

# تدقيق قابلية تشغيل التلاوات

- **التاريخ:** 2026-10-05 (فحص عميق `2026-10-05T14:02:30Z`).
- **طلب المالك:** «احذف التلاوات التي لا تعمل».
- **الأداة:** `node artifacts/majalis/scripts/audit-reciters-playability.mjs [--deep] [--json out.json]` (شبكي، ليس ضمن مسار CI الإلزامي).
- **البوابة الساكنة:** `pnpm --filter @workspace/majalis run test:reciters-catalog-integrity`.

## المنهجية

يبني السكربت الروابط نفسها التي يطلبها التطبيق من `src/lib/quran-audio.ts`:

| المصدر | النمط | الاستخدام في التطبيق |
|---|---|---|
| everyayah (آية-بآية) | `https://everyayah.com/data/{folder}/{SSS}{AAA}.mp3` | المصحف، شريط التشغيل، المشغّل المصغّر |
| islamic.network (احتياط آية) | `https://cdn.islamic.network/quran/audio/{bitrate}/{edition}/{global}.mp3` | `listAyahAudioUrls` عند فشل everyayah |
| mp3quran (سورة كاملة) | `{surahBaseUrl}/{SSS}.mp3` | تشغيل السورة، التنزيل دون اتصال (`ReciterDownloadManager`) |

لكل رابط: `GET` مع `Range: bytes=0-1023`، تتبّع التحويلات، مهلة 10ث، محاولتان إضافيتان. يُعدّ ناجحًا إن كانت الحالة 200/206 ونوع المحتوى `audio/*` وأول البايتات بصمة MP3 (ID3 أو frame sync) والرابط النهائي https.

- **العيّنة الافتراضية:** آيات 1:1، 1:7، 2:255، 2:286، 18:1، 112:1، 114:6؛ وسور 1، 2، 18، 112، 114.
- **الفحص العميق (`--deep`):** أول وآخر آية من كل سورة (229 رابطًا لكل قارئ) + السور الـ114 كاملة.
- **CORS:** everyayah وmp3quran يعيدان `Access-Control-Allow-Origin: *`. islamic.network لا يعيد ترويسة CORS، وهذا لا يضر لأن التشغيل يمر عبر عنصر `<audio>` (لا WebAudio ولا `crossOrigin`)، والتنزيل (`fetch`) يستعمل mp3quran فقط.
- **المحتوى المختلط:** كل الروابط https.

## النتائج (فحص عميق، قبل الإصلاح)

«معروض» = ضمن القائمة المُحقَّقة (`audio-registry.json` / `DEFAULT_VERIFIED_RECITER_IDS`) في منتقيات المصحف والإعدادات. كل الروابط الناجحة أعادت `206 audio/mpeg`.

| المعرّف | القارئ | معروض | آية everyayah | احتياط islamic.network (قبل) | سورة mp3quran | احتياط islamic.network (بعد) |
|---|---|---|---|---|---|---|
| dosari | ياسر الدوسري | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| ali_jaber | علي جابر | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| abdulsamad | عبد الباسط عبد الصمد | نعم | WORKS 229/229 | **BROKEN 0/7 (403)** | WORKS 114/114 | WORKS 7/7 (`192/ar.abdulbasitmurattal`) |
| minshawi | محمد صديق المنشاوي | نعم | WORKS 229/229 | WORKS 7/7 | WORKS 114/114 | WORKS 7/7 |
| husary | محمود خليل الحصري | نعم | WORKS 229/229 | WORKS 7/7 | WORKS 114/114 | WORKS 7/7 |
| alafasy | مشاري راشد العفاسي | نعم | WORKS 229/229 | WORKS 7/7 | WORKS 114/114 | WORKS 7/7 |
| ghamdi | سعد الغامدي | لا | WORKS 229/229 | **BROKEN 0/7 (403)** | WORKS 114/114 | محذوف (لا معدّل عامل) |
| maher | ماهر المعيقلي | نعم | WORKS 229/229 | WORKS 7/7 | WORKS 114/114 | WORKS 7/7 |
| sudais | عبد الرحمن السديس | نعم | WORKS 229/229 | **BROKEN 0/7 (403)** | WORKS 114/114 | WORKS 7/7 (`192/…`) |
| shuraim | سعود الشريم | نعم | WORKS 229/229 | **BROKEN 0/7 (403)** | WORKS 114/114 | WORKS 7/7 (`64/…`) |
| ajamy | أحمد بن علي العجمي | لا | WORKS 229/229 | WORKS 7/7 | WORKS 114/114 | WORKS 7/7 |
| qatami | ناصر القطامي | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| shatri | أبو بكر الشاطري | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| balilah | بندر بليلة | لا | (سورة فقط) | — | WORKS 114/114 | — |
| jaleel | خالد الجليل | لا | (سورة فقط) | — | WORKS 114/114 | — |
| abkar | إدريس أبكر | لا | (سورة فقط) | — | WORKS 114/114 | — |
| fares | فارس عباد | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| rifai | هاني الرفاعي | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| hudhaify | علي بن عبد الرحمن الحذيفي | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| ayyoub | محمد أيوب | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| jibreel | محمد جبريل | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| basfar | عبد الله بصفر | نعم | WORKS 229/229 | — | WORKS 114/114 | — |
| mustafa_ismail | مصطفى إسماعيل | لا | **PARTIAL 142/229 (87× 404)** | — | WORKS 114/114 | سورة فقط |
| tablawi | محمد محمود الطبلاوي | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| budair | صلاح البدير | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| qasim | عبد المحسن القاسم | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| matrood | عبد الله المطرود | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| akhdar | إبراهيم الأخضر | لا | WORKS 229/229 | — | WORKS 114/114 | — |
| bukhatir | صلاح بو خاطر | لا | WORKS 229/229 | — | WORKS 114/114 | — |

### الأدلة على الأعطال

- islamic.network بمعدّل 128: `403 application/xml` لكل من `ar.abdulsamad` و`ar.ghamadi` و`ar.abdurrahmaansudais` و`ar.saoodshuraym` (مثال: `https://cdn.islamic.network/quran/audio/128/ar.abdulsamad/262.mp3`). المعدّلات العاملة المُتحقَّقة (206): `ar.abdulbasitmurattal` 64/192، `ar.abdurrahmaansudais` 64/192، `ar.saoodshuraym` 64. لا معدّل عامل لـ`ar.ghamadi` (32/40/48/64/128/192 كلها فشلت).
- everyayah `Mustafa_Ismail_48kbps`: 404 `text/html` للسور 3–45 تقريبًا، ولـ18:110 و74:56 (مثال: `https://everyayah.com/data/Mustafa_Ismail_48kbps/018001.mp3`). لا مجلد بديل على everyayah لهذا القارئ.

## ما تغيّر

1. **احتياط islamic.network** (`ISLAMIC_NETWORK_EDITION`): صار كل مدخل يحمل المعدّل (`{bitrate}/{edition}`). عبد الباسط ← `192/ar.abdulbasitmurattal` (يطابق تسجيل المرتّل في everyayah)، السديس ← `192`، الشريم ← `64`. حُذف الغامدي (403 بكل المعدّلات)، وحُذف مدخل `abdulbasitmurattal` اليتيم (لا قارئ بهذا المعرّف). بهذا لا يُجرَّب رابط ميت قبل الانتقال للتالي.
2. **مصطفى إسماعيل:** أُزيل مصدر آية-بآية (`everyayahFolder: null`) لأنه جزئي ولا بديل موثوق. يبقى في وضع السورة الكاملة (mp3quran يعمل 114/114)، فلا يظهر في منتقيات آية-بآية.
3. **ترحيل التفضيل عند القراءة:** `RETIRED_AYAH_RECITER_IDS` + `migrateStoredReciterId` في `quran-audio.ts`. يُستعمل في `loadReciterId` (مفتاح `mj-quran-reciter-v3` في localStorage، ويكتب القيمة المُرحَّلة) وفي `QuranEngineContext.hydratePreferences` (`preferredReciterId` في IndexedDB). أي معرّف مُزال أو غير مُحقَّق يُرحَّل إلى القارئ الافتراضي المُحقَّق.
4. **التكرار:** لا معرّفات مكرّرة ولا مجلدات/روابط مكرّرة في `RECITERS` و`audio-registry.json` وكتالوج المرتّل. البوابة تمنع عودتها.

لم يُحذف أي قارئ معروض، فكل القرّاء الـ13 المُحقَّقين يعملون كاملًا في المصدرين الأساسيين. لم يُمسّ نص القرآن ولا تعيينه.

## ملاحظة خارج النطاق

`mapReciterToQuranComRecitation` في `src/lib/surah-ayah-timing.ts` تخص توقيتات التزامن فقط، لا الصوت. فيها المفتاح `shuraym` (المعرّف الفعلي `shuraim`) وأرقام تلاوات قد لا تطابق quran.com. تُركت دون تعديل لأنها لا تؤثر في تشغيل الصوت، وتحتاج مراجعة مستقلة.

# تقييم المصادر الإسلامية الخارجية — سُنّة

**التاريخ:** 2026-10-06 · **النوع:** تقرير فقط (لا تغيير في كود المنتج)
**مرجع القرارات المعلّقة:** [`LICENSE_DECISION_MATRIX.md`](./LICENSE_DECISION_MATRIX.md) · [`/LICENSE_RISKS.md`](../../LICENSE_RISKS.md) · [`docs/release/OWNER_ACTIONS_CURRENT.md`](../release/OWNER_ACTIONS_CURRENT.md)

> **تنبيه حاكم:** لا يُبدَّل أي مصدر ولا يُفعَّل أي تكامل إلا بعد موافقة المالك **بندًا بندًا**. هذا التقرير يصنّف ويقترح فقط، ولا يقرّر قانونيًا. لا يمسّ هذا العمل نص القرآن أو خرائطه، ولا حساب أوقات الصلاة، ولا جدولة الأذان.

## سياق المنتج (مُتحقَّق منه في المستودع)

- **التطبيق مجاني، وليس فيه إعلانات ولا مشتريات داخلية.**
  - لا يوجد StoreKit ولا AdMob ولا RevenueCat ولا Stripe، لا في `artifacts/majalis/src` ولا في `package.json`.
  - البوابة `src/lib/__tests__/header-ad-gate.test.ts` تتحقق من **غياب** `adsbygoogle`.
- **غلاف iOS بعيد:** `capacitor.config.ts` يضبط `server.url = https://www.ssunnah.com`. معنى ذلك أن «الحزمة» داخل التطبيق هي الويب الحي، والتخزين دون اتصال يعتمد على تخزين الويب. التفاصيل في [`FEATURE_IMPROVEMENTS_EVALUATION.md`](./FEATURE_IMPROVEMENTS_EVALUATION.md).
- **البنود المعلّقة التي يحاول هذا التقرير حلّها:**
  - خطوط QPC V2 (`/fonts/qpc-v2/pN.woff2` في `src/features/mushaf-shared/useQpcPageFont.ts`).
  - طبعة حصن المسلم.
  - حزم everyayah وmp3quran للاستماع دون اتصال.
  - حزم الأذان.

## منهجية الأدلة

- كل ترخيص منقول من الموقع الرسمي، مع رابطه وتاريخ قراءته (2026-10-06).
- إذا كان الموقع الرسمي غير متاح أو كانت شروطه غير منشورة، يُكتب ذلك صراحة **ولا يُخمَّن الترخيص**.

---

## 1) Quran Foundation API (‏quran.com API v4 / ‏api.quran.foundation)

- **ما يقدّمه:** نص القرآن، والتراجم، والتفاسير، والتلاوات، والصفحات والأجزاء، وخطوط المصحف وصوره، ومزامنة المحتوى (Content Sync).
- **الشروط الحالية:** [Developer Terms](https://api-docs.quran.foundation/legal/developer-terms/)
  - الترخيص: «non-exclusive, revocable, non-transferable, non-sublicensable license to access and use the APIs solely to develop and operate Applications».
  - الاستخدام التجاري مسموح: «A Developer may charge for an Application, offer subscriptions or in-app purchases, display advertising…».
  - الإسناد: «credits Quran Foundation in a reasonably accessible place».
  - **التخزين المؤقت محدود.** محظور: «Cache or store QF Content longer than 1 week unless it is obtained and maintained through the Content Sync APIs». ومن يستخدم المزامنة: «perform a next sync at least every 7 days».
  - **الخطوط والصور:** «A Developer may cache or bundle font files and Mushaf images obtained through QF APIs … for use in an Application if the Developer maintains an active account».
  - عدم التعديل: «The text of the Quran is not modified in any way».
  - حدود المعدّل: يُحظر «Exceed published rate limits or quotas».
  - يُحظر بناء نماذج تعلّم آلي من المحتوى دون إذن كتابي.
  - الإيقاف: «QF may suspend or revoke Developer's API credentials … if Developer breaches these Terms».
- **المتطلبات:** [Quickstart](https://api-docs.quran.foundation/docs/quickstart/)
  - تسجيل في [Developer Console](https://dev-console.quran.foundation/projects).
  - تطبيق «Backend/server app» بمعرّفَي `client_id` و`client_secret` (OAuth2 client credentials).
  - يبدأ التطبيق في بيئة pre-live، ثم ينتقل إلى الإنتاج بعد موافقة على الصلاحيات.
  - التكلفة **غير مذكورة** في صفحة البدء.
  - **السرّ لا يوضع في العميل.** يلزم وكيل خادم (Vercel API) يحمل الرمز.
- **في متجر App Store:** مسموح بالشروط أعلاه: إسناد ظاهر، وعدم تعديل، والالتزام بقيد الأسبوع للتخزين.
- **ما يحلّه في المشروع:**
  - **خطوط QPC:** النص يجيز صراحة «bundle font files … obtained through QF APIs» بشرط حساب نشط. هذا **مسار ترخيص موثّق** لبند خطوط QPC/QUL في المصفوفة، إذا جلبنا الخطوط عبر QF API بحساب مسجّل.
    - يبقى قرار المالك واجبًا: هل يكفي هذا النص بديلًا عن الإذن الكتابي من KFGQPC؟ يُنصح بتأكيد بريدي من `developers@quran.com`.
  - **التفاسير والتراجم:** يستخدمها التطبيق اليوم عبر `https://api.quran.com/api/v4`، في `src/lib/quran-data/fetch-ayah-content.ts` و`tafsir-editions.ts`.
    - هذا الاستدعاء بلا مصادقة على النطاق القديم.
    - المسار الرسمي الحالي هو `apis.quran.foundation` مع OAuth2.
    - **حالة النطاق القديم:** لم تذكر الصفحة الرسمية أنه مُهمل، لكنه ما زال يعمل (فُحص حيًّا: HTTP 200).
- **المخاطر:**
  - قيد تخزين أسبوع واحد يمنع حزم تفاسير كاملة دون اتصال إلا عبر Content Sync.
  - الانتقال إلى OAuth يتطلب وكيل خادم.
  - الترخيص قابل للإلغاء.
- **التكلفة والجهد:** تسجيل مجاني ظاهريًا (التكلفة غير منشورة)، وجهد متوسط: وكيل OAuth ونقل النقاط الطرفية.

## 2) نص Tanzil

- **ما يقدّمه:** نص المصحف بروايات وصيغ متعددة (عثماني، إملائي).
- **الشروط:** [tanzil.net/docs/text_license](https://tanzil.net/docs/text_license)
  - الترخيص: Creative Commons Attribution 3.0.
  - «Permission is granted to copy and distribute verbatim copies of this text, but CHANGING IT IS NOT ALLOWED.»
  - الإسناد شرط: «its source (Tanzil Project) is clearly indicated, and a link is made to tanzil.net».
  - يجب إدراج إشعار الحقوق في كل نسخة.
- **في المتجر:** مسموح، وكذلك الحزم دون اتصال، بشرط النقل الحرفي والإسناد والرابط.
- **ما يحلّه:** مرجع نصي حرّ للبحث والمطابقة وللوضع دون اتصال.
  - المستودع يشير إليه أصلًا: طبعة `quran-warsh-tanzil` في `src/lib/quran-api.ts:552`، وصفحة `SourcesLicensesPage`.
  - **لا يحلّ مشكلة الخطوط:** نص Tanzil يُعرض بخط Unicode وليس بخط QPC الصفحي.
- **المخاطر:** منخفضة. **لا يُستبدل نص المصحف الحالي** (خارج النطاق).

## 3) خطوط مجمع الملك فهد (KFGQPC) بديلًا لخطوط QPC

- **ما يقدّمه:** خط «KFGQPC Uthmanic Script HAFS» (خط Unicode واحد)، وخطوط QPC V1/V2 الصفحية (604 خطوط).
- **الشروط:**
  - **الموقع الرسمي `fonts.qurancomplex.gov.sa` تعذّر الوصول إليه** يوم الفحص (ECONNREFUSED)، وكذلك `qurancomplex.gov.sa`. لذلك لم يُقرأ الترخيص من مصدره الرسمي.
  - النص المضمَّن في ملف الخط، كما نقلته [ScanCode LicenseDB](https://scancode-licensedb.aboutcode.org/kfgqpc-uthmanic-script-hafs.html) (مصدر ثانوي): «This Font is the property of King Fahd Glorious Quran Printing Complex, and may not be reproduced, modified without the express written approval of King Fahd Glorious Quran Printing Complex.»
  - تنقل مصادر ثانوية أخرى صيغة تجيز «Use, Copy, Distribute» مجانًا، مع منع البيع والتعديل. **هذا غير مؤكَّد من المصدر الرسمي.**
  - [QUL](https://qul.tarteel.ai/resources/font/245) يصف خط Hafs بأنه «Official Uthmani script font released by the Quran Complex». **لا تذكر الصفحة ترخيصًا محددًا.**
- **في المتجر:** **غير واضح.** الصياغتان المنقولتان تتعارضان: إحداهما تشترط موافقة كتابية للنسخ، والأخرى تجيز التوزيع المجاني دون تعديل.
- **ما يحلّه:** هو نفس جهة الحقوق لخطوط QPC الحالية. **استبدال V2 بخط Hafs الموحّد لا يُسقط الحاجة إلى الإذن**، ويغيّر تخطيط المصحف الصفحي (خارج النطاق).
- **التوصية:** طلب إذن كتابي من المجمع، أو الاعتماد على بند «bundle font files» في شروط QF (المصدر 1).
- **المخاطر:** عالية حتى يصل نص رسمي.

## 4) ‏Sunnah.com API (الحديث مع الدرجة)

- **ما يقدّمه:** كتب الحديث بالعربية والإنجليزية، ودرجات الأحاديث.
- **الشروط:**
  - **صفحة [sunnah.com/developers](https://sunnah.com/developers) أعادت 403** للأدوات الآلية، ولم تعرض [وثائق Stoplight](https://sunnah.stoplight.io/docs/api/) نص الشروط.
  - المفتاح يُطلب بفتح Issue في [github.com/sunnah-com/api](https://github.com/sunnah-com/api)، ويُرسَل في ترويسة `X-API-Key`.
  - ملف README في المستودع **لا يحتوي شروط ترخيص البيانات.**
  - تتكرر في قوالب طلبات المفتاح عبارات مثل «Mass reproduction of the collections is not permitted». **هذه ليست وثيقة رسمية موقَّعة.** النتيجة: الشروط **غير واضحة رسميًا**.
- **في المتجر:**
  - الاستدعاء الحي بمفتاح مع إسناد ورابط: محتمل.
  - الحزم دون اتصال أو النسخ الجماعي: **غير مسموح على الأرجح.** يلزم تأكيد كتابي.
- **ما يحلّه:** درجات الأحاديث من مصدر مشهور.
  - المستودع يستخدم اليوم `cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1` (`src/lib/hadith-cdn-service.ts`).
- **المتطلبات:** مفتاح عبر GitHub Issue. يُحفظ في الخادم لا في العميل.
- **المخاطر:** متوسطة إلى عالية: مفتاح فردي قد يُسحب، وشروط غير منشورة.

## 5) مكتبة Adhan ‏(adhan-js) — مرجع لاختبارات أوقات الصلاة فقط

- **ما تقدّمه:** حساب أوقات الصلاة بطرق متعددة، والقبلة.
- **الشروط:** [github.com/batoulapps/adhan-js](https://github.com/batoulapps/adhan-js): «Adhan is available under the MIT license.»
- **في المتجر:** مسموحة (MIT مع إبقاء إشعار الترخيص).
- **حالتها في المستودع:**
  - مذكورة تبعيةً `"adhan": "^4.4.4"` في `artifacts/majalis/package.json:959`.
  - **لا يستوردها أي ملف** (البحث عن `from 'adhan'` في `src` و`lib` لم يُرجع شيئًا).
- **ما تحلّه:** **مرجع مستقل في الاختبارات فقط**، لمقارنة مخرجات `src/lib/prayer-time-engine.ts` ضمن هامش دقيقة.
  - **لا يُبدَّل محرك الصلاة** (ممنوع).
  - الأولى نقلها إلى `devDependencies` إذا اعتُمدت للاختبار، أو حذفها إن لم تُعتمد. القرار للمالك.
- **المخاطر:** منخفضة جدًا (اختبارات فقط).

## 6) تقويم أم القرى عبر `Intl` ‏(islamic-umalqura)

- **ما يقدّمه:** تحويل هجري مدمج في محرك JS، بلا تبعية ولا شبكة.
- **المرجع:** [MDN — Intl.supportedValuesOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf)
  - `islamic-umalqura`: «Lunar calendar using KACST-calculated months from the start of 1300 AH … to the end of 1600 AH …, falling back to islamic-civil outside that range».
  - وعن `islamic`: «canonicalized to a different calendar … and raise a warning». **لذلك يجب تجنّب `islamic` المجرّد.**
- **الترخيص:** جزء من المنصة، ولا قيود.
- **حالته في المستودع:**
  - **مستخدم فعلًا:** `src/lib/hijri-utils.ts:48,147` (`Intl.DateTimeFormat("en-u-ca-islamic-umalqura")`).
  - يُستعمل أيضًا في `local-notifications.ts` و`smart-content-recommendations.ts` و`widget-data/types.ts`.
- **ما يحلّه:** الحاجة محلولة أصلًا. يكفي التأكد من عدم وجود استدعاءات لـ`islamic` المجرّد.
- **المخاطر:** منخفضة. التقويم قد يختلف يومًا عن الرؤية المحلية، وهذا يحتاج نص توضيح في الواجهة لا تغيير حساب.

## 7) البحث النصي العربي في Postgres/Supabase

- **ما يقدّمه:** `pg_trgm` وFTS. منذ PostgreSQL 12 أضيف مُجذِّر Snowball للعربية ([ملاحظات إصدار 12](https://www.postgresql.org/docs/release/12.0/): «word stemming support for Arabic …»).
- **الترخيص:** PostgreSQL License (متساهل)، ومضمَّن في Supabase.
- **حالته في المستودع (من الملفات):**
  - الترحيلات موجودة:
    - `artifacts/majalis/supabase/migrations/20261003100000_arabic_search_infrastructure_v2.sql`
    - `20261003110000_arabic_search_hadiths_sources_v3.sql`
    - `20261003120000_arabic_search_hadith_source_infra_v4.sql`
  - تبني `public.ar_normalize`، و`pg_trgm`، و`to_tsvector('simple', …)`، ودوال `search_*`.
  - رأس v4 ينص: «REQUIRES_EXPLICIT_APPROVAL before any Production apply».
  - `docs/audit/ARABIC_SEARCH_INFRASTRUCTURE_REPORT.md:103` ينص: «Production apply: REQUIRES_EXPLICIT_APPROVAL (never auto)».
  - **لا يوجد في المستودع ما يثبت تطبيقها على الإنتاج**، فهي غير مطبَّقة حتى يثبت المالك العكس.
- **ما يحلّه:** بحث عربي مطبَّع، يتجاوز الهمزات والتشكيل، مع تشابه trigram للأحاديث والمصادر والدروس.
  - يمكن تقييم إعداد `'arabic'` (تجذير) بديلًا لـ`'simple'` لاحقًا، **بعد قياس**؛ فالتجذير قد يضرّ دقة نصوص الحديث.
- **المخاطر:** إنشاء الفهارس داخل معاملة على جداول كبيرة. يوجد دليل `docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md` وملف تراجع. **تطبيقها على الإنتاج قرار المالك.**

## 8) ‏QuranEnc.com (تراجم معاني القرآن)

- **ما يقدّمه:** تراجم معتمدة بعشرات اللغات، وواجهة API عامة.
- **الشروط:** [quranenc.com/en/home/api/](https://quranenc.com/en/home/api/)
  - «No modification, addition, or deletion of the content.»
  - «Clearly referring to the publisher and the source (QuranEnc.com).»
  - «Mentioning the version number when re-publishing the translation.»
  - «Keeping the transcript information inside the document.»
  - إبلاغ المصدر بالملاحظات، والتحديث إلى أحدث إصدار.
  - «Inappropriate advertisements must not be included when displaying translations.»
  - **لا يُطلب مفتاح API.**
- **في المتجر:** مسموح بهذه الشروط. التطبيق بلا إعلانات فيستوفي شرطها. التخزين دون اتصال جائز ضمنًا، فالنص يتيح «re-publishing» بشرط تحديث الإصدار.
- **ما يحلّه:** بديل موثّق لتراجم AlQuran Cloud، المصنّفة «جزئي» في `LICENSE_RISKS.md` بسبب غموض شروط الطبعة.
- **المخاطر:** منخفضة. يلزم إظهار رقم الإصدار وآلية تحديث.

## 9) ‏HadeethEnc.com (موسوعة الأحاديث المترجمة)

- **ما يقدّمه:** أحاديث منتقاة مع شرح وترجمات. واجهة API موثّقة على [Postman](https://documenter.getpostman.com/view/5211979/TVev3j7q).
- **الشروط:** [hadeethenc.com/en/home](https://hadeethenc.com/en/home)
  - «Contents of the translations can be downloaded and re-published, with the following terms and conditions: 1. No modification, addition, or deletion of the content. 2. Clearly referring to the publisher and the source (HadeethEnc.com). 3. Mentioning the version number … 4. Keeping the transcript information … 5. Notifying the source … 6. Updating the translation according to the latest version … 7. Inappropriate advertisements must not be included».
- **في المتجر:** مسموح، والحزم دون اتصال مسموحة نصًّا («downloaded and re-published») بالشروط السبعة.
- **ما يحلّه:** مصدر مفتوح الشروط لمتون أحاديث مشروحة. **قد يكون بديلًا جزئيًا لمحتوى حصن المسلم المسند**، لكن ذلك يستلزم مطابقة يدوية للأذكار، وليس بديلًا آليًا.
  - **الدرجات:** لم تذكر الصفحة الرئيسية حقل درجة الحديث، فيجب التحقق من الـAPI قبل الاعتماد.
- **المخاطر:** منخفضة إلى متوسطة. الشرط السادس يُلزم بالتحديث، فيلزم مزامنة دورية.

## 10) ‏IslamHouse

- **ما يقدّمه:** كتب ومقالات وفتاوى وصوتيات بلغات عديدة. الـAPI على `api3.islamhouse.com/v3`.
- **الشروط:**
  - رابط المطوّرين `developers.islamhouse.com/en/how-to-use` يحوّل إلى [Postman](https://documenter.getpostman.com/view/7929737/TzkyMfPc)، و**لم تعرض الصفحة نص الشروط** عند الجلب.
  - تذكر مصادر ثانوية أن هناك «public API key» مجانيًا، وأن الشرط عدم التعديل مع الإسناد. **لم يُتحقَّق من ذلك من مصدر رسمي**، فالشروط **غير واضحة**.
- **في المتجر:** غير محسوم حتى يُقرأ نص رسمي.
- **ما يحلّه:**
  - محتوى المكتبة (~١٧٣ كتابًا مصنّفة «غير محسوم» في `LICENSE_RISKS.md`): يمكن أن يكون مصدر بدائل بإسناد واضح.
  - المرجع الحالي في المستودع: `src/views/MethodologyPage.tsx` فقط.
- **المخاطر:** متوسطة، بسبب غموض الشروط وتعدد حقوق المؤلفين داخل المنصة.

## 11) الدرر السنية (dorar.net) — أداة مراجعة داخلية فقط

- **ما يقدّمه:** الموسوعة الحديثية: أحكام المحدّثين على الأحاديث. خدمة API بنمط JSONP مذكورة في [مقال الخدمة الرسمي](https://dorar.net/article/389).
- **الشروط:**
  - **صفحات dorar.net أعادت 403** للأدوات الآلية، فلم تُقرأ الشروط من المصدر.
  - الوسيط غير الرسمي [AhmedElTabarani/dorar-hadith-api](https://github.com/AhmedElTabarani/dorar-hadith-api) **ليس مصدرًا رسميًا**. يذكر حدّ 100 بحث يوميًا لكل IP، وفيه Issue عن توقف المشروع.
  - النتيجة: الشروط **غير واضحة**.
- **في المتجر:** **لا يُعرض في التطبيق.** يُستخدم أداةً داخلية للمراجِع البشري يتحقق بها من درجة الحديث قبل النشر، من المتصفح ومن صفحة الدرر نفسها، دون تخزين نتائجها ولا إعادة نشرها.
- **ما يحلّه:** يرفع جودة مراجعة `verified_hadith_items` وحصن المسلم في مركز المراجعة، دون مخاطر ترخيص على الثنائي.
- **المخاطر:** منخفضة ما دام داخليًا ويدويًا. أي أتمتة تحتاج إذنًا.

## 12) توقيتات التلاوة كلمةً كلمة من Quran Foundation

- **ما يقدّمه:** `GET /chapter_recitations/{id}/{chapter}?segments=true`.
  - [التوثيق](https://api-docs.quran.foundation/docs/content_apis_versioned/chapter-reciter-audio-file): «When `segments=true`, verse-level timestamp entries include `segments` ([word_index, start_ms, end_ms])».
- **الشروط:** شروط QF (المصدر 1). التوقيتات «QF Content»، فيسري عليها قيد التخزين لأسبوع.
- **حالته في المستودع:** `src/lib/surah-ayah-timing.ts`. **وُجدت ثلاث مشكلات** بالفحص الحي، ولم يُعدَّل شيء:
  1. **مفتاح خاطئ:** الخريطة `mapReciterToQuranComRecitation` تستخدم المفتاح `shuraym` (السطر 129)، بينما معرّف القارئ في `src/lib/quran-audio.ts:142` هو `shuraim`. الشيخ الشريم لا يطابق المفتاح، فيسقط إلى `reciter.featured ? 7` (العفاسي) أو `null`.
  2. **أرقام تلاوات خاطئة:** طابقنا الخريطة مع `GET https://api.quran.com/api/v4/resources/recitations`:

     | المفتاح في الخريطة | الرقم في الخريطة | من يقرأ فعلًا بهذا الرقم | الرقم الصحيح |
     |---|---|---|---|
     | `husary` | 2 | عبد الباسط (مرتل) | 6 (أو 12 للمعلم) |
     | `shuraym` | 12 | الحصري (معلم) | 10 |
     | `ajamy` | 10 | الشريم | العجمي غير موجود في القائمة |
     | `dosari` | 6 | الحصري | الدوسري غير موجود في القائمة |

     الأرقام الصحيحة في الخريطة: `alafasy:7` و`sudais:3` و`minshawi:9`.
  3. **شكل الاستجابة:** الكود يقرأ `json.audio_file.segments` ويعامل أول عنصر رقمًا للآية. الاستجابة الحية تضع التوقيتات في `audio_file.timestamps[]`، بالحقول `verse_key` و`timestamp_from` و`timestamp_to`، ثم `segments` بصيغة [رقم الكلمة، البداية، النهاية]. ولا يوجد `audio_file.segments` في المستوى الأعلى (فُحص حيًّا مع `chapter_recitations/7/1`). **النتيجة: الدالة تُرجع `null` دائمًا عمليًا**، ويُستخدم المسار البديل.
- **ما يحلّه:** تمييز الآية والكلمة أثناء التلاوة. الإصلاح المقترح (بعد موافقة):
  - قراءة `timestamps[].verse_key/timestamp_from/timestamp_to`.
  - تصحيح الخريطة إلى `shuraim:10` و`husary:6`.
  - حذف `ajamy` و`dosari` لعدم وجودهما.
  - إزالة السقوط إلى العفاسي لقارئ آخر.
  - هذا **مزامنة عرض فقط**، ولا يمسّ نص المصحف أو خرائطه.
- **المخاطر:** منخفضة تقنيًا. ترخيصيًا: جلب حي فقط ضمن قيد الأسبوع.

### 12-ب) التلاوة الهجينة (قرار المالك، 2026-10-06) — خلف راية مطفأة

ملفات mp3quran تسجيلات مختلفة عن ملفات QF، ولذلك لا تُطبَّق توقيتات QF عليها. القارئ المتوفّر في QF يُشغَّل من ملف QF نفسه (`audio_file.audio_url`)، ويُظلَّل بتوقيت الرد نفسه (`timestamps[]`) بدقة ودون تحجيم. بقية القرّاء على mp3quran بالتقدير النسبي كما هم.

- **الراية:** `VITE_QF_RECITATION_AUDIO` (‏`1`/`true`)، وهي مطفأة افتراضيًا. للتجربة على جهاز واحد: `localStorage["ssunnah.qf_recitation_audio"]="1"`. الكود في `src/lib/qf-recitation-audio.ts`.
- **ينتقلون إلى QF** (المطابقة بالهوية والأسلوب المرتّل؛ المصدر `GET /api/v4/resources/recitations`):

  | القارئ (معرّف التطبيق) | recitation id في QF |
  |---|---|
  | عبد الباسط عبد الصمد (`abdulsamad`) | 2 (مرتّل، وليس المجوّد 1) |
  | عبد الرحمن السديس (`sudais`) | 3 |
  | أبو بكر الشاطري (`shatri`) | 4 |
  | هاني الرفاعي (`rifai`) | 5 |
  | محمود خليل الحصري (`husary`) | 6 (مرتّل، وليس المعلّم 12) |
  | مشاري العفاسي (`alafasy`) | 7 |
  | محمد صديق المنشاوي (`minshawi`) | 9 (مرتّل، وليس المجوّد 8) |
  | سعود الشريم (`shuraim`) | 10 |

- **يبقون على mp3quran:** الدوسري، علي جابر، الغامدي، المعيقلي، العجمي، القطامي، بليلة، الجليل، أبكر، فارس عباد، الحذيفي، محمد أيوب، محمد جبريل، بصفر، مصطفى إسماعيل، البدير، القاسم، المطرود، الأخضر، بو خاطر. وكذلك **الطبلاوي**: رقمه 11 في QF، لكن ملفاته فعليًا `abdul_muhsin_alqasim`، وهذا خلل بيانات عند QF.
- **السقوط الآمن:** إن كانت الراية مطفأة، أو القارئ غير مربوط أو معطّلًا بمفتاح التعطيل، أو فشل QF أو تجاوز 6 ثوانٍ، يعمل التطبيق كما هو الآن: رابط mp3quran مع التقدير النسبي.
- **التنزيلات:** تبقى mp3quran دائمًا. ملفات QF لا تدخل التنزيلات الدائمة، لأن شروط QF تحدّ التخزين بأسبوع. السورة المنزّلة تُشغَّل بالتقدير النسبي. رد QF يُخزَّن في ذاكرة الجلسة فقط، وفي CDN يومًا واحدًا (`max-age=86400`).
- **المفاتيح (إنتاج QF):** OAuth2 ‏`client_credentials` بنطاق `content` على `https://oauth2.quran.foundation/oauth2/token`، ثم الرأسان `x-auth-token` و`x-client-id` إلى `https://apis.quran.foundation/content/api/v4/...`. التوثيق يمنع وضع `client_secret` في المتصفح أو التطبيق، ولذلك يمرّ الطلب عبر وكيل الخادم `GET /api/qf-chapter-audio?recitation=&chapter=` (`lib/api-handlers/qf-chapter-audio.js`). الوكيل يخزّن الرمز ويعيد المحاولة مرة واحدة عند 401. ‏`api.quran.com/api/v4` العام يعمل اليوم بلا مفتاح، لكن المالك اختار مفاتيح الإنتاج.
  - يضعها المالك في **Vercel → Project → Settings → Environment Variables** (Production): `QF_CLIENT_ID` و`QF_CLIENT_SECRET`، و`QF_ENV=prelive` اختياريًا لبيئة الاختبار. وإن احتاجها CI فبالأسماء نفسها في **GitHub → Settings → Secrets → Actions**. لا تُكتب في المستودع.
  - بلا مفاتيح يعيد الوكيل 503، فيبقى كل شيء على mp3quran.
- **التفعيل:** (1) أضف المفاتيح أعلاه. (2) تحقّق: `curl "https://www.ssunnah.com/api/qf-chapter-audio?recitation=7&chapter=112"` يجب أن يعيد `audio_file.timestamps`. (3) أضف `VITE_QF_RECITATION_AUDIO=1` في Vercel env، ثم أعد النشر لأن الراية تُقرأ وقت البناء. الإطفاء: احذف المتغيّر وأعد النشر.
- **CSP:** أُضيف `https://download.quranicaudio.com` إلى `media-src` في `vercel.json`.
- **الاختبار:** `pnpm run test:qf-recitation-audio`.

## 13) التفسير الميسر (مجمع الملك فهد)

- **ما يقدّمه:** تفسير مختصر معتمد من نخبة من العلماء، ونشره المجمع.
- **الشروط:**
  - **موقع المجمع `qurancomplex.gov.sa` تعذّر الوصول إليه** يوم الفحص (ECONNREFUSED)، ولم يُعثر على نص ترخيص إعادة نشر منشور.
  - صفحة الكتاب: [qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/](https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/).
  - النتيجة: الشروط **غير واضحة**.
- **حالته في المستودع:** هو التفسير الافتراضي. `DEFAULT_MUSHAF_TAFSIR_EDITION = "muyassar"` في `src/lib/quran-data/tafsir-editions.ts:73`، ويُجلب حيًّا من Quran.com (`ar-tafsir-muyassar`) مع ملاحظة مصدر «Quran.com / QUL».
- **في المتجر:**
  - الجلب الحي عبر QF يخضع لشروط QF (إسناد، وعدم تعديل، وتخزين أسبوع).
  - **حزمه دون اتصال يحتاج إذن المجمع** أو Content Sync من QF.
- **المخاطر:** متوسطة للحزم دون اتصال، ومنخفضة للجلب الحي.

## 14) القبلة: مكتبة Adhan مقابل كود المشروع

- **المشروع اليوم:** `src/lib/qibla-math.ts`.
  - `qiblaBearing()` يحسب الاتجاه بصيغة الاتجاه الكروي الابتدائي، إلى الكعبة عند 21.4225 و39.8262.
  - تعليق الملف ينص: «Same spherical formula as adhan's `Qibla()`».
  - يستهلكه `src/hooks/useQiblaCompass.ts` و`src/pages/worship/ui/QiblaView.tsx`، ويُختبر في `src/lib/__tests__/qibla-compass.test.ts`.
- **Adhan:** توفر `Qibla(coordinates)` بنفس الصيغة، وترخيصها MIT.
- **التوصية:** **لا استبدال.** الكود الحالي خالص وبلا تبعية ومختبَر. الفائدة الوحيدة من Adhan هنا: **اختبار مطابقة** يقارن `qiblaBearing` بـ`Qibla()` لعدة مدن ضمن ±0.01°.
- **المخاطر:** لا شيء.

---

## جدول التوصيات

> **لا يُبدَّل شيء حتى يوافق المالك بندًا بندًا.**

| المصدر | التوصية | حالة الترخيص | إجراء المالك المطلوب |
|---|---|---|---|
| 1 ‏Quran Foundation API | اعتماد خلف علَم بعد الموافقة (وكيل OAuth، ومسار ترخيص للخطوط) | واضح: Developer Terms، قابل للإلغاء، تخزين ≤ أسبوع | تسجيل في Developer Console، وتأكيد بريدي أن «bundle font files» يغطي QPC V2 |
| 2 نص Tanzil | اعتماد الآن مرجعًا للبحث والمطابقة فقط، دون استبدال نص المصحف | واضح: CC BY 3.0، نقل حرفي مع إسناد ورابط | الموافقة على الإسناد في `/sources` |
| 3 خطوط KFGQPC | خلف علَم بعد الموافقة، وبعد الإذن الكتابي | **غير واضح** (الموقع الرسمي غير متاح، والصيغ الثانوية متعارضة) | طلب إذن كتابي من المجمع، أو الاعتماد على مسار QF في البند 1 |
| 4 ‏Sunnah.com API | خلف علَم بعد الموافقة، جلب حي فقط | **غير واضح** (الصفحة الرسمية 403، والشروط غير منشورة) | طلب مفتاح (GitHub Issue) وتأكيد كتابي للشروط |
| 5 ‏Adhan (اختبارات) | اعتماد الآن للاختبارات فقط، ونقلها إلى devDependencies | واضح: MIT | الموافقة على النقل أو الحذف، دون مساس بمحرك الصلاة |
| 6 ‏Intl umalqura | معتمد فعلًا، ويُبقى | منصة، بلا قيد | لا شيء |
| 7 البحث العربي (Postgres) | خلف علَم بعد الموافقة (تطبيق v2–v4 على الإنتاج) | واضح: PostgreSQL License | قرار تطبيق الترحيلات بنسخة احتياطية حسب الدليل |
| 8 ‏QuranEnc | خلف علَم بعد الموافقة، بديلًا لتراجم AlQuran Cloud | واضح: عدم تعديل، وإسناد، ورقم إصدار، وتحديث | الموافقة واختيار اللغات |
| 9 ‏HadeethEnc | خلف علَم بعد الموافقة | واضح: الشروط السبعة | الموافقة، وتحديد دوره في استبدال حصن المسلم |
| 10 ‏IslamHouse | رفض مؤقت حتى تُقرأ الشروط الرسمية | **غير واضح** | طلب نص الشروط من المنصة |
| 11 الدرر السنية | أداة داخلية فقط (مراجعة يدوية) | **غير واضح** (403) | الموافقة على اعتماده مرجعًا للمراجِع، دون أتمتة |
| 12 توقيتات QF | خلف علَم بعد الموافقة (تصحيح المحلّل والخريطة) | واضح (شروط QF) | الموافقة على إصلاح `surah-ayah-timing.ts` |
| 13 التفسير الميسر | يبقى جلبًا حيًّا، ورفض الحزم دون اتصال حتى يأتي إذن | **غير واضح** (موقع المجمع غير متاح) | إذن المجمع للحزم دون اتصال، أو Content Sync |
| 14 القبلة (Adhan) | رفض الاستبدال، والاكتفاء باختبار مطابقة | واضح: MIT | لا شيء، أو الموافقة على اختبار المطابقة |

### أثرها على البنود المعلّقة في المصفوفة

- **QPC V2:**
  - أقوى مسار: بند QF «cache or bundle font files … if the Developer maintains an active account» (المصدر 1).
  - البديل: إذن كتابي من KFGQPC (المصدر 3).
  - لا يوجد مصدر حرّ بديل.
- **حصن المسلم:** لم يُعثر على طبعة بترخيص مفتوح. البديل المقترح: إسناد كل ذكر مباشرة إلى مصدره الحديثي، مع مراجعة داخلية عبر الدرر (11)، ومتون من HadeethEnc (9) حيث تتوفر.
- **everyayah وmp3quran دون اتصال:**
  - [everyayah.com](https://everyayah.com/) و[mp3quran.net/api](http://www.mp3quran.net/api/) **لا يعرضان أي نص ترخيص** في الصفحات الرسمية المفحوصة.
  - يبقى البند `STREAM_ONLY`. شروط QF لا تجيز تخزين الصوت أكثر من أسبوع.
- **حزم الأذان:** لم يُعثر في هذه المصادر على حلّ. يبقى القرار في المصفوفة.

## أزواج «الذكر + فضله» للإشعارات (`src/data/adhkar-fadl.json`)

- **المصدر:** نصوص الصحيحين المضمّنة في المستودع `public/data/hadith/bukhari.json` و`muslim.json` (أصلها fawazahmed0/hadith-api، ترخيص مفتوح، وهي مستعملة أصلًا في التطبيق). الدرجة: صحيح (الصحيحان).
- **المنهج:** كل «فضل» مقطع متصل حرفي من الرواية؛ لا صياغة بشرية. المولِّد `scripts/gen-adhkar-fadl.mjs` والاختبار `test:adhkar-fadl` يتحققان أن اللفظ مقطع حرفي من الرواية المخزّنة وأن المصدر والدرجة محفوظان في البيانات فقط (لا يظهران في الإشعار).
- **ترقيم:** البخاري بترقيم الفتح؛ مسلم برقم الرواية في بيانات المستودع (ليس ترقيم عبد الباقي).
- **الطول:** ≤160 حرفًا بعد حذف التشكيل (افتراض مسجَّل).
- **لم يُدرج:** ما لم يوجد لفظه في بيانات المستودع (مثل أحاديث الترمذي)، وما يتضمن حوار الراوي.

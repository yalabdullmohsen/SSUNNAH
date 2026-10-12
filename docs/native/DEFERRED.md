# مؤجل بقرار المالك (بلا مصدر أو محجوب)

مداخل هذه الشاشات مخفية من نسخة الإصدار (القوائم والمراكز وخريطة الموقع والبحث) عبر `LibraryRouteScope.deferred`، وتبقى في الـ212 بحالة `[~]` في FEATURE_PARITY. `node scripts/native-progress.mjs` يعرض النسبتين: من 212 كلها، ومن المطلوب للإصدار.

| المسار | السبب | المطلوب لرفع التأجيل |
|---|---|---|
| `/islamic-sects` و`/islamic-sects/:id` | لا Data/aqidah/islamic-sects.json مُصدَّر؛ والمعروض `PUBLISHED` فقط | تصدير من n1 |
| `/fikr-waqia` | لا Data/sirah/fikr-waqia.json مُصدَّر | تصدير من n1 |
| `/competitions` و`/competitions/:id` | جدول المسابقات فارغ في الإنتاج، فلا مصدر | محتوى منشور ثم تصدير |
| `/durus-imaniyya` | لا Data/learn/durus-imaniyya.json | تصدير من n1 |
| `/durus-mutanawwia` | لا Data/learn/durus-mutanawwia.json | تصدير من n1 |
| `/fawaid` | المعتمد `approved` فقط ولا ملف مُصدَّر | تصدير من n1 بعد مراجعة المصدر |
| `/annual-courses/:id` | البذرة التجريبية لا تُعرض ولا دورات معتمدة | دورات معتمدة ثم تصدير |
| `/institutions` | محجوب بقرار المالك: كل الـ44 `needs_review` (انظر LEARN_INSTITUTIONS_DECISION.md) | مراجعة المؤسسات |

**الرفع:** صدِّر الملف (n1)، احذف المسار من `LibraryRouteScope.deferred`، وغيّر `[~]` إلى `[ ]` في FEATURE_PARITY.

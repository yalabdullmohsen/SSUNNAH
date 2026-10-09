# نموذج «تسميع» — التعرّف الصوتي على الجهاز

**الغرض:** تفريغ تلاوة المستخدم إلى نص على الجهاز بالكامل (بلا خادم ولا إرسال صوت) لكشف الكلمة فور نطقها في وضع «تسميع».
**بلا تدريب:** نستخدم نموذج Tarteel المضبوط للقرآن كما هو، ونحوّله فقط إلى CoreML.

## المصدر والترخيص (تحقق 2026-10-07)

| المكوّن | المصدر | الترخيص | ملاحظة |
|---|---|---|---|
| `tarteel-ai/whisper-base-ar-quran` (74M معامل) | https://huggingface.co/tarteel-ai/whisper-base-ar-quran · commit `5c3c53fdf9272c4f6ee0bee09a1e5a4a615ee25c` | **Apache-2.0** (وسم `license:apache-2.0` وبطاقة النموذج) | يسمح بالاستخدام التجاري والتحويل والتوزيع مع الإشعار |
| `tarteel-ai/whisper-tiny-ar-quran` (38M) | https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran · commit `c3d7e624af5c81bef25a10a2af3a5a84cb4dd0f0` | **Apache-2.0** | للمقارنة |
| OpenAI Whisper (الأصل الذي ضُبط منه) | https://github.com/openai/whisper | **MIT** | |
| WhisperKit / argmax-oss-swift (محرك التشغيل) | https://github.com/argmaxinc/argmax-oss-swift | **MIT** | iOS 16+ |
| whisperkittools (أداة التحويل، لا تُشحن) | https://github.com/argmaxinc/whisperkittools | **MIT** | |

**تحفّظ موثّق:** بطاقة النموذج لا تذكر مجموعة بيانات التدريب ولا ترخيصها (الحقل «None dataset»، والاستخدامات «More information needed»). ترخيص **الأوزان** Apache-2.0 صريح وغير مقيَّد بالتجاري، لكن أصل بيانات التدريب غير موثّق — فهذا الأصل **«جزئي»** في `docs/LICENSES.md` إلى أن يؤكد المالك (مراسلة Tarteel أو قبول المخاطرة). لا نشحن بيانات التدريب ولا نعدّل الأوزان.

## التحويل (قابل للإعادة)

```
tools/tasmee-model/convert.sh base <workDir>     # أو tiny
python3 tools/tasmee-model/make_manifest.py <folder> <modelId> <upstream@sha> Apache-2.0 docs/tasmee/model-manifest-base.json
```

خطوات `prepare_hf_model.py` لازمة لسببين: المستودع يحوي `pytorch_model.bin` فقط (و`transformers` يرفض pickle مع `torch<2.6` الذي تثبّته whisperkittools)، فتُحمَّل الأوزان بـ`weights_only=True` وتُحفظ safetensors؛ ويفتقر لـ`generation_config.json` فيؤخذ من `openai/whisper-<size>`. كذلك يُشحن `tokenizer.json` **الرسمي** من `openai/whisper-<size>` (MIT) مع الحزمة كي لا يجلب WhisperKit الـtokenizer من الشبكة وقت التشغيل. لا يُولَّد من ملفات Tarteel: الملف المولَّد ينقصه رموز الزمن (107 مقابل 1608 رمزًا مضافًا) فيُخرج WhisperKit نصًا فارغًا، وكان هذا سبب أعطال tiny وتلاوتَي الإجهاد في قياساتنا الأولى. نتحقق أن معرّفات `vocab.json` لـTarteel مطابقة للرسمي.

## الأحجام (CoreML fp16، مع tokenizer)

| النموذج | الحجم | الملفات |
|---|---|---|
| base | 150.3 MB (مفكوك) | `docs/tasmee/model-manifest-base.json` |
| tiny | 80.2 MB | `docs/tasmee/model-manifest-tiny.json` |

## الاستضافة: GitHub Releases (ثابتة)

كل نسخة أرشيف **zip بلا ضغط** (`zip -0`) أصلٌ في إصدار GitHub بوسم ثابت (مثل `whisper-quran-coreml-v1`) على المستودع العام `yalabdullmohsen/SSUNNAH`، مع `README` و`LICENSE` (Apache-2.0) و`NOTICE` («مشتق ومحوَّل من tarteel-ai/whisper-base-ar-quran؛ التعديل الوحيد هو التحويل إلى CoreML وإرفاق tokenizer.json الرسمي، بلا تدريب»).
- الـmanifest (`model-manifest-<variant>.json`): رابط الأرشيف `releases/download/<الوسم>/…` وحجمه وSHA-256، وحجم وSHA-256 لكل ملف داخله. المنزِّل (Swift) يستكمل بـRange ويتحقق من الأرشيف ثم من كل ملف بعد الفك.
- **الإصدارات لا تُعدَّل بعد نشرها**: `publish_release.py` يرفض وسمًا موجودًا؛ أي تحديث إصدار جديد بوسم جديد (ويُحدَّث الـmanifest في التطبيق ليشير إليه).
- **تبديل الرابط بلا تحديث تطبيق**: `artifacts/majalis/public/data/tasmee-model.json` (`{modelId, archiveUrl}`) يُنشر مع الموقع ويجلبه التطبيق قبل التنزيل. يُطبَّق على `modelId` المطابق فقط ورابط https فقط، ويبدّل `archive.url` وحده؛ الحجم وSHA-256 يبقيان من الـmanifest المثبَّت في التطبيق، فأي مضيف بديل يجب أن يقدّم الأرشيف نفسه بايتًا ببايت. نموذج مختلف (مثل المكمَّم) = modelId جديد = manifest جديد في التطبيق.
- **التنزيل**: بموافقة صريحة في شاشة تعرض الحجم، عبر Wi-Fi فقط (`allowsCellularAccess/ExpensiveNetworkAccess/ConstrainedNetworkAccess = false`، وخطأ `wifi_required` بلا إعادة محاولة على الخلوي)، ويُستأنف من الجزء المنزَّل.
- التحقق: `python3 tools/tasmee-model/verify_release.py docs/tasmee/model-manifest-*.json` (يعيد تنزيل كل أرشيف، يطابق الحجم وSHA-256، يجرّب Range، ويفكّ ويطابق كل ملف).
- النشر: `python3 tools/tasmee-model/publish_release.py yalabdullmohsen/SSUNNAH whisper-quran-coreml-v1 <workDir> --variant base=<folder> --variant tiny=<folder>` (يستعمل `gh`).

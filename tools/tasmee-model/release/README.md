# sunnah-whisper-quran-coreml

نسخة **CoreML** (بصيغة [WhisperKit](https://github.com/argmaxinc/argmax-oss-swift)) من نموذج Tarteel للتعرّف على تلاوة القرآن، تُستعمل في وضع «تسميع» في تطبيق سُنّة على الجهاز بلا إرسال صوت.
تُنشر كأصول إصدار GitHub ثابتة (immutable): كل تحديث إصدار جديد بوسم جديد، ولا يُعدَّل إصدار منشور.

Core ML conversion of Tarteel's Quran-recitation Whisper base model, for on-device use. Release assets are never modified after publishing.

## مشتق ومحوَّل / Derivative notice

- **مشتق ومحوَّل من** [`tarteel-ai/whisper-base-ar-quran`](https://huggingface.co/tarteel-ai/whisper-base-ar-quran) (Apache-2.0)، وهو مضبوط من [OpenAI Whisper](https://github.com/openai/whisper) (MIT).
- **التعديل الوحيد:** التحويل إلى Core ML (float16) بأدوات whisperkittools وإرفاق `tokenizer.json` الرسمي من OpenAI Whisper كما هو. **بلا تدريب ولا ضبط.** التفاصيل في [`NOTICE`](./NOTICE).
- **تحفّظ:** بطاقة النموذج الأصلي لا توثّق بيانات التدريب. ترخيص الأوزان Apache-2.0 كما نشره أصحابها.

## الترخيص / License

Apache License 2.0 — [`LICENSE`](./LICENSE) و[`NOTICE`](./NOTICE) (يتضمن إشعار MIT لـOpenAI Whisper).

## الأصول / Assets

| الأصل | المحتوى |
|---|---|
| `sunnah-whisper-base-ar-quran-coreml.zip` | base (fp16): `AudioEncoder.mlmodelc` · `TextDecoder.mlmodelc` · `MelSpectrogram.mlmodelc` · `tokenizer.json` · `tokenizer_config.json` · `generation_config.json` (zip بلا ضغط) |
| `model-manifest-*.json` | حجم وSHA-256 للأرشيف ولكل ملف داخله؛ التطبيق يتحقق منها قبل الاستخدام |

التطبيق يثبّت الرابط بوسم الإصدار (`releases/download/<tag>/…`) ويتحقق من SHA-256؛ لا يعتمد على «latest».

# ن3 إلى ن2: `/c/:slug` صارت أصلية

- `CitationScreen` (Special/CitationScreen.swift) تجلب `/api/citations/:slug`؛ لا تبنِ شاشة لها.
- البوابة (`api-security-registry.mjs`) تعدّ `/api/citations` مسارًا يتطلب دخولًا، فللزائر «الاقتباس غير موجود» (مطابق للموقع)؛ وللمسجَّل يُرسَل رمز الجلسة (`AccountSession.read(from: platform.auth)`).
- لقطتا فاتح/داكن على n3-quran: حالة «غير متاح» فقط؛ حالة العرض مغطاة باختبار فك JSON ولم تُلتقط لأن لا جلسة دخول في المحاكي.
- قرار المالك: لا تعديل للبوابة ولا فتح المسار.

# نظام حركة التنقل (ن4 → ن1)

المصدر: `Shell/Motion.swift`. سقف أي حركة 0.35 ثانية (يفرضه `MotionTokensTests`).

- التوكنات: `SunnahMotion.Duration` (press .12 / quick .18 / standard .25 / navigate .32 / fade .15) و`SunnahMotion.press/quick/standard/navigate`. عند «تقليل الحركة» تتحول كلها إلى تلاشٍ قصير.
- الانتقال: `SunnahDestination` يلف كل وجهة في `RootTabView`؛ zoom (iOS 18) إن سُجّل مصدر للمسار وإلا انزلاق النظام.
- Haptics: `SunnahNavHaptics` (دخول light / خروج soft)، المفتاح `sunnah.haptics.navigation` (افتراضي مفعّل).

## المطلوب من ن1 (دون تعديل من ن4 على ملفاتكم)
1. مفتاح تفعيل/إيقاف في الإعدادات: `@AppStorage(SunnahNavHaptics.defaultsKey)`.
2. على بطاقات القوائم التي تفتح مسارًا: `.sunnahTransitionSource(path)` لتفعيل zoom.
3. `.sunnahPressable()` بدل `.buttonStyle(.plain)` للبطاقات التي بلا تأثير ضغط.

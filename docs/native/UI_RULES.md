# قواعد الواجهة المشتركة

## البطاقة السفلية فوق المحتوى
- أي بطاقة أو لوحة سفلية تعلو محتوى قابلًا للتمرير تُبنى بـ`SunnahBottomCard` (Components/SunnahBottomCard.swift) ولا ترسم يدويًا بـ`overlay(alignment: .bottom)` أو `safeAreaInset(.bottom)`.
- تقيس البطاقة ارتفاعها وتبلّغ المضيف عبر `SunnahBottomCardHeightKey`؛ على الحاوية المضيفة استدعاء `.sunnahAvoidsBottomCard()` فيُحجز هامش سفلي بقدرها ويبقى العنصر المحدد ظاهرًا.
- الحارس `scripts/native-bottom-card-guard.sh` يفشل إن استُعملت `SunnahBottomCard` في ملف بلا `sunnahAvoidsBottomCard()`، أو وُجد `overlay(alignment: .bottom)` يدوي خارج قائمة السماح.
- `Mushaf/**` ملك ن3: قائمة السماح تتضمن `MushafReaderView.swift` مؤقتًا إلى أن يهاجر إلى المكوّن بمراجعته.
- الـsheet النظامي (`.sheet` + detents) يدير الإزاحة بنفسه ولا يخضع لهذه القاعدة.

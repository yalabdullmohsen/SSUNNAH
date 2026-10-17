# قواعد الواجهة المشتركة

## البطاقة السفلية فوق المحتوى
- أي بطاقة أو لوحة سفلية تعلو محتوى قابلًا للتمرير تُبنى بـ`SunnahBottomCard` (Components/SunnahBottomCard.swift) ولا ترسم يدويًا بـ`overlay(alignment: .bottom)` أو `safeAreaInset(.bottom)`.
- تقيس البطاقة ارتفاعها وتبلّغ المضيف عبر `SunnahBottomCardHeightKey`؛ على الحاوية المضيفة استدعاء `.sunnahAvoidsBottomCard()` فيُحجز هامش سفلي بقدرها ويبقى العنصر المحدد ظاهرًا.
- الحارس `scripts/native-bottom-card-guard.sh` يفشل إن استُعملت `SunnahBottomCard` في ملف بلا `sunnahAvoidsBottomCard()`، أو وُجد `overlay(alignment: .bottom)` يدوي خارج قائمة السماح.
- `Mushaf/**` ملك ن3: قائمة السماح تتضمن `MushafReaderView.swift` مؤقتًا إلى أن يهاجر إلى المكوّن بمراجعته.
- الـsheet النظامي (`.sheet` + detents) يدير الإزاحة بنفسه ولا يخضع لهذه القاعدة.

## قاعدة التنبيه الموحّد (الذكاء الاصطناعي)
- في كل صفحة محتوى يرسم `SunnahContentFooter` أيقونتين صغيرتين فقط: «!» (`detail.disclosureInfo`) و«إبلاغ عن خطأ» (`detail.reportIssue`)، وسطر المصدر. لا بطاقة ولا نص تنبيه كامل داخل الصفحة.
- الرسالة الكاملة (`SunnahDisclosure.short`، نص ن5 الحرفي) تُعرض في Sheet **بضغطة المستخدم على «!» فقط**: لا تُفتح عند دخول أي شاشة. الاستثناء الوحيد افتتاحية أول تشغيل (`IntroView`، مرة واحدة).
- الصفحات الحساسة (أحكام/فتاوى/أحاديث) تمرّر `sensitive: true` فيظهر بجوار الأيقونتين «للفتوى راجع أهل العلم» بخط صغير.
- البيان الكامل (`SunnahDisclosureNotice`) في أماكنه الثابتة فقط: المصادر، حول التطبيق، الإعدادات، وأول تشغيل.
- يفرضها `scripts/native-content-footer-guard.sh` (اختباراته في `scripts/__tests__/native-content-footer-guard.test.mjs`): يفشل عند ظهور النص الكامل في صفحة محتوى، أو عند فتح الـSheet تلقائيًا.

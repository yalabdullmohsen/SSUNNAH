# WHATS_NEW — سُنّة 1.2.0

> نص «ما الجديد» لـ App Store Connect (حدّ 4000 حرف لكل لغة). كل سطر مبني على ميزة موجودة في `docs/native/FEATURE_PARITY.md`؛ لا نتحقق منه بتشغيل التطبيق هنا — **ن4 يطابقه على البناء الفعلي قبل الإرسال**، وأي سطر لا يعمل يُحذف.

## العربية (ar)

```
سُنّة 1.2.0 — إعادة بناء كاملة كتطبيق أصلي لـ iPhone وiPad.

• تطبيق أصلي بالكامل: أسرع في الفتح والتنقل.
• يعمل بلا اتصال: المحتوى الأساسي مضمَّن في التطبيق (الأذكار، الأحاديث، الفقه، السيرة وغيرها). الميزات المرتبطة بالحساب أو بمحتوى جديد تحتاج اتصالًا.
• المصحف الكامل: 604 صفحات بالرسم العثماني.
• حاسبة الفرائض (المواريث): تعمل على جهازك بلا اتصال.
• مواقيت الصلاة واتجاه القبلة: تُحسَب على جهازك بحسب موقعك، مع تذكيرات الصلاة.
• المصحف: يختفي الشريط السفلي أثناء القراءة لتبقى الصفحة كاملة.
• زر «إبلاغ عن خطأ» وتنبيه الذكاء الاصطناعي في صفحات المحتوى.
• تحسينات في التصميم والخطوط ودعم الوضع الداكن والعربية من اليمين لليسار.
• حفظ جلسة الدخول بأمان في سلسلة مفاتيح الجهاز (Keychain).
• شرح تفاعلي يعرّفك بالتطبيق.
• قصص الأنبياء.
• شروح مصوّرة: مراحل خلق الإنسان ومعجزات النبي ﷺ.
• أربعة ودجتات للشاشة الرئيسية من بيانات التطبيق مع مصدرها: الضحى، أذكار بعد الصلاة، الأسماء الحسنى، الجمعة والصيام.

محتوى التطبيق مُعدّ بمساعدة الذكاء الاصطناعي، وقد يقع فيه خطأ.
```

## English (en-US)

```
Sunnah 1.2.0 — rebuilt from the ground up as a fully native app for iPhone and iPad.

• Fully native: faster launch and navigation.
• Works offline: core content is bundled in the app (adhkar, hadith, fiqh, seerah and more). Account features and newly published content need a connection.
• Complete Mushaf: all 604 pages in Uthmani script.
• Inheritance (Fara'id) calculator: runs on your device, offline.
• Prayer times and Qibla: calculated on your device from your location, with prayer reminders.
• Mushaf: the bottom tab bar hides while reading so the page stays full.
• A "Report an error" button and an AI notice on content pages.
• Refined design and fonts, with Dark Mode and full right-to-left Arabic support.
• Your sign-in session is stored securely in the device Keychain.
• An interactive walkthrough introduces you to the app.
• Stories of the Prophets.
• Illustrated explainers: stages of human creation and the miracles of the Prophet ﷺ.
• Four Home Screen widgets from the app's own data, each showing its source: Duha prayer, adhkar after prayer, the Beautiful Names, and Friday & fasting.

The app's content is prepared with AI assistance and may contain errors.
```

## ما لا نقوله عمدًا (لا ادعاءات)
لا «تصميم موحد جديد» ولا «أيقونة !»: لم تُدمج بعد (#3461 و#3454–#3458 دُمجت وتحققت وجملتها في النص؛ #3450 دُمج وتحقق وجملته في النص؛ #3453 أُغلق؛ #3462 دُمج وتحقق وجملته في STORE_LISTING_1_2_0)، وتُضاف الجملة بعد دمجها والتحقق. زر الإبلاغ أيقونته `exclamationmark.bubble` وتنبيه الذكاء الاصطناعي `info.circle` (لا «!» حرفيًا). ولا ادعاء بمراجعة مشايخ.
لا «جميع الميزات تعمل بلا إنترنت»، ولا «تسميع بالذكاء الاصطناعي»، ولا «أذان» (الأذان غير مضمَّن: تنبيه بعبارة صوتية)، ولا أعداد محتوى لم تُتحقق.

---

# الإصدار القادم (مسوّدة — لا تُنسخ إلى ASC قبل التحقق)

> كل سطر يُنقل فقط بعد دمج ميزته و`verify-merged`. الحالة اليوم: ✅ مدموج ومتحقَّق · ⏳ لم يُدمج بعد.
> - ✅ المصحف: خط أوضح وأثخن، حقل بحث، الأدوات تظهر بالنقر (#3549–#3552).
> - ✅ العلامات الملوّنة الخمس (#3555).
> - ✅ قصص خمسة أنبياء بأقسام «من السنة» و«القصة» (#3552) — لا تُكتب «كاملة» لكل الأنبياء قبل اكتمال السرد.
> - ✅ التصميم الجديد («النموذج ٢»): الدفعتان ١ و٢ مدموجتان (#3554، #3558)؛ ⏳ فقط إصلاحات ن1 الأخيرة — لا يُكتب «بالكامل» إلا بعد اجتياز ACCEPTANCE بلقطات.
> - ⏳ قصص الأنبياء لكل الأنبياء.

## العربية (ar)

```
• تصميم جديد بالكامل: بطاقات أوضح، وشريط تنقل عائم، وأرقام عربية، ودعم الوضعين الفاتح والداكن. [✅ الدفعتان ١ و٢ — «بالكامل» ⏳ لإصلاحات ن1]
• المصحف: خط أوضح، وحقل بحث ظاهر، والأدوات تظهر عند النقر على الصفحة. [✅]
• خمس علامات ملوّنة لتمييز ما تقرأ وحفظه. [✅]
• قصص خمسة من الأنبياء بمصادرها وقسم «من السنة». [✅ — «كاملة» ⏳]

محتوى التطبيق مُعدّ بمساعدة الذكاء الاصطناعي، وقد يقع فيه خطأ.
```

## English (en-US)

```
• A fully new design: clearer cards, a floating tab bar, Arabic-Indic numerals, and Light and Dark appearance. [done: batches 1 and 2 — "fully" pending n1's last fixes]
• Mushaf: a clearer font, a visible search field, and tools that appear when you tap the page. [done]
• Five colored markers to highlight and save what you read. [done]
• Stories of five Prophets, each with its sources and a "From the Sunnah" section. [done — "complete" pending]

The app's content is prepared with AI assistance and may contain errors.
```

لا تحتوي أي جملة ادعاء مراجعة شيخ. أزل وسوم [⏳]/[✅]/[pending]/[done] عند النسخ.

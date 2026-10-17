# تدقيق Required Reason APIs (m2-1) — من الكود على origin/native-app

| الهدف | API مستعمل (الدليل) | الرمز المُصرَّح به | الفرق |
|---|---|---|---|
| SunnahApp (`ios-native/SunnahApp/PrivacyInfo.xcprivacy`) | UserDefaults.standard (`PerformanceMetrics.swift:27`، و12 موضعًا في SunnahNative)؛ App Group (`Shared/SunnahSharedData.swift:7,11`، `AccountDeletion.swift:63`)؛ تاريخ تعديل ملف (`SunnahDataKit/DiskCache.swift:27-28`) | UserDefaults: CA92.1 + 1C8F.1؛ FileTimestamp: C617.1 | لا فرق |
| SunnahWatch (`SunnahWatchResources`) | App Group `group.com.yousef.majlisilm.watch` فقط (`WatchModels.swift:70-71`)؛ لا `.standard` ولا طوابع ملفات | UserDefaults: 1C8F.1 | لا فرق |
| PrayerWidget / SunnahWidgetKit / SunnahPrayer | App Group فقط؛ لا `.standard` ولا طوابع ملفات | UserDefaults: 1C8F.1 | لا فرق |
| App القديم (Capacitor، `ios/App/App/PrivacyInfo.xcprivacy`) | يربط SunnahDataKit/Shared | UserDefaults: CA92.1 فقط | ينقصه 1C8F.1 وC617.1 إن بقي مُشحَنًا |

`TasmeeModelStore` يقرأ `.size` فقط (ليس طابعًا زمنيًا ولا مساحة قرص) فلا يُصرَّح به.

**لا تُصرَّح** (غير مستعملة في أي هدف): مساحة القرص، وقت الإقلاع (systemUptime)، لوحات المفاتيح النشطة.

## التوصية
1. SunnahApp والWatch والWidget: لا تغيير؛ المانيفست مطابق للكود.
2. App القديم: إن كان خارج هدف الإرسال فلا شيء؛ وإلا أضف 1C8F.1 وC617.1 (ن4).
3. قائمة البيانات المجموعة في القديم أوسع من SunnahApp (هاتف، جهاز، بحث، أعطال)؛ المعتمد للإرسال هو SunnahApp، فتحقق من Privacy Report لأرشيف حقيقي قبل الإرسال.
4. أي حزمة طرف ثالث بمانيفستها لم تُفحص هنا؛ يغطيها Privacy Report.

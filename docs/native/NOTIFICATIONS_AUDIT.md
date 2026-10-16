# تدقيق الإشعارات الأصلية (ن4، 2026-10-16)

| المحور | الحالة | ملاحظة |
|---|---|---|
| الجرد | تم | 5 مجموعات: الصلاة (`PrayerNotificationScheduler`)، والأذكار/الورد/الدوري/المناسبات (`GeneralNotificationPlanner`)؛ البوابة `NativeNotificationsGate`؛ الموافقة `NativeNotificationsOptIn`. |
| حد 64 | سليم | الصلاة ≤ `prayerShare` وتُخفَّض إن زاد غيرها؛ العامة تملأ `64 − المعلّق`؛ نافذة 7 أيام؛ مغطى باختبار السعة. |
| المنطقة الزمنية | أُصلح (الصلاة والأذكار) | الزناد كان بلا `timeZone` فيفسّره iOS بمنطقة الجهاز؛ الآن `GeneralNotificationPlanner.triggerComponents` تحملها للمجموعتين (قرار المالك 2026-10-16؛ حساب المواقيت لم يُمس). اختبار 3 مناطق (الكويت/نيويورك/طوكيو). |
| الأذونات | سليم | لا جدولة بلا `authorized/provisional`؛ الطلب من `AccountNotificationSettingsScreen` عند فعل المستخدم؛ opt-in افتراضيًا مطفأ. |
| المحتوى | سليم | الأذكار من `AdhkarFadl` (12 زوجًا من الصحيحين)؛ الورد/الدوري/المناسبات مقيّدة بـ`limiting` خارج 1.1.0. |
| الروابط العميقة والعرض الأمامي | أُنجز | `NativeNotificationCenterDelegate` (يُثبَّت عند الإطلاق والتنشيط، يمرّر ما ليس لنا إلى مندوب Capacitor السابق): banner+صوت أماميًا؛ النقر ⇒ `NotificationRouting` ⇒ `AppRouter.open` (صلاة `/prayer-times`، أذكار/دوري `/adhkar`، ورد `/daily-wird`، دروس `/lessons`، جمعة `/jumuah`)، مع مسار معلّق للإطلاق البارد. Capacitor يبقى في الهدف لأنه يستضيف شاشات الويب. |
| الإعدادات (ن1) | قائمة | `AccountNotificationSettingsScreen` لـن1. |
| الخصوصية وحذف الحساب | أُصلح | بعد الحذف: إزالة الإشعارات المعلّقة ومسح نطاق App Group (`LocalDataEraser(clearNotifications:)`). |
| حارس | موجود | `NotificationRoutingTests.testTriggersAlwaysCarryLocationTimeZone` يمنع عودة زناد بلا منطقة. |
| اختبارات | موجودة | GeneralNotificationPlanner/LegacyWeb/OptIn/Planner + NoAdhanNaming. |

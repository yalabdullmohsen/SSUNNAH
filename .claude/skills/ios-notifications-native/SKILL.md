---
name: ios-notifications-native
description: الإشعارات الأصلية في iOS (الأذكار) وعلمها المستقل وعدم الازدواج مع الويب. استخدمها عند أي تعديل على إشعارات الأذكار أو الصلاة أو أذوناتها.
---

# إشعارات iOS
- علم مستقل `native_notifications_enabled` (`ios/App/App/NativeNotificationsGate.swift`، إيقاف عن بُعد عبر `public/native-notifications.json`) لا يرتبط بعلم الصدفة `NativeShellGate`؛ البوابة `scripts/test-ios-capacitor-gates.mjs` تفشل إن رُبطا.
- الأذكار فقط أصلية وopt-in مطفأ افتراضيًا (App Group، مفتاح `sunnah.notifications.optin.v1`)؛ الصلاة تبقى على جدولة الويب. الويب يتنحّى عن الأذكار حين يفعّل الأصلي (`src/lib/adhkar-reminders/index.ts` `syncOnce`).
- الإذن يُطلب من إعدادات المستخدم بعد شرح قصير لا عند فتح التطبيق. صيغة الذكر: العنوان = الذكر، النص «قال ﷺ: …»؛ ساعات الهدوء 23–05 وسقف 6/يوم لغير الصلاة.
- التحقق: `xcodebuild` للمحاكي لأن `#if os(iOS)` لا يُصرَّف في `swift test`؛ ثم `docs/program/NOTIFICATIONS_DEVICE_CHECKLIST.md` على جهاز. بنود 1.1.x في `docs/program/BACKLOG.md`.

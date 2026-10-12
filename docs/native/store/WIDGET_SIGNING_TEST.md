# اختبار توقيع Widget Extension سحابيًا (2026-10-12، ن4)

## الأدلة المحلية
- `security find-identity`: هوية «Apple Development» واحدة فقط؛ لا هوية توزيع ولا ملفات تعريف في `~/Library/MobileDevice/Provisioning Profiles`.
- المفتاح موجود: `~/.appstoreconnect/private_keys/AuthKey_5YN9STQ52Y.p8` (Key ID = 5YN9STQ52Y).
- **لا يوجد Issuer ID** في أي ملف محلي أو متغير بيئة (`APP_STORE_CONNECT_ISSUER_ID` غير مضبوط) ⇒ لا يمكن تشغيل `xcodebuild -allowProvisioningUpdates -authenticationKey*` فعليًا.
- `ios-native/scripts/generate-xcodeproj.rb` لا يعرّف target للـWidget Extension بعد؛ كيان `SunnahApp.entitlements` الحالي للتطبيق فقط.

## الخلاصة
لم يُنفَّذ اختبار توقيع فعلي: يحتاج Issuer ID (سرّ المالك) ودور مفتاح Admin. الآلية نفسها ستوقّع الامتداد (bundle `com.yousef.majlisilm.widget` + App Group) سحابيًا لأنها `signingStyle=automatic` مع `-allowProvisioningUpdates`، لكن هذا استنتاج لا إثبات.

## المطلوب
1. المالك: Issuer ID (App Store Connect ← Users and Access ← Integrations) كمتغير `APP_STORE_CONNECT_ISSUER_ID`، والتأكد من دور Admin للمفتاح.
2. بعده: إضافة target الامتداد والـApp Group ثم `fastlane ios native_beta`.
3. إن تعذّر قبل ظهر الغد: تبقى شاشة `/widget-center` الأصلية (#3065) هي البديل.

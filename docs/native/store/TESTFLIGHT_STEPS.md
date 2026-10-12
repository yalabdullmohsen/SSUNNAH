# TESTFLIGHT_STEPS — تسليم سُنّة 1.2.0 إلى App Store (للمالك)

> مبني على lane `native_beta` في `fastlane/Fastfile` (يبني `ios-native/SunnahApp.xcodeproj`، المخطط `SunnahApp`، الإصدار 1.2.0، رقم البناء = max(آخر بناء TestFlight + 1، 100)، يوقّع تلقائيًا بمفتاح ASC ويرفع إلى TestFlight **داخليًا** دون إرسال للمراجعة). **لا أحد يبني أو يرفع دون إذنك**؛ هذه الخطوات تُنفَّذ على جهازك أو بتفويضك.
> أسماء الأزرار كما في App Store Connect بالإنجليزية (واجهتك قد تكون عربية: ابحث عن المقابل).

## 0) شروط مسبقة (مرة واحدة)
- Mac عليه Xcode وfastlane (`bundle install` أو `brew install fastlane`).
- مفتاح ASC (App Store Connect ← **Users and Access** ← **Integrations** ← **App Store Connect API** ← **Generate API Key**، دور **App Manager**): احفظ ملف `.p8` **خارج المستودع** (مثل `~/.appstoreconnect/private_keys/`). المستودع عام: لا تضع `.p8` فيه.
- تأكد أن ن4 أنهى التحقق بالبناء (الخصوصية والتوقيع) وأن بيان `PRIVACY_CHECK.md` مطابق.

## 1) رفع البناء
```bash
export APP_STORE_CONNECT_API_KEY_ID=XXXXXXXXXX
export APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export APP_STORE_CONNECT_API_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_XXXXXXXXXX.p8
export TESTFLIGHT_CHANGELOG="سُنّة 1.2.0 أصلي"   # اختياري
git checkout native-app && git pull   # (أو main بعد دمج native-app) فيه lane native_beta
bash ios-native/scripts/prepare-data.sh          # يولّد ios-native/Data (غير مُلتزَم)
bundle exec fastlane ios native_beta
```
نجاحه ينتهي برسالة `SunnahApp 1.2.0 build N` ثم رفع. (الـlane لا ينتظر المعالجة.)

## 2) انتظار المعالجة
App Store Connect ← **Apps** ← سُنّة ← تبويب **TestFlight** ← **Builds** ← **iOS**: يظهر البناء بحالة **Processing** (عادةً 10–30 دقيقة) ثم يصل بريد. إن ظهر **Missing Compliance** اضغطه واختر **No** للتشفير المستثنى (الـplist يصرّح `ITSAppUsesNonExemptEncryption=false` فالسؤال لا يفترض أن يظهر).

## 3) اختبار داخلي (موصى به قبل المراجعة)
TestFlight ← **Internal Testing** ← **+** (أو اختر المجموعة) ← **Add Builds** ← اختر البناء ← **Add**. ثبّته من تطبيق TestFlight على جهاز حقيقي ونفّذ `DEVICE_NOTIFICATION_MATRIX.md`.

## 4) تجهيز صفحة الإصدار
**Apps** ← سُنّة ← تبويب **Distribution** (App Store) ← **+** بجانب **iOS App** ← اكتب **1.2.0** ← **Create**.
1. **What's New in This Version**: الصق نص كل لغة من `WHATS_NEW.md`.
2. **Build** (قسم Build) ← **Add Build** ← اختر البناء المرفوع ← **Done**.
3. **App Review Information** ← الصق ملاحظات `REVIEW_NOTES.md` في **Notes**؛ أدخل الحساب التجريبي إن أردت (فعّل **Sign-in required** ثم **User name / Password**).
4. **App Privacy** (القائمة الجانبية ← **App Privacy** ← **Edit**): اتبع القسم 5 من `PRIVACY_CHECK.md` ثم **Publish**.
5. تأكد من **Privacy Policy URL** ولقطات الشاشة المطلوبة ومعلومات الإصدار.

## 5) الإرسال للمراجعة
أعلى صفحة الإصدار ← **Add for Review** ← في صفحة **Draft Submission** راجع الجدول ← **Submit for Review**.
اختر **Release** (يدوي/تلقائي بعد القبول) من **Version Release** قبل ذلك.

## 6) بعد الإرسال
الحالة: **Waiting for Review** ← **In Review** ← **Pending Developer Release/Ready for Distribution**. عند الرفض: افتح **App Review** ← رسالة المراجع ← أجب في **Resolution Center** ولا تُعد الرفع قبل قراءة السبب.

## تنبيهات
- بناء بـ`TASMEE_DIAGNOSTICS=1` يُرفع للاختبار الداخلي فقط ولا يُرسل للمراجعة.
- lane `beta` القديم يبني تطبيق Capacitor (`artifacts/majalis/ios/App`) — **لا تستعمله لـ1.2.0**.
- فشل التوقيع بـ`-allowProvisioningUpdates`: تأكد من أن دور مفتاح ASC App Manager على الأقل وأن `APPLE_TEAM_ID` صحيح (الافتراضي 5D8TX37HTS).

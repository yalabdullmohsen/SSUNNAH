# TESTFLIGHT_STEPS — تسليم سُنّة 1.2.0 إلى App Store (للمالك)

> مبني على lane `native_beta` في `fastlane/Fastfile` (يبني `ios-native/SunnahApp.xcodeproj`، المخطط `SunnahApp`، الإصدار 1.2.0، رقم البناء = max(آخر بناء TestFlight + 1، 100)، يوقّع تلقائيًا بمفتاح ASC ويرفع إلى TestFlight **داخليًا** دون إرسال للمراجعة). **لا أحد يبني أو يرفع دون إذنك**؛ هذه الخطوات تُنفَّذ على جهازك أو بتفويضك.
> أسماء الأزرار كما في App Store Connect بالإنجليزية (واجهتك قد تكون عربية: ابحث عن المقابل).

## 0) شروط مسبقة
- Mac عليه Xcode وfastlane (`bundle install` أو `brew install fastlane`).
- **مفتاح ASC: استعمل المفتاح السابق نفسه** إن كان عندك (هو الذي يستعمله lane `beta` القديم)؛ لا حاجة لإنشاء جديد. أسماء المتغيرات (من `Fastfile` و`fastlane/README.md` و`docs/guides/AUTOMATION_SETUP.md`):
  - `APP_STORE_CONNECT_API_KEY_ID` و`APP_STORE_CONNECT_ISSUER_ID`
  - `.p8`: إمّا `APP_STORE_CONNECT_API_KEY_PATH` (مسار ملف **خارج المستودع**) أو `APP_STORE_CONNECT_API_KEY_KEY` (Base64) — و`native_beta` و`native_release` يدعمان الطريقتين: إن وُجد `..._PATH` استُعمل، وإلا يُفكّ `..._KEY` (Base64) تلقائيًا إلى ملف مؤقت 0600 في مجلد النظام المؤقت (خارج المستودع) ويُحذف عند انتهاء العملية.
  - اختياري: `APPLE_TEAM_ID` (الافتراضي 5D8TX37HTS)، `APP_IDENTIFIER`.
  - ملاحظة: `artifacts/majlisilm-flutter/release.sh` يستعمل أسماء أخرى (`ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_PATH`) لتطبيق Flutter القديم، لا لـ fastlane.
  - لم أستطع التحقق أن المفتاح نفسه ما زال موجودًا/صالحًا عندك (الأسرار ليست في المستودع). إن فُقد: App Store Connect ← **Users and Access** ← **Integrations** ← **App Store Connect API** ← **Generate API Key** بدور **App Manager**.
- تأكد أن ن4 أنهى التحقق بالبناء وأن `PRIVACY_CHECK.md` مطابق.

## 1) رفع البناء
```bash
# القيم نفسها لمفتاحك السابق (انظر القسم 0)
export APP_STORE_CONNECT_API_KEY_ID=XXXXXXXXXX
export APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export APP_STORE_CONNECT_API_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_XXXXXXXXXX.p8
export TESTFLIGHT_CHANGELOG="سُنّة 1.2.0 أصلي"   # اختياري
git checkout native-app && git pull   # (أو main بعد دمج native-app) فيه lane native_beta
bash ios-native/scripts/prepare-data.sh          # يولّد ios-native/Data (غير مُلتزَم)
bundle exec fastlane ios native_beta
```
نجاحه ينتهي برسالة `SunnahApp 1.2.0 build N` ثم رفع. (الـlane لا ينتظر المعالجة.)

**بناء وتوقيع بلا رفع (للتحقق دون لمس TestFlight):** `bundle exec fastlane ios native_beta upload:false` ينتج `ios-native/build/SunnahApp.ipa` فقط ولا يتصل برفع. الافتراضي `upload:true`. (`export_method` هو `app-store` لأن fastlane 2.241.0 لا يقبل `app-store-connect`.)

## 2) انتظار المعالجة
App Store Connect ← **Apps** ← سُنّة ← تبويب **TestFlight** ← **Builds** ← **iOS**: يظهر البناء بحالة **Processing** (عادةً 10–30 دقيقة) ثم يصل بريد. إن ظهر **Missing Compliance** اضغطه واختر **No** للتشفير المستثنى (الـplist يصرّح `ITSAppUsesNonExemptEncryption=false` فالسؤال لا يفترض أن يظهر).

## 3) اختبار داخلي (موصى به قبل المراجعة)
TestFlight ← **Internal Testing** ← **+** (أو اختر المجموعة) ← **Add Builds** ← اختر البناء ← **Add**. ثبّته من تطبيق TestFlight على جهاز حقيقي ونفّذ `DEVICE_NOTIFICATION_MATRIX.md`.

## 4) إرسال الإصدار للمراجعة — الطريقة المختصرة: `native_release`
يقرأ `WHATS_NEW.md` (العربية → `ar-SA`، الإنجليزية → `en-US`) و`REVIEW_NOTES.md`، يختار البناء، ويرسل للمراجعة. **الافتراضي dry-run**: يجهّز الملفات ويطبع ملخصًا ولا يتصل بـ App Store Connect.
```bash
bundle exec fastlane ios native_release                      # dry-run: مراجعة ما سيُرسل
bundle exec fastlane ios native_release submit:true          # فعلي: آخر بناء لـ1.2.0
bundle exec fastlane ios native_release submit:true build:101  # فعلي: بناء محدد
```
اختياري: `REVIEW_DEMO_USER` و`REVIEW_DEMO_PASSWORD` (حساب تجريبي، يبقيان في بيئتك لا في المستودع)، و`AUTOMATIC_RELEASE=true` للإطلاق التلقائي بعد القبول.
**شروط:** الإصدار 1.2.0 يجب أن يكون بحالة قابلة للتحرير (أنشئه يدويًا مرة: **Apps** ← سُنّة ← **+** بجانب **iOS App** ← `1.2.0` ← **Create**)، وأن يكون البناء قد أنهى **Processing**. اللغتان `ar-SA` و`en-US` يجب أن تكونا مضافتين للتطبيق في App Store Connect؛ إن اختلفت أسماء اللغات فعدّلها في الـlane. أول تشغيل فعلي لم يُجرَّب هنا (لا fastlane على هذه الآلة) فابدأ بـdry-run.
**لا يُؤتمت — خطوات يدوية قليلة (مرة واحدة):**
1. **App Privacy**: App Store Connect ← سُنّة ← **App Privacy** ← **Edit** ← اتبع §5 في `PRIVACY_CHECK.md` ← **Publish**.
2. **Privacy Policy URL**: الصق `https://yalabdullmohsen.github.io/sunnah-legal/privacy.html` في **App Information** ← **Privacy Policy URL** (GitHub Pages؛ HTTP 200 بتاريخ 2026-10-15).
3. لقطات الشاشة وبقية بيانات الصفحة إن لم تكن مكتملة من الإصدار السابق.

### الطريقة اليدوية (بديل)
**Distribution** ← **1.2.0** ← الصق **What's New in This Version** ← قسم **Build** ← **Add Build** ← اختر البناء ← **Done** ← **App Review Information** (الصق **Notes**، و**Sign-in required** إن أردت) ← **Add for Review** ← **Submit for Review**.

## 6) بعد الإرسال
الحالة: **Waiting for Review** ← **In Review** ← **Pending Developer Release/Ready for Distribution**. عند الرفض: افتح **App Review** ← رسالة المراجع ← أجب في **Resolution Center** ولا تُعد الرفع قبل قراءة السبب.

## تنبيهات
- بناء بـ`TASMEE_DIAGNOSTICS=1` يُرفع للاختبار الداخلي فقط ولا يُرسل للمراجعة.
- lane `beta` القديم يبني تطبيق Capacitor (`artifacts/majalis/ios/App`) — **لا تستعمله لـ1.2.0**.
- فشل التوقيع بـ`-allowProvisioningUpdates`: دور مفتاح ASC يجب أن يكون **Admin** (أو App Manager على الأقل)؛ إنشاء شهادة التوزيع السحابية وملفات التعريف (التطبيق + Widget Extension + App Group) يتطلب Admin عادةً، وApp Manager قد يفشل بـ«Cloud signing permission error». تأكد أيضًا أن `APPLE_TEAM_ID` صحيح (الافتراضي 5D8TX37HTS). الـlane تستعمل `export_method: app-store-connect` و`signingStyle: automatic` بلا هوية توزيع محلية.

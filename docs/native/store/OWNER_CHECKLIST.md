# OWNER_CHECKLIST — إطلاق سُنّة 1.2.0 (بناء 100) للمالك

الخطوات بالترتيب. الأوامر تُنسخ كما هي من جذر المستودع على `native-app` المحدَّث.
التفاصيل: `TESTFLIGHT_STEPS.md`، الخصوصية: `PRIVACY_CHECK.md`.

## 0) المفتاح (مرة واحدة، خارج المستودع)
```bash
mkdir -p ~/.appstoreconnect && chmod 700 ~/.appstoreconnect
cat > ~/.appstoreconnect/env.sh <<'EOF'
export APP_STORE_CONNECT_API_KEY_ID=XXXXXXXXXX
export APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export APP_STORE_CONNECT_API_KEY_PATH=$HOME/.appstoreconnect/private_keys/AuthKey_XXXXXXXXXX.p8
EOF
chmod 600 ~/.appstoreconnect/env.sh
```

## 1) رفع البناء إلى TestFlight
```bash
source ~/.appstoreconnect/env.sh
git checkout native-app && git pull
export BUNDLE_PATH=$HOME/.bundle-sunnah && bundle install
bash ios-native/scripts/prepare-data.sh        # يولّد ios-native/Data (غير مُلتزَم)
bundle exec fastlane ios native_beta           # ينتهي بـ «SunnahApp 1.2.0 build N» ثم الرفع
```

## 2) فحص TestFlight على iPhone حقيقي
App Store Connect ← سُنّة ← TestFlight ← انتظر خروج البناء من Processing (10–30 د) ← Internal Testing ← Add Builds.
ثبّته من تطبيق TestFlight ثم تحقّق: المواقيت والقبلة، المصحف، الأذكار بعناوينها، الويدجت، الإشعارات (`DEVICE_NOTIFICATION_CHECK`).

## 3) تجربة الدخول (اختيارية للمراجعة، افتراض: المقصود تسجيل الدخول لمسار مساهماتي)
في التطبيق: الأقسام ← مساهماتي (`/my-submissions`) ← تسجيل الدخول بحساب Supabase مؤكَّد البريد. إن أردت تقديمه للمراجِع:
```bash
export REVIEW_DEMO_USER='بريد@example.com'
export REVIEW_DEMO_PASSWORD='••••••••'     # يبقى في بيئتك، لا في المستودع
```

## 4) App Privacy (يدوي)
App Store Connect ← سُنّة ← App Privacy ← Edit ← اتبع §5 في `PRIVACY_CHECK.md` ← Publish.
Privacy Policy URL: `https://www.ssunnah.com/privacy`.

## 5) لصق WHATS_NEW وREVIEW_NOTES
`native_release` يقرؤهما تلقائيًا (`WHATS_NEW.md` → ar-SA/en-US، `REVIEW_NOTES.md` → ملاحظات المراجِع). للمعاينة:
```bash
bundle exec fastlane ios native_release        # dry-run: لا اتصال ولا إرسال
```
وللّصق اليدوي: Distribution ← 1.2.0 ← What's New (من `WHATS_NEW.md`)، App Review Information ← Notes (من `REVIEW_NOTES.md`). اللقطات: `docs/native/store/screenshots`.

## 6) Submit
```bash
source ~/.appstoreconnect/env.sh
bundle exec fastlane ios native_release submit:true             # آخر بناء لـ1.2.0
# أو بناء محدد: bundle exec fastlane ios native_release submit:true build:100
```
ثم تابع: Waiting for Review ← In Review ← Ready. شرط: الإصدار 1.2.0 مُنشأ يدويًا بحالة قابلة للتحرير، والبناء أنهى Processing.

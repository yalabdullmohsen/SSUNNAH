# OWNER_CHECKLIST — إطلاق سُنّة 1.2.0 للمالك (رقم البناء: انظر `docs/native/release-state.json`)

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
Privacy Policy URL: `https://yalabdullmohsen.github.io/sunnah-legal/privacy.html`.

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
# أو بناء محدد (الرقم من release-state.json): bundle exec fastlane ios native_release submit:true build:N
```
ثم تابع: Waiting for Review ← In Review ← Ready. شرط: الإصدار 1.2.0 مُنشأ يدويًا بحالة قابلة للتحرير، والبناء أنهى Processing.

## قبل زر الإرسال (ما بقي على يوسف وحده)
التفاصيل في `docs/native/submission/`؛ هنا المختصر فقط.
- [ ] **ASC — الخصوصية:** أجب App Privacy من `ASC_APP_PRIVACY_ANSWERS.md` ثم Publish. أضف مضيفي الصوت بالحالة أ أو ب حسب `AUDIO_HEADERS_CHECK.md` (لم تُملأ بعد) ثم طابِق `app-privacy.md`.
- [ ] **ASC — App Review Information:** أنشئ `apple.review@ssunnah.com` في Supabase (Auto Confirm User)، جرّب الدخول، وضع البريد وكلمة المرور في Sign-in required فقط؛ الصياغة في `ASC_REVIEW_INFORMATION.md`.
- [ ] **ASC — الصفحة:** الصق النصوص من `STORE_LISTING_1_2_0.md`، والتقط اللقطات من بناء TestFlight الفعلي (iPhone وiPad، فاتح وداكن).
- [ ] **الجهاز:** نفّذ `DEVICE_TEST_SHEET.md` على البناء الفعلي، بما فيه الحذف والتصدير بحساب تجريبي.
- [ ] **الشيخ:** أرسل `WHATS_NEW` وAPPSTORE_METADATA وREVIEW_NOTES للمراجعة الشرعية وانتظر ردّه، ثم حوّله بقالب `SHEIKH_REPLY_TEMPLATE.md`.
- [ ] **التدقيق:** راجع `GUIDELINES_AUDIT.md` وما فيه من بنود مفتوحة، وتحقق من Privacy Report في الأرشيف (لم يُتحقق منه بعد).
- [ ] **النطاق:** `www.ssunnah.com` معلّق (402) في PRIVACY_CHECK؛ أعِده أو أزل رابطه من REVIEW_NOTES.
- [ ] **الإرسال:** أنشئ الإصدار 1.2.0 يدويًا ثم نفّذ الخطوة 6 بنفسك.

منتهٍ (إفادة المالك، لا دليل مستودع): `delete_my_account` و`export_my_account` مطبَّقتان على الإنتاج، وتعريفاهما مقروءان، واختبار الحذف والتصدير ناجح من جهازه. يبقى تكرار الاختبار على RC النهائي ضمن `DEVICE_TEST_SHEET.md`.

# قائمة فحص الرفع إلى TestFlight (ن4)

**لا بناء ولا رفع دون إذن المالك الصريح.** الرفع من Xcode Organizer بيد المالك.

## الأمر الواحد
```
SIM_UDID=<محاكي النافذة> bash scripts/native-archive-prepare.sh --clean-run --size-app <SunnahApp.app من بناء Release>
```
أخضر = جاهز للقائمة أدناه. `--set-version X.Y.Z --build N` يغيّر الإصدار في `generate-xcodeproj.rb` ويعيد توليد pbxproj (أضِفه في commit). `--archive` يتطلب `OWNER_APPROVED_ARCHIVE=1` ويؤرشف محليًا إلى `~/.majalis-tools/archives/` بلا رفع.

## قاعدة رقم البناء
- `docs/native/release-state.json` يسجّل آخر بناء رُفع فعلًا (الآن 101). `CURRENT_PROJECT_VERSION` في `generate-xcodeproj.rb` يجب أن يكون **أكبر** منه، وإلا يفشل `native-release-check.sh` و`native-archive-prepare.sh`.
- بعد كل رفع ناجح: حدّث `lastUploadedBuild` في الملف ذاته في PR، وارفع البناء التالي بـ`--set-version X.Y.Z --build N`.

## الأرشفة والرفع من Xcode (يدوي بيد المالك، أقل نقرات)
1. `open ios-native/SunnahApp.xcodeproj` ثم اختر الهدف **SunnahApp** والوجهة **Any iOS Device (arm64)** (لا محاكي).
2. Signing & Capabilities: Team = 5D8TX37HTS و«Automatically manage signing» مفعّل (للتطبيق وSunnahWidget).
3. **Product > Archive** وانتظر فتح Organizer.
4. **Distribute App > App Store Connect > Upload > Next** (اترك الخيارات الافتراضية: Upload symbols، Manage version) **> Upload**.
5. في App Store Connect > TestFlight انتظر انتهاء المعالجة (Processing) ثم أضف الاختبار الداخلي.
6. بعد النجاح حدّث `release-state.json` (انظر أعلاه).
- تحقق مسبق بلا رفع: `OWNER_APPROVED_ARCHIVE=1 bash scripts/native-archive-prepare.sh --archive` (لا export ولا upload؛ يحتاج شهادة توزيع في keychain).

## القائمة
- [ ] الإصدار والبناء موحّدان بين التطبيق والويدجت (الحالي 1.2.0 / 102)، ورقم البناء أكبر من آخر مرفوع (`docs/native/release-state.json`).
- [ ] التوقيع: `DEVELOPMENT_TEAM=5D8TX37HTS`، entitlements صالحة (التطبيق + PrayerWidget)، شهادة Apple Distribution عند المالك (Automatic signing). لا شهادات أو ملفات توفير في المستودع.
- [ ] privacy manifest للتطبيق والويدجت: `NSPrivacyTracking=false` وأسباب APIs معلنة.
- [ ] الحجم: .app ≈ 259MB على المحاكي (Data ≈ 209.7MB، الثنائي 41MB، الويدجت 6.6MB؛ الخطوط ≈ 153MB مقصودة)؛ السقف 400MB، تحذير فوق 200MB.
- [ ] `scripts/native-release-check.sh` أخضر (يتطلب `ios-native/Data` مولَّدًا عبر `export-ios-data.mjs`، وهو غير مُلتزَم).
- [ ] تشغيل أول نظيف: التطبيق حي بعد 8s بلا `.ips` (`--clean-run`).
- [ ] `scripts/check-no-sim-delete.sh` أخضر.
- [ ] CI أخضر على `native-app` (عدا فحوص Vercel المتوقعة).
- [ ] لا ادعاء اجتياز جهاز من نتائج المحاكي؛ جرّب على جهاز حقيقي قبل الإرسال للمراجعة.

## الحجم (App Thinning)
- المقاس محليًا: 259MB للتطبيق غير المقسَّم (Data 209.7MB: مصحف/خطوط QPC 156MB، حديث 17MB، تفسير 8.6MB؛ الثنائي 41MB). لا ملفات مكررة المحتوى (>300KB) في `ios-native/Data` (فُحص بـmd5). الخطوط تبقى محزومة (مصدر الحقيقة).
- الرقم الحاكم (App Thinning Size Report للأجهزة) يحتاج Archive موقّعًا + export، ولا شهادة توزيع على هذا الجهاز ولا export مسموح؛ يُستخرج بعد رفع المالك: Organizer > Distribute > Custom > Development/Ad Hoc + App Thinning "All compatible device variants" (يولّد `App Thinning Size Report.txt`)، أو من App Store Connect > TestFlight > Build > حجم التنزيل.

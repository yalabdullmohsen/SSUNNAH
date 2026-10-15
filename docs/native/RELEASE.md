# قائمة فحص الرفع إلى TestFlight (ن4)

**لا بناء ولا رفع دون إذن المالك الصريح.** الرفع من Xcode Organizer بيد المالك.

## الأمر الواحد
```
SIM_UDID=<محاكي النافذة> bash scripts/native-archive-prepare.sh --clean-run --size-app <SunnahApp.app من بناء Release>
```
أخضر = جاهز للقائمة أدناه. `--set-version X.Y.Z --build N` يغيّر الإصدار في `generate-xcodeproj.rb` ويعيد توليد pbxproj (أضِفه في commit). `--archive` يتطلب `OWNER_APPROVED_ARCHIVE=1` ويؤرشف محليًا إلى `~/.majalis-tools/archives/` بلا رفع.

## القائمة
- [ ] الإصدار والبناء موحّدان بين التطبيق والويدجت (الحالي 1.2.0 / 100)، ورقم البناء أكبر من آخر مرفوع في App Store Connect.
- [ ] التوقيع: `DEVELOPMENT_TEAM=5D8TX37HTS`، entitlements صالحة (التطبيق + PrayerWidget)، شهادة Apple Distribution عند المالك (Automatic signing). لا شهادات أو ملفات توفير في المستودع.
- [ ] privacy manifest للتطبيق والويدجت: `NSPrivacyTracking=false` وأسباب APIs معلنة.
- [ ] الحجم: .app ≈ 259MB على المحاكي (Data ≈ 209.7MB، الثنائي 41MB، الويدجت 6.6MB؛ الخطوط ≈ 153MB مقصودة)؛ السقف 400MB، تحذير فوق 200MB.
- [ ] `scripts/native-release-check.sh` أخضر (يتطلب `ios-native/Data` مولَّدًا عبر `export-ios-data.mjs`، وهو غير مُلتزَم).
- [ ] تشغيل أول نظيف: التطبيق حي بعد 8s بلا `.ips` (`--clean-run`).
- [ ] `scripts/check-no-sim-delete.sh` أخضر.
- [ ] CI أخضر على `native-app` (عدا فحوص Vercel المتوقعة).
- [ ] لا ادعاء اجتياز جهاز من نتائج المحاكي؛ جرّب على جهاز حقيقي قبل الإرسال للمراجعة.

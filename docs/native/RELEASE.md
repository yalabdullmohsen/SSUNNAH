# قائمة فحص الرفع إلى TestFlight (ن4)

**لا بناء ولا رفع دون إذن المالك الصريح.** الرفع من Xcode Organizer بيد المالك.

## الأمر الواحد
```
SIM_UDID=<محاكي النافذة> bash scripts/native-archive-prepare.sh --clean-run --size-app <SunnahApp.app من بناء Release>
```
أخضر = جاهز للقائمة أدناه. `--set-version X.Y.Z --build N` يغيّر الإصدار في `generate-xcodeproj.rb` ويعيد توليد pbxproj (أضِفه في commit). `--archive` يتطلب `OWNER_APPROVED_ARCHIVE=1` ويؤرشف محليًا إلى `~/.majalis-tools/archives/` بلا رفع.

## قاعدة رقم البناء
- `docs/native/release-state.json` يسجّل آخر بناء رُفع فعلًا (الآن 101). `CURRENT_PROJECT_VERSION` في `generate-xcodeproj.rb` يجب أن يكون **أكبر** منه، وإلا يفشل `native-release-check.sh` و`native-archive-prepare.sh`.
- بعد كل رفع ناجح: `bash scripts/release-record.sh <البناء> [YYYY-MM-DD]` (يحدّث `lastUploadedBuild` و`uploadedAt` ويرفض رقمًا ليس أكبر من المسجَّل؛ لا تحرير يدوي) وأضِف الملف في PR، ثم ارفع البناء التالي بـ`--set-version X.Y.Z --build N`.

## الأرشفة والرفع من Xcode (يدوي بيد المالك، أقل نقرات)
1. `open ios-native/SunnahApp.xcodeproj` ثم اختر الهدف **SunnahApp** والوجهة **Any iOS Device (arm64)** (لا محاكي).
2. Signing & Capabilities: Team = 5D8TX37HTS و«Automatically manage signing» مفعّل (للتطبيق وSunnahWidget).
3. **Product > Archive** وانتظر فتح Organizer.
4. **Distribute App > App Store Connect > Upload > Next** (اترك الخيارات الافتراضية: Upload symbols، Manage version) **> Upload**.
5. في App Store Connect > TestFlight انتظر انتهاء المعالجة (Processing) ثم أضف الاختبار الداخلي.
6. بعد النجاح: `bash scripts/release-record.sh <البناء>` (انظر أعلاه).
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

## حدّ العمليات (maxprocperuid)
افتراضي macOS: `kern.maxprocperuid` = 1333 فقط؛ استنفاده يُفشل `fork` ويُسقط المحاكيات وxcodebuild. للعرض والاقتراح بلا sudo: `bash scripts/mac-raise-process-limits.sh`. **الأمر الوحيد بـsudo (المالك)**، يطلب كتابة «نعم» ثم يكتب LaunchDaemon دائمًا (8192 / 6144):

```
sudo bash scripts/mac-raise-process-limits.sh --install
```
أعد فتح الطرفية/التطبيقات بعده (الحد القديم يبقى في الصدفات المفتوحة).

## إجراء مرشّح الإصدار
1. بعد تجميد الليلة: لا PR إلا لإصلاح عاجل (عيب ويدجت، حماية المعلّق، تقليب المصحف)؛ ما سواه ينتظر الإصدار التالي.
2. على الرأس النهائي لـ`native-app`: `bash scripts/native-release-check.sh` أخضر.
3. صباح الرفع: أرشفة جديدة من الرأس النهائي (`OWNER_APPROVED_ARCHIVE=1 bash scripts/native-archive-prepare.sh --archive`) بعد دمج ما يلزم من ن1 وعيب الويدجت، ن2 وحماية المعلّق، ن3 وتقليب المصحف؛ لا تُرفع أرشفة سابقة.
4. الرفع من Organizer بيد المالك، ثم `bash scripts/release-record.sh <البناء>`.

## خطر إطلاق: حجم قاعدة الإنتاج
- **قاعدة الإنتاج 420MB (قياس المالك المباشر) < حد 500MB: لا دين ولا TRUNCATE.** رقم 570MB القديم كان من تحذير اللوحة ولم يُقَس؛ صُحّح. الأكبر `mke_decisions` 83MB، `mke_quality_reports` 82MB، `akp_review_queue` 76MB، ولن تُمس. التفاصيل: `docs/native/TRUNCATE_EXPLAINED.md`.
- **مساران كانا يعتمدان على الموقع المجمّد — أُصلحا (2026-10-16):** الإرسال (`AccountSubmissionsScreens`) صار إدراجًا مباشرًا في `user_submissions` بجلسة المستخدم عبر RLS الموجودة (pending فقط؛ `type="lesson"` والنوع العربي في `meta.kind`) فيعمل **بلا SQL جديد**. التصدير (`AccountPrivacyCenterScreen`) صار `rpc/export_my_account` — **خطوة مالك:** نفّذ `docs/native/backend/export-account.sql` في Supabase (جُرّب بمعاملة تُلغى، لم يبقَ أثر)؛ قبل تنفيذه يتدهور الزر برسالة «تعذّر تحميل المحتوى. أعد المحاولة.» دون تعليق. لا حاجب للإصدار.

## قائمة فحص RC (تُنفَّذ بعد إشارة «ابنِ RC»؛ بناء واحد إلى `~/.majalis-tools/rc/`)
حالة البنود الساكنة فُحصت 2026-10-15 على `native-app`؛ والباقي يُنفَّذ على الحزمة.
- [x] مسارات: `native-release-check.sh` ⇒ مدموج ومبني 212/212، ومُتحقَّق بلقطة 212/212، فحص Release ساكن نظيف.
- [x] رقم البناء: 1.2.0 (102) في `generate-xcodeproj.rb`، أكبر من `lastUploadedBuild`=101.
- [x] التشفير: `ITSAppUsesNonExemptEncryption=false` في Info.plist.
- [x] الفئة العمرية 4+ (مؤكَّدة من المالك؛ `APPSTORE_METADATA.md`).
- [x] الخصوصية: `PrivacyInfo.xcprivacy` للتطبيق والويدجت مطابق للأسباب المستعملة (`PRIVACY_CHECK.md`).
- [ ] أعد `native-release-check.sh` على الرأس النهائي قبل البناء (يجب بقاؤه أخضر بعد دمج ن1/ن2/ن3).
- [ ] محاكٍ نظيف: تثبيت الحزمة وتشغيل بارد بلا انهيار.
- [ ] فتح كل مسار رئيسي في الفاتح والداكن وRTL بلا شاشة فارغة.
- [x] الحسابان أُنشئا في Supabase الإنتاج بـAuto Confirm (2026-10-15): حساب المراجع `apple.review@ssunnah.com` (لا يُمسّ ولا يُحذف) وحساب اختبار الحذف `test.delete@ssunnah.com` (للحذف مرة واحدة فقط؛ كلمة المرور خارج المستودع). `delete_my_account` مطبَّقة ومُختبرة على مستوى القاعدة.
- [ ] حذف الحساب في التطبيق بحساب `test.delete@ssunnah.com` (الحساب ← مركز الخصوصية ← حذف الحساب نهائيًا ← «حذف»)، ثم التحقق أن الصف اختفى من `auth.users` وبياناته من الجداول المرتبطة. يُنفَّذ بيد المالك: إدخال كلمة المرور والحذف النهائي خارج ما أنفّذه آليًا.
- [x] تغطية «حذف الحساب»: الخلفية مُختبَرة على الإنتاج بمعاملة مُلغاة، والواجهة بعميل وهمي (`AccountDeletionFlowTests`: الزر لا يُفعَّل إلا بـ«حذف» بالضبط، `deleteAccount` مرة واحدة ثم signOut ثم مسح محلي عند النجاح، ورسالة الخطأ بلا signOut ولا مسح عند الفشل، وجسم الطلب `{}` بلا معرّف؛ الدالة تعتمد `auth.uid()` فقط). لقطات في `docs/native/shots/account-deletion/` (الأولى من المحاكي، وa/b/c عرض macOS بلا حقل النص). لم يُختبر على جهاز.
- **حذف الحساب لم يُختبر على جهاز حقيقي.** سيجرّبه يوسف على RC2 بحساب `test.delete@ssunnah.com` (لا حساب المراجع). المُثبَت: الخلفية (معاملة مُلغاة على الإنتاج) والواجهة (عميل وهمي) فقط.
- [ ] الويدجت: أوقات وتحديث (التوقيع على الجهاز بيد المالك).
- [ ] المصحف على 3 أحجام خط: تقليب وحفظ الموضع.
- [ ] شرط المالك: إنشاء حساب المراجع بـAuto Confirm (حجم القاعدة 420MB: لا إجراء).
- ما لا يثبته المحاكي (إشعارات، توقيع الويدجت) يُذكر صراحة ولا يُدّعى اجتيازه.

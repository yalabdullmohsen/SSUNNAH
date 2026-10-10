# خطوات الإرسال للمراجعة — الاثنين 12 أكتوبر (بيد يوسف)

1. اختبار الجهاز: نفّذ docs/program/DEVICE_TEST_CHECKLIST_1.1.0.md على TestFlight 1.1.0 (68). لا إرسال قبل نجاح A8 (الشاشة الفارغة).
2. GitHub → Actions → asc-store-sync → Run workflow: `status` ثم `sync` مع apply=true (يطبّق store/asc/metadata-1.1.0.json وreview-notes-1.1.0.txt).
3. App Store Connect → التطبيق → النسخة 1.1.0 → Build: اختر 68.
4. لقطات 6.9": store/screenshots/iphone-6.9 (الرئيسية، المصحف). ارفعها يدويًا إن لم تُرفع بالأتمتة؛ 6.5" وiPad إن طلبها ASC.
5. App Review Information: الملاحظات من review-notes-1.1.0.txt. لا حساب تجريبي (1.1.0 بلا تسجيل دخول). التسميع مغلق في App Store.
6. Privacy: PrivacyInfo مُدقَّق (بلا تتبّع). تأكد من تطابق تسميات الخصوصية في ASC.
7. Version Release = **Manual**.
8. Add for Review ← Submit for Review (النقرة الأخيرة لأبل/يوسف).
9. الأربعاء 14 أكتوبر بعد القبول: Release This Version يدويًا.

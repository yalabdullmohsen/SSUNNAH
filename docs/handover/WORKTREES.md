# سياسة الـ worktrees (إلزامية لكل النوافذ)

- المكان الوحيد: `~/ssunnah-wt/` — أربع نسخ دائمة فقط: `n1` `n2` `n3` `n4`.
- كل نافذة تعيد استخدام نسختها وتبدّل الفرع داخلها، ولا تنشئ worktree لكل مهمة:
  `scripts/wt-switch.sh n4 <branch> [origin/main]`
- ممنوع إنشاء clone أو worktree خارج `~/ssunnah-wt` (ولا تحت `/private/tmp` أو `~/.majalis-tools`).
- `node_modules` روابط رمزية إلى المستودع الرئيسي (ينشئها `wt-switch.sh`) فلا تكلّف مساحة.
- بعد دمج PR: `scripts/post-merge-cleanup.sh` يحذف الفرع المحلي (ويُستدعى ليلًا من `disk-clean.sh`).
- فروع `backup/*` على الـremote حفظ لنسخ قديمة؛ لا تُحذف.

## التنظيف الليلي
`scripts/install-disk-clean-launchd.sh` يثبّت launchd الساعة 03:00 → `scripts/disk-clean.sh`،
ونتيجته في `~/ssunnah-board/disk.log`. إن نزل الفارغ تحت 15GB يظهر `~/ssunnah-board/DISK_LOW`
ويطبع `ci-local-lock.sh` تحذيرًا؛ وتحت 10GB يرفض البناء.

## قاعدة البناء
DerivedData في مكان واحد: `~/ssunnah-build/DerivedData`، محاكٍ واحد: iPhone 17 Pro
(`D6FD9993-ED1B-4659-9C3B-B74999C0F87E`). قفل البناء يحذف ما فيه الأقدم من 3 أيام قبل كل بناء.

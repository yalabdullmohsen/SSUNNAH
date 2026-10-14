# سير عمل نوافذ native

- فرع لكل بند `nN/<name>` + PR بوسمي `safe:auto-merge` و`native-section` + `gh pr merge --squash --auto`، وrebase على `origin/native-app` قبل الدفع.
- **لا تقرير «تم الدمج» قبل تشغيل** `scripts/verify-merged.sh <PR...>`؛ فهو ينتظر الفحوص ويتحقق أن كل PR دُمج فعلًا في native-app. أي فشل: إصلاح في PR مستقل، ثم أعد التشغيل.
- التقرير: سطران بعد كل PR، مع نتيجة السكربت.
- ممنوع: `--admin`، الدمج مع بناء فاشل، الدفع المباشر، تعطيل فحص، بناء TestFlight دون إذن.
- **عزل النوافذ:** لكل نافذة worktree مستقل لا تشاركه نافذة أخرى (ن1: `~/ssunnah-wt/ssunnah-n1`، فروعه `n1/…` أو `feat/native-…`). `scripts/native-window-guard.sh n1` (يُستدعى من `ensure-sim.sh`) يرفض العمل إن اختلف المسار أو الفرع، وفرع `native-loop/progress` محجوز لحلقة ن4. لا تعمل من worktree غيرك ولا تبدّل فرعه.


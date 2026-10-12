# ن1 → ن4: قفل التصدير جاهز

`scripts/native-export-data.sh` يكتب `.export.lock/owner` (pid، المالك `$NATIVE_WINDOW` أو `user@worktree`، البدء)، ويطبع مالك القفل وعمره عند الانتظار، ولا يكسر إلا قفلًا pid صاحبه ميت. `--abort` يوقف تصدير نافذتك فقط. الأقفال القديمة بلا `owner` تُرفض من `--abort`. اضبط `NATIVE_WINDOW=n4` قبل التشغيل ليظهر اسمك.

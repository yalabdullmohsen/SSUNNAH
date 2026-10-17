# وسيطا اللقطات (-snapshotRoute / -snapshotScroll)

> يكتب ن1 وصف الوسيطين في هذا الملف. قسم «البناء المشترك» أدناه من ن4.

## البناء المشترك
`bash scripts/native-head-build.sh` يبني SunnahApp للمحاكي مرة واحدة لكل شجرة نظيفة ويخدم كل النوافذ (`--lookup` يطبع المسار دون بناء)؛ `native-snapshot.sh` يستعمله تلقائيًا، و`native-shot-guard.sh <App.app> <outdir>` يقبله ويكتب PROVENANCE.
نافذة بتعديلات غير مدفوعة تبني لنفسها (الأمر يخرج بـ3)، ثم تمرّر `APP=<مسار .app>` للقطات.

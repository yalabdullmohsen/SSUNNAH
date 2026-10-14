# قواعد عمليات البناء (xcodebuild) على الجهاز المشترك

- كل بناء يمرّ عبر `bash scripts/native-build-locked.sh <المالك> <سجل> <وسائط xcodebuild>`: قفل لكل `-derivedDataPath` يسجّل `pid` والمالك في `~/.ssunnah-tools/build-locks/*/owner`.
- **ممنوع** على أي نافذة استعمال `pkill` أو `killall` أو `kill` على عملية لا تملكها؛ يُقتل فقط الـpid المسجَّل باسمها في ملف `owner` (سبب فشل `rc=65`: قتل خارجي لـ`prepare-data.sh` أثناء البناء، 2026-10-12).
- إن قُتلت عملية بناء يعيد السكربت تشغيلها آليًا مرة واحدة قبل إعلان الفشل (السجل الأول يُحفظ في `<سجل>.killed`).
- مجلدات `-derivedDataPath` لكل نافذة: ن4 `~/.majalis-tools/dd/n4` (Release: `~/.majalis-tools/dd/n4-rel`) — ممنوع `/tmp` (يُمسح عند إعادة التشغيل)؛ لا تبنِ في مجلد نافذة أخرى.

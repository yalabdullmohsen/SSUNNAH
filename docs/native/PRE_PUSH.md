# خطّاف pre-push

على فروع `native-*` و`n1..n4/*` يشغّل الخطّاف حرّاس التطبيق الخفيفة فقط (chevron/plist/webview) بلا `ci:local` وبلا قفل ci-local المشترك؛ `ci:local` الكامل يبقى على فروع main/الويب (المصدر: `scripts/hooks/pre-push`، التثبيت: `scripts/install-pre-push-hook.sh`).

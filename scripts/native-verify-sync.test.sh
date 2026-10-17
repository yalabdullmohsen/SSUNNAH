#!/usr/bin/env bash
# اختبار native_verify_sync + حالة المسار النسبي: يعمل من أي مجلد، ولا يحمّل سكربت التصدير شيئًا بمسار نسبي لـ$0 بعد cd.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/native-sync-dir.sh"; . "$HERE/native-verify-sync.sh"
T=$(mktemp -d "${TMPDIR:-/tmp}/verify-test.XXXXXX"); trap 'rm -rf "${T:?}"' EXIT
mkdir -p "$T/s/a" "$T/d"; echo 1 >"$T/s/a/x"; echo 2 >"$T/s/y"
native_sync_dir "$T/s" "$T/d"; native_verify_sync "$T/s" "$T/d" >/dev/null
echo 3 >"$T/d/extra"; ! native_verify_sync "$T/s" "$T/d" 2>/dev/null || { echo "فشل: لم يكتشف ملفًا زائدًا" >&2; exit 1; }
rm "$T/d/extra"; echo changed >"$T/d/y"; ! native_verify_sync "$T/s" "$T/d" 2>/dev/null || { echo "فشل: لم يكتشف اختلاف المحتوى" >&2; exit 1; }
# المسار النسبي: التشغيل من مجلدات مختلفة
for d in "$HERE/.." "$HERE" "$T"; do (cd "$d" && bash "$HERE/native-sync-dir.test.sh" >/dev/null) || { echo "فشل: native-sync-dir.test من $d" >&2; exit 1; }; done
# سكربت التصدير: كل source بعد cd يجب أن يعتمد \$ROOT
if grep -nE '^\. +"\$\(cd "\$\(dirname "\$0"\)"' "$HERE/native-export-data.sh"; then echo "فشل: source نسبي لـ\$0 في native-export-data.sh" >&2; exit 1; fi
grep -q 'native_verify_sync "\$OUT" "\$FINAL"' "$HERE/native-export-data.sh" || { echo "فشل: التصدير لا يستدعي native_verify_sync" >&2; exit 1; }
echo "native-verify-sync: OK"

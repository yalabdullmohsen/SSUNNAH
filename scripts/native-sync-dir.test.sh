#!/usr/bin/env bash
# اختبار native_sync_dir على مجلد مؤقت: يتيم يُحذف، المجلد الفارغ يُزال، .input-hash يبقى، والمحتوى الجديد يستبدل القديم.
set -euo pipefail
. "$(cd "$(dirname "$0")" && pwd)/native-sync-dir.sh"
T=$(mktemp -d "${TMPDIR:-/tmp}/sync-test.XXXXXX"); trap 'rm -rf "${T:?}"' EXIT
mkdir -p "$T/out/a" "$T/final/a" "$T/final/old/sub"
echo new >"$T/out/a/x"; echo old >"$T/final/a/x"; echo o >"$T/final/a/orphan"; echo y >"$T/final/old/sub/y"; echo h >"$T/final/.input-hash"
native_sync_dir "$T/out" "$T/final"
[ "$(cat "$T/final/a/x")" = new ] || { echo "فشل: لم يُستبدل المحتوى" >&2; exit 1; }
[ ! -e "$T/final/a/orphan" ] || { echo "فشل: اليتيم باقٍ" >&2; exit 1; }
[ ! -e "$T/final/old" ] || { echo "فشل: مجلد فارغ باقٍ" >&2; exit 1; }
[ -f "$T/final/.input-hash" ] || { echo "فشل: حُذف .input-hash" >&2; exit 1; }
echo "native-sync-dir: OK"

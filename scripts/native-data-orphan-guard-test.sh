#!/usr/bin/env bash
# اختبار حارس يتامى ios-native/Data
set -uo pipefail
G="$(cd "$(dirname "$0")" && pwd)/native-data-orphan-guard.sh"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
mkdir -p "$T/a/sub"; echo 1 >"$T/a/x.json"; echo 2 >"$T/a/sub/y.json"; echo h >"$T/.input-hash"; cp "$T/.input-hash" "$T/a/.input-hash"
echo '{"files":[{"path":"x.json"},{"path":"sub/y.json"}]}' >"$T/a/MANIFEST.json"
DATA="$T/a" bash "$G" >/dev/null 2>&1 || { echo "FAIL: مجلد نظيف رُفض"; exit 1; }
echo 3 >"$T/a/sub/old.json"
out=$(DATA="$T/a" bash "$G" 2>&1) && { echo "FAIL: اليتيم لم يُكتشف"; exit 1; }
echo "$out" | grep -q "sub/old.json" || { echo "FAIL: لم يُذكر اليتيم"; exit 1; }
rm "$T/a/sub/old.json"; rm "$T/a/MANIFEST.json"
DATA="$T/a" bash "$G" >/dev/null 2>&1 && { echo "FAIL: غياب MANIFEST قُبل"; exit 1; }
echo "data-orphan-guard tests OK"

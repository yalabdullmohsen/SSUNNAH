#!/usr/bin/env bash
# بناء xcodebuild واحد في كل مرة مع قفل يسجّل pid والمالك، وإعادة تشغيل آلية مرة واحدة إن قُتلت العملية من الخارج.
# الاستعمال: bash scripts/native-build-locked.sh <المالك> <ملف-السجل> <وسائط xcodebuild…>
# القفل: ~/.ssunnah-tools/build-locks/<derivedDataPath-slug>/owner  (pid=… owner=… started=…)
# ممنوع على أي نافذة pkill/killall أو kill لعملية لا تملكها؛ يُقتل فقط pid المسجَّل باسمك في ملف owner.
set -uo pipefail
OWNER="${1:?المالك}"; LOG="${2:?السجل}"; shift 2
DD=$(printf '%s\n' "$@" | awk '/^-derivedDataPath$/{getline; print; exit}'); DD=${DD:-default}
LOCK="$HOME/.ssunnah-tools/build-locks/$(echo "$DD" | tr '/ ' '__')"
mkdir -p "$(dirname "$LOCK")"
until mkdir "$LOCK" 2>/dev/null; do
  p=$(sed -n 's/^pid=\([0-9]*\).*/\1/p' "$LOCK/owner" 2>/dev/null)
  if [[ -n "$p" ]] && ! kill -0 "$p" 2>/dev/null; then echo "native-build-lock: المالك pid=$p ميت — يُكسر" >&2; rm -rf "$LOCK"; continue; fi
  echo "native-build-lock: بناء جارٍ ($(cat "$LOCK/owner" 2>/dev/null)) — انتظار" >&2; sleep 15
done
trap 'rm -rf "$LOCK"' EXIT
echo "pid=$$ owner=$OWNER started=$(date +%s)" > "$LOCK/owner"
run() { bash "$(dirname "$0")/build-slot.sh" -- xcodebuild "$@" > "$LOG" 2>&1; }  # خانة عالمية (≤2 بناءين عبر النوافذ)
run "$@"; rc=$?
# 143/137 أو 65 مع "Terminated": عملية قُتلت من الخارج → محاولة ثانية واحدة قبل إعلان الفشل
if [[ $rc -ne 0 ]] && { [[ $rc -ge 128 ]] || grep -q "Terminated" "$LOG"; }; then
  echo "native-build-lock: قُتلت العملية (rc=$rc) — إعادة تلقائية واحدة" >&2
  cp "$LOG" "$LOG.killed"; run "$@"; rc=$?
fi
echo "build_rc=$rc" >> "$LOG"; exit $rc

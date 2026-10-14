#!/usr/bin/env bash
# يضمن وجود محاكٍ باسم <اسم-النافذة>-sim ويطبع UDID (ينشئه إن لم يوجد). لا يمسّ محاكيات الغير.
# الاستعمال: bash scripts/ensure-sim.sh n1 [--boot]   |   n1-b: المحاكي الثاني n1-sim-b (ن1 فقط)
set -euo pipefail
W="${1:?اسم النافذة (n1..n4 أو n1-b)}"; NAME="$W-sim"; [[ "$W" == "n1-b" ]] && NAME="n1-sim-b"   # المحاكي الثاني لـ ن1 فقط
bash "$(dirname "$0")/native-window-guard.sh" "$W" || exit $?
udid=$(xcrun simctl list devices | sed -n "s/^ *$NAME (\([0-9A-F-]*\)).*/\1/p" | head -1)
if [[ -z "$udid" ]]; then
  rt=$(xcrun simctl list runtimes | sed -n 's/.*\(com.apple.CoreSimulator.SimRuntime.iOS-[0-9-]*\)$/\1/p' | tail -1)
  udid=$(xcrun simctl create "$NAME" com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro "$rt")
fi
[[ "${2:-}" == "--boot" ]] && { xcrun simctl bootstatus "$udid" -b >/dev/null 2>&1 || true; }
echo "$udid"

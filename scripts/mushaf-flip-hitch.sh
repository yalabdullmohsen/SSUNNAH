#!/usr/bin/env bash
# قياس تقطيع تقليب المصحف داخل التطبيق (ن3): نسخة Debug تقلّب N صفحة آليًا وتقيس فواصل الإطارات (MushafFlipProbe).
# الاستعمال: scripts/mushaf-flip-hitch.sh [N=50] [صفحة البداية=100]   — يلزم محاكٍ ن3 (scripts/ensure-sim.sh n3).
set -euo pipefail
N="${1:-50}"; START="${2:-100}"
cd "$(dirname "$0")/.."
SIM="$(scripts/ensure-sim.sh n3 | tail -1)"; DD="${DD:-/tmp/n3-dd}"; BID=com.yousef.majlisilm
scripts/native-build-locked.sh n3 /tmp/n3-flip-build.log build -project ios-native/SunnahApp.xcodeproj -scheme SunnahApp -destination "id=$SIM" -derivedDataPath "$DD" >/dev/null 2>&1 || { tail -5 /tmp/n3-flip-build.log; exit 1; }
xcrun simctl bootstatus "$SIM" -b >/dev/null 2>&1 || true
xcrun simctl terminate "$SIM" "$BID" 2>/dev/null || true
xcrun simctl install "$SIM" "$DD/Build/Products/Debug-iphonesimulator/SunnahApp.app"
xcrun simctl launch "$SIM" "$BID" -snapshotRoute "/mushaf/page/$START" -mushafAutoFlip "$N" >/dev/null
for _ in $(seq 1 90); do
  sleep 2
  L="$(xcrun simctl spawn "$SIM" log show --last 3m --info --debug --predicate 'subsystem == "com.yousef.majlisilm" AND category == "mushaf-perf"' --style compact 2>/dev/null | grep MUSHAF_HITCH | tail -1 || true)"
  [ -n "$L" ] && { echo "$L" | sed 's/.*MUSHAF_HITCH/MUSHAF_HITCH/'; exit 0; }
done
echo "لم يظهر سطر MUSHAF_HITCH" >&2; exit 1

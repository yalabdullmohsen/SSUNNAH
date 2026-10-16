#!/usr/bin/env bash
# قياس تقطيع تقليب المصحف داخل التطبيق (ن3): نسخة Debug تقلّب N صفحة آليًا وتقيس فواصل الإطارات (MushafFlipProbe).
# الاستعمال: [DIR=-1] [SHOT=مسار.png] scripts/mushaf-flip-hitch.sh [N=50] [صفحة البداية=100]
#   DIR=-1 يقلّب للخلف؛ SHOT يلتقط الشاشة بعد انتهاء القياس (داخل المستودع، لا /tmp).   — يلزم محاكٍ ن3 (scripts/ensure-sim.sh n3).
set -euo pipefail
N="${1:-50}"; START="${2:-100}"
cd "$(dirname "$0")/.."
CONFIG="${CONFIG:-Debug}"   # CONFIG=Release يبني بلا تحسينات Debug مع تفعيل المسبار بعلم MUSHAF_PROBE
SIM="$(scripts/ensure-sim.sh n3 | tail -1)"; DD="${DD:-$HOME/.majalis-tools/dd/n3-$CONFIG}"; BID=com.yousef.majlisilm
scripts/native-build-locked.sh n3 /tmp/n3-flip-build.log build -project ios-native/SunnahApp.xcodeproj -scheme SunnahApp -destination "id=$SIM" -configuration "$CONFIG" OTHER_SWIFT_FLAGS='$(inherited) -DMUSHAF_PROBE' -derivedDataPath "$DD" >/dev/null 2>&1 || { tail -5 /tmp/n3-flip-build.log; exit 1; }
xcrun simctl bootstatus "$SIM" -b >/dev/null 2>&1 || true
xcrun simctl terminate "$SIM" "$BID" 2>/dev/null || true
xcrun simctl install "$SIM" "$DD/Build/Products/${CONFIG}-iphonesimulator/SunnahApp.app"
if [ -n "${SHOT:-}" ]; then SIM=$SIM bash scripts/native-shot-guard.sh "$DD/Build/Products/${CONFIG}-iphonesimulator/SunnahApp.app" "$(dirname "$SHOT")" >&2 || exit 2; fi  # لقطة الإطار من بناء HEAD
T0="$(date '+%Y-%m-%d %H:%M:%S')"
xcrun simctl launch "$SIM" "$BID" -snapshotRoute "/mushaf/page/$START" -mushafAutoFlip "$N" -mushafAutoFlipBack "$([ "${DIR:-1}" = -1 ] && echo YES || echo NO)" ${EXTRA:-} >/dev/null
for _ in $(seq 1 90); do
  sleep 2
  L="$(xcrun simctl spawn "$SIM" log show --start "$T0" --info --debug --predicate 'subsystem == "com.yousef.majlisilm" AND category == "mushaf-perf"' --style compact 2>/dev/null | grep MUSHAF_HITCH | tail -1 || true)"
  [ -n "$L" ] && { echo "$L" | sed 's/.*MUSHAF_HITCH/MUSHAF_HITCH/'; [ -n "${SHOT:-}" ] && { sleep 1; xcrun simctl io "$SIM" screenshot "$SHOT" >/dev/null 2>&1; }; exit 0; }
done
echo "لم يظهر سطر MUSHAF_HITCH" >&2; exit 1

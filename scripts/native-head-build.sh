#!/usr/bin/env bash
# بناء SunnahApp للمحاكي مرة واحدة لكل شجرة مصدر ويخدم كل النوافذ: ~/.majalis-tools/headbuild/<key>/{SunnahApp.app,PROVENANCE.txt,KEY}
# native-head-build.sh           يبني (عبر build-slot) إن لم يوجد، ويطبع مسار .app في آخر سطر. نافذة بتعديلات غير مدفوعة: يرفض (خروج 3) فابنِ لنفسك.
# native-head-build.sh --lookup  لا يبني: يطبع المسار إن كان مخزَّنًا ومطابقًا للمفتاح، وإلا لا شيء (خروج 1).
set -uo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"; cd "$R" || exit 2
HB="${HEADBUILD_DIR:-$HOME/.majalis-tools/headbuild}"
KEY=$(bash "$R/scripts/native-head-key.sh") || { [ "${1:-}" = --lookup ] && exit 1; echo "native-head-build: تعديلات غير مدفوعة في الكود — ابنِ لنفسك (هذا البناء لشجرة HEAD النظيفة فقط)" >&2; exit 3; }
D="$HB/$KEY"; APP="$D/SunnahApp.app"
if [ -f "$D/KEY" ] && [ -d "$APP" ]; then echo "$APP"; exit 0; fi
[ "${1:-}" = --lookup ] && exit 1
mkdir -p "$HB"; L="$HB/$KEY.lock"
if ! mkdir "$L" 2>/dev/null; then # بناء جارٍ لنفس المفتاح: انتظره بدل بناء ثانٍ
  echo "native-head-build: بناء $KEY جارٍ — انتظار" >&2
  for _ in $(seq 1 360); do sleep 5; [ -f "$D/KEY" ] && { echo "$APP"; exit 0; }
    [ -d "$L" ] || break; p=$(cat "$L/pid" 2>/dev/null); [ -n "$p" ] && ! kill -0 "$p" 2>/dev/null && { rm -rf "$L"; break; }; done
  [ -f "$D/KEY" ] && { echo "$APP"; exit 0; }; mkdir "$L" 2>/dev/null || { echo "native-head-build: تعذّر الحصول على القفل" >&2; exit 4; }
fi
echo $$ > "$L/pid"; trap 'rm -rf "$L"' EXIT
T="$HB/$KEY.tmp"; rm -rf "$T"; mkdir -p "$T"
sh ios-native/scripts/prepare-data.sh >/dev/null 2>&1
( cd ios-native && bash ../scripts/build-slot.sh -- xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath "$T/dd" build -quiet ) >"$T/build.log" 2>&1 \
  || { grep -E "error:" "$T/build.log" | sort -u | head -10 >&2; echo "native-head-build: فشل البناء (السجل $T/build.log)" >&2; exit 1; }
SRCAPP="$T/dd/Build/Products/Debug-iphonesimulator/SunnahApp.app"; [ -d "$SRCAPP" ] || { echo "native-head-build: لا .app ناتج" >&2; exit 1; }
EXE=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$SRCAPP/Info.plist")
rm -rf "$D"; mkdir -p "$D"; cp -R "$SRCAPP" "$APP"; cp "$T/build.log" "$D/build.log"
{ echo "git_sha=$(git rev-parse HEAD)"; echo "key=$KEY"; echo "sdk=$(xcrun --sdk iphonesimulator --show-sdk-version)"
  echo "binary_sha256=$(shasum -a 256 "$APP/$EXE" | cut -d' ' -f1)"; echo "built_at=$(date '+%F %T')"; } >"$D/PROVENANCE.txt"
echo "$KEY" >"$D/KEY"; rm -rf "$T"
echo "$APP"

#!/bin/bash
# إطلاق RC (TestFlight داخلي فقط). يتحقق من الشروط ثم يبني ويرفع؛ يتوقف عند أول شرط غير متحقق.
# الاستعمال: bash scripts/native-rc3-launch.sh <build> [--final]     (RC3 = 104 تجريبي؛ النهائي ≥105 مع --final)
# الشروط: PRs التقليب ومحرك المصحف وn1 مدموجة، native-release-check 212/212، EDGE-OK، native-rc-gate (RC_FINAL=1 للنهائي).
set -uo pipefail; cd "$(dirname "$0")/.."
BUILD="${1:?رقم البناء}"; FINAL=0; [ "${2:-}" = "--final" ] && FINAL=1
REQ_PRS="${REQ_PRS:-3335 3336}"
die() { echo "✗ $1" >&2; exit 1; }
git fetch -q origin native-app
for p in $REQ_PRS; do [ "$(gh pr view "$p" --json state -q .state)" = MERGED ] || die "PR #$p لم يُدمج بعد"; done
LAST=$(node -p 'require("./docs/native/release-state.json").lastUploadedBuild')
[ "$BUILD" -gt "$LAST" ] || die "البناء $BUILD ≤ آخر مرفوع ($LAST)"
sh ios-native/scripts/prepare-data.sh >/dev/null 2>&1
OUT=$(RC_FINAL=$FINAL bash scripts/native-release-check.sh 2>&1); echo "$OUT" | grep -q "212/212" || die "native-release-check ليس 212/212"
echo "$OUT" | grep -q "✗" && die "native-release-check فيه مخالفات"
bash scripts/build-slot.sh -- bash scripts/native-edge-check.sh | tail -1 | grep -qx EDGE-OK || die "EDGE-OK لم يتحقق"
RC_FINAL=$FINAL bash scripts/native-rc-gate.sh || die "بوابة RC مغلقة"
echo "✓ كل الشروط متحققة — بناء $BUILD"
bash scripts/native-archive-prepare.sh --set-version 1.2.0 --build "$BUILD" || die "فشل ضبط الإصدار"
OWNER_APPROVED_ARCHIVE=1 bash scripts/build-slot.sh -- bash scripts/native-archive-prepare.sh --archive || die "فشلت الأرشفة"
bash scripts/native-archive-privacy-check.sh ~/.majalis-tools/archives/SunnahApp-1.2.0-$BUILD.xcarchive || die "Privacy Report للأرشيف فيه مخالفات"
# shellcheck disable=SC1090
source ~/.appstoreconnect/env.sh
ARCH=~/.majalis-tools/archives/SunnahApp-1.2.0-$BUILD.xcarchive; [ -d "$ARCH" ] || die "لا أرشيف"
EXP=$(mktemp -d); xcodebuild -exportArchive -archivePath "$ARCH" -exportPath "$EXP" -exportOptionsPlist ~/.majalis-tools/rc1-export.plist -allowProvisioningUpdates >/dev/null 2>&1 || die "فشل التصدير"
UP=$(xcrun altool --upload-app -f "$EXP"/*.ipa -t ios --apiKey "$APP_STORE_CONNECT_API_KEY_ID" --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID" 2>&1); UPRC=$?
echo "$UP" | grep -E "ERROR|UPLOAD|Missing|code :" | head -12
[ $UPRC -eq 0 ] || die "فشل الرفع (altool رمز $UPRC)"
echo "↑ رُفع $BUILD. التالي: scripts/release-record.sh $BUILD $(date +%F) في PR ثم رفع المولّد إلى $((BUILD+1)) ومراقبة VALID."

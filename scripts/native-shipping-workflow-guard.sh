#!/usr/bin/env bash
# يفشل إن ظهر App.xcodeproj/App.xcworkspace (هدف Capacitor القديم، غير مشحون) في أي workflow شحن
# (اسمه testflight|deploy|release|appstore|ship، أو يستدعي fastlane beta/native_beta/pilot/upload_to_testflight). التعليقات (#) مستثناة.
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
fail=0
for f in .github/workflows/*.yml .github/workflows/*.yaml; do
  [ -f "$f" ] || continue
  ship=no; echo "$f" | grep -Eiq 'testflight|deploy|release|appstore|ship' && ship=yes
  grep -Ev '^[[:space:]]*#' "$f" | grep -Eq 'fastlane +(ios +)?(beta|native_beta|release)|pilot|upload_to_testflight' && ship=yes
  [ $ship = yes ] || continue
  hit=$(grep -Ev '^[[:space:]]*#' "$f" | grep -nE 'App\.xc(odeproj|workspace)' | head -3)
  [ -z "$hit" ] || { echo "✗ $f يشير إلى هدف Capacitor القديم في workflow شحن: $hit" >&2; fail=1; }
done
[ $fail = 0 ] && echo "✓ لا App.xcodeproj في workflows الشحن"
exit $fail

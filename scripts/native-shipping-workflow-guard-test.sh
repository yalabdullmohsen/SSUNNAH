#!/usr/bin/env bash
set -uo pipefail
G="$(cd "$(dirname "$0")" && pwd)/native-shipping-workflow-guard.sh"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; mkdir -p "$T/.github/workflows"; fail=0
ok(){ echo "  ✓ $1"; }; no(){ echo "  ✗ $1"; fail=1; }
printf 'jobs:\n  a:\n    steps:\n      - run: xcodebuild -project App.xcodeproj\n' > "$T/.github/workflows/ios-testflight-deploy.yml"
GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && no "يجب أن يفشل على testflight" || ok "يفشل على App.xcodeproj في workflow شحن"
printf '# App.xcodeproj قديم\njobs: {}\n' > "$T/.github/workflows/ios-testflight-deploy.yml"
GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && ok "التعليق لا يُحتسب" || no "التعليق"
printf 'jobs:\n  a:\n    steps:\n      - run: xcodebuild -project App.xcodeproj\n' > "$T/.github/workflows/ci.yml"
GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && ok "workflow غير شحن لا يُفحص" || no "ci"
printf 'jobs:\n  a:\n    steps:\n      - run: bundle exec fastlane ios beta\n      - run: xcodebuild -project App.xcodeproj\n' > "$T/.github/workflows/x.yml"
GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && no "fastlane beta بلا اسم شحن" || ok "يلتقط workflow شحن بالمحتوى"
bash "$G" >/dev/null 2>&1 && ok "المستودع الحقيقي نظيف" || no "المستودع الحقيقي"
[ $fail = 0 ] && echo "shipping-workflow-guard tests OK" || { echo FAILED; exit 1; }

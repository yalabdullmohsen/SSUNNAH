#!/usr/bin/env bash
# اختبار طفرة: الحارس ينجح على الحالي ويفشل إذا حُذفت الأيقونة أو اختلّ الإصدار/bundle id.
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
bash "$R/scripts/native-watch-assets-guard.sh" >/dev/null || { echo "الحارس يفشل على الحالي"; exit 1; }
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mut() { # اسم، أمر الطفرة داخل النسخة
  rm -rf "$T/ios"; mkdir -p "$T/ios"; cp -R "$R/ios-native/SunnahApp.xcodeproj" "$R/ios-native/SunnahWatchResources" "$T/ios/"
  ( cd "$T/ios" && eval "$2" )
  if WATCH_GUARD_ROOT="$T/ios" bash "$R/scripts/native-watch-assets-guard.sh" >/dev/null 2>&1; then echo "✗ الطفرة «$1» لم تُكتشف"; exit 1; fi
  echo "✓ طفرة «$1» اكتُشفت"
}
mut "حذف الأيقونة" 'rm -rf SunnahWatchResources/Assets.xcassets/AppIcon.appiconset'
mut "حذف صورة 1024" 'rm SunnahWatchResources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png'
mut "حذف entitlements" 'rm SunnahWatchResources/SunnahWatch.entitlements'
mut "حذف privacy" 'rm SunnahWatchResources/PrivacyInfo.xcprivacy'
mut "إصدار الساعة مختلف" "ruby -rxcodeproj -e 'p=Xcodeproj::Project.open(\"SunnahApp.xcodeproj\"); p.targets.find{|t|t.name==\"SunnahWatch\"}.build_configurations.each{|c|c.build_settings[\"CURRENT_PROJECT_VERSION\"]=\"1\"}; p.save'"
mut "bundle id خاطئ" "sed -i '' 's/com.yousef.majlisilm.watchkitapp;/com.yousef.majlisilm.watch;/' SunnahApp.xcodeproj/project.pbxproj"
echo "watch guard mutation tests OK"

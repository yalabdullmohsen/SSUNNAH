#!/usr/bin/env bash
# حارس أصول الساعة: يفشل قبل الأرشفة إن نقصت أيقونة SunnahWatch أو اختلّ bundle id/الإصدار/entitlements/privacy (رفض ASC 90391/90713).
# WATCH_GUARD_ROOT يغيّر جذر ios-native (لاختبار الطفرة).
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
IOS="${WATCH_GUARD_ROOT:-$R/ios-native}"
ruby -rxcodeproj -rjson -e '
ios = ARGV[0]; errs = []
proj = Xcodeproj::Project.open(File.join(ios, "SunnahApp.xcodeproj"))
t = ->(n) { proj.targets.find { |x| x.name == n } }
app, wk, wkx = t.("SunnahApp"), t.("SunnahWatch"), t.("SunnahWatchComplications")
(errs << "هدف SunnahApp/SunnahWatch/SunnahWatchComplications ناقص"; abort errs.join("\n")) unless app && wk && wkx
bs = ->(tg, k) { tg.build_configurations.map { |c| c.build_settings[k] }.uniq }
one = ->(tg, k) { v = bs.(tg, k); v.size == 1 ? v[0].to_s : (errs << "#{tg.name}: #{k} غير موحّد بين الإعدادات (#{v.inspect})"; "") }
pid = one.(app, "PRODUCT_BUNDLE_IDENTIFIER")
errs << "bundle id للساعة يجب #{pid}.watchkitapp" unless one.(wk, "PRODUCT_BUNDLE_IDENTIFIER") == "#{pid}.watchkitapp"
errs << "bundle id للـComplications يجب #{pid}.watchkitapp.complications" unless one.(wkx, "PRODUCT_BUNDLE_IDENTIFIER") == "#{pid}.watchkitapp.complications"
[wk, wkx].each do |tg|
  %w[CURRENT_PROJECT_VERSION MARKETING_VERSION].each { |k| errs << "#{tg.name}: #{k}=#{one.(tg, k)} لا يطابق التطبيق (#{one.(app, k)})" unless one.(tg, k) == one.(app, k) }
  errs << "#{tg.name}: SDKROOT يجب watchos" unless one.(tg, "SDKROOT") == "watchos"
  ent = one.(tg, "CODE_SIGN_ENTITLEMENTS"); errs << "#{tg.name}: entitlements مفقود (#{ent})" if ent.empty? || !File.file?(File.join(ios, ent))
  pl = one.(tg, "INFOPLIST_FILE"); errs << "#{tg.name}: Info.plist مفقود (#{pl})" if pl.empty? || !File.file?(File.join(ios, pl))
  errs << "#{tg.name}: PrivacyInfo.xcprivacy غير مضمَّن في Resources" unless tg.resources_build_phase.files.any? { |f| f.file_ref && f.file_ref.path.to_s.end_with?("PrivacyInfo.xcprivacy") }
end
pr = File.join(ios, "SunnahWatchResources/PrivacyInfo.xcprivacy")
errs << "PrivacyInfo.xcprivacy للساعة مفقود/غير صالح" unless File.file?(pr) && system("plutil", "-lint", pr, out: File::NULL, err: File::NULL)
# الأيقونة (90391/90713)
errs << "SunnahWatch: ASSETCATALOG_COMPILER_APPICON_NAME يجب AppIcon" unless bs.(wk, "ASSETCATALOG_COMPILER_APPICON_NAME") == ["AppIcon"]
errs << "SunnahWatch: Assets.xcassets غير مضمَّن في Resources" unless wk.resources_build_phase.files.any? { |f| f.file_ref && f.file_ref.path.to_s.end_with?("Assets.xcassets") }
cj = File.join(ios, "SunnahWatchResources/Assets.xcassets/AppIcon.appiconset/Contents.json")
if File.file?(cj)
  imgs = JSON.parse(File.read(cj))["images"] || []
  ok = imgs.any? { |i| i["filename"] && i["size"] == "1024x1024" && i["platform"] == "watchos" && File.file?(File.join(File.dirname(cj), i["filename"])) &&
    `sips -g pixelWidth -g pixelHeight "#{File.join(File.dirname(cj), i["filename"])}" 2>/dev/null`.scan(/: (\d+)/).flatten == %w[1024 1024] }
  errs << "أيقونة الساعة: لا صورة 1024x1024 watchos صالحة في AppIcon.appiconset" unless ok
else errs << "أيقونة الساعة: AppIcon.appiconset/Contents.json مفقود" end
# Info.plist
ip = File.join(ios, "SunnahWatchResources/Info.plist")
if File.file?(ip)
  pb = ->(k) { `/usr/libexec/PlistBuddy -c "Print :#{k}" "#{ip}" 2>/dev/null`.strip }
  errs << "Info.plist للساعة: WKApplication يجب true" unless pb.("WKApplication") == "true"
  errs << "Info.plist للساعة: WKCompanionAppBundleIdentifier يجب #{pid}" unless pb.("WKCompanionAppBundleIdentifier") == pid
  errs << "Info.plist للساعة: CFBundleVersion يجب $(CURRENT_PROJECT_VERSION)" unless pb.("CFBundleVersion") == "$(CURRENT_PROJECT_VERSION)"
end
if errs.empty? then puts "watch assets guard OK" else puts errs.map { |e| "✗ " + e }; exit 1 end
' "$IOS"

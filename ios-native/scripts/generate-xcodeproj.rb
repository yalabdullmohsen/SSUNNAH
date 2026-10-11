#!/usr/bin/env ruby
# يولّد ios-native/SunnahApp.xcodeproj (هدف SunnahApp) — شغّله: ruby ios-native/scripts/generate-xcodeproj.rb
require 'fileutils'
require 'xcodeproj'
root = File.expand_path('..', __dir__)
path = File.join(root, 'SunnahApp.xcodeproj')
FileUtils.rm_rf(path)
proj = Xcodeproj::Project.new(path)
proj.root_object.development_region = 'ar'
proj.root_object.known_regions = %w[ar en Base]
t = proj.new_target(:application, 'SunnahApp', :ios, '16.2')
app = proj.main_group.new_group('SunnahApp', 'SunnahApp')
Dir[File.join(root, 'SunnahApp/*.swift')].sort.each { |f| t.add_file_references([app.new_reference(File.basename(f))]) }
plat = app.new_group('Platform', 'Platform')
Dir[File.join(root, 'SunnahApp/Platform/*.swift')].sort.each { |f| t.add_file_references([plat.new_reference(File.basename(f))]) }
shared = proj.main_group.new_group('Shared')
%w[Shared/OfflineAudioStore Shared/PlaybackSessionController Shared/SunnahSharedData Shared/SunnahBrandColors Shared/SunnahWidgetEnvelope Shared/SunnahWidgetRefreshCoordinator Shared/SunnahPrayerDeepLink App/Services/KeychainStore].each do |n|
  r = shared.new_reference("../artifacts/majalis/ios/App/#{n}.swift"); r.source_tree = 'SOURCE_ROOT'
  t.add_file_references([r])
end
app.new_reference('Info.plist'); app.new_reference('SunnahApp.entitlements')
t.resources_build_phase.add_file_reference(app.new_reference('Resources/Assets.xcassets'))
data = proj.main_group.new_reference('Data'); data.source_tree = 'SOURCE_ROOT'; data.path = 'Data'
data.last_known_file_type = 'folder'
t.resources_build_phase.add_file_reference(data)
# حزمة SunnahNative محلية
ref = proj.new(Xcodeproj::Project::Object::XCLocalSwiftPackageReference)
ref.relative_path = '../artifacts/majalis/ios/App/SunnahNative'
proj.root_object.package_references << ref
dep = proj.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
dep.product_name = 'SunnahNative'
t.package_product_dependencies << dep
bf = proj.new(Xcodeproj::Project::Object::PBXBuildFile); bf.product_ref = dep
t.frameworks_build_phase.files << bf
# مرحلة تجهيز البيانات قبل نسخ الموارد
sp = t.new_shell_script_build_phase('تجهيز البيانات (prepare-data.sh)')
sp.shell_script = "\"${SRCROOT}/scripts/prepare-data.sh\"\n"
sp.always_out_of_date = '1'
t.build_phases.delete(sp); t.build_phases.insert(t.build_phases.index(t.resources_build_phase), sp)
t.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.yousef.majlisilm'
  s['INFOPLIST_FILE'] = 'SunnahApp/Info.plist'
  s['CODE_SIGN_ENTITLEMENTS'] = 'SunnahApp/SunnahApp.entitlements'
  s['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  s['DEVELOPMENT_TEAM'] = '5D8TX37HTS'
  s['MARKETING_VERSION'] = '1.1.0'; s['CURRENT_PROJECT_VERSION'] = '56'
  s['SWIFT_VERSION'] = '5.0'; s['TARGETED_DEVICE_FAMILY'] = '1,2'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.2'; s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
end
proj.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(t); scheme.set_launch_target(t)
scheme.save_as(path, 'SunnahApp', true)
puts "✓ #{path}"

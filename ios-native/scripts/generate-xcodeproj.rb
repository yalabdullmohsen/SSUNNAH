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
# glob متكرر: كل SunnahApp/**/*.swift عضو في الهدف تلقائيًا (مجموعة لكل مجلد) — لا قوائم يدوية تتعارض
add_dir = lambda do |group, dir|
  Dir[File.join(dir, '*.swift')].sort.each { |f| t.add_file_references([group.new_reference(File.basename(f))]) }
  Dir[File.join(dir, '*')].sort.select { |d| File.directory?(d) && !d.end_with?('.xcassets') && Dir.exist?(d) && !Dir[File.join(d, '**/*.swift')].empty? }.each do |d|
    add_dir.call(group.new_group(File.basename(d), File.basename(d)), d)
  end
end
add_dir.call(app, File.join(root, 'SunnahApp'))
shared = proj.main_group.new_group('Shared')
%w[Shared/OfflineAudioStore Shared/PlaybackSessionController Shared/SunnahSharedData Shared/SunnahBrandColors Shared/SunnahWidgetEnvelope Shared/SunnahWidgetPreferences Shared/SunnahWidgetRefreshCoordinator Shared/SunnahPrayerDeepLink App/PrayerActivityAttributes App/PrayerLiveActivityController App/Services/KeychainStore App/Tasmee/TasmeeEngine App/Tasmee/TasmeeModelStore App/Tasmee/TasmeeDiagnostics].each do |n|
  r = shared.new_reference("../artifacts/majalis/ios/App/#{n}.swift"); r.source_tree = 'SOURCE_ROOT'
  t.add_file_references([r])
end
app.new_reference('Info.plist'); app.new_reference('SunnahApp.entitlements')
t.resources_build_phase.add_file_reference(app.new_reference('Resources/Assets.xcassets'))
t.resources_build_phase.add_file_reference(app.new_reference('PrivacyInfo.xcprivacy'))
# خطوط OFL (Almarai للواجهة، Amiri للنصوص) — تُنسخ إلى جذر الحزمة ليطابقها UIAppFonts
%w[Almarai-Regular Almarai-Bold Almarai-ExtraBold Amiri-Regular Amiri-Bold NotoNaskhArabic-Regular NotoNaskhArabic-Bold].each do |f|
  t.resources_build_phase.add_file_reference(app.new_reference("Resources/Fonts/#{f}.ttf"))
end
data = proj.main_group.new_reference('Data'); data.source_tree = 'SOURCE_ROOT'; data.path = 'Data'
data.last_known_file_type = 'folder'
t.resources_build_phase.add_file_reference(data)
# مجلد الأصوات: مرجع مجلد فارغ من ملفات الصوت (README فقط) إلى أن يوافق المالك على الملفات
sounds = proj.main_group.new_reference('Sounds'); sounds.source_tree = 'SOURCE_ROOT'; sounds.path = 'Sounds'
sounds.last_known_file_type = 'folder'
t.resources_build_phase.add_file_reference(sounds)
# حزمة SunnahNative محلية
ref = proj.new(Xcodeproj::Project::Object::XCLocalSwiftPackageReference)
ref.relative_path = '../artifacts/majalis/ios/App/SunnahNative'
proj.root_object.package_references << ref
dep = proj.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
dep.product_name = 'SunnahNative'
t.package_product_dependencies << dep
bf = proj.new(Xcodeproj::Project::Object::PBXBuildFile); bf.product_ref = dep
t.frameworks_build_phase.files << bf
# WhisperKit (محرك التسميع على الجهاز) — الإصدار نفسه الذي يستعمله هدف Capacitor
wk = proj.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
wk.repositoryURL = 'https://github.com/argmaxinc/argmax-oss-swift.git'
wk.requirement = { 'kind' => 'upToNextMinorVersion', 'minimumVersion' => '0.18.0' }
proj.root_object.package_references << wk
wkdep = proj.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
wkdep.product_name = 'WhisperKit'; wkdep.package = wk
t.package_product_dependencies << wkdep
wkbf = proj.new(Xcodeproj::Project::Object::PBXBuildFile); wkbf.product_ref = wkdep
t.frameworks_build_phase.files << wkbf
# مرحلة تجهيز البيانات قبل نسخ الموارد
sp = t.new_shell_script_build_phase('تجهيز البيانات (prepare-data.sh)')
sp.shell_script = "\"${SRCROOT}/scripts/prepare-data.sh\"\n"
sp.always_out_of_date = '1'  # التخطي داخل prepare-data.sh بالـhash (مدخلاته آلاف الملفات خارج هدف Xcode)
sp.output_paths = ['$(SRCROOT)/Data/MANIFEST.json']
t.build_phases.delete(sp); t.build_phases.insert(t.build_phases.index(t.resources_build_phase), sp)
t.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.yousef.majlisilm'
  s['INFOPLIST_FILE'] = 'SunnahApp/Info.plist'
  s['CODE_SIGN_ENTITLEMENTS'] = 'SunnahApp/SunnahApp.entitlements'
  s['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  s['ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES'] = 'AppIcon-StarDish AppIcon-ZellijDark'
  s['ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS'] = 'YES'
  s['DEVELOPMENT_TEAM'] = '5D8TX37HTS'
  s['MARKETING_VERSION'] = '1.2.0'; s['CURRENT_PROJECT_VERSION'] = '115'
  s['SWIFT_VERSION'] = '5.0'; s['TARGETED_DEVICE_FAMILY'] = '1,2'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.2'; s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
end
# امتداد الودجت «الصلاة القادمة»: يعيد استخدام مصادر PrayerWidget المعتمدة كما هي (لا تعديل لها) + SunnahWidgetKit
wroot = '../artifacts/majalis/ios/App'
wt = proj.new_target(:app_extension, 'PrayerWidget', :ios, '16.2')
wg = proj.main_group.new_group('PrayerWidget')
Dir[File.join(root, wroot, 'PrayerWidget/*.swift')].sort.each do |f|
  r = wg.new_reference("#{wroot}/PrayerWidget/#{File.basename(f)}"); r.source_tree = 'SOURCE_ROOT'
  r.set_path("#{wroot}/PrayerWidget/#{File.basename(f)}")
  wt.add_file_references([r])
end
%w[SunnahSharedData SunnahBrandColors SunnahPrayerDeepLink SunnahWidgetEnvelope SunnahWidgetPreferences SunnahWidgetRefreshCoordinator].each do |n|
  r = shared.new_reference("../artifacts/majalis/ios/App/Shared/#{n}.swift"); r.source_tree = 'SOURCE_ROOT'
  wt.add_file_references([r])
end
winfo = wg.new_reference("#{wroot}/PrayerWidget/Info.plist"); winfo.source_tree = 'SOURCE_ROOT'
wg.new_reference("#{wroot}/PrayerWidget/PrayerWidget.entitlements").source_tree = 'SOURCE_ROOT'
# بيان الخصوصية الخاص بالامتداد (UserDefaults لمجموعة التطبيق → 1C8F.1) — مطلوب لكل حزمة تستعمل API ذا سبب مطلوب
wt.resources_build_phase.add_file_reference(wg.new_reference('PrayerWidgetResources/PrivacyInfo.xcprivacy'))
wref = proj.new(Xcodeproj::Project::Object::XCLocalSwiftPackageReference)
wref.relative_path = '../artifacts/majalis/ios/App/SunnahWidgetKit'
proj.root_object.package_references << wref
wdep = proj.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency); wdep.product_name = 'SunnahWidgetKit'
wt.package_product_dependencies << wdep
wbf = proj.new(Xcodeproj::Project::Object::PBXBuildFile); wbf.product_ref = wdep
wt.frameworks_build_phase.files << wbf
wt.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.yousef.majlisilm.PrayerWidget'
  s['INFOPLIST_FILE'] = "#{wroot}/PrayerWidget/Info.plist"
  s['CODE_SIGN_ENTITLEMENTS'] = "#{wroot}/PrayerWidget/PrayerWidget.entitlements"
  s['DEVELOPMENT_TEAM'] = '5D8TX37HTS'
  s['MARKETING_VERSION'] = '1.2.0'; s['CURRENT_PROJECT_VERSION'] = '115'
  s['SWIFT_VERSION'] = '5.0'; s['TARGETED_DEVICE_FAMILY'] = '1,2'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.2'; s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['SKIP_INSTALL'] = 'YES'; s['PRODUCT_NAME'] = '$(TARGET_NAME)'
end
t.add_dependency(wt)
emb = t.new_copy_files_build_phase('Embed Foundation Extensions')
emb.symbol_dst_subfolder_spec = :plug_ins
ebf = emb.add_file_reference(wt.product_reference, true)
ebf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
# Apple Watch: تطبيق watchOS (واجهة ن1 في SunnahWatch/App) + امتداد Complications، يُضمَّن في أرشيف الآيفون (Embed Watch Content)
wver = '10.0'
wk = proj.new_target(:application, 'SunnahWatch', :watchos, wver)
wkx = proj.new_target(:app_extension, 'SunnahWatchComplications', :watchos, wver)
wgrp = proj.main_group.new_group('SunnahWatch')
wapp = wgrp.new_group('App', 'SunnahWatch/App'); wcx = wgrp.new_group('Complications', 'SunnahWatch/Complications')
Dir[File.join(root, 'SunnahWatch/App/*.swift')].sort.each { |f| wk.add_file_references([wapp.new_reference(File.basename(f))]) }
Dir[File.join(root, 'SunnahWatch/Complications/*.swift')].sort.each { |f| wkx.add_file_references([wcx.new_reference(File.basename(f))]) }
# النماذج والسمة مشتركة بين الهدفين (README الواجهة)
%w[WatchModels WatchTheme].each { |n| wkx.add_file_references([wapp.files.find { |x| x.path == "#{n}.swift" }]) }
["SunnahSharedData", "SunnahWidgetEnvelope", "SunnahWidgetPreferences"].each { |n| wk.add_file_references([shared.new_reference("../artifacts/majalis/ios/App/Shared/#{n}.swift").tap { |r| r.source_tree = "SOURCE_ROOT" }]) }
wres = proj.main_group.new_group('SunnahWatchResources', 'SunnahWatchResources')
[wk, wkx].each do |tg|
  tg.resources_build_phase.add_file_reference(wres.new_reference('PrivacyInfo.xcprivacy'))
  dp = proj.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency); dp.product_name = 'SunnahWidgetKit'
  tg.package_product_dependencies << dp
  bfx = proj.new(Xcodeproj::Project::Object::PBXBuildFile); bfx.product_ref = dp
  tg.frameworks_build_phase.files << bfx
end
wk.resources_build_phase.add_file_reference(wres.new_reference('Assets.xcassets'))
wk.build_configurations.each { |c| c.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon' }
{ wk => ['com.yousef.majlisilm.watchkitapp', 'Info.plist', 'SunnahWatch.entitlements'],
  wkx => ['com.yousef.majlisilm.watchkitapp.complications', 'Complications-Info.plist', 'SunnahWatchComplications.entitlements'] }.each do |tg, (bid, plist, ent)|
  wres.new_reference(plist); wres.new_reference(ent)
  tg.build_configurations.each do |c|
    s = c.build_settings
    s['PRODUCT_BUNDLE_IDENTIFIER'] = bid
    s['INFOPLIST_FILE'] = "SunnahWatchResources/#{plist}"
    s['CODE_SIGN_ENTITLEMENTS'] = "SunnahWatchResources/#{ent}"
    s['DEVELOPMENT_TEAM'] = '5D8TX37HTS'
    s['MARKETING_VERSION'] = '1.2.0'; s['CURRENT_PROJECT_VERSION'] = '115'
    s['SWIFT_VERSION'] = '5.0'; s['TARGETED_DEVICE_FAMILY'] = '4'
    s['WATCHOS_DEPLOYMENT_TARGET'] = wver; s['GENERATE_INFOPLIST_FILE'] = 'NO'
    s['SDKROOT'] = 'watchos'; s['SKIP_INSTALL'] = 'YES'; s['PRODUCT_NAME'] = '$(TARGET_NAME)'
    s['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
  end
end
wk.build_configurations.each { |c| c.build_settings['SKIP_INSTALL'] = 'YES' }
wk.add_dependency(wkx)
wemb = wk.new_copy_files_build_phase('Embed Foundation Extensions')
wemb.symbol_dst_subfolder_spec = :plug_ins
wk_ebf = wemb.add_file_reference(wkx.product_reference, true)
wk_ebf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
t.add_dependency(wk)
wcp = t.new_copy_files_build_phase('Embed Watch Content')
wcp.dst_subfolder_spec = '16'; wcp.dst_path = '$(CONTENTS_FOLDER_PATH)/Watch'
wcbf = wcp.add_file_reference(wk.product_reference, true)
wcbf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
# هدف XCUITest: نقر فعلي على بلاطات الرئيسية (xcodebuild test) — يلتقط ما لا تلتقطه لقطات -snapshotRoute
ut = proj.new_target(:ui_test_bundle, 'SunnahAppUITests', :ios, '16.2')
ug = proj.main_group.new_group('SunnahAppUITests', 'SunnahAppUITests')
Dir[File.join(root, 'SunnahAppUITests/*.swift')].sort.each { |f| ut.add_file_references([ug.new_reference(File.basename(f))]) }
ut.add_dependency(t)
ut.build_configurations.each do |c|
  b = c.build_settings
  b['TEST_TARGET_NAME'] = 'SunnahApp'; b['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.yousef.majlisilm.UITests'
  b['SWIFT_VERSION'] = '5.0'; b['GENERATE_INFOPLIST_FILE'] = 'YES'; b['TARGETED_DEVICE_FAMILY'] = '1'
  b['DEVELOPMENT_TEAM'] = '5D8TX37HTS'
end
# حتمية: المعرّفات من ترتيب إنشاء الكائنات (السكربت نفسه حتمي: Dir[].sort) لا من تجزئة شجرة تعتمد ترتيب التمرير؛ توليدان = ملف متطابق بايتًا
class Xcodeproj::Project::UUIDGenerator
  def switch_uuids(project)
    project.mark_dirty!
    project.objects.each_with_index.each_with_object({}) do |(o, i), h|
      u = Digest::MD5.hexdigest("#{i}:#{o.isa}").upcase
      o.instance_variable_set(:@uuid, u); h[u] = o
    end
  end
end
proj.predictabilize_uuids
proj.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(t); scheme.set_launch_target(t)
scheme.add_test_target(ut)
scheme.save_as(path, 'SunnahApp', true)
puts "✓ #{path}"

#!/usr/bin/env ruby
# يطابق ملفات SunnahApp/**/*.swift على القرص بأعضاء هدف SunnahApp في المشروع المولَّد؛ يخرج 1 عند أي اختلاف.
require 'xcodeproj'
root = File.expand_path('..', __dir__)
proj = Xcodeproj::Project.open(File.join(root, 'SunnahApp.xcodeproj'))
t = proj.targets.find { |x| x.name == 'SunnahApp' }
members = t.source_build_phase.files.map { |b| b.file_ref.real_path.to_s }.select { |p| p.start_with?(File.join(root, 'SunnahApp') + '/') }.sort
disk = Dir[File.join(root, 'SunnahApp/**/*.swift')].map { |f| File.realpath(f) }.sort
members = members.map { |f| File.realpath(f) }
miss = disk - members; extra = members - disk
puts "قرص: #{disk.size} · أعضاء: #{members.size}"
miss.each { |f| puts "ليس عضوًا: #{f}" }; extra.each { |f| puts "عضو بلا ملف: #{f}" }
exit(miss.empty? && extra.empty? ? 0 : 1)

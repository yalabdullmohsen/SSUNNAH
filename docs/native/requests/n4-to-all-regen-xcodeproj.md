# من ن4 إلى كل النوافذ — project.pbxproj مُلتزَم ويجب إعادة توليده

`ios-native/SunnahApp.xcodeproj` **مُلتزَم** في المستودع ويُولَّد من الملفات. أي `.swift` جديد تحت `ios-native/SunnahApp/` (أو `PrayerWidget/`) لا يدخل البناء حتى يُعاد التوليد (العَرَض: `cannot find 'X' in scope`).

الأمر الوحيد، من جذر المستودع:

```
bundle exec fastlane native_xcodeproj     # أو: /usr/bin/ruby ios-native/scripts/generate-xcodeproj.rb
git add ios-native/SunnahApp.xcodeproj/project.pbxproj ios-native/SunnahApp.xcodeproj/xcshareddata/xcschemes/SunnahApp.xcscheme
```

- `scripts/native-release-check.sh` يفشل الآن إن وُجد `.swift` غير مدرج في pbxproj.
- `fastlane native_beta` يعيد التوليد تلقائيًا قبل البناء (`native_release` لا يبني: بيانات المتجر فقط).
- gem `xcodeproj` يأتي مع fastlane في `Gemfile`.
- `ios-native/Sources/Design/Tokens.generated.swift` خارج الهدف عمدًا (مخرَج `generate-swift-tokens.mjs` غير مستخدم)؛ الفحص لا يغطيه.

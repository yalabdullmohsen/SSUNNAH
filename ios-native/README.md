# ios-native — تطبيق سُنّة الأصلي (SwiftUI)
- `SunnahApp/`: هدف التطبيق (نقطة الدخول). يعتمد على الحزمة `artifacts/majalis/ios/App/SunnahNative` (الشاشات والقوالب) و`SunnahDataKit` (الجلب والكاش).
- قالب جديد: نفّذ `ScreenTemplate` (id/source/Content) ثم `TemplateRegistry.shared.register(T.self)` وافتحه بـ`Route.native(id:)`.
- البيانات المحزومة تُقرأ كما هي: `ContentSource.bundled(name:subdirectory:)`.
- التحقق: `swift build --triple arm64-apple-ios16.0-simulator --sdk $(xcrun --sdk iphonesimulator --show-sdk-path)` داخل الحزمة؛ بناء Xcode الكامل لـن4.

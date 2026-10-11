# ios-native — تطبيق سُنّة الأصلي (SwiftUI)
- `SunnahApp/`: هدف التطبيق (نقطة الدخول). يعتمد على الحزمة `artifacts/majalis/ios/App/SunnahNative` (الشاشات والقوالب) و`SunnahDataKit` (الجلب والكاش).
- قالب جديد: نفّذ `ScreenTemplate` (id/source/Content) ثم `TemplateRegistry.shared.register(T.self)` وافتحه بـ`Route.native(id:)`.
- البيانات المحزومة تُقرأ كما هي: `ContentSource.bundled(name:subdirectory:)`.
- التحقق: `swift build --triple arm64-apple-ios16.0-simulator --sdk $(xcrun --sdk iphonesimulator --show-sdk-path)` داخل الحزمة؛ بناء Xcode الكامل لـن4.

## البيانات
`ios-native/scripts/prepare-data.sh [مجلد_الإخراج]` يستدعي `scripts/native-export-data.sh` (تصدير + MANIFEST + إعادة تحقق من المجموع) ويولّد `ios-native/Data` افتراضيًا (غير مُلتزَم). يُضاف المجلد `Data` كمرجع مجلد لهدف SunnahApp مع Run Script Phase تستدعي السكربت قبل نسخ الموارد (ن4). القوالب تقرأ `Bundle.main` تحت `Data/<مجموعة>/…` (مثل `Data/adhkar/verified-adhkar.json`). الأذكار فارغة حتى يُوثَّق شيء في Supabase.

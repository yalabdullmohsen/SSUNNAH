// swift-tools-version: 5.9
import PackageDescription

// طبقة بيانات الهيكل الأصلي: كاش قرصي offline-first فوق ناقل بعيد يحقنه التطبيق
// (NetworkService الحالي)، فلا تُكرَّر الجلسة ولا الإعدادات (docs/program/PLAN.md).
let package = Package(
    name: "SunnahDataKit",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "SunnahDataKit", targets: ["SunnahDataKit"])
    ],
    targets: [
        .target(name: "SunnahDataKit"),
        .testTarget(name: "SunnahDataKitTests", dependencies: ["SunnahDataKit"])
    ]
)

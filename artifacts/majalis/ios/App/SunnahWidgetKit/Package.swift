// swift-tools-version: 5.9
import PackageDescription

// منطق الودجات النقي (تنسيق/حساب) بلا SwiftUI، قابل للاختبار بـ swift test دون محاكٍ.
let package = Package(
    name: "SunnahWidgetKit",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "SunnahWidgetKit", targets: ["SunnahWidgetKit"])
    ],
    targets: [
        .target(name: "SunnahWidgetKit"),
        .testTarget(name: "SunnahWidgetKitTests", dependencies: ["SunnahWidgetKit"])
    ]
)

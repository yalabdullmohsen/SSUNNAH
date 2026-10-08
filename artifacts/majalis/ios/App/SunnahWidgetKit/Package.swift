// swift-tools-version: 5.9
import PackageDescription

// منطق الودجات النقي (تنسيق/حساب) بلا SwiftUI، قابل للاختبار بـ swift test دون محاكٍ.
let package = Package(
    name: "SunnahWidgetKit",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "SunnahWidgetKit", targets: ["SunnahWidgetKit"])
    ],
    dependencies: [
        .package(path: "../SunnahPrayer")
    ],
    targets: [
        .target(name: "SunnahWidgetKit", dependencies: [.product(name: "SunnahPrayer", package: "SunnahPrayer")]),
        .testTarget(name: "SunnahWidgetKitTests", dependencies: ["SunnahWidgetKit"])
    ]
)

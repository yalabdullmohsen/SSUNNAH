// swift-tools-version: 5.9
import PackageDescription

// WebScreen: مضيف WKWebView للشاشات غير المحوّلة أصليًا (docs/program/PLAN.md).
// مستقل عن SunnahNative؛ يُربط بـ ScreenBuilder في PR الربط.
let package = Package(
    name: "SunnahWeb",
    defaultLocalization: "ar",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "SunnahWeb", targets: ["SunnahWeb"])
    ],
    targets: [
        .target(name: "SunnahWeb"),
        .testTarget(name: "SunnahWebTests", dependencies: ["SunnahWeb"])
    ]
)

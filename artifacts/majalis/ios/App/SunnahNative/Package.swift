// swift-tools-version: 5.9
import PackageDescription

// الهيكل الأصلي لسُنّة (SwiftUI). يُبنى ويُختبر مستقلًا عن هدف التطبيق،
// ويُربط به خلف المفتاح native_shell_enabled (docs/program/PLAN.md).
let package = Package(
    name: "SunnahNative",
    defaultLocalization: "ar",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "SunnahNative", targets: ["SunnahNative"])
    ],
    targets: [
        .target(name: "SunnahNative"),
        .testTarget(name: "SunnahNativeTests", dependencies: ["SunnahNative"])
    ]
)

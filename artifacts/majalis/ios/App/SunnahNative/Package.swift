// swift-tools-version: 5.9
import PackageDescription

// الهيكل الأصلي لسُنّة (SwiftUI). يُبنى ويُختبر مستقلًا عن هدف التطبيق (ios-native/SunnahApp).
let package = Package(
    name: "SunnahNative",
    defaultLocalization: "ar",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "SunnahNative", targets: ["SunnahNative"])
    ],
    dependencies: [
        .package(path: "../SunnahDataKit"),
        .package(path: "../SunnahPrayer")
    ],
    targets: [
        .target(name: "SunnahNative", dependencies: ["SunnahDataKit", "SunnahPrayer"]),
        .testTarget(name: "SunnahNativeTests", dependencies: ["SunnahNative"], resources: [.copy("Fixtures")])
    ]
)

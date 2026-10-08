// swift-tools-version: 5.9
import PackageDescription

// مواقيت الصلاة أصليًا (اليوم 3-4 في docs/program/PLAN.md).
// adhan-swift هو المنفذ الرسمي لـ adhan-js الذي يحسب به الويب (src/lib/prayer-times.ts)،
// فالخوارزمية واحدة؛ ويثبت ذلك اختبار التطابق مع مخرجات الويب.
let package = Package(
    name: "SunnahPrayer",
    defaultLocalization: "ar",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "SunnahPrayer", targets: ["SunnahPrayer"])
    ],
    dependencies: [
        .package(url: "https://github.com/batoulapps/adhan-swift", exact: "1.5.0")
    ],
    targets: [
        .target(name: "SunnahPrayer", dependencies: [.product(name: "Adhan", package: "adhan-swift")]),
        .testTarget(
            name: "SunnahPrayerTests",
            dependencies: ["SunnahPrayer"],
            resources: [.copy("Resources/web-parity.json")]
        )
    ]
)

// swift-tools-version:5.9
import PackageDescription

// أداة قياس «تسميع» على Mac (Apple Silicon): تشغّل WhisperKit بنموذج CoreML محوَّل وتُصدر نتائج جزئية متدفقة.
let package = Package(
    name: "tasmee-bench",
    platforms: [.macOS(.v14)],
    dependencies: [
        .package(url: "https://github.com/argmaxinc/argmax-oss-swift.git", from: "0.14.0"),
    ],
    targets: [
        .executableTarget(
            name: "tasmee-bench",
            dependencies: [.product(name: "WhisperKit", package: "argmax-oss-swift")]
        ),
    ]
)

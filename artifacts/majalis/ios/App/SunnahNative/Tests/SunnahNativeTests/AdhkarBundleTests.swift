import XCTest
@testable import SunnahNative

final class AdhkarBundleTests: XCTestCase {
    func testDecodesBundledJSONAsIs() throws {
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("ios-native/SunnahApp/Resources/data/adhkar.json")
        let bundle = try JSONDecoder().decode(AdhkarBundle.self, from: Data(contentsOf: url))
        XCTAssertFalse(bundle.categories.isEmpty)
        XCTAssertTrue(bundle.categories.allSatisfy { !bundle.items(in: $0).isEmpty })
    }
}

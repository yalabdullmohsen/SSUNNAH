import XCTest
@testable import SunnahNative

final class BundledDataIndexTests: XCTestCase {
    func testFindsNestedFileAndPrefersNonEmbedded() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("idx-\(UUID().uuidString).bundle")
        let fm = FileManager.default
        for p in ["Data/fiqh/zakat.json", "Data/embedded/zakat.json", "Data/embedded/only.json"] {
            let u = root.appendingPathComponent(p)
            try fm.createDirectory(at: u.deletingLastPathComponent(), withIntermediateDirectories: true)
            try Data("[]".utf8).write(to: u)
        }
        defer { try? fm.removeItem(at: root) }
        let bundle = try XCTUnwrap(Bundle(path: root.path))
        XCTAssertTrue(BundledDataIndex.url(named: "zakat", in: bundle)?.path.contains("/fiqh/") == true)
        XCTAssertNotNil(BundledDataIndex.url(named: "only", in: bundle))
        XCTAssertNil(BundledDataIndex.url(named: "missing", in: bundle))
    }
}

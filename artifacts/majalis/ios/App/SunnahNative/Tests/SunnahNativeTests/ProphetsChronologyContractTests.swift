import XCTest
@testable import SunnahNative

/// عقد الترتيب الزمني للأنبياء: كل ملف في `public/data/knowledge/prophets` له موضع في `ProphetStory.chronology`؛
/// نبي جديد بمعرّف غير مذكور كان سيُلحق في آخر القائمة بصمت (بعد محمد ﷺ).
final class ProphetsChronologyContractTests: XCTestCase {
    private func prophetsDir() throws -> URL {
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        for _ in 0..<10 {
            for rel in ["public/data/knowledge/prophets", "artifacts/majalis/public/data/knowledge/prophets"] {
                let c = dir.appendingPathComponent(rel)
                if FileManager.default.fileExists(atPath: c.path) { return c }
            }
            dir.deleteLastPathComponent()
        }
        XCTFail("public/data/knowledge/prophets غير موجود"); throw CocoaError(.fileNoSuchFile)
    }

    func testChronologyHasNoDuplicatesAndEndsWithMuhammad() {
        XCTAssertEqual(Set(ProphetStory.chronology).count, ProphetStory.chronology.count)
        XCTAssertEqual(ProphetStory.chronology.first, "adam")
        XCTAssertEqual(ProphetStory.chronology.last, "muhammad")
        XCTAssertEqual(ProphetStory.chronology.count, 25, "الأنبياء المذكورون في القرآن")
    }

    func testEveryProphetFileHasAPlaceInChronology() throws {
        let dir = try prophetsDir()
        struct Row: Decodable { let id: String }
        let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil).filter { $0.pathExtension == "json" }
        XCTAssertFalse(files.isEmpty)
        let ids = try files.map { try JSONDecoder().decode(Row.self, from: Data(contentsOf: $0)).id.replacingOccurrences(of: "prophet-", with: "") }
        let missing = ids.filter { !ProphetStory.chronology.contains($0) }.sorted()
        XCTAssertEqual(missing, [], "أضف المعرّف في موضعه الزمني من ProphetStory.chronology")
        XCTAssertEqual(Set(ids), Set(ProphetStory.chronology), "كل نبي في الترتيب له ملف")
    }
}

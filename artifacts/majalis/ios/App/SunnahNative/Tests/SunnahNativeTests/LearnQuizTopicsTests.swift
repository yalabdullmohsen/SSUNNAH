import XCTest
@testable import SunnahNative

/// أبواب الأسئلة: الباب الذي قسمه التصدير ملفات («السيرة-002» و«السيرة-003») بطاقة واحدة بمجموع أسئلته، لا بطاقتان بالعنوان نفسه.
final class LearnQuizTopicsTests: XCTestCase {
    private func manifest(_ chunks: [(String, Int)]) -> LearnQuizManifest {
        let body = chunks.map { "{\"file\":\"\($0.0)\",\"count\":\($0.1)}" }.joined(separator: ",")
        return try! JSONDecoder().decode(LearnQuizManifest.self, from: Data("{\"total\":0,\"chunks\":[\(body)]}".utf8))
    }

    func testSplitTopicMergesInFirstAppearanceOrder() {
        let t = manifest([("الأنبياء-000.json", 125), ("السيرة-002.json", 250), ("السيرة-003.json", 39), ("الفقه-004.json", 250), ("الفقه-005.json", 28)]).topics
        XCTAssertEqual(t.map(\.title), ["الأنبياء", "السيرة", "الفقه"])
        XCTAssertEqual(t.map(\.count), [125, 289, 278])
        XCTAssertEqual(t[1].chunks.map(\.file), ["السيرة-002.json", "السيرة-003.json"])
    }

    func testEmptyChunksAreDroppedAndEmptyTopicVanishes() {
        let t = manifest([("الحديث-009.json", 0), ("العقيدة-011.json", 250), ("العقيدة-012.json", 0)]).topics
        XCTAssertEqual(t.map(\.title), ["العقيدة"])
        XCTAssertEqual(t[0].chunks.count, 1)
    }

    func testRealManifestHasUniqueTopicTitles() throws {
        var url = URL(fileURLWithPath: #filePath)
        for _ in 0..<6 { url.deleteLastPathComponent() }
        let file = url.appendingPathComponent("public/data/quiz/manifest.json")
        guard FileManager.default.fileExists(atPath: file.path) else { throw XCTSkip("لا manifest") }
        let m = try JSONDecoder().decode(LearnQuizManifest.self, from: Data(contentsOf: file))
        let titles = m.topics.map(\.title)
        XCTAssertEqual(Set(titles).count, titles.count, "عنوان مكرر في شبكة الأبواب")
        XCTAssertEqual(m.topics.reduce(0) { $0 + $1.count }, m.chunks.reduce(0) { $0 + $1.count }, "لا يضيع سؤال بالضم")
    }
}

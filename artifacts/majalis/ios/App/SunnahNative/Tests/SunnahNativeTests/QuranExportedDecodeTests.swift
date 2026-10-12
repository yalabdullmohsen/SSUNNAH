import XCTest
@testable import SunnahNative

/// يفك ملفات JSON المصدَّرة فعليًا (Fixtures/quran، ناتج scripts/native/sections/quran-ts.mjs) بالنماذج،
/// فيظهر أي خلل في الشكل هنا لا في اللقطة. تُحدَّث الملفات بإعادة التصدير ونسخها.
final class QuranExportedDecodeTests: XCTestCase {
    private func load<T: Decodable>(_ type: T.Type, _ name: String) throws -> T {
        let url = try XCTUnwrap(Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Fixtures/quran"))
        return try JSONDecoder().decode(T.self, from: Data(contentsOf: url))
    }

    func testTajweed() throws {
        let f = try load(TajweedFile.self, "tajweed")
        XCTAssertEqual(f.chapters.count, 19)
        XCTAssertTrue(f.chapters.allSatisfy { !($0.source ?? "").isEmpty && !$0.title.isEmpty })
    }

    func testSurahStories() throws {
        let s = try load([SurahStory].self, "surah-stories")
        XCTAssertEqual(s.count, 114)
        XCTAssertEqual(Set(s.map(\.number)).count, 114)
    }

    func testHifzPaths() throws {
        let p = try load([HifzPath].self, "hifz-paths")
        XCTAssertEqual(p.count, 4)
        XCTAssertTrue(p.allSatisfy { !$0.units.isEmpty })
    }

    func testStats() throws {
        let s = try load([QuranStat].self, "stats")
        XCTAssertEqual(s.count, 95)
        XCTAssertEqual(Set(s.map(\.id)).count, 95)
    }

    func testQiraat() throws {
        let q = try load(QiraatFile.self, "qiraat")
        XCTAssertEqual([q.sections.count, q.ashara.count, q.diffs.count], [3, 10, 5])
    }

    func testAhruf() throws {
        XCTAssertEqual(try load([AhrufSection].self, "ahruf").count, 8)
    }

    func testMiraclesVerifiedWithSource() throws {
        let m = try load([MiracleItem].self, "miracles")
        XCTAssertEqual(m.count, 67)
        XCTAssertTrue(m.allSatisfy { !$0.scholarlySource.isEmpty && !$0.reference.isEmpty })
    }
}

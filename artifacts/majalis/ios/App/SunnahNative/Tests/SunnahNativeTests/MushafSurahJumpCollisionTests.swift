import XCTest
@testable import SunnahNative

/// القفز باسم السورة حين يجمع حذفُ الألف اسمين مختلفين: «الناس» و«النساء» كلاهما «لنس» بلا ألف،
/// فكان «الناس» يفتح النساء (أول تطابق). التطابق بالألف يسبق، والمتسامح لا يُقبل إلا فريدًا.
final class MushafSurahJumpCollisionTests: XCTestCase {
    private func index() throws -> MushafIndex {
        let names = [(2, "البقرة"), (4, "النساء"), (17, "الإسراء"), (92, "الليل"), (114, "الناس")]
        let surahs = names.map { "{\"id\":\($0.0),\"name\":\"\($0.1)\",\"ayahs\":3,\"firstPage\":\($0.0 * 5),\"lastPage\":\($0.0 * 5),\"place\":\"makkah\",\"bismillahPre\":true}" }
        let pages = names.map { "\"\($0.0):1\":\($0.0 * 5)" }
        return try JSONDecoder().decode(MushafIndex.self, from: Data("{\"surahs\":[\(surahs.joined(separator: ","))],\"juzStart\":[1],\"ayahPage\":{\(pages.joined(separator: ","))}}".utf8))
    }

    func testNasAndNisaOpenTheirOwnSurah() throws {
        let idx = try index()
        XCTAssertEqual(MushafSearch.jump("الناس", index: idx)?.title, "الناس")
        XCTAssertEqual(MushafSearch.jump("سورة الناس", index: idx)?.page, 570)
        XCTAssertEqual(MushafSearch.jump("النساء", index: idx)?.title, "النساء")
        XCTAssertEqual(MushafSearch.jump("النِّسَاءِ", index: idx)?.title, "النساء")
        XCTAssertEqual(MushafSearch.jump("الناس 1", index: idx)?.ayah, "114:1")
    }

    func testAmbiguousLooseSpellingIsNotGuessed() throws {
        // «النس» لا يطابق أحد الاسمين حرفيًا، ويطابق الاثنين بعد حذف الألف ⇒ لا قفز بدل اختيار أحدهما.
        XCTAssertNil(MushafSearch.jump("النس", index: try index()))
    }

    func testLooseSpellingStillWorksWhenUnique() throws {
        let idx = try index()
        XCTAssertEqual(MushafSearch.jump("الاسرا", index: idx)?.title, "الإسراء")
        XCTAssertEqual(MushafSearch.jump("بقره", index: idx)?.title, "البقرة")
        XCTAssertEqual(MushafSearch.jump("الليل", index: idx)?.title, "الليل")
    }
}

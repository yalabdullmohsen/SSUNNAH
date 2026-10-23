import XCTest
@testable import SunnahNative

/// قائمة السور في المصحف: البحث بالاسم متسامح مع الهمزات والمدة (كان contains الخام لا يجد «الأنعام» بـ«الانعام»).
final class MushafSurahFilterTests: XCTestCase {
    private func surah(_ id: Int, _ name: String) throws -> MushafSurah {
        try JSONDecoder().decode(MushafSurah.self, from: Data("{\"id\":\(id),\"name\":\"\(name)\",\"ayahs\":1,\"firstPage\":1,\"lastPage\":1,\"place\":\"makkah\",\"bismillahPre\":true}".utf8))
    }

    func testNameMatchesWithoutHamzaOrMadda() throws {
        XCTAssertTrue(MushafSurahFilter.matches(try surah(6, "الأنعام"), query: "الانعام", number: nil))
        XCTAssertTrue(MushafSurahFilter.matches(try surah(3, "آل عمران"), query: "ال عمران", number: nil))
        XCTAssertTrue(MushafSurahFilter.matches(try surah(17, "الإسراء"), query: "اسراء", number: nil))
        XCTAssertTrue(MushafSurahFilter.matches(try surah(2, "البقرة"), query: "البقره", number: nil))
        XCTAssertFalse(MushafSurahFilter.matches(try surah(2, "البقرة"), query: "الكهف", number: nil))
    }

    func testNumberMatchesById() throws {
        XCTAssertTrue(MushafSurahFilter.matches(try surah(18, "الكهف"), query: "18", number: 18))
        XCTAssertFalse(MushafSurahFilter.matches(try surah(19, "مريم"), query: "18", number: 18))
    }
}

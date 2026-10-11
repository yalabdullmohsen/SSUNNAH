import XCTest
@testable import SunnahNative

final class QuranAdaptersTests: XCTestCase {
    private func index() throws -> MushafIndex {
        try JSONDecoder().decode(MushafIndex.self, from: Data(#"{"surahs":[{"id":1,"name":"أ","ayahs":7,"firstPage":1,"lastPage":1,"place":"makkah","bismillahPre":false},{"id":2,"name":"ب","ayahs":286,"firstPage":2,"lastPage":49,"place":"madinah","bismillahPre":true},{"id":3,"name":"ج","ayahs":200,"firstPage":50,"lastPage":76,"place":"madinah","bismillahPre":true}],"juzStart":[1,22],"ayahPage":{}}"#.utf8))
    }

    func testRowsJoinRevelationOrder() throws {
        let meta = [QuranSurahMeta(id: 1, revelationOrder: 5, place: "makkah"), QuranSurahMeta(id: 2, revelationOrder: 87, place: "madinah")]
        let rows = QuranAdapters.rows(index: try index(), meta: meta)
        XCTAssertEqual(rows.map(\.revelationOrder), [5, 87, nil])
        XCTAssertEqual(rows[0].placeName, "مكية")
        XCTAssertEqual(rows[1].placeName, "مدنية")
    }

    func testByRevelationDropsUnknownAndSorts() throws {
        let meta = [QuranSurahMeta(id: 1, revelationOrder: 5, place: "makkah"), QuranSurahMeta(id: 2, revelationOrder: 2, place: "madinah")]
        let sorted = QuranAdapters.byRevelation(QuranAdapters.rows(index: try index(), meta: meta))
        XCTAssertEqual(sorted.map(\.id), [2, 1])
    }

    func testMakkiMadaniPartition() throws {
        let rows = QuranAdapters.rows(index: try index(), meta: [])
        XCTAssertEqual(QuranAdapters.makki(rows).map(\.id), [1])
        XCTAssertEqual(QuranAdapters.madani(rows).map(\.id), [2, 3])
    }
}

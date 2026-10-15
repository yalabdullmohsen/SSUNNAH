import XCTest
@testable import SunnahNative

final class MushafPositionPublisherTests: XCTestCase {
    private final class Spy: SharedDataPublishing, @unchecked Sendable {
        var isAvailable: Bool { true }
        var got: (Int, Int?, String?, Int?)?
        func publishProgress(dailyWirdCompleted: Int, dailyWirdTarget: Int, mushafPagesReadToday: Int) -> Bool { false }
        func publishMushafPosition(page: Int, surahNumber: Int?, surahName: String?, ayahNumber: Int?) -> Bool {
            got = (page, surahNumber, surahName, ayahNumber); return true
        }
    }

    private func index() throws -> MushafIndex {
        let json = """
        {"surahs":[{"id":1,"name":"الفاتحة","ayahs":7,"firstPage":1,"lastPage":1,"place":"makkah","bismillahPre":false},
                   {"id":2,"name":"البقرة","ayahs":286,"firstPage":2,"lastPage":49,"place":"madinah","bismillahPre":true}],
         "juzStart":[1,22],"ayahPage":{"1:1":1,"2:1":2,"2:2":2,"2:3":2,"2:6":3}}
        """
        return try JSONDecoder().decode(MushafIndex.self, from: Data(json.utf8))
    }

    func testPublishesSurahAndFirstAyahOfPage() throws {
        let spy = Spy()
        XCTAssertTrue(MushafPositionPublisher.publish(page: 2, index: try index(), to: spy))
        XCTAssertEqual(spy.got?.0, 2); XCTAssertEqual(spy.got?.1, 2)
        XCTAssertEqual(spy.got?.2, "البقرة"); XCTAssertEqual(spy.got?.3, 1)
    }

    func testClampsPageAndFallsBackToSurahOnPage() throws {
        let spy = Spy()
        MushafPositionPublisher.publish(page: 900, index: try index(), to: spy)
        XCTAssertEqual(spy.got?.0, 604)
        XCTAssertEqual(spy.got?.1, 2)
        XCTAssertNil(spy.got?.3)
    }

    func testDefaultPortIgnoresPosition() {
        XCTAssertFalse(NoSharedData().publishMushafPosition(page: 5, surahNumber: 2, surahName: nil, ayahNumber: 1))
    }
}

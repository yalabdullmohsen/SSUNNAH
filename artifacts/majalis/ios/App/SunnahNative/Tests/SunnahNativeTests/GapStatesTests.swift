import XCTest
@testable import SunnahNative

final class GapStatesTests: XCTestCase {
    func testSeerahPhasesDecodeAndMalformed() {
        let json = #"[{"id":"p1","num":1,"title":"ما قبل البعثة","year":"570م","desc":"د","topics":["أ"],"keyEvents":["ح"]}]"#
        XCTAssertEqual(SeerahPhasesView.phases(fromJSON: Data(json.utf8)).first?.num, 1)
        XCTAssertTrue(SeerahPhasesView.phases(fromJSON: Data("x".utf8)).isEmpty)
        XCTAssertTrue(SeerahPhasesView.phases(fromJSON: Data("[]".utf8)).isEmpty)
    }

    func testShamailDecodesBothBabShapes() {
        let json = #"[{"id":"khalq","label":"الخَلق","abwab":[{"id":1,"title":"باب","icon":"i","hadiths":[{"text":"نص","rawi":"أنس","source":"م"}]}]},{"id":"mahabbah","label":"المحبة","abwab":[{"title":"ب","text":"ن","source":"س"}]}]"#
        let tabs = ShamailView.tabs(fromJSON: Data(json.utf8))
        XCTAssertEqual(tabs.count, 2)
        XCTAssertEqual(tabs[0].abwab[0].hadiths?.first?.rawi, "أنس")
        XCTAssertEqual(tabs[1].abwab[0].text, "ن")
        XCTAssertTrue(ShamailView.tabs(fromJSON: Data("{".utf8)).isEmpty)
    }

    func testDirectoryEntriesUniquePaths() {
        let paths = DirectoryHubView.entries.map(\.path)
        XCTAssertEqual(Set(paths).count, 3)
    }
}

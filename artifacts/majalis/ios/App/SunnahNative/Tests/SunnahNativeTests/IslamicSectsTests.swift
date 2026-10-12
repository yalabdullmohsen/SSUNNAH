import XCTest
@testable import SunnahNative

final class IslamicSectsTests: XCTestCase {
    func testExportedEmptyArrayYieldsNoRecords() {
        XCTAssertTrue(IslamicSectsView.records(fromJSON: Data("[]".utf8)).isEmpty)
    }

    func testMalformedDataDegradesToEmptyNotCrash() {
        XCTAssertTrue(IslamicSectsView.records(fromJSON: Data("{oops".utf8)).isEmpty)
    }

    func testPublishedRecordsDecode() {
        let json = #"[{"id":"a","title":"مثال"}]"#
        XCTAssertEqual(IslamicSectsView.records(fromJSON: Data(json.utf8)).map(\.id), ["a"])
    }
}

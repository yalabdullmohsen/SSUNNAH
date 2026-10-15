import XCTest
@testable import SunnahDataKit

final class ScreenStateTrackerTests: XCTestCase {
    func testDuplicateAppearDoesNotLeak() {
        var t = ScreenStateTracker<String>(); let id = UUID()
        t.enter("loading", id: id); t.enter("loading", id: id)
        XCTAssertEqual(t.count("loading"), 1)
        t.leave("loading", id: id)
        XCTAssertEqual(t.count("loading"), 0)
    }
    func testLateDisappearOfOldScreenDoesNotClearNewScreen() {
        var t = ScreenStateTracker<String>(); let old = UUID(), new = UUID()
        t.enter("loading", id: old); t.reset()
        t.enter("loading", id: new)
        t.leave("loading", id: old)
        XCTAssertEqual(t.count("loading"), 1)
    }
    func testResetClearsAndRevisionAdvances() {
        var t = ScreenStateTracker<String>(); let r0 = t.revision
        t.enter("empty", id: UUID()); t.enter("error", id: UUID())
        XCTAssertGreaterThan(t.revision, r0)
        t.reset()
        XCTAssertEqual(t.count("empty") + t.count("error"), 0)
    }
}

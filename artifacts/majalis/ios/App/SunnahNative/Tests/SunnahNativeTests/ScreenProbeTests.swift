import XCTest
@testable import SunnahNative

@MainActor
final class ScreenProbeTests: XCTestCase {
    func testDuplicateAppearDoesNotLeakLoading() {
        let p = ScreenProbe(), id = UUID()
        p.enter(.loading, id: id); p.enter(.loading, id: id)
        XCTAssertTrue(p.isLoading)
        p.leave(.loading, id: id)
        XCTAssertFalse(p.isLoading)
    }
    func testLateDisappearOfOldScreenDoesNotClearNewScreen() {
        let p = ScreenProbe(), old = UUID(), new = UUID()
        p.enter(.loading, id: old); p.reset()
        p.enter(.loading, id: new)
        p.leave(.loading, id: old)
        XCTAssertTrue(p.isLoading)
    }
    func testOutcomePriority() {
        let p = ScreenProbe()
        p.enter(.empty, id: UUID()); XCTAssertEqual(p.outcome, "empty")
        p.enter(.error, id: UUID()); XCTAssertEqual(p.outcome, "error")
        p.reset(); XCTAssertEqual(p.outcome, "ok")
    }
}

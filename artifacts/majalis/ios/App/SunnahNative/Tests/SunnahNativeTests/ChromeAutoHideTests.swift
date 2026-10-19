import XCTest
@testable import SunnahNative

@MainActor
final class ChromeAutoHideTests: XCTestCase {
    private final class Fake: ChromeCancellable {
        let fire: @MainActor () -> Void; var cancelled = false
        init(_ f: @escaping @MainActor () -> Void) { fire = f }
        func cancel() { cancelled = true }
    }
    private var timers: [Fake] = []
    private var delays: [TimeInterval] = []
    private func make() -> ChromeAutoHide {
        ChromeAutoHide { d, f in let t = Fake(f); self.timers.append(t); self.delays.append(d); return t }
    }
    private func fireLast() { if let t = timers.last, !t.cancelled { t.fire() } }

    func testTapShowsThenHidesAfterTwoSeconds() {
        let c = make(); c.tapEmpty()
        XCTAssertTrue(c.visible); XCTAssertEqual(delays.last, 6)
        fireLast(); XCTAssertFalse(c.visible)
    }

    func testTouchResetsTimer() {
        let c = make(); c.tapEmpty(); let first = timers.last!
        c.touch()
        XCTAssertTrue(first.cancelled); XCTAssertEqual(timers.count, 2)
        first.fire(); fireLast(); XCTAssertFalse(c.visible)
    }

    func testTouchWhileHiddenDoesNotShow() {
        let c = make(); c.touch(); XCTAssertFalse(c.visible); XCTAssertTrue(timers.isEmpty)
    }

    func testPinnedStaysVisibleAndRearmsOnUnpin() {
        let c = make(); c.tapEmpty(); c.pin(true)
        XCTAssertTrue(timers.last!.cancelled); XCTAssertTrue(c.visible)
        c.touch(); XCTAssertTrue(c.visible)
        c.pin(false); fireLast(); XCTAssertFalse(c.visible)
    }

    func testVoiceOverKeepsAlwaysVisible() {
        let c = make(); c.alwaysVisible = true
        XCTAssertTrue(c.visible); c.tapEmpty(); XCTAssertTrue(c.visible)
        c.touch(); XCTAssertTrue(c.visible)
    }

    func testSecondTapHidesAndPinnedStaysVisible() {
        let c = make(); c.toggle(); XCTAssertTrue(c.visible)
        c.toggle(); XCTAssertFalse(c.visible)
        c.toggle(); c.pin(true); c.toggle(); XCTAssertTrue(c.visible)
    }

    func testCancelOnLeaveStopsTimer() {
        let c = make(); c.tapEmpty(); c.cancel(); XCTAssertTrue(timers.last!.cancelled)
    }
}

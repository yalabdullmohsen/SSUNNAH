import XCTest
@testable import SunnahNative

final class IntroPolicyTests: XCTestCase {
    func testColdLaunchShowsFull() {
        XCTAssertEqual(IntroPolicy.style(isColdLaunch: true, reduceMotion: false), .full)
    }
    func testReturnFromBackgroundShowsNothing() {
        XCTAssertEqual(IntroPolicy.style(isColdLaunch: false, reduceMotion: false), .none)
        XCTAssertEqual(IntroPolicy.style(isColdLaunch: false, reduceMotion: true), .none)
    }
    func testReduceMotionIsSimplified() {
        XCTAssertEqual(IntroPolicy.style(isColdLaunch: true, reduceMotion: true), .simplified)
    }
    @MainActor func testColdLaunchConsumedOnce() {
        _ = IntroPolicy.consumeColdLaunch()
        XCTAssertFalse(IntroPolicy.consumeColdLaunch())
    }
    func testExtraHoldIsCappedAtThreeSeconds() {
        XCTAssertEqual(IntroPolicy.extraHold(readyAt: 0.5), 0)
        XCTAssertEqual(IntroPolicy.extraHold(readyAt: 2.0), 0.4, accuracy: 0.001)
        XCTAssertEqual(IntroPolicy.extraHold(readyAt: nil), 1.4, accuracy: 0.001)
        XCTAssertEqual(IntroPolicy.extraHold(readyAt: 9), 1.4, accuracy: 0.001)
    }
    func testThemeFollowsChosenIcon() {
        XCTAssertEqual(IntroTheme.current(alternateIconName: "AppIcon-StarDish", dark: false), .starDish)
        XCTAssertEqual(IntroTheme.current(alternateIconName: "AppIcon-ZellijDark", dark: false), .zellijDark)
        XCTAssertEqual(IntroTheme.current(alternateIconName: nil, dark: false), .primary)
        XCTAssertEqual(IntroTheme.current(alternateIconName: nil, dark: true), .zellijDark)
    }
    func testPiecesStructure() {
        let p = IntroPieces.build(.primary)
        XCTAssertEqual(p.filter { $0.role == .core }.count, 2)
        XCTAssertEqual(p.filter { if case .tile = $0.role { return true } else { return false } }.count, 8)
        XCTAssertEqual(p.filter { $0.role == .gold }.count, 8)
        XCTAssertEqual(IntroPieces.build(.starDish).filter { $0.role == .core }.count, 5)
    }
}

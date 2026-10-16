import XCTest
@testable import SunnahNative

/// منطق ظهور/إخفاء الشريط السفلي في شاشات القراءة الكاملة (لمسة الصفحة تُظهره وثانية تخفيه).
@MainActor
final class ImmersiveReaderStateTests: XCTestCase {
    func testHiddenByDefaultWhenReaderEnters() {
        let s = ImmersiveReaderState(), a = UUID()
        XCTAssertFalse(s.hidesTabBar)
        s.enter(a, revealed: false)
        XCTAssertTrue(s.hidesTabBar)
        XCTAssertTrue(s.isActive)
    }

    func testPageTapRevealsThenHidesTabBar() {
        let s = ImmersiveReaderState(), a = UUID()
        s.enter(a, revealed: false)
        s.enter(a, revealed: true)    // لمسة الصفحة
        XCTAssertFalse(s.hidesTabBar)
        s.enter(a, revealed: false)   // لمسة ثانية
        XCTAssertTrue(s.hidesTabBar)
    }

    func testLeavingRestoresTabBar() {
        let s = ImmersiveReaderState(), a = UUID()
        s.enter(a, revealed: false)
        s.leave(a)
        XCTAssertFalse(s.hidesTabBar)
        XCTAssertFalse(s.isActive)
    }

    func testTopmostScreenDecides() {
        let s = ImmersiveReaderState(), reader = UUID(), detail = UUID()
        s.enter(reader, revealed: false)
        s.enter(detail, revealed: true)   // شاشة فوق القارئ تُظهر الشريط
        XCTAssertFalse(s.hidesTabBar)
        s.leave(detail)
        XCTAssertTrue(s.hidesTabBar)
    }
}

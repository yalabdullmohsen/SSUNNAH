import XCTest
@testable import SunnahNative

final class MotionTokensTests: XCTestCase {
    func testAllDurationsWithinCeiling() {
        let all = [SunnahMotion.Duration.press, SunnahMotion.Duration.quick, SunnahMotion.Duration.standard, SunnahMotion.Duration.navigate, SunnahMotion.Duration.fade]
        for d in all { XCTAssertLessThanOrEqual(d, SunnahMotion.maxDuration) }
        XCTAssertLessThanOrEqual(SunnahMotion.maxDuration, 0.35)
    }

    func testHapticsDefaultOn() {
        UserDefaults.standard.removeObject(forKey: SunnahNavHaptics.defaultsKey)
        XCTAssertTrue(SunnahNavHaptics.enabled)
    }
}

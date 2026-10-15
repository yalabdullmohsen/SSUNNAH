import XCTest
@testable import SunnahNative

final class OnceGuardTests: XCTestCase {
    /// استدعاء ثانٍ لا أثر له: تسجيل واحد فقط (عقد PerformanceMetrics.start()).
    func testSecondRunHasNoEffect() {
        let g = OnceGuard(); var registrations = 0
        XCTAssertTrue(g.run { registrations += 1 })
        XCTAssertFalse(g.run { registrations += 1 })
        XCTAssertEqual(registrations, 1)
    }

    func testConcurrentRunsRegisterOnce() {
        let g = OnceGuard(); let lock = NSLock(); var n = 0
        DispatchQueue.concurrentPerform(iterations: 50) { _ in g.run { lock.lock(); n += 1; lock.unlock() } }
        XCTAssertEqual(n, 1)
    }
}

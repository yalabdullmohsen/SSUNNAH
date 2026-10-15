import XCTest
@testable import SunnahNative

@MainActor
final class PostFirstFrameTests: XCTestCase {
    func testWorkWaitsForFirstFrameThenRunsInOrder() {
        let gate = PostFirstFrame(); var log: [String] = []
        gate.whenReady { log.append("platform") }
        gate.whenReady { log.append("widget") }
        XCTAssertTrue(log.isEmpty, "لا عمل قبل أول إطار")
        gate.fire()
        XCTAssertEqual(log, ["platform", "widget"])
    }

    func testFireIsIdempotentAndLateWorkRunsImmediately() {
        let gate = PostFirstFrame(); var n = 0
        gate.whenReady { n += 1 }
        gate.fire(); gate.fire()
        XCTAssertEqual(n, 1, "لا تكرار عند fire المتعدد")
        gate.whenReady { n += 10 }
        XCTAssertEqual(n, 11, "ما سُجّل بعد الإطلاق يُنفَّذ فورًا (عودة التطبيق للمقدمة)")
        XCTAssertTrue(gate.hasFired)
    }
}

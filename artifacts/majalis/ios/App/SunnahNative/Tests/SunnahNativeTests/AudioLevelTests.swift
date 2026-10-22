import XCTest
@testable import SunnahNative

final class AudioLevelTests: XCTestCase {
    func testSilenceIsZeroAndFullScaleIsOne() {
        XCTAssertEqual(AudioLevel.normalized(rms: 0), 0)
        XCTAssertEqual(AudioLevel.normalized(rms: 1), 1, accuracy: 0.001)
        XCTAssertEqual(AudioLevel.normalized(rms: 0.001), 0)   // −60 dB تحت الأرضية
    }

    func testLouderIsMonotonicallyHigher() {
        let quiet = AudioLevel.normalized(rms: 0.01), mid = AudioLevel.normalized(rms: 0.1), loud = AudioLevel.normalized(rms: 0.5)
        XCTAssertTrue(0 < quiet && quiet < mid && mid < loud && loud < 1)
    }

    func testRmsOfConstantAndSine() {
        let c = [Float](repeating: 0.5, count: 100)
        XCTAssertEqual(c.withUnsafeBufferPointer { AudioLevel.rms($0) }, 0.5, accuracy: 1e-6)
        let sine = (0..<1000).map { Float(sin(Double($0) * 2 * .pi / 100)) }
        XCTAssertEqual(sine.withUnsafeBufferPointer { AudioLevel.rms($0) }, 0.70710678, accuracy: 0.01)
    }
}

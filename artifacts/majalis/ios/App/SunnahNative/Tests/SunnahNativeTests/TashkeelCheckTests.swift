import XCTest
@testable import SunnahNative

final class TashkeelCheckTests: XCTestCase {
    func testMatchAndMismatch() {
        XCTAssertEqual(TashkeelCheck.compare(expected: "كَتَبَ", said: "كَتَبَ"), .match)
        XCTAssertEqual(TashkeelCheck.compare(expected: "كَتَبَ", said: "كُتِبَ"), .mismatch)
    }

    func testUnmarkedSpeechIsUnknownNotError() {
        XCTAssertEqual(TashkeelCheck.compare(expected: "كَتَبَ", said: "كتب"), .unknown)
        XCTAssertEqual(TashkeelCheck.compare(expected: "كَتَبَ", said: "ذهب"), .unknown)
    }

    func testQuranicMarksIgnored() {
        XCTAssertEqual(TashkeelCheck.compare(expected: "ٱلْحَمْدُ", said: "الْحَمْدُ"), .match)
    }
}

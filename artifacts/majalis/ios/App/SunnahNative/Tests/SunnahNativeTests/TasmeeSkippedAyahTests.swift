import XCTest
@testable import SunnahNative

final class TasmeeSkippedAyahTests: XCTestCase {
    private let words: [(surah: Int, ayah: Int)] = [(2, 11), (2, 11), (2, 12), (2, 12), (2, 13)]

    func testFullySkippedAyahIsReportedWithMessage() {
        let r = TasmeeSkippedAyahDetector.fullySkipped(words: words, states: [.correct, .correct, .skipped, .skipped, .correct], reached: 5)
        XCTAssertEqual(r, [TasmeeSkippedAyah(surah: 2, ayah: 12)])
        XCTAssertEqual(r.first?.message, "تجاوزتَ الآية ١٢")
    }

    func testPartiallySkippedAyahIsNotReported() {
        let r = TasmeeSkippedAyahDetector.fullySkipped(words: words, states: [.correct, .correct, .skipped, .correct, .correct], reached: 5)
        XCTAssertTrue(r.isEmpty)
    }

    func testAyahBeyondReachedIsIgnored() {
        let r = TasmeeSkippedAyahDetector.fullySkipped(words: words, states: [.correct, .correct, .skipped, .skipped, .pending], reached: 3)
        XCTAssertTrue(r.isEmpty)
    }
}

import XCTest
@testable import SunnahNative

final class TasmeeVoiceSearchTests: XCTestCase {
    private let idx: [(ayah: String, norm: String)] = [
        ("1:2", "الحمد لله رب العالمين"),
        ("1:3", "الرحمن الرحيم"),
        ("112:1", "قل هو الله احد"),
        ("112:2", "الله الصمد"),
    ]

    func testExactAndNoisyMatchRankFirst() {
        let s = TasmeeVoiceSearch(index: idx)
        XCTAssertEqual(s.search("الحمد لله رب العالمين").first?.ayah, "1:2")
        XCTAssertEqual(s.search("الحمد لله رب العالمن").first?.ayah, "1:2")   // خطأ تفريغ
        XCTAssertEqual(s.search("قل هو الله").first?.ayah, "112:1")           // مقطع جزئي
    }

    func testEmptyOrUnrelatedReturnsNothing() {
        let s = TasmeeVoiceSearch(index: idx)
        XCTAssertTrue(s.search("").isEmpty)
        XCTAssertTrue(s.search("xyz").isEmpty)
    }

    func testLimitRespected() {
        XCTAssertLessThanOrEqual(TasmeeVoiceSearch(index: idx).search("الله", limit: 2).count, 2)
    }
}

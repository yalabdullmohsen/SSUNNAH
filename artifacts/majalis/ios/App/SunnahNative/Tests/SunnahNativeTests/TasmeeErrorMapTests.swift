import XCTest
@testable import SunnahNative

final class TasmeeErrorMapTests: XCTestCase {
    private func w(_ s: Int, _ a: Int, _ i: Int, box: Int = 0, misses: Int = 1) -> TasmeeWeakWord {
        TasmeeWeakWord(surah: s, ayah: a, wordIndex: i, box: box, dueAt: Date(), misses: misses)
    }

    func testLevelsGrowWithMissesAndShrinkWithBox() {
        let m = TasmeeErrorMap.weakness([w(2, 1, 0), w(2, 2, 0, misses: 2), w(2, 3, 0, misses: 5), w(2, 4, 0, box: 3, misses: 3)])
        XCTAssertEqual(m["2:1"], .mild)
        XCTAssertEqual(m["2:2"], .medium)
        XCTAssertEqual(m["2:3"], .strong)
        XCTAssertEqual(m["2:4"], .mild)
    }

    func testWordsOfSameAyahAccumulate() {
        let m = TasmeeErrorMap.weakness([w(1, 1, 0), w(1, 1, 1)])
        XCTAssertEqual(m["1:1"], .medium)
    }

    func testPageWeaknessTakesMaxAndEmptyIsNone() {
        let m = TasmeeErrorMap.weakness([w(2, 3, 0, misses: 5)])
        XCTAssertEqual(TasmeeErrorMap.pageWeakness(ayahs: [(2, 1), (2, 3)], map: m), .strong)
        XCTAssertEqual(TasmeeErrorMap.pageWeakness(ayahs: [], map: m), .none)
    }
}

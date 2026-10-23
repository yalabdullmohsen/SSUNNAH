import XCTest
@testable import SunnahNative

final class TasmeeWeakWordBankTests: XCTestCase {
    private let t0 = Date(timeIntervalSince1970: 1_800_000_000)
    private func rec(_ at: Date, _ evs: [TasmeeSessionEvent]) -> TasmeeSessionRecord {
        TasmeeSessionRecord(startedAt: at, durationSec: 10, mode: .recite, surah: 2, fromAyah: 1, toAyah: 1,
                            totalWords: evs.count, events: evs)
    }
    private func ev(_ w: Int, _ k: TasmeeEventKind, peek: Bool = false) -> TasmeeSessionEvent {
        TasmeeSessionEvent(surah: 2, ayah: 1, wordIndex: w, kind: k, usedPeek: peek)
    }

    func testWrongSkippedAndPeekedWordsEnterBankCleanCorrectDoesNot() {
        let b = TasmeeWeakWordBank.apply(rec(t0, [ev(0, .correct), ev(1, .wrong), ev(2, .skipped), ev(3, .correct, peek: true)]), to: [])
        XCTAssertEqual(b.map(\.wordIndex).sorted(), [1, 2, 3])
    }

    func testRepeatedMissResetsBoxAndCounts() {
        var b = TasmeeWeakWordBank.apply(rec(t0, [ev(1, .wrong)]), to: [])
        b[0].box = 3
        b = TasmeeWeakWordBank.apply(rec(t0.addingTimeInterval(86_400), [ev(1, .wrong), ev(1, .wrong)]), to: b)
        XCTAssertEqual(b.count, 1); XCTAssertEqual(b[0].box, 0); XCTAssertEqual(b[0].misses, 2)
    }

    func testDueWordPassedAdvancesAndMasteryRemoves() {
        var b = TasmeeWeakWordBank.apply(rec(t0, [ev(1, .wrong)]), to: [])
        var now = t0
        for _ in 0...TasmeeSpacing.maxBox {
            now = b[0].dueAt
            b = TasmeeWeakWordBank.apply(rec(now, [ev(1, .correct)]), to: b)
            if b.isEmpty { break }
        }
        XCTAssertTrue(b.isEmpty)
    }

    func testNotYetDueWordDoesNotAdvance() {
        let b = TasmeeWeakWordBank.apply(rec(t0, [ev(1, .wrong)]), to: [])
        let c = TasmeeWeakWordBank.apply(rec(t0.addingTimeInterval(60), [ev(1, .correct)]), to: b)
        XCTAssertEqual(c, b)
    }

    func testDueAyahsGroupsAndOrdersByMisses() {
        let due = t0.addingTimeInterval(-1)
        let bank = [TasmeeWeakWord(surah: 2, ayah: 5, wordIndex: 1, dueAt: due, misses: 1),
                    TasmeeWeakWord(surah: 2, ayah: 7, wordIndex: 3, dueAt: due, misses: 4),
                    TasmeeWeakWord(surah: 2, ayah: 7, wordIndex: 1, dueAt: due, misses: 1),
                    TasmeeWeakWord(surah: 2, ayah: 9, wordIndex: 0, dueAt: t0.addingTimeInterval(999), misses: 9)]
        let r = TasmeeWeakWordBank.dueAyahs(bank, now: t0)
        XCTAssertEqual(r.map(\.ayah), [7, 5]); XCTAssertEqual(r[0].words, [1, 3])
    }
}

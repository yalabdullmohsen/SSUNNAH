import XCTest
@testable import SunnahNative

/// درجة وضع الاختبار من 100: الخطأ والتجاوز والنظرة تخصم الكلمة مرة واحدة، والكلمة الزائدة لا تخصم كلمة من المرجع.
final class TasmeeExamScoreTests: XCTestCase {
    private func rec(total: Int, _ events: [TasmeeSessionEvent]) -> TasmeeSessionRecord {
        TasmeeSessionRecord(startedAt: Date(timeIntervalSince1970: 1_767_268_800), durationSec: 60, mode: .exam,
                            surah: 1, fromAyah: 1, toAyah: 7, totalWords: total, events: events)
    }
    private func ev(_ w: Int, _ k: TasmeeEventKind, peek: Bool = false) -> TasmeeSessionEvent {
        TasmeeSessionEvent(surah: 1, ayah: 1, wordIndex: w, kind: k, usedPeek: peek)
    }

    func testRoundsToNearestPercent() {
        XCTAssertEqual(TasmeeExam.score(rec(total: 3, [ev(1, .wrong)])), 67)
        XCTAssertEqual(TasmeeExam.score(rec(total: 8, [ev(1, .wrong)])), 88, "87.5 تُقرَّب إلى 88")
        XCTAssertEqual(TasmeeExam.score(rec(total: 29, [])), 100)
    }

    func testPeekAndSkipCountAndSameWordOnce() {
        let r = rec(total: 10, [ev(1, .wrong), ev(1, .wrong), ev(2, .skipped), ev(3, .correct, peek: true)])
        XCTAssertEqual(TasmeeExam.score(r), 70)
    }

    func testExtraWordsDoNotDeduct() {
        XCTAssertEqual(TasmeeExam.score(rec(total: 4, [ev(1, .extra), ev(2, .tashkeelMaybe)])), 100)
    }

    func testEmptySessionScoresZero() {
        XCTAssertEqual(TasmeeExam.score(rec(total: 0, [])), 0)
        XCTAssertEqual(TasmeeExam.score(rec(total: 2, [ev(1, .wrong), ev(2, .wrong), ev(3, .wrong)])), 0, "لا درجة سالبة")
    }
}

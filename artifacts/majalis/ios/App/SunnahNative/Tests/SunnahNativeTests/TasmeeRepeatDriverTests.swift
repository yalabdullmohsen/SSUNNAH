import XCTest
@testable import SunnahNative

/// وضع التكرار: اكتشاف اكتمال الآية، عدّ القراءات النظيفة المتتالية، إعادة الآية، والانتقال لما بعدها.
@MainActor
final class TasmeeRepeatDriverTests: XCTestCase {
    private let ref = ["1:1#1", "1:1#2", "1:2#1", "1:2#2", "1:2#3"].map { TasmeeRefWord(id: $0, text: "كلمة") }

    private func ev(_ i: Int, _ st: TasmeeWordState) -> TasmeeWordEvent { TasmeeWordEvent(index: i, id: ref[i].id, state: st, timeMs: 0) }

    func testVerseEndTriggersRewindUntilTargetThenAdvances() {
        var d = TasmeeRepeatDriver(ref: ref, target: 2)
        XCTAssertTrue(d.consume(ev(0, .correct))); XCTAssertNil(d.takeAction(), "منتصف الآية: لا إجراء")
        XCTAssertTrue(d.consume(ev(1, .correct)))
        XCTAssertEqual(d.takeAction(), .rewind(to: 0, streak: 1, target: 2))
        XCTAssertTrue(d.consume(ev(0, .correct))); XCTAssertTrue(d.consume(ev(1, .correct)))
        XCTAssertEqual(d.takeAction(), .rewind(to: 2, streak: 0, target: 2), "بلغ الهدف: انتقل للآية التالية بعدّاد جديد")
        XCTAssertEqual(d.verseStart, 2)
    }

    func testWrongWordResetsStreak() {
        var d = TasmeeRepeatDriver(ref: ref, target: 2)
        _ = d.consume(ev(0, .correct)); _ = d.consume(ev(1, .correct)); _ = d.takeAction()
        _ = d.consume(ev(0, .wrong)); _ = d.consume(ev(0, .correct)); _ = d.consume(ev(1, .correct))
        XCTAssertEqual(d.takeAction(), .rewind(to: 0, streak: 0, target: 2), "قراءة فيها خطأ لا تُحتسب وتصفّر المتتالية")
    }

    func testEventsAfterVerseEndInSameBatchAreIgnoredAndLastVerseFinishes() {
        var d = TasmeeRepeatDriver(ref: ref, target: 1)
        _ = d.consume(ev(0, .correct))
        XCTAssertTrue(d.consume(ev(1, .correct)))
        XCTAssertFalse(d.consume(ev(2, .correct)), "كلمة من الآية التالية في الدفعة نفسها تُهمل وتُعاد لاحقًا")
        XCTAssertEqual(d.takeAction(), .rewind(to: 2, streak: 0, target: 1))
        _ = d.consume(ev(2, .correct)); _ = d.consume(ev(3, .correct)); _ = d.consume(ev(4, .correct))
        XCTAssertEqual(d.takeAction(), .finish)
    }

    func testSessionRewindRestoresPendingAndKeepsMistakeLog() async throws {
        let w = ["بِسْمِ", "ٱللَّهِ"].enumerated().map { TasmeeRefWord(id: "1:1#\($0.offset + 1)", text: $0.element) }
        let m = TasmeeMatcher(ref: w, params: { var p = TasmeeMatchParams(); p.gateOnError = true; return p }())
        _ = m.ingest("بسم", timeMs: 0); _ = m.ingest("بسم الله", timeMs: 10)
        XCTAssertEqual(m.next, 2)
        m.rewind(to: 0)
        XCTAssertEqual(m.next, 0)
        XCTAssertEqual(m.state, [.pending, .pending])
        _ = m.ingest("بسم الله", timeMs: 20)
        XCTAssertEqual(m.next, 2, "بعد الإعادة يتقدّم المطابِق من جديد")
    }
}

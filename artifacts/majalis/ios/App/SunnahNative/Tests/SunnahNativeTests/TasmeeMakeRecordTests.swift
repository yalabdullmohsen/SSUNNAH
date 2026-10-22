import XCTest
@testable import SunnahNative

/// سجل الجلسة من المطابِق: الخطأ المصحَّح يبقى، والمتجاوَز يُسجَّل، والصفر يعني لا سجل.
@MainActor
final class TasmeeMakeRecordTests: XCTestCase {
    private let ref = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"].enumerated()
        .map { TasmeeRefWord(id: "1:\($0.offset < 3 ? 1 : 2)#\($0.offset < 3 ? $0.offset + 1 : 1)", text: $0.element) }

    func testNoProgressYieldsNoRecord() {
        let m = TasmeeMatcher(ref: ref, params: TasmeeStrictness.normal.params)
        XCTAssertNil(MushafTasmeeController.makeRecord(m, startedAt: Date(), hints: 0))
    }

    func testRecordRangeAndCorrectedMistakeKept() {
        var p = TasmeeStrictness.normal.params; p.gateOnError = true
        let m = TasmeeMatcher(ref: ref, params: p)
        _ = m.ingest("الرحمن", timeMs: 1000)
        _ = m.ingest("الرحمن", timeMs: 1300)
        _ = m.ingest("بسم الله", timeMs: 2000)
        let r = MushafTasmeeController.makeRecord(m, startedAt: Date(), hints: 2)
        XCTAssertEqual(r?.surah, 1)
        XCTAssertEqual(r?.fromAyah, 1)
        XCTAssertEqual(r?.toAyah, 1)
        XCTAssertEqual(r?.totalWords, 2)
        XCTAssertEqual(r?.hints, 2)
        XCTAssertEqual(r?.count(.wrong), 1)
    }

    func testRecordCarriesChosenMode() {
        let m = TasmeeMatcher(ref: ref, params: TasmeeStrictness.normal.params)
        _ = m.ingest("بسم", timeMs: 1000)
        XCTAssertEqual(MushafTasmeeController.makeRecord(m, startedAt: Date(), hints: 0, mode: .exam)?.mode, .exam)
    }

    func testMaskLevelsForPendingWords() {
        var o = TasmeeModeOptions(); o.mode = .graded
        o.level = .firstLetter; XCTAssertEqual(o.mask(position: 1, count: 4), .firstLetter)
        o.level = .alternate; XCTAssertEqual([1, 2, 3, 4].map { o.mask(position: $0, count: 4) }, [.hidden, .shown, .hidden, .shown])
        o.level = .ayahEnd; XCTAssertEqual([1, 2, 3, 4].map { o.mask(position: $0, count: 4) }, [.shown, .shown, .hidden, .hidden])
        o.mode = .follow; XCTAssertEqual(o.mask(position: 1, count: 4), .shown)
    }
}

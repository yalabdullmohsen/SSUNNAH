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
}

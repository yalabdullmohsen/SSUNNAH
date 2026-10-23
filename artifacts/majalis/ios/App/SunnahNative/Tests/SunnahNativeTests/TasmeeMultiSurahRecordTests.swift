import XCTest
@testable import SunnahNative

/// جلسة تعبر سورتين (صفحة 604: الإخلاص ثم الفلق): الأخطاء تُحسب بسورتها، والمراجعة لا تُنشئ آية غير موجودة.
final class TasmeeMultiSurahRecordTests: XCTestCase {
    private let t0 = Date(timeIntervalSince1970: 1_767_268_800)

    private func record() -> TasmeeSessionRecord {
        TasmeeSessionRecord(startedAt: t0, durationSec: 60, mode: .recite, surah: 112, fromAyah: 1, toAyah: 4, totalWords: 20, events: [
            TasmeeSessionEvent(surah: 112, ayah: 1, wordIndex: 1, kind: .wrong),
            TasmeeSessionEvent(surah: 113, ayah: 1, wordIndex: 1, kind: .wrong),
            TasmeeSessionEvent(surah: 113, ayah: 5, wordIndex: 2, kind: .skipped),
        ])
    }

    func testSameAyahWordInDifferentSurahsAreTwoErrors() {
        let r = record()
        XCTAssertEqual(r.errorWords, 3)
        XCTAssertEqual(r.accuracy, 17.0 / 20.0, accuracy: 1e-9)
    }

    func testWeakAyahsStayInTheirSurah() {
        let r = record()
        XCTAssertEqual(r.weakAyahs, [1], "أرقام سورة السجل فقط")
        XCTAssertEqual(r.weakVerses.map { "\($0.surah):\($0.ayah)" }, ["112:1", "113:1", "113:5"])
    }

    @MainActor func testReviewItemsUseTheEventSurah() {
        let store = TasmeeHistoryStore(url: nil)
        store.append(record())
        let keys = Set(store.review.map { "\($0.surah):\($0.ayah)" })
        XCTAssertEqual(keys, ["112:1", "113:1", "113:5"])
        XCTAssertFalse(keys.contains("112:5"), "112 أربع آيات فقط")
    }

    @MainActor func testMakeRecordEndsWithinTheStartingSurah() {
        // آخر آية الإخلاص (112:4) ثم أول الفلق (113:1): toAyah = 4 لا 1.
        let ref = [TasmeeRefWord(id: "112:4#1", text: "وَلَمْ"), TasmeeRefWord(id: "112:4#2", text: "يَكُن"),
                   TasmeeRefWord(id: "113:1#1", text: "قُلْ"), TasmeeRefWord(id: "113:1#2", text: "أَعُوذُ")]
        let m = TasmeeMatcher(ref: ref, params: TasmeeStrictness.normal.params)
        _ = m.ingest("ولم يكن قل اعوذ", timeMs: 1000)
        let r = MushafTasmeeController.makeRecord(m, startedAt: t0, hints: 0)
        XCTAssertEqual(r?.surah, 112)
        XCTAssertEqual(r?.fromAyah, 4)
        XCTAssertEqual(r?.toAyah, 4)
    }
}

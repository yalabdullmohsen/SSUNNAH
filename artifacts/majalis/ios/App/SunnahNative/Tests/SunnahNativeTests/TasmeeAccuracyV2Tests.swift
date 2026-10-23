import XCTest
@testable import SunnahNative

final class TasmeeAccuracyV2Tests: XCTestCase {
    private func ref(_ words: [String]) -> [TasmeeRefWord] {
        words.enumerated().map { TasmeeRefWord(id: "2:6:\($0.offset)", text: $0.element) }
    }

    func testSplitHeardWordMatchesTwoReferenceWords() {
        let m = TasmeeMatcher(ref: ref(["إِنَّ", "ٱلَّذِينَ", "كَفَرُوا", "سَوَآءٌ"]))
        let evs = m.ingest("انالذين كفروا", timeMs: 1)
        XCTAssertEqual(evs.map(\.state), [.correct, .correct, .correct])
        XCTAssertEqual(m.next, 3)
    }

    func testMergedHeardWordsMatchOneReferenceWord() {
        let m = TasmeeMatcher(ref: ref(["ءَأَنذَرْتَهُمْ", "أَمْ", "لَمْ"]))
        let evs = m.ingest("ا انذرتهم ام لم", timeMs: 1)
        XCTAssertEqual(evs.map(\.state), [.correct, .correct, .correct])
    }

    func testSunLetterLamTolerated() {
        XCTAssertGreaterThanOrEqual(QuranWordMatch.bestWordSimilarity("اللذين", QuranWordMatch.quranWordForms("ٱلَّذِينَ")), 0.99)
    }

    func testWrongNeedsTwoConsecutiveWindows() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "رحمن", "الرحيم", "مالك"]))
        let first = m.ingest("الحمد رخمل الرحيم", timeMs: 1)
        XCTAssertEqual(first.map(\.state), [.correct], "الخطأ لا يُؤكَّد من نافذة واحدة")
        let second = m.ingest("الحمد رخمل الرحيم", timeMs: 2)
        XCTAssertEqual(second.map(\.state), [.wrong, .correct])
    }

    func testTransientWrongNeverReported() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "رحمن", "الرحيم", "مالك"]))
        _ = m.ingest("الحمد رخمل الرحيم", timeMs: 1)
        let second = m.ingest("الحمد رحمن الرحيم", timeMs: 2)
        XCTAssertEqual(second.map(\.state), [.correct, .correct])
    }

    func testConfirmedTextIsLastCorrectWords() {
        let m = TasmeeMatcher(ref: ref(["أ", "بب", "جج", "دد"]))
        _ = m.ingest("بب جج", timeMs: 1)
        XCTAssertEqual(m.confirmedText(8), "بب جج")
        XCTAssertEqual(m.confirmedText(1), "جج")
    }
}

final class TasmeeBenchmarkTests: XCTestCase {
    func testBenchmarkMeasuresAccuracyFalseErrorsAndLatency() {
        let words = ["إِنَّ", "ٱلَّذِينَ", "كَفَرُوا", "سَوَآءٌ"].enumerated().map { TasmeeRefWord(id: "\($0.offset)", text: $0.element) }
        let partials = [TasmeeBenchPartial(text: "انالذين", finishedAtMs: 900),
                        TasmeeBenchPartial(text: "انالذين كفروا سواء", finishedAtMs: 1400)]
        let r = TasmeeBenchmark.run(ref: words, partials: partials, spokenAtMs: [500, 600, 1000, 1300])
        XCTAssertEqual(r.correct, 4)
        XCTAssertEqual(r.falseErrors, 0)
        XCTAssertEqual(r.accuracy, 1)
        XCTAssertEqual(r.p95LatencyMs, 400)
        XCTAssertTrue(r.meetsTargets)
    }
}

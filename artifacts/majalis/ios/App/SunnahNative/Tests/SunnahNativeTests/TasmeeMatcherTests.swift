import XCTest
@testable import SunnahNative

final class TasmeeMatcherTests: XCTestCase {
    private func ref(_ words: [String]) -> [TasmeeRefWord] {
        words.enumerated().map { TasmeeRefWord(id: "1:1:\($0.offset)", text: $0.element) }
    }

    func testNormalizeStripsDiacriticsAndUnifiesLetters() {
        XCTAssertEqual(QuranWordMatch.normalizeQuranWord("ٱلرَّحْمَٰنِ"), "الرحمن")
        XCTAssertEqual(QuranWordMatch.normalizeQuranWord("الصَّلَوٰةَ"), QuranWordMatch.normalizeQuranWord("الصلاة"))
        XCTAssertEqual(QuranWordMatch.quranWordForms("تَبَٰرَكَ"), ["تبرك", "تبارك"])
    }

    func testSequentialRecitationRevealsWords() {
        let m = TasmeeMatcher(ref: ref(["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"]))
        XCTAssertEqual(m.ingest("بسم", timeMs: 100).map(\.state), [.correct])
        XCTAssertEqual(m.ingest("بسم الله الرحمن", timeMs: 200).map(\.index), [1, 2])
        XCTAssertEqual(m.next, 3)
    }

    func testSkippedWordIsMarkedSkipped() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "لله", "رب", "العالمين"]))
        let evs = m.ingest("الحمد رب العالمين", timeMs: 1)
        XCTAssertEqual(evs.map(\.state), [.correct, .skipped, .correct, .correct])
    }

    func testStrictFlagsExtraWord() {
        let words = ["الحمد", "لله", "رب", "العالمين", "الرحمن", "الرحيم"]
        let m = TasmeeMatcher(ref: ref(words), params: TasmeeStrictness.strict.params)
        _ = m.ingest("الحمد لله رب العالمين الرحمن الرحيم", timeMs: 1)
        let m2 = TasmeeMatcher(ref: ref(words), params: TasmeeStrictness.strict.params)
        _ = m2.ingest("الحمد لله زائدةكلمة رب العالمين", timeMs: 1)
        _ = m2.ingest("الحمد لله زائدةكلمة رب العالمين", timeMs: 2)
        XCTAssertTrue(m.drainExtras().isEmpty)
        XCTAssertEqual(m2.drainExtras().first?.heard, QuranWordMatch.normalizeQuranWord("زائدةكلمة"))
    }

    func testHallucinationGuard() {
        let g = HallucinationGuard()
        XCTAssertEqual(g.decide("ا", atMs: 0), .warmup)
        XCTAssertEqual(g.decide("ب", atMs: 500), .use)
        XCTAssertEqual(g.decide("ب", atMs: 1000), .repeat)
        XCTAssertEqual(g.decide("ب", atMs: 1500), .hallucination)
        XCTAssertEqual(g.decide("ب", atMs: 9000), .warmup)
    }
}

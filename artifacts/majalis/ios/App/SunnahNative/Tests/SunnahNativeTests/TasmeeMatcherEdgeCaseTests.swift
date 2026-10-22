import XCTest
@testable import SunnahNative

/// حالات حدّية للمطابق: همزات، تشكيل، تكرار كلمات، تجاوز ورجوع.
final class TasmeeMatcherEdgeCaseTests: XCTestCase {
    private func ref(_ words: [String]) -> [TasmeeRefWord] {
        words.enumerated().map { TasmeeRefWord(id: "1:1:\($0.offset)", text: $0.element) }
    }

    private func norm(_ s: String) -> String { QuranWordMatch.normalizeArabic(s) }

    // MARK: همزات

    func testAlefFormsUnify() {
        for f in ["أ", "إ", "آ", "ٱ"] { XCTAssertEqual(norm(f), "ا", f) }
    }

    func testHamzaOnCarriers() {
        XCTAssertEqual(norm("مؤمن"), "مومن")
        XCTAssertEqual(norm("سئل"), "سيل")
        XCTAssertEqual(norm("يئوس"), "يووس")  // ئ قبل و تُصبح و (لا تُحذف)
    }

    func testStandaloneHamzaAndTatweelDropped() {
        XCTAssertEqual(norm("السماء"), "السما")
        XCTAssertEqual(norm("الـــحمد"), "الحمد")
    }

    func testTaMarbutaAndAlefMaksura() {
        XCTAssertEqual(norm("رحمة"), "رحمه")
        XCTAssertEqual(norm("هدى"), "هدي")
    }

    func testHeardHamzaVariantStillMatchesRef() {
        let m = TasmeeMatcher(ref: ref(["أَنْعَمْتَ", "عَلَيْهِمْ"]))
        XCTAssertEqual(m.ingest("انعمت عليهم", timeMs: 1).map(\.state), [.correct, .correct])
    }

    // MARK: تشكيل

    func testTashkeelAndDigitsStripped() {
        XCTAssertEqual(norm("الْحَمْدُ"), "الحمد")
        XCTAssertEqual(norm("٣"), "3")
        XCTAssertEqual(norm("  رَبِّ   الْعَالَمِينَ "), "رب العالمين")
    }

    func testDaggerAlefYieldsBothForms() {
        XCTAssertEqual(QuranWordMatch.quranWordForms("مَٰلِكِ"), ["ملك", "مالك"])
        XCTAssertEqual(QuranWordMatch.quranWordForms("الحمد"), ["الحمد"])
    }

    func testDaggerAlefRefAcceptsFullSpelling() {
        let m = TasmeeMatcher(ref: ref(["مَٰلِكِ", "يَوْمِ"]))
        XCTAssertEqual(m.ingest("مالك", timeMs: 1).map(\.state), [.correct])
    }

    func testSynonymSpellingsMatch() {
        XCTAssertEqual(QuranWordMatch.normalizeQuranWord("الصلوة"), QuranWordMatch.normalizeQuranWord("الصلاة"))
    }

    // MARK: wordsMatch

    func testWordsMatchToleranceRules() {
        XCTAssertTrue(QuranWordMatch.wordsMatch("العالمين", "العالمين"))
        XCTAssertTrue(QuranWordMatch.wordsMatch("العالمين", "العالمبن"))          // فرق حرف، طول ≥ 6
        XCTAssertFalse(QuranWordMatch.wordsMatch("العالمين", "العالمبن", strict: true))
        XCTAssertFalse(QuranWordMatch.wordsMatch("ربك", "ربه"))                    // قصيرة: لا تسامح
        XCTAssertFalse(QuranWordMatch.wordsMatch("العالمين", "العالبمن"))          // فرق حرفين
    }

    // MARK: تكرار كلمات

    func testRepeatedPhraseAdvancesPastEachOccurrence() {
        let words = ["فبأي", "آلاء", "ربكما", "تكذبان", "فبأي", "آلاء", "ربكما", "تكذبان"]
        let m = TasmeeMatcher(ref: ref(words))
        XCTAssertEqual(m.ingest("فبأي آلاء ربكما تكذبان", timeMs: 1).map(\.index), [0, 1, 2, 3])
        XCTAssertEqual(m.next, 4)
        // النص المتراكم: التكرار الثاني يُطابَق مع المرجع الثاني لا مع الأول
        let both = "فبأي آلاء ربكما تكذبان فبأي آلاء ربكما تكذبان"
        XCTAssertEqual(m.ingest(both, timeMs: 2).map(\.index), [4, 5, 6, 7])
        XCTAssertEqual(m.next, 8)
    }

    func testRepeatedWordDoesNotMatchBehindCursor() {
        let m = TasmeeMatcher(ref: ref(["قل", "هو", "الله", "أحد", "الله", "الصمد"]))
        _ = m.ingest("قل هو الله أحد", timeMs: 1)
        XCTAssertEqual(m.next, 4)
        XCTAssertEqual(m.ingest("الله الصمد", timeMs: 2).map(\.index), [4, 5])
    }

    // MARK: تجاوز ورجوع

    func testSkipJumpsCursorAndMarksSkipped() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "لله", "رب", "العالمين"]))
        let evs = m.ingest("الحمد رب", timeMs: 1)
        XCTAssertEqual(evs.map(\.state), [.correct, .skipped, .correct])
        XCTAssertEqual(m.next, 3)
    }

    func testReRecitingEarlierWordsEmitsNothingAndCursorDoesNotRegress() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "لله", "رب", "العالمين"]))
        _ = m.ingest("الحمد لله رب", timeMs: 1)
        XCTAssertEqual(m.next, 3)
        XCTAssertTrue(m.ingest("الحمد لله", timeMs: 2).isEmpty)
        XCTAssertEqual(m.next, 3)
        XCTAssertEqual(m.ingest("العالمين", timeMs: 3).map(\.index), [3])
    }

    func testResetRestoresStart() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "لله"]))
        _ = m.ingest("الحمد لله", timeMs: 1)
        m.reset()
        XCTAssertEqual(m.next, 0)
        XCTAssertEqual(m.ingest("الحمد", timeMs: 2).map(\.state), [.correct])
    }

    func testEmptyAndGarbageInputProduceNoEvents() {
        let m = TasmeeMatcher(ref: ref(["الحمد", "لله"]))
        XCTAssertTrue(m.ingest("", timeMs: 1).isEmpty)
        XCTAssertTrue(m.ingest("، . !", timeMs: 2).isEmpty)
        XCTAssertEqual(m.next, 0)
    }
}

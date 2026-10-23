import XCTest
@testable import SunnahNative

@MainActor
private final class SpyEngine: RecitationEngineControlling {
    var modelStatus: RecitationModelStatus = .installed
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    var startPrompts: [String?] = []
    var setPrompts: [String?] = []
    var stops = 0
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws {}
    func deleteModel() throws {}
    func load() async throws {}
    func start(prompt: String?) async throws { startPrompts.append(prompt) }
    func setPrompt(_ text: String?) async { setPrompts.append(text) }
    func stop() async { stops += 1 }
}

/// ربط جلسة التسميع بالمحرك والحارس والمطابِق، ودوال التشابه في QuranWordMatch — بلا محاكي ولا صوت.
@MainActor
final class TasmeeSessionWiringTests: XCTestCase {
    private let raw = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ"]
    private var words: [TasmeeRefWord] { raw.enumerated().map { TasmeeRefWord(id: "1:1:\($0.offset)", text: $0.element) } }
    private func partial(_ seq: Int, _ text: String, _ ms: Double) -> RecitationPartial {
        RecitationPartial(seq: seq, text: text, finishedAtMs: ms)
    }

    // MARK: الجلسة

    func testStartSendsNoPromptBeforeAnyConfirmedWord() async throws {
        let e = SpyEngine()
        try await TasmeeSession(engine: e, ref: words, promptWords: 2).start()
        try await TasmeeSession(engine: e, ref: words).start()
        XCTAssertEqual(e.startPrompts, [nil, nil], "التلقين من المؤكَّد فقط: لا شيء قبل أول كلمة")
    }

    func testWarmupAndRepeatsAreCountedButNotMatched() async throws {
        let e = SpyEngine()
        let s = TasmeeSession(engine: e, ref: words)
        var revealed: [Int] = []
        s.onWord = { revealed.append($0.index) }
        try await s.start()
        e.onPartial?(partial(0, "بسم", 50))        // إحماء
        XCTAssertTrue(revealed.isEmpty)
        e.onPartial?(partial(1, "بسم الله", 100))
        e.onPartial?(partial(2, "بسم الله", 150))  // تكرار حرفي لا يُعاد إدخاله
        XCTAssertEqual(revealed, [0, 1])
        let r = await s.stop()
        XCTAssertEqual(r.partials, 3)
        XCTAssertEqual(r.states, [.correct, .correct, .pending])
        XCTAssertEqual(r.total, 3)
        XCTAssertEqual(r.correct, 2)
        XCTAssertEqual(r.extras, 0)
    }

    func testUnclearHintsCountedAndStopDetachesEngine() async throws {
        let e = SpyEngine()
        let s = TasmeeSession(engine: e, ref: words)
        var hints: [String] = []
        s.onHint = { hints.append($0) }
        try await s.start()
        e.onUnclear?(); e.onUnclear?()
        let r = await s.stop()
        XCTAssertEqual(r.unclearHints, 2)
        XCTAssertEqual(hints, [tasmeeUnclearHint, tasmeeUnclearHint])
        XCTAssertNil(e.onPartial)
        XCTAssertNil(e.onUnclear)
        XCTAssertEqual(e.stops, 1)
    }

    func testPartialsAfterStopAreIgnored() async throws {
        let e = SpyEngine()
        let s = TasmeeSession(engine: e, ref: words)
        try await s.start()
        _ = await s.stop()
        s.handle(partial(0, "بسم", 0))
        s.handle(partial(1, "بسم الله الرحمن", 100))
        let r = await s.stop()
        XCTAssertEqual(r.partials, 0)
        XCTAssertEqual(r.states, [.pending, .pending, .pending])
    }

    func testPromptFollowsLastConfirmedWords() async throws {
        let e = SpyEngine()
        let s = TasmeeSession(engine: e, ref: words, promptWords: 2)
        try await s.start()
        e.onPartial?(partial(0, "بسم", 0))
        e.onPartial?(partial(1, "بسم الله", 100))
        await settle { e.setPrompts.count >= 1 }
        e.onPartial?(partial(2, "بسم الله الرحمن", 200))
        await settle { e.setPrompts.count >= 2 }
        XCTAssertEqual(e.setPrompts, ["بِسْمِ ٱللَّهِ", "ٱللَّهِ ٱلرَّحْمَٰنِ"], "آخر كلمات مؤكَّدة لا القادمة")
    }

    /// يترك مهام التلميح (Task على MainActor) تنفذ قبل الفحص.
    private func settle(_ done: () -> Bool) async {
        for _ in 0..<200 where !done() { await Task.yield() }
    }

    // MARK: دوال التشابه

    func testEditDistanceBasics() {
        func d(_ a: String, _ b: String) -> Int { QuranWordMatch.editDistance(Array(a.unicodeScalars), Array(b.unicodeScalars)) }
        XCTAssertEqual(d("", "رحم"), 3)
        XCTAssertEqual(d("رحم", ""), 3)
        XCTAssertEqual(d("رحيم", "رحيم"), 0)
        XCTAssertEqual(d("رحيم", "رحمن"), 2)
        XCTAssertEqual(d("kitten", "sitting"), 3)
        XCTAssertEqual(d("sitting", "kitten"), 3)
    }

    func testWordSimilarityScale() {
        XCTAssertEqual(QuranWordMatch.wordSimilarity("", ""), 1)
        XCTAssertEqual(QuranWordMatch.wordSimilarity("رحيم", "رحمم"), 0.75, accuracy: 1e-9)
        XCTAssertEqual(QuranWordMatch.wordSimilarity("ابت", "ثجح"), 0)
        XCTAssertEqual(QuranWordMatch.wordSimilarity("رب", ""), 0)
    }

    func testBestSimilarityPicksClosestFormAndEmptyIsZero() {
        XCTAssertEqual(QuranWordMatch.bestWordSimilarity("تبارك", []), 0)
        XCTAssertEqual(QuranWordMatch.bestWordSimilarity("تبارك", QuranWordMatch.quranWordForms("تَبَٰرَكَ")), 1)
        XCTAssertLessThan(QuranWordMatch.bestWordSimilarity("تبارك", ["تبرك"]), 1)
    }

    func testTokenizeSpokenStripsPunctuationAndDropsEmptyTokens() {
        let t = QuranWordMatch.tokenizeSpoken("بِسْمِ، «الله» ؟ ـــ\n الرحمن.")
        XCTAssertEqual(t.map(\.raw), ["بِسْمِ", "الله", "الرحمن"])
        XCTAssertEqual(t.map(\.norm), ["بِسْمِ", "الله", "الرحمن"].map(QuranWordMatch.normalizeQuranWord))
        XCTAssertTrue(QuranWordMatch.tokenizeSpoken("  ، . ؟ ").isEmpty)
    }
}

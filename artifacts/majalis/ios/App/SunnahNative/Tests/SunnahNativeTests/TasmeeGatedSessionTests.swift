import XCTest
@testable import SunnahNative

@MainActor
private final class FakeEngine: RecitationEngineControlling {
    var modelStatus: RecitationModelStatus = .installed
    var modelDownloadBytes: Int64? { nil }
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws {}
    func deleteModel() throws {}
    func load() async throws {}
    func start(prompt: String?) async throws {}
    func setPrompt(_ text: String?) async {}
    func stop() async {}
}

/// جلسة بوضع البوابة بمحرك وهمي (بلا ميكروفون): الخطأ لا يقدّم التتبّع، والتصحيح يكشف الكلمة.
@MainActor
final class TasmeeGatedSessionTests: XCTestCase {
    private let words = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ"].enumerated().map { TasmeeRefWord(id: "1:1#\($0.offset + 1)", text: $0.element) }

    func testWrongWordDoesNotAdvanceThenCorrectionReveals() async throws {
        let e = FakeEngine()
        let s = TasmeeSession(engine: e, ref: words, gateOnError: true)
        var events: [TasmeeWordEvent] = []
        s.onWord = { events.append($0) }
        try await s.start()
        // الحارس يحفظ أول نافذة (إحماء) ويرفض المكرَّر حرفيًا؛ فنصوص متمايزة والكلمة الخاطئة ثابتة.
        for (i, t) in ["شيء", "الرحمن", "الرحمن ذلك"].enumerated() { e.onPartial?(RecitationPartial(seq: i, text: t, finishedAtMs: Double(1000 + i * 300))) }
        XCTAssertEqual(s.matcher.next, 0, "الخطأ لا يقدّم التتبّع")
        XCTAssertTrue(events.contains { $0.index == 0 && $0.state == .wrong })
        e.onPartial?(RecitationPartial(seq: 3, text: "بسم الله", finishedAtMs: 2000))
        XCTAssertEqual(s.matcher.next, 2)
        XCTAssertEqual(s.matcher.mistakes.map(\.index), [0], "الخطأ يبقى في السجل بعد تصحيحه")
    }
}

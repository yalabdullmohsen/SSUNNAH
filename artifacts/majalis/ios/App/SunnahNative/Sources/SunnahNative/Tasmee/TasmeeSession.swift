import Foundation

public let tasmeeUnclearHint = "لم يتضح الصوت، قرّب الهاتف أو قلّل الضوضاء"

public struct TasmeeSessionReport: Sendable, Equatable {
    public let states: [TasmeeWordState]
    public var total: Int { states.count }
    public var correct: Int { states.filter { $0 == .correct }.count }
    public var wrong: Int { states.filter { $0 == .wrong }.count }
    public var skipped: Int { states.filter { $0 == .skipped }.count }
    public let partials: Int
    public let unclearHints: Int
    public let extras: Int
}

/// جلسة «تسميع»: تربط المحرك (نص جزئي) بالمطابِق والحارس — نسخة Swift من `session.ts` (بلا وضع القياس).
@MainActor
public final class TasmeeSession {
    public let matcher: TasmeeMatcher
    public var onWord: ((TasmeeWordEvent) -> Void)?
    public var onExtra: ((TasmeeExtraEvent) -> Void)?
    public var onHint: ((String) -> Void)?

    private let engine: RecitationEngineControlling
    private let promptWords: Int
    private let guardRail = HallucinationGuard()
    private var active = false
    private var partials = 0, hints = 0, extras = 0
    private var lastPrompt = ""

    public init(engine: RecitationEngineControlling, ref: [TasmeeRefWord],
                strictness: TasmeeStrictness = .normal, promptWords: Int = 0) {
        self.engine = engine
        self.promptWords = promptWords
        self.matcher = TasmeeMatcher(ref: ref, params: strictness.params)
    }

    private func promptText() -> String { promptWords > 0 ? matcher.upcomingText(promptWords) : "" }

    public func start() async throws {
        active = true
        engine.onPartial = { [weak self] p in self?.handle(p) }
        engine.onUnclear = { [weak self] in
            guard let self, self.active else { return }
            self.hints += 1
            self.onHint?(tasmeeUnclearHint)
        }
        lastPrompt = promptText()
        try await engine.start(prompt: lastPrompt.isEmpty ? nil : lastPrompt)
    }

    func handle(_ p: RecitationPartial) {
        guard active else { return }
        partials += 1
        guard guardRail.decide(p.text, atMs: p.finishedAtMs) == .use else { return }
        let evs = matcher.ingest(p.text, timeMs: p.finishedAtMs)
        for x in matcher.drainExtras() { extras += 1; onExtra?(x) }
        for e in evs { onWord?(e) }
        if !evs.isEmpty {
            let next = promptText()
            if next != lastPrompt {
                lastPrompt = next
                Task { await engine.setPrompt(next.isEmpty ? nil : next) }
            }
        }
    }

    public func stop() async -> TasmeeSessionReport {
        active = false
        engine.onPartial = nil
        engine.onUnclear = nil
        await engine.stop()
        return TasmeeSessionReport(states: matcher.state, partials: partials, unclearHints: hints, extras: extras)
    }
}

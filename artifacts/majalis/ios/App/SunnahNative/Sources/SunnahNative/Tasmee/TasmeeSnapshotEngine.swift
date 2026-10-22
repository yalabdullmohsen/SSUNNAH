#if DEBUG
import Foundation

/// لقطات التدقيق فقط (Debug): `-tasmeeStage sheet|hidden|revealed|wrong|hint` يستبدل محرك التعرّف بمحرك وهمي يبثّ نصوصًا جزئية مبرمجة
/// وموجة صوت مصطنعة، فيمرّ المسار الحقيقي كاملًا (المتحكّم ← الجلسة ← المطابِق ← الرسم) بلا ميكروفون ولا نموذج. لا وجود له في Release.
@MainActor
final class TasmeeSnapshotEngine: RecitationEngineControlling, RecitationLevelReporting {
    static let shared: TasmeeSnapshotEngine? = UserDefaults.standard.string(forKey: "tasmeeStage").map { TasmeeSnapshotEngine(stage: $0) }

    let stage: String
    weak var controller: MushafTasmeeController?
    var modelStatus: RecitationModelStatus { .installed }
    var modelDownloadBytes: Int64? { nil }
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    var onLevel: ((Float) -> Void)?
    private var running = false

    init(stage: String) { self.stage = stage }

    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws {}
    nonisolated func deleteModel() throws {}
    func load() async throws {}
    func setPrompt(_ text: String?) async {}
    func stop() async { running = false }

    func start(prompt: String?) async throws {
        running = true
        Task { @MainActor in
            var t = 0.0
            while running { t += 0.08; onLevel?(Float(0.55 + 0.4 * sin(t * 7)) * Float(0.6 + 0.4 * sin(t * 2.3))); try? await Task.sleep(nanoseconds: 80_000_000) }
        }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 700_000_000); await script() }
    }

    private func script() async {
        guard let words = controller?.ref?.words.map(\.text), words.count > 8 else { return }
        var seq = 0, ms = 0.0
        func say(_ n: Int, extra: String? = nil) async {
            seq += 1; ms += 900
            onPartial?(RecitationPartial(seq: seq, text: (words.prefix(n) + (extra.map { [$0] } ?? [])).joined(separator: " "), finishedAtMs: ms))
            try? await Task.sleep(nanoseconds: 350_000_000)
        }
        switch stage {
        case "revealed": await say(3); await say(6)
        case "wrong": await say(3); await say(3, extra: "ززززز")
        case "hint": await say(3); await say(3, extra: "ززززز"); await say(3, extra: "ططططط"); await say(3, extra: "ككككك")
        default: break
        }
    }

    /// يفتح الورقة أو يبدأ الجلسة مباشرة (`sheet` يكتفي بالورقة).
    static func autoStart(_ c: MushafTasmeeController, page: Int, repo: MushafRepository, search: MushafSearch?) async {
        guard let e = shared else { return }
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        e.controller = c
        c.micPressed(page: page, repo: repo, search: search)
        guard e.stage != "sheet" else { return }
        c.startWith(c.options)
    }
}

func debugTasmeeEngine(_ e: RecitationEngineControlling?) -> RecitationEngineControlling? { TasmeeSnapshotEngine.shared ?? e }
#else
func debugTasmeeEngine(_ e: RecitationEngineControlling?) -> RecitationEngineControlling? { e }
#endif

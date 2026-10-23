import Foundation
import SunnahNative

/// ينفّذ منفذ التسميع فوق المحرك الحقيقي (TasmeeEngine + WhisperKit) ومخزن النموذج؛ لا صوت يُرسل ولا يُحفظ.
@MainActor
final class RecitationEngineAdapter: RecitationEngineControlling {
    private let engine = TasmeeEngine()
    private let store = TasmeeModelStore.shared
    private let manifest: TasmeeManifest?
    private var downloading = false
    private var downloadProgress = 0.0

    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?

    init() {
        manifest = try? JSONDecoder().decode(TasmeeManifest.self, from: Data(TasmeeManifestJSON.baseQ6.utf8))
        engine.onEvent = { [weak self] ev in
            Task { @MainActor in
                switch ev {
                case .partial(let p): self?.onPartial?(RecitationPartial(seq: p.seq, text: p.text, finishedAtMs: Double(p.finishedAtMs)))
                case .unclearAudio: self?.onUnclear?()
                case .failure(let m): self?.onFailure?(m)
                default: break
                }
            }
        }
    }

    var modelDownloadBytes: Int64? { manifest?.archive.size }

    var modelStatus: RecitationModelStatus {
        guard let manifest else { return .unsupported }
        if store.isInstalled(manifest) { return .installed }
        return downloading ? .downloading(progress: downloadProgress) : .notInstalled
    }

    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws {
        guard let manifest else { throw TasmeeModelError.io("manifest") }
        downloading = true; defer { downloading = false }
        try await store.download(manifest, allowCellular: true) { [weak self] got, total in
            let p = total > 0 ? Double(got) / Double(total) : 0
            Task { @MainActor in self?.downloadProgress = p }
            progress(p)
        }
    }

    func deleteModel() throws {
        guard let manifest else { return }
        try store.delete(manifest.modelId)
    }

    func load() async throws {
        guard let manifest, store.isInstalled(manifest) else { throw TasmeeModelError.io("النموذج غير مثبّت") }
        try await engine.load(modelFolder: try store.modelDir(manifest.modelId))
    }

    func start(prompt: String?) async throws { try engine.start(prompt: prompt, keepSessionAudio: false) }
    func setPrompt(_ text: String?) async { engine.setPrompt(text) }
    func stop() async { _ = engine.stop() }
}

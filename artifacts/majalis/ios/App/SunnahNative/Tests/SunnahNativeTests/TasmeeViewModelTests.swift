import XCTest
@testable import SunnahNative

@MainActor
private final class MockEngine: RecitationEngineControlling {
    var modelStatus: RecitationModelStatus = .installed
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    var stopped = false
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws { modelStatus = .installed }
    func deleteModel() throws {}
    func load() async throws {}
    func start(prompt: String?) async throws {}
    func setPrompt(_ text: String?) async {}
    func stop() async { stopped = true }
}

@MainActor
final class TasmeeViewModelTests: XCTestCase {
    private let words = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ"].enumerated().map { TasmeeRefWord(id: "1:1:\($0.offset)", text: $0.element) }

    func testListenRevealStopFlow() async {
        let e = MockEngine()
        let vm = TasmeeViewModel(engine: e, ref: words)
        await vm.start()
        XCTAssertTrue(vm.isListening)
        e.onPartial?(RecitationPartial(seq: 0, text: "بسم", finishedAtMs: 50)) // نافذة الإحماء لا تكشف
        e.onPartial?(RecitationPartial(seq: 1, text: "بسم الله", finishedAtMs: 100))
        XCTAssertEqual(vm.states, [.correct, .correct, .pending])
        XCTAssertEqual(vm.progress, 2.0 / 3.0, accuracy: 0.001)
        await vm.stop()
        guard case .finished(let r) = vm.phase else { return XCTFail("لم تنتهِ الجلسة") }
        XCTAssertEqual(r.correct, 2)
        XCTAssertTrue(e.stopped)
    }

    func testStartBlockedWhenModelMissing() async {
        let e = MockEngine(); e.modelStatus = .notInstalled
        let vm = TasmeeViewModel(engine: e, ref: words)
        await vm.start()
        XCTAssertEqual(vm.phase, .idle)
        await vm.downloadModel()
        XCTAssertEqual(vm.modelStatus, .installed)
    }
}

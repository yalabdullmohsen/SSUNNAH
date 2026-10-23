import XCTest
@testable import SunnahNative

@MainActor
private final class PrewarmSpy: RecitationEngineControlling {
    var modelStatus: RecitationModelStatus
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    var loads = 0
    init(_ s: RecitationModelStatus) { modelStatus = s }
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws {}
    func deleteModel() throws {}
    func load() async throws { loads += 1 }
    func prewarm() async { loads += 1 }
    func start(prompt: String?) async throws {}
    func setPrompt(_ text: String?) async {}
    func stop() async {}
}

/// التسخين: فتح ورقة الأوضاع يحمّل النموذج المثبّت في الخلفية ليبدأ الاستماع فور «ابدأ» (≤ 1ث)؛ لا تحميل بلا نموذج.
@MainActor
final class TasmeePrewarmTests: XCTestCase {
    private let repo = MushafRepository(root: URL(fileURLWithPath: "/nonexistent"))

    func testOpeningModeSheetPrewarmsInstalledModel() async {
        let spy = PrewarmSpy(.installed)
        let c = MushafTasmeeController(engine: spy)
        c.micPressed(page: 1, repo: repo, search: nil)
        XCTAssertTrue(c.showModeSheet)
        for _ in 0..<50 where spy.loads == 0 { try? await Task.sleep(nanoseconds: 20_000_000) }
        XCTAssertEqual(spy.loads, 1)
    }

    func testNoPrewarmWhenModelNotInstalled() async {
        let spy = PrewarmSpy(.notInstalled)
        let c = MushafTasmeeController(engine: spy)
        c.micPressed(page: 1, repo: repo, search: nil)
        try? await Task.sleep(nanoseconds: 150_000_000)
        XCTAssertEqual(spy.loads, 0)
    }
}

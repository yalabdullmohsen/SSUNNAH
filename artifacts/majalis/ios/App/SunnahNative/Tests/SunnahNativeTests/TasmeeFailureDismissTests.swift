import XCTest
@testable import SunnahNative

@MainActor
private final class FailingDownloadEngine: RecitationEngineControlling {
    struct Offline: LocalizedError { var errorDescription: String? { "لا يوجد اتصال بالإنترنت." } }
    var modelStatus: RecitationModelStatus = .notInstalled
    var modelDownloadBytes: Int64? { nil }
    var onPartial: ((RecitationPartial) -> Void)?
    var onUnclear: (() -> Void)?
    var onFailure: ((String) -> Void)?
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws { throw Offline() }
    func deleteModel() throws {}
    func load() async throws {}
    func start(prompt: String?) async throws {}
    func setPrompt(_ text: String?) async {}
    func stop() async {}
}

/// فشل التنزيل يُظهر السبب الحقيقي، و«إغلاق» يعيد الجلسة إلى idle (فيختفي الميكروفون من المصحف).
@MainActor
final class TasmeeFailureDismissTests: XCTestCase {
    func testDownloadFailureShowsRealReasonThenDismissReturnsToIdle() async {
        let c = MushafTasmeeController(engine: FailingDownloadEngine())
        await c.confirmDownload()
        XCTAssertTrue(c.isFailed)
        XCTAssertTrue(c.showsSessionControls, "الشريط ظاهر ليعرض السبب وزر إعادة المحاولة")
        guard case .failed(let m) = c.phase else { return XCTFail("المتوقع failed") }
        XCTAssertTrue(m.contains("لا يوجد اتصال بالإنترنت") && m.contains("أعد المحاولة"))
        c.dismissFailure()
        XCTAssertEqual(c.phase, .idle)
        XCTAssertFalse(c.showsSessionControls, "بعد الإغلاق لا ميكروفون ولا شريط")
    }

    func testDismissIsNoOpOutsideFailure() {
        let c = MushafTasmeeController(engine: FailingDownloadEngine())
        c.dismissFailure()
        XCTAssertEqual(c.phase, .idle)
    }
}

import XCTest
@testable import SunnahNative

/// وضع الطيران (ن3): مسار المصحف (تحميل الصفحات والخطوط والتخطيط) لا يطلب الشبكة إطلاقًا.
final class MushafOfflineTests: XCTestCase {
    private final class FailAll: URLProtocol {
        nonisolated(unsafe) static var hits = 0
        override class func canInit(with request: URLRequest) -> Bool { hits += 1; return true }
        override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
        override func startLoading() { client?.urlProtocol(self, didFailWithError: URLError(.notConnectedToInternet)) }
        override func stopLoading() {}
    }

    func testMushafPathWorksWithoutNetwork() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        FailAll.hits = 0
        URLProtocol.registerClass(FailAll.self)
        defer { URLProtocol.unregisterClass(FailAll.self) }
        let r = MushafRepository(root: URL(fileURLWithPath: p)), size = CGSize(width: 402, height: 874)
        for n in [1, 2, 150, 301, 604] {
            let page = try r.page(n), f = try r.ensureFont(page: n)
            XCTAssertFalse(r.pageLayout(page, family: f, size: size).m.rows.isEmpty, "صفحة \(n)")
        }
        XCTAssertEqual(FailAll.hits, 0, "طلب شبكة من مسار المصحف")
    }

    /// لا استدعاء URLSession/URLRequest في مصدر وحدة المصحف.
    func testMushafSourcesDoNotUseNetworkAPIs() throws {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative/Mushaf")
        let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil).filter { $0.pathExtension == "swift" }
        XCTAssertFalse(files.isEmpty)
        for f in files {
            let src = try String(contentsOf: f, encoding: .utf8)
            for api in ["URLSession", "URLRequest", "URLProtocol", "dataTask("] {
                XCTAssertFalse(src.contains(api), "\(f.lastPathComponent) يستعمل \(api)")
            }
        }
    }
}

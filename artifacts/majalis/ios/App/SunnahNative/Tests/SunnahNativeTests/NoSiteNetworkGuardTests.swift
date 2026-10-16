import XCTest
@testable import SunnahNative

/// حارس «بلا شبكة/أي خطأ خادم»: لا اتصال بنطاق الموقع (Vercel 402) في أي مسار؛ المحتوى من الحزمة المدمجة والكاش.
final class NoSiteNetworkGuardTests: XCTestCase {
    private func transport() -> RemoteTransport {
        RemoteTransport(config: RemoteConfig(supabaseURL: URL(string: "https://db.example.test/"), anonKey: "anon"))
    }

    func testDefaultConfigHasNoSiteHost() {
        XCTAssertNil(RemoteConfig().siteURL)
        XCTAssertNil(RemoteConfig.fromBundle(Bundle(for: Self.self)).siteURL)
    }

    func testEverySiteSourceFailsLocallyWithoutRequest() async {
        let paths = ["/api/auto-content?limit=100", "/api/updates", "/data/lessons/chunk-000.json",
                     "/data/sources/accounts.json", "/data/lessons/feed.json", "/api/citations/x"]
        for path in paths {
            do { _ = try await transport().fetch(path: path, requireAuth: false); XCTFail("طلب شبكة إلى \(path)") }
            catch { XCTAssertEqual(error as? RemoteTransportError, .badPath, path) }
        }
    }

    func testSubmissionsQueryByUserIdNotEmail() {
        guard case .remote(let path, _, _) = AccountEndpoints.submissions(userId: "u-1") else { return XCTFail() }
        XCTAssertTrue(path.contains("user_id=eq.u-1"))
        XCTAssertFalse(path.contains("submitter_email"))
    }
}

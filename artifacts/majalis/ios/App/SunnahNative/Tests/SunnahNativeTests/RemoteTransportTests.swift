import XCTest
import SunnahDataKit
@testable import SunnahNative

final class RemoteTransportTests: XCTestCase {
    private func transport() -> RemoteTransport {
        RemoteTransport(config: RemoteConfig(
            supabaseURL: URL(string: "https://db.example.test/"), anonKey: "anon", accessToken: { nil }))
    }

    func testSitePathsGoToSiteWithEightSecondTimeout() async throws {
        let r = try await transport().request(path: "/data/lessons/feed.json", requireAuth: false)
        XCTAssertEqual(r.url?.absoluteString, "https://www.ssunnah.com/data/lessons/feed.json")
        XCTAssertEqual(r.timeoutInterval, 8)
        XCTAssertNil(r.value(forHTTPHeaderField: "apikey"))
    }

    func testRestPathsGoToSupabaseWithAnonFallback() async throws {
        let r = try await transport().request(path: "/rest/v1/bookmarks?select=id", requireAuth: false)
        XCTAssertEqual(r.url?.absoluteString, "https://db.example.test/rest/v1/bookmarks?select=id")
        XCTAssertEqual(r.value(forHTTPHeaderField: "apikey"), "anon")
        XCTAssertEqual(r.value(forHTTPHeaderField: "Authorization"), "Bearer anon")
    }

    func testAuthRequiredWithoutTokenFailsWithoutNetwork() async {
        do { _ = try await transport().request(path: "/rest/v1/x", requireAuth: true); XCTFail() }
        catch { XCTAssertEqual(error as? RemoteTransportError, .noCredentials) }
    }

    func testLastGoodResponseIsServedWhenOffline() async throws {
        struct Item: Codable, Equatable, Sendable { let n: Int }
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("rt-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        let up = ClosureTransport { _, _ in Data(#"{"n":7}"#.utf8) }
        let down = ClosureTransport { _, _ in throw URLError(.notConnectedToInternet) }
        let src = ContentSource.remote(path: "/api/x", maxAge: 0)
        let first = ContentLoader(store: DataStore(transport: up, cache: DiskCache(directory: dir)))
        _ = try await first.load(Item.self, from: src)
        let offline = ContentLoader(store: DataStore(transport: down, cache: DiskCache(directory: dir)))
        let v = try await offline.load(Item.self, from: src)
        XCTAssertEqual(v, Item(n: 7))
        let empty = ContentLoader(store: DataStore(transport: down, cache: DiskCache(directory: dir.appendingPathComponent("none"))))
        do { _ = try await empty.load(Item.self, from: src); XCTFail() } catch {}
    }

    func testOfflineMessageIsFriendly() {
        XCTAssertEqual(ErrorStateView.offlineMessage, "لا يوجد اتصال، حاول لاحقًا")
    }
}

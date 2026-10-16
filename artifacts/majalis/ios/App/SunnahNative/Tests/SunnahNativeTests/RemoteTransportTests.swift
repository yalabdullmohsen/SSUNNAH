import XCTest
import SunnahDataKit
@testable import SunnahNative

final class RemoteTransportTests: XCTestCase {
    private func transport() -> RemoteTransport {
        RemoteTransport(config: RemoteConfig(
            supabaseURL: URL(string: "https://db.example.test/"), anonKey: "anon", accessToken: { nil }))
    }

    func testSitePathsAreRejectedWithoutNetwork() async {
        for path in ["/data/lessons/feed.json", "/api/updates", "/api/citations/x"] {
            do { _ = try await transport().request(path: path, requireAuth: false); XCTFail("يجب رفض \(path)") }
            catch { XCTAssertEqual(error as? RemoteTransportError, .badPath) }
        }
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

final class RemoteSeedsTests: XCTestCase {
    private func bundle() throws -> Bundle {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("seed-\(UUID().uuidString)")
        for (dir, name, body) in [
            ("Data/seed", "auto-content", #"{"ok":true,"items":[{"slug":"a","title":"x"}]}"#),
            ("Data/seed", "platform-updates", "[]"),
            ("Data/sources", "accounts", #"{"accounts":[]}"#),
        ] {
            let d = root.appendingPathComponent(dir)
            try FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
            try Data(body.utf8).write(to: d.appendingPathComponent(name + ".json"))
        }
        return try XCTUnwrap(Bundle(path: root.path))
    }

    func testSeedPathMapping() throws {
        let b = try bundle()
        XCTAssertNotNil(RemoteSeeds.data(forPath: "/data/sources/accounts.json", bundle: b))
        XCTAssertNotNil(RemoteSeeds.data(forPath: "/api/auto-content?limit=100", bundle: b))
        XCTAssertNotNil(RemoteSeeds.data(forPath: "/api/updates", bundle: b))
        XCTAssertNil(RemoteSeeds.data(forPath: "/rest/v1/bookmarks?select=id", bundle: b))
        let d = try XCTUnwrap(RemoteSeeds.data(forPath: "/api/auto-content?slug=a", bundle: b))
        XCTAssertTrue(String(decoding: d, as: UTF8.self).contains("\"item\""))
        XCTAssertNil(RemoteSeeds.data(forPath: "/api/auto-content?slug=zzz", bundle: b))
    }

    func testSeedServedWhenOfflineAndNoCache() async throws {
        struct F: Decodable, Sendable { let accounts: [String] }
        let down = ClosureTransport { _, _ in throw URLError(.notConnectedToInternet) }
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("c-\(UUID().uuidString)")
        let loader = ContentLoader(bundle: try bundle(), store: DataStore(transport: down, cache: DiskCache(directory: dir)))
        let v = try await loader.load(F.self, from: .remote(path: "/data/sources/accounts.json"))
        XCTAssertEqual(v.accounts, [])
    }
}

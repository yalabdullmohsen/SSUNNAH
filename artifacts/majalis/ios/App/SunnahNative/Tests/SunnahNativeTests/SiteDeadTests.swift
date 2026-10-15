import XCTest
import SunnahDataKit
@testable import SunnahNative

/// يحاكي موت الموقعين (Vercel 402): كل طلب إلى مضيفاتهما يعيد 402، ويُسجَّل كل مضيف يُطلب.
final class DeadSiteProtocol: URLProtocol, @unchecked Sendable {
    static let deadHosts: Set<String> = ["www.ssunnah.com", "ssunnah.com", "majlisilm.com", "www.majlisilm.com"]
    nonisolated(unsafe) static var seen: [URLRequest] = []
    nonisolated(unsafe) static var supabase: (URLRequest) -> (Int, Data) = { _ in (200, Data("{}".utf8)) }
    private static let lock = NSLock()

    static func reset() { lock.withLock { seen = [] } }
    static var hosts: Set<String> { lock.withLock { Set(seen.compactMap { $0.url?.host }) } }

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Self.lock.withLock { Self.seen.append(request) }
        let host = request.url?.host ?? ""
        let (code, body) = Self.deadHosts.contains(host)
            ? (402, Data("DEPLOYMENT_DISABLED".utf8)) : Self.supabase(request)
        client?.urlProtocol(self, didReceive: HTTPURLResponse(url: request.url!, statusCode: code, httpVersion: nil, headerFields: nil)!,
                            cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: body)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}

    static func session() -> URLSession {
        let c = URLSessionConfiguration.ephemeral
        c.protocolClasses = [DeadSiteProtocol.self]
        c.timeoutIntervalForRequest = RemoteTransport.timeout
        return URLSession(configuration: c)
    }
}

final class SiteDeadTests: XCTestCase {
    override func setUp() { DeadSiteProtocol.reset() }

    private func config() -> RemoteConfig {
        RemoteConfig(supabaseURL: URL(string: "https://db.example.test/"), anonKey: "anon", accessToken: { nil })
    }

    func testRemoteTransportFailsFastOnDeadSite() async {
        let t = RemoteTransport(config: config(), session: DeadSiteProtocol.session())
        for path in ["/api/updates", "/data/lessons/feed.json", "/api/auto-content?limit=100"] {
            do { _ = try await t.fetch(path: path, requireAuth: false); XCTFail("يجب أن يفشل \(path)") }
            catch RemoteTransportError.status(let code) { XCTAssertEqual(code, 402) }
            catch { XCTFail("خطأ غير متوقع \(error)") }
        }
    }

    func testContentLoaderServesCacheOrSeedInsteadOfHanging() async throws {
        struct Feed: Decodable, Sendable { let accounts: [String] }
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("dead-\(UUID().uuidString)")
        let seeds = root.appendingPathComponent("Data/sources")
        try FileManager.default.createDirectory(at: seeds, withIntermediateDirectories: true)
        try Data(#"{"accounts":[]}"#.utf8).write(to: seeds.appendingPathComponent("accounts.json"))
        let bundle = try XCTUnwrap(Bundle(path: root.path))
        let t = RemoteTransport(config: config(), session: DeadSiteProtocol.session())
        let loader = ContentLoader(bundle: bundle, store: DataStore(transport: t, cache: DiskCache(directory: root.appendingPathComponent("c"))))
        let v = try await loader.load(Feed.self, from: .remote(path: "/data/sources/accounts.json"))
        XCTAssertEqual(v.accounts, [])
    }

    func testAccountAPIDegradesWithErrorNotHang() async {
        let api = AccountAPI(session: DeadSiteProtocol.session())
        let draft = AccountSubmissionDraft(type: "lesson", title: "عنوان", details: "تفاصيل", author: "م")
        do { _ = try await api.submitContent(draft); XCTFail("يجب أن يفشل الإرسال") } catch {}
        do { _ = try await api.exportAccount(token: "t"); XCTFail("يجب أن يفشل التصدير") }
        catch AccountAPIError.server(let m) { XCTAssertFalse(m.isEmpty) } catch {}
        XCTAssertTrue(DeadSiteProtocol.hosts.isSubset(of: DeadSiteProtocol.deadHosts))
        XCTAssertTrue(DeadSiteProtocol.seen.allSatisfy { $0.timeoutInterval == RemoteTransport.timeout })
    }

    func testShortSessionHasShortTimeoutsAndNoConnectivityWait() {
        let c = RemoteTransport.shortSession().configuration
        XCTAssertEqual(c.timeoutIntervalForRequest, 8)
        XCTAssertEqual(c.timeoutIntervalForResource, 8)
        XCTAssertFalse(c.waitsForConnectivity)
        XCTAssertEqual(AccountAPI().session.configuration.timeoutIntervalForRequest, 8)
    }

    // MARK: حذف الحساب — RPC داخل التطبيق ولا يمس الموقع

    private func deleter(token: String? = "tok", supabase: String? = "https://db.example.test") -> SupabaseAccountDeleter {
        let store = InMemoryAuthStore()
        if let token { try? store.setValue(token, forKey: "access_token") }
        return SupabaseAccountDeleter(supabaseURL: supabase.flatMap(URL.init(string:)), anonKey: "anon", store: store, session: DeadSiteProtocol.session())
    }

    func testDeleteCallsRpcOnSupabaseOnlyWithBearer() async throws {
        DeadSiteProtocol.supabase = { _ in (204, Data()) }
        try await deleter().deleteMyAccount()
        let r = try XCTUnwrap(DeadSiteProtocol.seen.first)
        XCTAssertEqual(DeadSiteProtocol.seen.count, 1)
        XCTAssertEqual(r.httpMethod, "POST")
        XCTAssertEqual(r.url?.absoluteString, "https://db.example.test/rest/v1/rpc/delete_my_account")
        XCTAssertEqual(r.value(forHTTPHeaderField: "Authorization"), "Bearer tok")
        XCTAssertEqual(r.value(forHTTPHeaderField: "apikey"), "anon")
        XCTAssertEqual(r.timeoutInterval, SupabaseAccountDeleter.timeout)
        XCTAssertTrue(DeadSiteProtocol.hosts.isDisjoint(with: DeadSiteProtocol.deadHosts))
    }

    private func failure(_ d: SupabaseAccountDeleter) async -> AuthServiceError? {
        do { try await d.deleteMyAccount(); return nil } catch { return error as? AuthServiceError }
    }

    func testDeleteWithoutSessionFailsWithoutNetwork() async {
        guard case .unauthorized? = await failure(deleter(token: nil)) else { return XCTFail() }
        XCTAssertTrue(DeadSiteProtocol.seen.isEmpty)
    }

    func testDeleteNotConfigured() async {
        guard case .notConfigured? = await failure(deleter(supabase: nil)) else { return XCTFail() }
    }

    func testDeleteStatusMapping() async {
        DeadSiteProtocol.supabase = { _ in (401, Data()) }
        guard case .unauthorized? = await failure(deleter()) else { return XCTFail("401") }
        DeadSiteProtocol.supabase = { _ in (403, Data()) }
        guard case .unauthorized? = await failure(deleter()) else { return XCTFail("403") }
        DeadSiteProtocol.supabase = { _ in (404, Data()) }
        guard case .server(let m)? = await failure(deleter()) else { return XCTFail("404") }
        XCTAssertTrue(m.contains("غير متاحة"))
        DeadSiteProtocol.supabase = { _ in (500, Data()) }
        guard case .server? = await failure(deleter()) else { return XCTFail("500") }
    }

    func testDeleteNetworkErrorsBecomeOffline() async {
        final class Fail: URLProtocol, @unchecked Sendable {
            nonisolated(unsafe) static var code = URLError.Code.timedOut
            override class func canInit(with request: URLRequest) -> Bool { true }
            override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
            override func startLoading() { client?.urlProtocol(self, didFailWithError: URLError(Self.code)) }
            override func stopLoading() {}
        }
        let c = URLSessionConfiguration.ephemeral; c.protocolClasses = [Fail.self]
        let store = InMemoryAuthStore(); try? store.setValue("tok", forKey: "access_token")
        let d = SupabaseAccountDeleter(supabaseURL: URL(string: "https://db.example.test"), anonKey: "a", store: store, session: URLSession(configuration: c))
        for code in [URLError.Code.timedOut, .notConnectedToInternet, .cannotConnectToHost, .networkConnectionLost] {
            Fail.code = code
            guard case .offline? = await failure(d) else { return XCTFail("\(code)") }
        }
    }

    func testLocalEraseClearsDefaultsAndCache() async throws {
        let suite = "erase-\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defaults.set("x", forKey: "k")
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("e-\(UUID().uuidString)")
        let cache = DiskCache(directory: dir)
        try await cache.write(Data("1".utf8), for: "a")
        await LocalDataEraser.eraseAll(defaults: defaults, bundleID: suite, cache: cache)
        XCTAssertNil(defaults.string(forKey: "k"))
        let gone = await cache.read("a")
        XCTAssertNil(gone)
    }
}

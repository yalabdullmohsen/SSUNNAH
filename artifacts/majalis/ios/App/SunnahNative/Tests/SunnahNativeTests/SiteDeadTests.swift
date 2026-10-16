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

    func testRemoteTransportRejectsSitePathsWithoutAnyRequest() async {
        let t = RemoteTransport(config: config(), session: DeadSiteProtocol.session())
        for path in ["/api/updates", "/data/lessons/feed.json", "/api/auto-content?limit=100"] {
            do { _ = try await t.fetch(path: path, requireAuth: false); XCTFail("يجب أن يفشل \(path)") }
            catch RemoteTransportError.badPath {}
            catch { XCTFail("خطأ غير متوقع \(error)") }
        }
        XCTAssertTrue(DeadSiteProtocol.seen.isEmpty, "بلا شبكة: لا طلب إلى نطاق الموقع أصلًا")
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

    // MARK: تصدير البيانات والمقترحات — Supabase مباشرة لا الموقع

    private func jwt(sub: String = "11111111-2222-3333-4444-555555555555") -> String {
        func b64(_ s: String) -> String { Data(s.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "").replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_") }
        return "\(b64(#"{"alg":"none"}"#)).\(b64(#"{"sub":"\#(sub)","email":"a@b.test"}"#)).sig"
    }

    private func api(signedIn: Bool = true) -> AccountAPI {
        let store = InMemoryAuthStore()
        if signedIn { try? store.setValue(jwt(), forKey: "access_token") }
        DeadSiteProtocol.reset()
        let cfg = AccountBackend.Config(url: URL(string: "https://db.example.test")!, anonKey: "anon", store: store)
        return AccountAPI(session: DeadSiteProtocol.session(), backend: cfg)
    }

    func testExportCallsRpcOnSupabaseWithBearerOnly() async throws {
        DeadSiteProtocol.supabase = { _ in (200, Data(#"{"bookmarks":[],"exported_at":"x"}"#.utf8)) }
        let data = try await api().exportAccount(token: "tok")
        let r = try XCTUnwrap(DeadSiteProtocol.seen.first)
        XCTAssertEqual(r.url?.path, "/rest/v1/rpc/export_my_account")
        XCTAssertEqual(r.value(forHTTPHeaderField: "Authorization"), "Bearer tok")
        XCTAssertEqual(String(data: r.httpBody ?? (r.httpBodyStream.map { Data(reading: $0) } ?? Data()), encoding: .utf8), "{}")
        XCTAssertEqual(DeadSiteProtocol.hosts, ["db.example.test"])
        XCTAssertNotNil(try JSONSerialization.jsonObject(with: data) as? [String: Any])
    }

    func testExportErrorsAreArabicNotHang() async {
        for (code, _) in [(401, 0), (500, 0)] {
            DeadSiteProtocol.supabase = { _ in (code, Data("{}".utf8)) }
            do { _ = try await api().exportAccount(token: "t"); XCTFail() }
            catch AccountAPIError.server(let m) { XCTAssertFalse(m.isEmpty) } catch { XCTFail("\(error)") }
        }
        do { _ = try await AccountAPI(session: DeadSiteProtocol.session(), backend: nil).exportAccount(token: "t"); XCTFail() }
        catch AccountAPIError.server(let m) { XCTAssertEqual(m, AccountAPI.unavailable) } catch { XCTFail("\(error)") }
    }

    func testSubmitInsertsOwnPendingRowViaRLS() async throws {
        DeadSiteProtocol.supabase = { _ in (201, Data()) }
        let draft = AccountSubmissionDraft(type: "فائدة", title: " عنوان ", details: "تفاصيل", author: "")
        let msg = try await api().submitContent(draft)
        XCTAssertFalse(msg.isEmpty)
        let r = try XCTUnwrap(DeadSiteProtocol.seen.first)
        XCTAssertEqual(r.url?.path, "/rest/v1/user_submissions")
        XCTAssertEqual(r.value(forHTTPHeaderField: "Prefer"), "return=minimal")
        XCTAssertEqual(DeadSiteProtocol.hosts, ["db.example.test"])
        let body = try XCTUnwrap(r.httpBody ?? r.httpBodyStream.map { Data(reading: $0) })
        let row = try XCTUnwrap(try JSONSerialization.jsonObject(with: body) as? [String: Any])
        XCTAssertEqual(row["user_id"] as? String, "11111111-2222-3333-4444-555555555555")
        XCTAssertEqual(row["type"] as? String, "lesson")
        XCTAssertEqual(row["title"] as? String, "عنوان")
        XCTAssertNil(row["status"], "الحالة تُترك للافتراضي pending (RLS ترفض غيره)")
        XCTAssertEqual((row["meta"] as? [String: Any])?["kind"] as? String, "فائدة")
    }

    func testSubmitRequiresSignInAndRespectsDbLimits() async {
        let draft = AccountSubmissionDraft(type: "درس", title: "عنوان", details: "تفاصيل", author: "م")
        do { _ = try await api(signedIn: false).submitContent(draft); XCTFail() }
        catch AccountAPIError.server(let m) { XCTAssertEqual(m, AccountAPI.signInNeeded) } catch { XCTFail("\(error)") }
        XCTAssertTrue(DeadSiteProtocol.seen.isEmpty, "بلا جلسة لا طلب أصلًا")
        let long = AccountSubmissionDraft(type: "درس", title: "عنوان", details: String(repeating: "ا", count: 3001), author: "")
        do { _ = try await api().submitContent(long); XCTFail() } catch AccountAPIError.server { } catch { XCTFail("\(error)") }
        XCTAssertTrue(DeadSiteProtocol.seen.isEmpty)
    }

    func testScreenLimitsNeverExceedTableLimitsAndCounterShows() {
        XCTAssertEqual(AccountSubmissionDraft.titleMax, 300)
        XCTAssertEqual(AccountSubmissionDraft.detailsMax, 3000)
        XCTAssertEqual(AccountSubmissionDraft.authorMax, 100)
        XCTAssertEqual(AccountSubmissionDraft.titleMax, AccountAPI.titleMax)
        XCTAssertEqual(AccountSubmissionDraft.detailsMax, AccountAPI.detailsMax)
        let ok = AccountSubmissionDraft(type: "درس", title: String(repeating: "ع", count: 300), details: String(repeating: "ت", count: 3000), author: String(repeating: "م", count: 100))
        XCTAssertTrue(ok.isValid)
        XCTAssertFalse(AccountSubmissionDraft(type: "درس", title: String(repeating: "ع", count: 301), details: "تفاصيل", author: "").isValid)
        XCTAssertFalse(AccountSubmissionDraft(type: "درس", title: "عنوان", details: String(repeating: "ت", count: 3001), author: "").isValid)
        XCTAssertFalse(AccountSubmissionDraft(type: "درس", title: "عنوان", details: "تفاصيل", author: String(repeating: "م", count: 101)).isValid)
        XCTAssertEqual(AccountSubmissionDraft.counter("أهلا", max: 300), "4 / 300")
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

private extension Data {
    init(reading stream: InputStream) {
        self.init(); stream.open(); defer { stream.close() }
        var buf = [UInt8](repeating: 0, count: 4096)
        while stream.hasBytesAvailable { let n = stream.read(&buf, maxLength: buf.count); if n <= 0 { break }; append(buf, count: n) }
    }
}

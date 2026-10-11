import Foundation
import SunnahNative

/// عميل Supabase Auth (REST) بلا Capacitor؛ يخزّن الجلسة في Keychain عبر `AuthSessionStoring`.
/// المفاتيح: SUPABASE_URL وSUPABASE_ANON_KEY وVERCEL_API_BASE_URL من Info.plist.
struct SupabaseAuthAdapter: AuthServicing {
    private let store: AuthSessionStoring
    private let urlString: String
    private let anon: String
    private let apiBase: String

    init(store: AuthSessionStoring, bundle: Bundle = .main) {
        self.store = store
        func plist(_ k: String) -> String { (bundle.object(forInfoDictionaryKey: k) as? String) ?? "" }
        urlString = plist("SUPABASE_URL"); anon = plist("SUPABASE_ANON_KEY"); apiBase = plist("VERCEL_API_BASE_URL")
    }

    var isConfigured: Bool { URL(string: urlString)?.host != nil && !anon.isEmpty }
    var currentEmail: String? { try? store.value(forKey: "user_email") }

    func signIn(email: String, password: String) async throws {
        let r = try await post("token?grant_type=password", ["email": email, "password": password])
        try save(r, email: email)
    }

    func signUp(email: String, password: String) async throws -> Bool {
        let r = try await post("signup", ["email": email, "password": password])
        if r["access_token"] is String { try save(r, email: email); return false }
        return true
    }

    func resetPassword(email: String) async throws { _ = try await post("recover", ["email": email]) }

    func signOut() async {
        if let t = try? store.value(forKey: "access_token") {
            _ = try? await post("logout", [:], bearer: t)
        }
        for k in ["access_token", "refresh_token", "user_email"] { try? store.removeValue(forKey: k) }
        try? store.clearLegacySession()
    }

    func deleteAccount() async throws {
        guard let t = try store.value(forKey: "access_token"), let url = URL(string: apiBase)?.appendingPathComponent("api/account/delete")
        else { throw AuthServiceError.unauthorized }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization")
        req.timeoutInterval = 30
        let (_, resp) = try await run(req)
        guard (resp as? HTTPURLResponse)?.statusCode == 200 else { throw AuthServiceError.server("تعذّر حذف الحساب، حاول لاحقًا.") }
    }

    private func save(_ r: [String: Any], email: String) throws {
        guard let a = r["access_token"] as? String, let rt = r["refresh_token"] as? String else {
            throw AuthServiceError.server("استجابة غير متوقعة من الخادم.")
        }
        try store.setValue(a, forKey: "access_token")
        try store.setValue(rt, forKey: "refresh_token")
        try store.setValue(email, forKey: "user_email")
    }

    private func post(_ path: String, _ body: [String: String], bearer: String? = nil) async throws -> [String: Any] {
        guard isConfigured, let base = URL(string: urlString),
              let url = URL(string: base.appendingPathComponent("auth/v1").absoluteString + "/" + path)
        else { throw AuthServiceError.notConfigured }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(anon, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(bearer ?? anon)", forHTTPHeaderField: "Authorization")
        req.timeoutInterval = 30
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, resp) = try await run(req)
        let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        guard let code = (resp as? HTTPURLResponse)?.statusCode, (200..<300).contains(code) else {
            let msg = (json["error_description"] as? String) ?? (json["msg"] as? String) ?? "تعذّر إتمام الطلب."
            throw AuthServiceError.server(msg)
        }
        return json
    }

    private func run(_ req: URLRequest) async throws -> (Data, URLResponse) {
        do { return try await URLSession.shared.data(for: req) }
        catch let e as URLError where e.code == .notConnectedToInternet { throw AuthServiceError.offline }
    }
}

import Foundation
import SunnahDataKit

/// حذف الحساب داخل التطبيق (شرط App Store 5.1.1(v)) بلا اعتماد على الموقع.
/// ينفَّذ عبر RPC في Supabase اسمها `delete_my_account` (بلا معاملات، للمستخدم الحالي).
public protocol AccountDeleting: Sendable {
    /// يحذف حساب المستخدم الحالي في الخادم؛ يرمي `AuthServiceError` بعربية مفهومة عند الفشل.
    func deleteMyAccount() async throws
}

public struct SupabaseAccountDeleter: AccountDeleting {
    public static let rpcName = "delete_my_account"
    public static let timeout: TimeInterval = 15

    private let supabaseURL: URL?
    private let anonKey: String
    private let store: AuthSessionStoring
    private let session: URLSession

    public init(supabaseURL: URL?, anonKey: String, store: AuthSessionStoring, session: URLSession? = nil) {
        self.supabaseURL = supabaseURL
        self.anonKey = anonKey
        self.store = store
        self.session = session ?? RemoteTransport.shortSession(timeout: Self.timeout)
    }

    public func deleteMyAccount() async throws {
        guard let base = supabaseURL, base.host != nil, !anonKey.isEmpty else { throw AuthServiceError.notConfigured }
        guard let token = (try? store.value(forKey: "access_token")) ?? nil, !token.isEmpty else { throw AuthServiceError.unauthorized }
        var req = URLRequest(url: base.appendingPathComponent("rest/v1/rpc/\(Self.rpcName)"))
        req.httpMethod = "POST"
        req.timeoutInterval = Self.timeout
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.httpBody = Data("{}".utf8)
        let response: URLResponse
        do { (_, response) = try await session.data(for: req) }
        catch is URLError { throw AuthServiceError.offline }
        guard let code = (response as? HTTPURLResponse)?.statusCode else { throw AuthServiceError.server(Self.failure) }
        switch code {
        case 200..<300: return
        case 401, 403: throw AuthServiceError.unauthorized
        case 404: throw AuthServiceError.server("خدمة حذف الحساب غير متاحة حاليًا. حاول لاحقًا أو راسلنا من صفحة الدعم.")
        default: throw AuthServiceError.server(Self.failure)
        }
    }

    static let failure = "تعذّر حذف الحساب، حاول لاحقًا."
}

/// يمسح البيانات المحلية بعد حذف الحساب (الجلسة تُمسح عبر signOut): تفضيلات التطبيق والكاش.
public enum LocalDataEraser {
    public static func eraseAll(defaults: UserDefaults = .standard, bundleID: String? = Bundle.main.bundleIdentifier,
                                cache: DiskCache = .standard()) async {
        if let bundleID { defaults.removePersistentDomain(forName: bundleID) }
        await cache.removeAll()
    }
}

/// تدفق «حذف الحساب نهائيًا» خارج الواجهة ليُختبَر بعميل وهمي: لا معرّف مستخدم يُمرَّر أبدًا (الخادم يعتمد auth.uid() فقط).
enum AccountDeletionFlow {
    static let phrase = "حذف"

    static func canDelete(confirm: String, busy: Bool) -> Bool { !busy && confirm == phrase }

    /// يعيد nil عند النجاح، وإلا رسالة الخطأ؛ عند الفشل لا signOut ولا مسح محلي.
    static func run(auth: AuthServicing, erase: () async -> Void = { await LocalDataEraser.eraseAll() }) async -> String? {
        do {
            try await auth.deleteAccount()
            await auth.signOut()
            await erase()
            return nil
        } catch { return error.localizedDescription }
    }
}

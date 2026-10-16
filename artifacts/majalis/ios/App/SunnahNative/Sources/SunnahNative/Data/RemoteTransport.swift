import Foundation
import SunnahDataKit

/// إعداد الناقل البعيد. المفاتيح تُقرأ من Info.plist (SUPABASE_URL وSUPABASE_ANON_KEY) ولا تُخزَّن في المستودع.
public struct RemoteConfig: Sendable {
    /// nil افتراضيًا: لا اتصال بنطاق الموقع (المحتوى من الحزمة المدمجة والكاش)؛ مسارات غير Supabase تُرفض فورًا.
    public var siteURL: URL?
    public var supabaseURL: URL?
    public var anonKey: String?
    public var accessToken: @Sendable () async -> String?

    public init(
        siteURL: URL? = nil,
        supabaseURL: URL? = nil,
        anonKey: String? = nil,
        accessToken: @escaping @Sendable () async -> String? = { nil }
    ) {
        self.siteURL = siteURL
        self.supabaseURL = supabaseURL
        self.anonKey = anonKey
        self.accessToken = accessToken
    }

    /// قيم افتراضية عامة (anon key عامّ بطبيعته ومحمي بـRLS) كي لا نحتاج تعديل Info.plist.
    static let defaultSupabaseURL = URL(string: "https://ngmvmlulzacrlicuagyp.supabase.co")
    static let defaultAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbXZtbHVsemFjcmxpY3VhZ3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMTAxNzUsImV4cCI6MjA5NzU4NjE3NX0.zPCPSciPj5UwHZ7enFD4WOSfWaD2NvsoOLBtATSubcs"

    public static func fromBundle(_ bundle: Bundle = .main, accessToken: @escaping @Sendable () async -> String? = { nil }) -> RemoteConfig {
        func value(_ key: String) -> String? {
            let v = (bundle.object(forInfoDictionaryKey: key) as? String)?.trimmingCharacters(in: .whitespaces)
            return (v?.isEmpty == false) ? v : nil
        }
        #if DEBUG
        // محاكاة انقطاع الاتصال في التجارب: -SUNNAH_OFFLINE (DEBUG فقط، ولا يمسّ Info.plist)
        if CommandLine.arguments.contains("-SUNNAH_OFFLINE") {
            let dead = URL(string: "https://offline.invalid")!
            return RemoteConfig(supabaseURL: dead, anonKey: value("SUPABASE_ANON_KEY") ?? Self.defaultAnonKey, accessToken: accessToken)
        }
        #endif
        return RemoteConfig(
            supabaseURL: value("SUPABASE_URL").flatMap(URL.init(string:)) ?? Self.defaultSupabaseURL,
            anonKey: value("SUPABASE_ANON_KEY") ?? Self.defaultAnonKey,
            accessToken: accessToken
        )
    }
}

public enum RemoteTransportError: Error, Equatable {
    case badPath, noCredentials, status(Int)
}

/// ناقل `URLSession` بمهلة قصيرة (8 ثوانٍ). غير متزامن بالكامل فلا يُجمّد الواجهة.
/// `/rest/v1` ← Supabase فقط؛ أي مسار آخر (`/api` و`/data`) يُرفض بـ`badPath` ما لم تُمرَّر siteURL صراحةً (الاختبارات).
public struct RemoteTransport: DataTransport {
    public static let timeout: TimeInterval = 8

    private let config: RemoteConfig
    private let session: URLSession

    public init(config: RemoteConfig, session: URLSession? = nil) {
        self.config = config
        self.session = session ?? Self.shortSession()
    }

    /// جلسة بمهلة قصيرة وبلا انتظار اتصال: أي مضيف ميت يفشل خلال ثوانٍ لا يعلّق.
    public static func shortSession(timeout: TimeInterval = RemoteTransport.timeout) -> URLSession {
        let c = URLSessionConfiguration.default
        c.timeoutIntervalForRequest = timeout
        c.timeoutIntervalForResource = timeout
        c.waitsForConnectivity = false
        return URLSession(configuration: c)
    }

    /// يبني الطلب دون إرساله (للاختبار).
    public func request(path: String, requireAuth: Bool) async throws -> URLRequest {
        guard path.hasPrefix("/") else { throw RemoteTransportError.badPath }
        var req: URLRequest
        if path.hasPrefix("/rest/v1/") {
            guard let base = config.supabaseURL, let key = config.anonKey,
                  let url = URL(string: base.absoluteString.trimmingSuffix("/") + path) else { throw RemoteTransportError.noCredentials }
            req = URLRequest(url: url)
            req.setValue(key, forHTTPHeaderField: "apikey")
            let token = await config.accessToken()
            if requireAuth && token == nil { throw RemoteTransportError.noCredentials }
            req.setValue("Bearer " + (token ?? key), forHTTPHeaderField: "Authorization")
        } else {
            guard let site = config.siteURL, let url = URL(string: site.absoluteString.trimmingSuffix("/") + path) else { throw RemoteTransportError.badPath }
            req = URLRequest(url: url)
            if requireAuth {
                guard let token = await config.accessToken() else { throw RemoteTransportError.noCredentials }
                req.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
            }
        }
        req.timeoutInterval = Self.timeout
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        return req
    }

    public func fetch(path: String, requireAuth: Bool) async throws -> Data {
        let req = try await request(path: path, requireAuth: requireAuth)
        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw RemoteTransportError.status(http.statusCode)
        }
        return data
    }
}

private extension String {
    func trimmingSuffix(_ s: String) -> String { hasSuffix(s) ? String(dropLast(s.count)) : self }
}

public extension ContentLoader {
    /// المحمّل الحي: المحزوم من الحزمة، والبعيد offline-first (آخر استجابة ناجحة على القرص تُعرض عند الانقطاع).
    static func live(bundle: Bundle = .main, config: RemoteConfig? = nil) -> ContentLoader {
        let transport = RemoteTransport(config: config ?? .fromBundle(bundle))
        return ContentLoader(bundle: bundle, store: DataStore(transport: transport, cache: .standard()))
    }
}

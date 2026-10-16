import Foundation

/// مسارات الشبكة لشاشات القسم — كما يطلبها الويب حرفيًا. القراءة تمر عبر ContentLoader (.remote) فتستفيد
/// من كاش DataStore؛ اصطلاح المسار (docs/native/requests/account.md): `/rest/v1/…` من Supabase (المفتاح العام والتوكن
/// يضيفهما ناقل الهدف)، أما `/api/…` و`/data/…` فتُخدم من الكاش/البذرة المدمجة لأن RemoteTransport يرفض نطاق الموقع.
enum AccountEndpoints {
    /// دروس الكويت المجمّعة (public/data/lessons/chunk-000.json) — للتقويم ووضع السيارة.
    static let lessons = ContentSource.remote(path: "/data/lessons/chunk-000.json", maxAge: 3600)

    static let autoContent = ContentSource.remote(path: "/api/auto-content?limit=100", maxAge: 900)

    /// مصدر الموقع الفعلي لتحديثات المنصة (جدول platform_updates غير موجود في Supabase الإنتاج): [{id,title,content}].
    static let platformUpdates = ContentSource.remote(path: "/api/updates", maxAge: 900)

    static func autoContent(slug: String) -> ContentSource {
        .remote(path: "/api/auto-content?slug=" + query(slug), maxAge: 900)
    }

    /// مساهمات المستخدم الحالي: `user_id` (RLS تحصر المستخدم في صفوفه) بدل البريد.
    static func submissions(userId: String) -> ContentSource {
        .remote(
            path: "/rest/v1/user_submissions?select=id,type,title,status,reviewer_note,file_name,file_size_kb,file_url,file_mime,created_at&user_id=eq." + query(userId) + "&order=created_at.desc&limit=30",
            maxAge: 0, requireAuth: true)
    }

    static func bookmarks(userId: String) -> ContentSource {
        .remote(path: "/rest/v1/bookmarks?select=id,content_type&user_id=eq." + query(userId), maxAge: 0, requireAuth: true)
    }

    static func achievements(userId: String) -> ContentSource {
        .remote(path: "/rest/v1/achievements?select=achievement_key,title,description,earned_at&user_id=eq." + query(userId) + "&order=earned_at.desc",
                maxAge: 0, requireAuth: true)
    }

    static func completedLessons(userId: String) -> ContentSource {
        .remote(path: "/rest/v1/lesson_registrations?select=lesson_id&user_id=eq." + query(userId) + "&status=eq.completed", maxAge: 0, requireAuth: true)
    }

    static func resume(userId: String) -> ContentSource {
        .remote(path: "/rest/v1/reading_resume?select=content_type,content_id,content_title,content_url,position,last_opened_at&user_id=eq." + query(userId) + "&order=last_opened_at.desc&limit=5",
                maxAge: 0, requireAuth: true)
    }

    static func query(_ value: String) -> String {
        var allowed = CharacterSet.urlQueryAllowed
        allowed.remove(charactersIn: "&=+?#")
        return value.addingPercentEncoding(withAllowedCharacters: allowed) ?? value
    }
}

/// جلسة Supabase المحفوظة في Keychain عبر منفذ AuthSessionStoring: مفاتيح محوّل الدخول الأصلي
/// (access_token وuser_email، والمعرّف من مطالبة sub في الرمز)، ثم جلسة الويب القديمة (sb-<ref>-auth-token).
struct AccountSession: Equatable, Sendable {
    static let storageKey = "sb-ngmvmlulzacrlicuagyp-auth-token"
    static let tokenKey = "access_token"
    static let emailKey = "user_email"

    let accessToken: String
    let userId: String
    let email: String?
    let fullName: String?

    /// الاسم المعروض كما في الويب: الاسم الكامل، ثم ما قبل @ في البريد، ثم «المستخدم».
    var displayName: String {
        if let n = fullName, !n.isEmpty { return n }
        if let e = email, let local = e.split(separator: "@").first, !local.isEmpty { return String(local) }
        return "المستخدم"
    }

    static func read(from store: AuthSessionStoring) -> AccountSession? {
        if let token = (try? store.value(forKey: tokenKey)) ?? nil,
           let session = fromToken(token, email: (try? store.value(forKey: emailKey)) ?? nil) {
            return session
        }
        guard let raw = (try? store.value(forKey: storageKey)) ?? nil else { return nil }
        return parse(raw)
    }

    /// جلسة من رمز JWT: المعرّف من sub، والبريد والاسم من المطالبات إن غابت.
    static func fromToken(_ token: String, email: String?) -> AccountSession? {
        let parts = token.split(separator: ".")
        guard parts.count == 3 else { return nil }
        var b64 = parts[1].replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
        b64 += String(repeating: "=", count: (4 - b64.count % 4) % 4)
        guard let data = Data(base64Encoded: b64),
              let claims = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let sub = claims["sub"] as? String, !sub.isEmpty else { return nil }
        let meta = claims["user_metadata"] as? [String: Any]
        return AccountSession(accessToken: token, userId: sub, email: email ?? claims["email"] as? String,
                              fullName: meta?["full_name"] as? String)
    }

    static func parse(_ raw: String) -> AccountSession? {
        guard let data = raw.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        // supabase-js v2: الجلسة نفسها، أو داخل currentSession في الصيغ الأقدم.
        let session = (object["currentSession"] as? [String: Any]) ?? object
        guard let token = session["access_token"] as? String, !token.isEmpty,
              let user = session["user"] as? [String: Any], let id = user["id"] as? String, !id.isEmpty else { return nil }
        let meta = user["user_metadata"] as? [String: Any]
        return AccountSession(accessToken: token, userId: id, email: user["email"] as? String, fullName: meta?["full_name"] as? String)
    }
}

enum AccountAPIError: Error, Equatable {
    case notSignedIn
    case server(String)
    case invalidResponse
}

/// اتصال Supabase للكتابة (يضبطه محوّل الدخول عند الإقلاع): عنوان المشروع والمفتاح العام ومخزن الجلسة.
public enum AccountBackend {
    struct Config: Sendable {
        let url: URL
        let anonKey: String
        let store: AuthSessionStoring
    }
    private static let lock = NSLock()
    nonisolated(unsafe) private static var stored: Config?

    static var current: Config? { lock.withLock { stored } }
    public static func configure(url: URL?, anonKey: String, store: AuthSessionStoring) {
        guard let url, url.host != nil, !anonKey.isEmpty else { return }
        lock.withLock { stored = Config(url: url, anonKey: anonKey, store: store) }
    }
}

/// طلبات الكتابة القليلة في القسم — مباشرة على Supabase (RLS/RPC بجلسة المستخدم)، بلا الموقع المجمّد.
struct AccountAPI: Sendable {
    /// مهلة قصيرة دائمًا: لا يجوز أن يعلّق أي طلب.
    var session: URLSession = RemoteTransport.shortSession()
    var backend: AccountBackend.Config? = AccountBackend.current

    static let signInNeeded = "سجّل الدخول لإرسال مقترحك."
    static let unavailable = "تعذّر تحميل المحتوى. أعد المحاولة."
    /// حدود جدول user_submissions في الإنتاج (CHECK): العنوان 3–300، التفاصيل ≤ 3000، الاسم 2–100.
    static let titleMax = 300, detailsMax = 3000, authorMax = 100

    /// إدراج صف في user_submissions (سياسة RLS تسمح للمستخدم المسجَّل بصفه فقط وبحالة pending).
    /// النوع في الجدول lesson|adhan فقط، فيُحفظ النوع العربي الذي اختاره المستخدم في meta.kind.
    func submitContent(_ draft: AccountSubmissionDraft) async throws -> String {
        guard let backend else { throw AccountAPIError.server(Self.unavailable) }
        guard let user = AccountSession.read(from: backend.store) else { throw AccountAPIError.server(Self.signInNeeded) }
        let title = draft.title.trimmingCharacters(in: .whitespacesAndNewlines)
        let details = draft.details.trimmingCharacters(in: .whitespacesAndNewlines)
        let author = draft.author.trimmingCharacters(in: .whitespacesAndNewlines)
        guard title.count <= Self.titleMax else { throw AccountAPIError.server("العنوان لا يتجاوز \(Self.titleMax) حرفًا.") }
        guard details.count <= Self.detailsMax else { throw AccountAPIError.server("التفاصيل لا تتجاوز \(Self.detailsMax) حرف.") }
        let name = author.count >= 2 ? String(author.prefix(Self.authorMax)) : user.displayName
        var row: [String: Any] = [
            "type": "lesson", "user_id": user.userId, "title": title, "description": details,
            "submitter_name": name.count >= 2 ? name : "مستخدم التطبيق", "meta": ["kind": draft.type, "source": "ios-native"]
        ]
        if let email = user.email { row["submitter_email"] = String(email.prefix(320)) }
        var request = authorized(backend, path: "rest/v1/user_submissions", token: user.accessToken)
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        request.httpBody = try JSONSerialization.data(withJSONObject: row)
        let (_, response) = try await send(request)
        switch response.statusCode {
        case 200..<300: return "شكراً! ينتظر موافقة المشرف."
        case 401, 403: throw AccountAPIError.server(Self.signInNeeded)
        default: throw AccountAPIError.server("حدث خطأ، حاول مرة أخرى.")
        }
    }

    /// RPC export_my_account (SECURITY DEFINER على auth.uid()) — يعيد ملف JSON مطبوعًا للحفظ أو المشاركة.
    func exportAccount(token: String) async throws -> Data {
        guard let backend else { throw AccountAPIError.server(Self.unavailable) }
        var request = authorized(backend, path: "rest/v1/rpc/export_my_account", token: token)
        request.httpBody = Data("{}".utf8)
        let (data, response) = try await send(request)
        let object = try? JSONSerialization.jsonObject(with: data)
        guard (200..<300).contains(response.statusCode), let object else {
            throw AccountAPIError.server(response.statusCode == 401 || response.statusCode == 403 ? "انتهت الجلسة، سجّل الدخول من جديد." : Self.unavailable)
        }
        return try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted, .sortedKeys])
    }

    private func authorized(_ backend: AccountBackend.Config, path: String, token: String) -> URLRequest {
        var request = URLRequest(url: backend.url.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.timeoutInterval = RemoteTransport.timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(backend.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        return request
    }

    private func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        do {
            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw AccountAPIError.invalidResponse }
            return (data, http)
        } catch is URLError { throw AccountAPIError.server("تعذر الاتصال، حاول مرة أخرى.") }
    }
}

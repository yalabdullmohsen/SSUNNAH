import Foundation

/// مسارات الشبكة لشاشات القسم — كما يطلبها الويب حرفيًا. القراءة تمر عبر ContentLoader (.remote) فتستفيد
/// من كاش DataStore؛ اصطلاح المسار (docs/native/requests/account.md): `/api/…` و`/data/…` من نطاق الموقع،
/// و`/rest/v1/…` من Supabase (المفتاح العام والتوكن يضيفهما ناقل الهدف).
enum AccountEndpoints {
    /// دروس الكويت المجمّعة (public/data/lessons/chunk-000.json) — للتقويم ووضع السيارة.
    static let lessons = ContentSource.remote(path: "/data/lessons/chunk-000.json", maxAge: 3600)

    static let autoContent = ContentSource.remote(path: "/api/auto-content?limit=100", maxAge: 900)

    /// مصدر الموقع الفعلي لتحديثات المنصة (جدول platform_updates غير موجود في Supabase الإنتاج): [{id,title,content}].
    static let platformUpdates = ContentSource.remote(path: "/api/updates", maxAge: 900)

    static func autoContent(slug: String) -> ContentSource {
        .remote(path: "/api/auto-content?slug=" + query(slug), maxAge: 900)
    }

    static func submissions(email: String) -> ContentSource {
        let e = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return .remote(
            path: "/rest/v1/user_submissions?select=id,type,title,status,reviewer_note,file_name,file_size_kb,file_url,file_mime,created_at&submitter_email=eq." + query(e) + "&order=created_at.desc&limit=30",
            maxAge: 0)
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

/// طلبات الكتابة القليلة في القسم (POST إلى واجهات الموقع) — DataStore للقراءة فقط.
struct AccountAPI: Sendable {
    var baseURL = URL(string: AccountTexts.siteURL)!
    /// مهلة قصيرة دائمًا: الموقع قد يكون غير متاح (402/انقطاع) ولا يجوز أن يعلّق أي طلب.
    var session: URLSession = RemoteTransport.shortSession()

    /// POST /api/submissions — نفس جسم الويب. يعيد رسالة الخادم عند النجاح.
    func submitContent(_ draft: AccountSubmissionDraft) async throws -> String {
        let body = try JSONSerialization.data(withJSONObject: [
            "type": draft.type, "title": draft.title, "content": draft.details, "author": draft.author
        ])
        let json = try await post("/api/submissions", body: body, bearer: nil)
        if json["ok"] as? Bool == true { return json["message"] as? String ?? "شكراً! ينتظر موافقة المشرف." }
        throw AccountAPIError.server(json["message"] as? String ?? "حدث خطأ، حاول مرة أخرى.")
    }

    /// POST /api/account/export — يعيد ملف JSON مطبوعًا للحفظ أو المشاركة.
    func exportAccount(token: String) async throws -> Data {
        var request = URLRequest(url: baseURL.appendingPathComponent("api/account/export"))
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = RemoteTransport.timeout
        let (data, response) = try await session.data(for: request)
        let object = try? JSONSerialization.jsonObject(with: data)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode), let object else {
            throw AccountAPIError.server(((object as? [String: Any])?["error"] as? String) ?? "تعذّر تحميل المحتوى. أعد المحاولة.")
        }
        return try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted, .sortedKeys])
    }

    private func post(_ path: String, body: Data, bearer: String?) async throws -> [String: Any] {
        var request = URLRequest(url: baseURL.appendingPathComponent(String(path.dropFirst())))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let bearer { request.setValue("Bearer \(bearer)", forHTTPHeaderField: "Authorization") }
        request.httpBody = body
        request.timeoutInterval = RemoteTransport.timeout
        let (data, _) = try await session.data(for: request)
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw AccountAPIError.invalidResponse }
        return json
    }
}

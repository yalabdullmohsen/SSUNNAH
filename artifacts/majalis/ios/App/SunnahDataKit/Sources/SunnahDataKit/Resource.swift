import Foundation

/// مورد بعيد قابل للكاش: مسار API ونوع فكّه ومدة صلاحيته.
public struct Resource<Value: Decodable & Sendable>: Sendable {
    public let path: String
    public let cacheKey: String
    public let maxAge: TimeInterval
    public let requireAuth: Bool
    let decode: @Sendable (Data) throws -> Value

    public init(
        path: String,
        cacheKey: String? = nil,
        maxAge: TimeInterval = 60 * 60,
        requireAuth: Bool = false,
        decoder: JSONDecoder = JSONDecoder()
    ) {
        self.path = path
        self.cacheKey = cacheKey ?? path
        self.maxAge = maxAge
        self.requireAuth = requireAuth
        self.decode = { try decoder.decode(Value.self, from: $0) }
    }
}

/// نتيجة التحميل مع مصدرها؛ الواجهة تعرض `isStale` تنبيهًا خفيفًا دون إخفاء المحتوى.
public struct Loaded<Value: Sendable>: Sendable {
    public enum Source: Sendable, Equatable { case cache, remote }

    public let value: Value
    public let source: Source
    public let savedAt: Date
    public let isStale: Bool
}

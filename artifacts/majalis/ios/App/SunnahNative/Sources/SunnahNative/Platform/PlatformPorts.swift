import SwiftUI

/// منافذ الخدمات الأصلية: تعرّفها الحزمة وينفّذها هدف التطبيق بتوصيل الأصناف الجوهرية الموجودة
/// (Keychain، المجموعة المشتركة...) كما هي، فلا تُعاد كتابتها ولا تتعلق الشاشات بتفاصيلها.

/// جلسة الدخول في Keychain فقط (الخدمة com.yousef.majlisilm.auth) — لا UserDefaults أبدًا.
public protocol AuthSessionStoring: Sendable {
    func value(forKey key: String) throws -> String?
    func setValue(_ value: String, forKey key: String) throws
    func removeValue(forKey key: String) throws
    /// يمسح جلسة NetworkService القديمة عند الخروج.
    func clearLegacySession() throws
}

/// نشر لقطات غير سرّية إلى App Group (group.com.yousef.majlisilm) للويدجت والنشاط الحي.
public protocol SharedDataPublishing: Sendable {
    var isAvailable: Bool { get }
    @discardableResult
    func publishProgress(dailyWirdCompleted: Int, dailyWirdTarget: Int, mushafPagesReadToday: Int) -> Bool
}

/// حاوية الخدمات؛ الافتراضي ذاكرة مؤقتة آمنة للمعاينات والاختبارات.
public struct PlatformServices: Sendable {
    public var auth: AuthSessionStoring
    public var sharedData: SharedDataPublishing
    public init(auth: AuthSessionStoring = InMemoryAuthStore(), sharedData: SharedDataPublishing = NoSharedData()) {
        self.auth = auth; self.sharedData = sharedData
    }
}

public final class InMemoryAuthStore: AuthSessionStoring, @unchecked Sendable {
    private let lock = NSLock()
    private var values: [String: String] = [:]
    public init() {}
    public func value(forKey key: String) throws -> String? { lock.withLock { values[key] } }
    public func setValue(_ value: String, forKey key: String) throws { lock.withLock { values[key] = value } }
    public func removeValue(forKey key: String) throws { lock.withLock { _ = values.removeValue(forKey: key) } }
    public func clearLegacySession() throws {}
}

public struct NoSharedData: SharedDataPublishing {
    public init() {}
    public var isAvailable: Bool { false }
    public func publishProgress(dailyWirdCompleted: Int, dailyWirdTarget: Int, mushafPagesReadToday: Int) -> Bool { false }
}

private struct PlatformServicesKey: EnvironmentKey {
    static let defaultValue = PlatformServices()
}

public extension EnvironmentValues {
    var platform: PlatformServices {
        get { self[PlatformServicesKey.self] }
        set { self[PlatformServicesKey.self] = newValue }
    }
}

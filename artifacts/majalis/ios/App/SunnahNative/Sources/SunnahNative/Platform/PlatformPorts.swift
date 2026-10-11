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

/// تلاوات محمّلة دون اتصال (Application Support، خارج نسخ iCloud).
public protocol OfflineAudioProviding: Sendable {
    /// رابط الملف المحلي إن كانت السورة محمّلة وإلا nil.
    func localURL(reciterId: String, surah: Int) -> URL?
    func downloadedSurahs(reciterId: String) -> [Int]
    func save(_ data: Data, reciterId: String, surah: Int) throws
    func remove(reciterId: String, surah: Int) throws
    func removeAll(reciterId: String) throws
    func totalBytes() -> Int
}

public enum PlaybackSessionMode: String, Sendable { case inactive, playback, recording }

public enum PlaybackRemoteCommand: String, Sendable { case play, pause, toggle, next, previous, stop }

/// جلسة الصوت و«يُشغَّل الآن» وأوامر القفل/مركز التحكم. التشغيل نفسه (AVPlayer) في مشغّل الشاشات.
@MainActor
public protocol PlaybackSessionControlling: AnyObject {
    var mode: PlaybackSessionMode { get }
    var onRemoteCommand: ((PlaybackRemoteCommand) -> Void)? { get set }
    func enablePlayback(title: String?, artist: String?, album: String?) throws
    func enableRecording() throws
    func deactivate() throws
    func updateNowPlaying(playing: Bool, elapsed: Double?, duration: Double?, rate: Float)
    func clearNowPlaying()
}

/// حاوية الخدمات؛ الافتراضي ذاكرة مؤقتة آمنة للمعاينات والاختبارات.
public struct PlatformServices: Sendable {
    public var auth: AuthSessionStoring
    public var sharedData: SharedDataPublishing
    public var offlineAudio: OfflineAudioProviding
    public init(auth: AuthSessionStoring = InMemoryAuthStore(),
                sharedData: SharedDataPublishing = NoSharedData(),
                offlineAudio: OfflineAudioProviding = NoOfflineAudio()) {
        self.auth = auth; self.sharedData = sharedData; self.offlineAudio = offlineAudio
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

public struct NoOfflineAudio: OfflineAudioProviding {
    public init() {}
    public func localURL(reciterId: String, surah: Int) -> URL? { nil }
    public func downloadedSurahs(reciterId: String) -> [Int] { [] }
    public func save(_ data: Data, reciterId: String, surah: Int) throws {}
    public func remove(reciterId: String, surah: Int) throws {}
    public func removeAll(reciterId: String) throws {}
    public func totalBytes() -> Int { 0 }
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

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

/// النشاط الحي لمواقيت الصلاة (Dynamic Island / شاشة القفل) — يقرأ من لقطة App Group فقط.
public protocol LiveActivityControlling: Sendable {
    var isSupported: Bool { get }
    /// يبدأ/يحدّث النشاط من لقطة المواقيت المشتركة؛ true عند النجاح.
    func sync() async -> Bool
    /// يُنهي كل الأنشطة؛ true إن وُجد ما يُنهى.
    func end() async -> Bool
}

public struct NoLiveActivity: LiveActivityControlling {
    public init() {}
    public var isSupported: Bool { false }
    public func sync() async -> Bool { false }
    public func end() async -> Bool { false }
}

/// حاوية الخدمات؛ الافتراضي ذاكرة مؤقتة آمنة للمعاينات والاختبارات.
/// عميل مصادقة Supabase (كلمة مرور) خلف منفذ؛ المحوّل في SunnahApp.
public protocol AuthServicing: Sendable {
    var isConfigured: Bool { get }
    var currentEmail: String? { get }
    func signIn(email: String, password: String) async throws
    /// يعيد true إن لزم تأكيد البريد قبل الدخول.
    func signUp(email: String, password: String) async throws -> Bool
    func resetPassword(email: String) async throws
    func signOut() async
    func deleteAccount() async throws
    /// يحدّث كلمة المرور للجلسة الحالية (بعد رابط الاستعادة).
    func updatePassword(_ newPassword: String) async throws
    /// يقبل رابط العودة (sunnah://auth/callback#access_token=…) ويحفظ الجلسة؛ يعيد true عند النجاح.
    func handleCallback(_ url: URL) -> Bool
}

public struct NoAuthService: AuthServicing {
    public init() {}
    public var isConfigured: Bool { false }
    public var currentEmail: String? { nil }
    public func signIn(email: String, password: String) async throws { throw AuthServiceError.notConfigured }
    public func signUp(email: String, password: String) async throws -> Bool { throw AuthServiceError.notConfigured }
    public func resetPassword(email: String) async throws { throw AuthServiceError.notConfigured }
    public func signOut() async {}
    public func deleteAccount() async throws { throw AuthServiceError.notConfigured }
    public func updatePassword(_ newPassword: String) async throws { throw AuthServiceError.notConfigured }
    public func handleCallback(_ url: URL) -> Bool { false }
}

public enum AuthServiceError: Error, LocalizedError, Sendable {
    case notConfigured, offline, unauthorized
    case server(String)
    public var errorDescription: String? {
        switch self {
        case .notConfigured: return "خدمة الحساب غير مهيّأة في هذه النسخة."
        case .offline: return "لا يوجد اتصال بالإنترنت."
        case .unauthorized: return "انتهت الجلسة، سجّل الدخول من جديد."
        case .server(let m): return m
        }
    }
}

public struct PlatformServices: Sendable {
    public var auth: AuthSessionStoring
    public var sharedData: SharedDataPublishing
    public var offlineAudio: OfflineAudioProviding
    public var liveActivity: LiveActivityControlling
    public var authService: AuthServicing
    public init(auth: AuthSessionStoring = InMemoryAuthStore(),
                sharedData: SharedDataPublishing = NoSharedData(),
                offlineAudio: OfflineAudioProviding = NoOfflineAudio(),
                liveActivity: LiveActivityControlling = NoLiveActivity(),
                authService: AuthServicing = NoAuthService()) {
        self.auth = auth; self.sharedData = sharedData; self.offlineAudio = offlineAudio
        self.liveActivity = liveActivity; self.authService = authService
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

/// نص جزئي من محرك التسميع (WhisperKit) — يطابق TasmeePartialEvent في عقد الجسر القديم.
public struct RecitationPartial: Sendable, Equatable {
    public let seq: Int
    public let text: String
    public let finishedAtMs: Double
    public init(seq: Int, text: String, finishedAtMs: Double) {
        self.seq = seq; self.text = text; self.finishedAtMs = finishedAtMs
    }
}

public enum RecitationModelStatus: Sendable, Equatable {
    case notInstalled
    case downloading(progress: Double)
    case installed
    case unsupported
}

/// محرك التسميع على الجهاز: ينفّذه هدف التطبيق فوق TasmeeEngine/TasmeeModelStore. المطابقة في الحزمة لا فيه.
@MainActor
public protocol RecitationEngineControlling: AnyObject {
    var modelStatus: RecitationModelStatus { get }
    var onPartial: ((RecitationPartial) -> Void)? { get set }
    /// كلام مرصود ولا يعود نص («لم يتضح الصوت»).
    var onUnclear: (() -> Void)? { get set }
    var onFailure: ((String) -> Void)? { get set }
    func downloadModel(progress: @escaping @Sendable (Double) -> Void) async throws
    func deleteModel() throws
    func load() async throws
    func start(prompt: String?) async throws
    func setPrompt(_ text: String?) async
    func stop() async
}

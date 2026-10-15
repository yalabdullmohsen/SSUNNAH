import Foundation

/// يضمن تنفيذ العمل مرة واحدة فقط مهما تكرر الاستدعاء (آمن عبر الخيوط).
public final class OnceGuard: @unchecked Sendable {
    private let lock = NSLock()
    private var done = false
    public init() {}

    /// ينفّذ `work` عند أول استدعاء فقط؛ يعيد true إن نُفّذ فعلًا.
    @discardableResult
    public func run(_ work: () -> Void) -> Bool {
        lock.lock(); defer { lock.unlock() }
        guard !done else { return false }
        done = true
        work()
        return true
    }
}

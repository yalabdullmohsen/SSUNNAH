import Foundation

/// أعمال الإقلاع غير اللازمة لأول إطار (بناء خدمات المنصة، نشر الويدجت، إعادة جدولة الإشعارات) تُؤجَّل إلى ما بعد أول إطار للحركة.
/// `fire()` يُستدعى مرة واحدة عند أول إطار (أو بمهلة احتياطية)؛ ما سُجِّل قبله يُنفَّذ بترتيب التسجيل، وما سُجِّل بعده يُنفَّذ فورًا — فلا يضيع عمل ولا يتكرر.
@MainActor
public final class PostFirstFrame {
    public private(set) var hasFired = false
    private var pending: [@MainActor () -> Void] = []

    public init() {}

    public func whenReady(_ work: @escaping @MainActor () -> Void) {
        if hasFired { work() } else { pending.append(work) }
    }

    public func fire() {
        guard !hasFired else { return }
        hasFired = true
        let queued = pending
        pending = []
        queued.forEach { $0() }
    }
}

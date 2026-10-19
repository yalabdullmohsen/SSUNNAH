import Foundation

public protocol ChromeCancellable { func cancel() }

/// مؤقت إخفاء زر الخروج: يظهر بلمسة فراغ ويختفي بعد ثانيتين من آخر تفاعل.
/// يبقى ظاهرًا ما دامت البطاقة مفتوحة (`pinned`) أو مع VoiceOver (`alwaysVisible`).
@MainActor
public final class ChromeAutoHide: ObservableObject {
    public typealias Scheduler = (TimeInterval, @escaping @MainActor () -> Void) -> ChromeCancellable

    public static let delay: TimeInterval = 6

    @Published public private(set) var visible = false
    public var alwaysVisible = false { didSet { if alwaysVisible { visible = true; timer?.cancel() } else { rearm() } } }
    private var pinned = false
    private var timer: ChromeCancellable?
    private let schedule: Scheduler

    public init(schedule: @escaping Scheduler = ChromeAutoHide.liveScheduler) { self.schedule = schedule }

    /// لمسة على مساحة فارغة: تُظهر الزر وتبدأ العدّ.
    public func tapEmpty() { visible = true; rearm() }
    /// نقرة على الصفحة: تُظهر الأدوات، وثانية تُخفيها (ما لم تكن مثبّتة).
    public func toggle() { if visible && !pinned && !alwaysVisible { timer?.cancel(); timer = nil; visible = false } else { tapEmpty() } }
    /// أي لمسة/تمرير: تعيد ضبط العدّ دون تبديل الظهور.
    public func touch() { if visible { rearm() } }
    /// البطاقة مفتوحة: الزر ثابت.
    public func pin(_ on: Bool) { pinned = on; if on { visible = true; timer?.cancel() } else if visible { rearm() } }
    /// مغادرة الشاشة.
    public func cancel() { timer?.cancel(); timer = nil }

    private func rearm() {
        timer?.cancel(); timer = nil
        guard !pinned, !alwaysVisible else { return }
        timer = schedule(Self.delay) { [weak self] in self?.visible = false; self?.timer = nil }
    }

    public static let liveScheduler: Scheduler = { delay, fire in
        let task = Task { @MainActor in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            if !Task.isCancelled { fire() }
        }
        return TaskToken(task: task)
    }
    private struct TaskToken: ChromeCancellable { let task: Task<Void, Never>; func cancel() { task.cancel() } }
}

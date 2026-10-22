import Foundation

/// يقود وضع التكرار فوق المطابِق: يكتشف اكتمال الآية، ويعدّ القراءات النظيفة المتتالية، ثم يطلب إعادة الآية أو الانتقال لما بعدها.
/// نقيّ بلا واجهة: المتحكّم يُمرّر إليه أحداث الكلمات وينفّذ `Action` عند نهاية الدفعة (فلا تتداخل إعادة المؤشر مع أحداث الدفعة نفسها).
public struct TasmeeRepeatDriver: Sendable, Equatable {
    public enum Action: Sendable, Equatable {
        /// أعد المؤشر إلى `index`؛ `streak` من `target` قراءة نظيفة للآية الحالية.
        case rewind(to: Int, streak: Int, target: Int)
        /// اكتملت آخر آية بهدفها: أنهِ الجلسة.
        case finish
    }

    private let verseEnd: [Int]
    private let count: Int
    public private(set) var counter: TasmeeRepeatCounter
    public private(set) var verseStart = 0
    private var dirty = false
    private var pending: Action?

    public init(ref: [TasmeeRefWord], target: Int) {
        count = ref.count
        counter = TasmeeRepeatCounter(target: target)
        func verse(_ w: TasmeeRefWord) -> Substring { w.id.split(separator: "#").first ?? "" }
        var ends = Array(repeating: 0, count: ref.count)
        var i = ref.count - 1
        while i >= 0 {
            ends[i] = (i + 1 < ref.count && verse(ref[i + 1]) == verse(ref[i])) ? ends[i + 1] : i
            i -= 1
        }
        verseEnd = ends
    }

    /// `false` = تجاهل الحدث (جاء بعد اكتمال الآية في الدفعة نفسها، وستُعاد الكلمات).
    public mutating func consume(_ e: TasmeeWordEvent) -> Bool {
        guard pending == nil, verseStart < count else { return false }
        if e.state == .wrong { dirty = true }
        guard e.state == .correct, e.index == verseEnd[verseStart] else { return true }
        let done = counter.record(clean: !dirty)
        dirty = false
        if !done { pending = .rewind(to: verseStart, streak: counter.streak, target: counter.target); return true }
        let next = e.index + 1
        if next >= count { pending = .finish; return true }
        verseStart = next
        counter = TasmeeRepeatCounter(target: counter.target)
        pending = .rewind(to: next, streak: 0, target: counter.target)
        return true
    }

    /// يُستدعى بعد أحداث الدفعة؛ يُرجع الإجراء المعلّق (مرة واحدة).
    public mutating func takeAction() -> Action? { defer { pending = nil }; return pending }
}

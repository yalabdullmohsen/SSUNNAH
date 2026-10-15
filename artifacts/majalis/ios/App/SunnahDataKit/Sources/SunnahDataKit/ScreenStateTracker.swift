import Foundation

/// منطق عدّ حالات الشاشة الظاهرة (loading/empty/error) لقياس الجاهزية، بلا SwiftUI فيُختبر بـ`swift test` على macOS.
/// المفتاح معرّف نسخة الواجهة: enter/leave متساويا القوة، فلا يعلَق عدّاد بسبب onAppear مكرَّر أو onDisappear
/// متأخر/مفقود، ولا ينقص onDisappear متأخر من شاشة قديمة حالة شاشة جديدة.
public struct ScreenStateTracker<Key: Hashable> {
    private var live: [Key: Set<UUID>] = [:]
    public private(set) var revision = 0
    public init() {}
    public mutating func enter(_ s: Key, id: UUID) { if live[s, default: []].insert(id).inserted { revision += 1 } }
    public mutating func leave(_ s: Key, id: UUID) { if live[s]?.remove(id) != nil { revision += 1 } }
    /// يصفّر كل الحالات (تبديل المسار في وضع التدقيق).
    public mutating func reset() { live = [:]; revision += 1 }
    public func count(_ s: Key) -> Int { live[s]?.count ?? 0 }
}

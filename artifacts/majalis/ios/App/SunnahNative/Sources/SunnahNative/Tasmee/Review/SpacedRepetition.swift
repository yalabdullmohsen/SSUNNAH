import Foundation

/// حالة مراجعة آية ضعيفة بتكرار متباعد (صندوق ليتنر مبسّط): الفاصل يتضاعف بالنجاح ويعود ليوم بالخطأ.
public struct TasmeeReviewItem: Codable, Sendable, Equatable, Identifiable {
    public var surah: Int
    public var ayah: Int
    public var box: Int
    public var dueAt: Date
    public var misses: Int
    public var id: String { "\(surah):\(ayah)" }

    public init(surah: Int, ayah: Int, box: Int = 0, dueAt: Date, misses: Int = 1) {
        self.surah = surah; self.ayah = ayah; self.box = box; self.dueAt = dueAt; self.misses = misses
    }
}

public enum TasmeeSpacing {
    /// فواصل الصناديق بالأيام: 1، 2، 4، 8، 16، 32.
    public static let intervalsDays: [Int] = [1, 2, 4, 8, 16, 32]
    public static let maxBox = intervalsDays.count - 1

    public static func due(afterBox box: Int, from now: Date, calendar: Calendar = .current) -> Date {
        let b = min(max(box, 0), maxBox)
        return calendar.date(byAdding: .day, value: intervalsDays[b], to: now) ?? now
    }

    /// أخطأ: يعود للصندوق 0 ويُستحق غدًا.
    public static func failed(_ it: TasmeeReviewItem, now: Date, calendar: Calendar = .current) -> TasmeeReviewItem {
        var n = it; n.box = 0; n.misses += 1; n.dueAt = due(afterBox: 0, from: now, calendar: calendar); return n
    }

    /// أصاب: يرتقي صندوقًا. بعد تجاوز الأخير يُعدّ متقنًا (nil) ويخرج من المراجعة.
    public static func passed(_ it: TasmeeReviewItem, now: Date, calendar: Calendar = .current) -> TasmeeReviewItem? {
        let next = it.box + 1
        if next > maxBox { return nil }
        var n = it; n.box = next; n.dueAt = due(afterBox: next, from: now, calendar: calendar); return n
    }
}

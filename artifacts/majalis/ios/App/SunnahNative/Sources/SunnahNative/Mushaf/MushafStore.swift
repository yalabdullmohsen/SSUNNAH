import Foundation

/// ألوان العلامات الخمسة (نموذج الألوان 2): أساس فاتح وصيغة أفتح للداكن لتباين واضح في الوضعين.
public enum MushafMarkColor: String, Codable, CaseIterable, Sendable, Identifiable {
    case wird, hifz, review, tadabbur, general
    public var id: String { rawValue }
    public var name: String {
        switch self {
        case .wird: return "الورد"
        case .hifz: return "الحفظ"
        case .review: return "المراجعة"
        case .tadabbur: return "التدبّر"
        case .general: return "عامة"
        }
    }
    /// (فاتح، داكن)
    var hex: (UInt32, UInt32) {
        switch self {
        case .wird: return (0x1F5C45, 0x5FBF98)
        case .hifz: return (0xB8892B, 0xE0B65A)
        case .review: return (0x2F6B8A, 0x6FB1D6)
        case .tadabbur: return (0x6B4E8A, 0xB496D4)
        case .general: return (0x8A7F6A, 0xB8AE98)
        }
    }
}

/// علامة قراءة: على آية (`ayah` بصيغة «سورة:آية») أو على صفحة كاملة (`ayah == nil`). لكل (هدف، لون) علامة واحدة، ويجوز أكثر من لون للهدف نفسه.
public struct MushafBookmark: Codable, Equatable, Sendable, Identifiable {
    public var id: String { "\(ayah ?? "p\(page)")|\(color.rawValue)" }
    public let ayah: String?
    public let page: Int
    public let date: Date
    public let color: MushafMarkColor

    public init(ayah: String?, page: Int, date: Date, color: MushafMarkColor = .general) {
        self.ayah = ayah; self.page = page; self.date = date; self.color = color
    }

    /// ترحيل: العلامات القديمة {ayah, page, date} بلا لون تُقرأ «عامة».
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        ayah = try c.decodeIfPresent(String.self, forKey: .ayah)
        page = try c.decode(Int.self, forKey: .page)
        date = try c.decode(Date.self, forKey: .date)
        color = (try? c.decodeIfPresent(MushafMarkColor.self, forKey: .color)) ?? .general
    }
}

public final class MushafStore: ObservableObject {
    @Published public private(set) var bookmarks: [MushafBookmark]
    @Published public private(set) var lastPage: Int
    @Published public private(set) var pagesReadToday: Int

    private let defaults: UserDefaults
    private let now: () -> Date
    private enum Key { static let bookmarks = "mushaf.bookmarks", last = "mushaf.lastPage", day = "mushaf.readDay", read = "mushaf.readPages" }

    public init(defaults: UserDefaults = .standard, now: @escaping () -> Date = Date.init) {
        self.defaults = defaults; self.now = now
        bookmarks = (defaults.data(forKey: Key.bookmarks).flatMap { try? JSONDecoder().decode([MushafBookmark].self, from: $0) }) ?? []
        let last = defaults.integer(forKey: Key.last)
        lastPage = last == 0 ? 1 : Mushaf.clamp(last)
        pagesReadToday = 0
        pagesReadToday = todaysPages().count
    }

    private func save() { defaults.set(try? JSONEncoder().encode(bookmarks), forKey: Key.bookmarks) }

    /// هل للآية علامة بأي لون؟
    public func isBookmarked(_ ayah: String) -> Bool { bookmarks.contains { $0.ayah == ayah } }

    /// ألوان علامات الآية / الصفحة (بترتيب الألوان الثابت).
    public func colors(ofAyah ayah: String) -> [MushafMarkColor] { MushafMarkColor.allCases.filter { c in bookmarks.contains { $0.ayah == ayah && $0.color == c } } }
    public func colors(ofPage page: Int) -> [MushafMarkColor] { MushafMarkColor.allCases.filter { c in bookmarks.contains { $0.ayah == nil && $0.page == page && $0.color == c } } }

    /// آية ← ألوانها، لرسم الأثر البصري في الصفحة.
    public func ayahColors(onPage page: Int) -> [String: [MushafMarkColor]] {
        var out: [String: [MushafMarkColor]] = [:]
        for b in bookmarks where b.ayah != nil && b.page == page { out[b.ayah!, default: []].append(b.color) }
        return out.mapValues { cs in MushafMarkColor.allCases.filter(cs.contains) }
    }

    /// يبدّل علامة بلون على آية (`ayah`) أو على صفحة (`ayah == nil`).
    public func toggleMark(_ color: MushafMarkColor, ayah: String?, page: Int) {
        let p = Mushaf.clamp(page)
        if let i = bookmarks.firstIndex(where: { $0.ayah == ayah && $0.color == color && (ayah != nil || $0.page == p) }) { bookmarks.remove(at: i) }
        else { bookmarks.insert(.init(ayah: ayah, page: p, date: now(), color: color), at: 0) }
        save()
    }

    /// توافق: زر العلامة المفرد — يزيل كل علامات الآية إن وُجدت، وإلا يضيف «عامة».
    public func toggleBookmark(ayah: String, page: Int) {
        if isBookmarked(ayah) { bookmarks.removeAll { $0.ayah == ayah }; save() }
        else { toggleMark(.general, ayah: ayah, page: page) }
    }

    /// علامات اللون المحدد، أو الكل عند `nil`؛ الأحدث أولًا.
    public func marks(filter: MushafMarkColor?) -> [MushafBookmark] {
        bookmarks.filter { filter == nil || $0.color == filter }.sorted { $0.date > $1.date }
    }

    public func remove(_ mark: MushafBookmark) { bookmarks.removeAll { $0.id == mark.id }; save() }

    /// يُسجَّل عند استقرار القارئ على صفحة: آخر موضع + عدّاد صفحات اليوم (للتقدّم والويدجت).
    public func visit(page: Int) {
        let p = Mushaf.clamp(page)
        lastPage = p
        defaults.set(p, forKey: Key.last)
        var set = todaysPages(); set.insert(p)
        defaults.set(dayString(), forKey: Key.day)
        defaults.set(Array(set), forKey: Key.read)
        pagesReadToday = set.count
    }

    private func dayString() -> String {
        let c = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day], from: now())
        return "\(c.year!)-\(c.month!)-\(c.day!)"
    }
    private func todaysPages() -> Set<Int> {
        guard defaults.string(forKey: Key.day) == dayString() else { return [] }
        return Set(defaults.array(forKey: Key.read) as? [Int] ?? [])
    }
}

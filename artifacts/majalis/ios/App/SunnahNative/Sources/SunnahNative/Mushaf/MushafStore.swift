import Foundation

/// علامات القراءة ومتابعة الحفظ/القراءة: محليًا على الجهاز (UserDefaults).
public struct MushafBookmark: Codable, Equatable, Sendable, Identifiable {
    public var id: String { ayah }
    public let ayah: String
    public let page: Int
    public let date: Date
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

    public func isBookmarked(_ ayah: String) -> Bool { bookmarks.contains { $0.ayah == ayah } }

    public func toggleBookmark(ayah: String, page: Int) {
        if let i = bookmarks.firstIndex(where: { $0.ayah == ayah }) { bookmarks.remove(at: i) }
        else { bookmarks.insert(.init(ayah: ayah, page: Mushaf.clamp(page), date: now()), at: 0) }
        defaults.set(try? JSONEncoder().encode(bookmarks), forKey: Key.bookmarks)
    }

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

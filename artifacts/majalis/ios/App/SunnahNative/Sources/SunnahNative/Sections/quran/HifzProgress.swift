import Foundation

/// حالة حفظ صفحة من المصحف (٦٠٤ صفحات). تُشتقّ حالة السورة والجزء والحزب منها ولا تُخزَّن.
public enum HifzState: String, Codable, CaseIterable, Sendable, Identifiable {
    case none, partial, memorized, review
    public var id: String { rawValue }
    public var name: String {
        switch self {
        case .none: return "غير محفوظ"
        case .partial: return "محفوظ جزئيًا"
        case .memorized: return "محفوظ"
        case .review: return "يحتاج مراجعة"
        }
    }
    /// قوة الحفظ الافتراضية (٠…٥) عند تعيين الحالة.
    var defaultStrength: Int {
        switch self { case .none: return 0; case .partial: return 1; case .review: return 2; case .memorized: return 4 }
    }
}

public struct HifzPageEntry: Codable, Equatable, Sendable {
    public var state: HifzState
    public var lastReview: Date?
    public var strength: Int
    public init(state: HifzState, lastReview: Date? = nil, strength: Int? = nil) {
        self.state = state; self.lastReview = lastReview; self.strength = min(5, max(0, strength ?? state.defaultStrength))
    }
}

/// نسب مجموعة صفحات (جزء/سورة/المصحف كله). «المحفوظ» يشمل ما يحتاج مراجعة لأنه محفوظ فعلًا.
public struct HifzSummary: Equatable, Sendable {
    public let total: Int
    public let memorized: Int, partial: Int, review: Int
    public var none: Int { max(0, total - memorized - partial - review) }
    public var memorizedTotal: Int { memorized + review }
    private func frac(_ n: Int) -> Double { total > 0 ? Double(n) / Double(total) : 0 }
    public var memorizedFraction: Double { frac(memorizedTotal) }
    public var partialFraction: Double { frac(partial) }
    public var remainingFraction: Double { frac(none) }
    public var memorizedFractionPure: Double { frac(memorized) }
    public var reviewFraction: Double { frac(review) }
    /// الحالة المشتقّة: أي مراجعة → مراجعة؛ وإلا كله محفوظ → محفوظ؛ وإلا أي تقدّم → جزئي؛ وإلا لا شيء.
    public var derived: HifzState {
        if review > 0 { return .review }
        if total > 0 && memorized == total { return .memorized }
        if memorized > 0 || partial > 0 { return .partial }
        return .none
    }
    public static func percent(_ f: Double) -> Int { Int((f * 100).rounded()) }
}

/// نموذج الحفظ المشترك (الخريطة والإحصائيات والخطة): قيمة نقية Codable، بلا واجهة ولا نص قرآني.
public struct HifzProgress: Codable, Equatable, Sendable {
    /// صفحة → مدخل؛ الصفحات غير المذكورة «غير محفوظة».
    public private(set) var entries: [String: HifzPageEntry] = [:]
    /// أيام النشاط بصيغة yyyy-MM-dd (للتتابع اليومي).
    public private(set) var activeDays: [String] = []
    public init() {}

    public static let pageCount = 604
    static let maxDays = 400

    public func entry(_ page: Int) -> HifzPageEntry { entries[String(page)] ?? HifzPageEntry(state: .none) }
    public func state(_ page: Int) -> HifzState { entry(page).state }

    /// تعيين حالة لنطاق صفحات دفعة واحدة؛ `.none` يمحو المدخل.
    public mutating func set(_ state: HifzState, pages: ClosedRange<Int>, date: Date = Date(), calendar: Calendar = .hifz) {
        let lo = max(1, pages.lowerBound), hi = min(Self.pageCount, pages.upperBound)
        guard lo <= hi else { return }
        for p in lo...hi {
            if state == .none { entries[String(p)] = nil }
            else {
                var e = entries[String(p)] ?? HifzPageEntry(state: state)
                e.state = state; e.strength = state.defaultStrength
                if state == .memorized || state == .review { e.lastReview = e.lastReview ?? date }
                entries[String(p)] = e
            }
        }
        if state != .none { touch(date, calendar) }
    }

    /// مراجعة صفحة: تُرجعها «محفوظة» وتزيد القوة وتسجّل التاريخ.
    public mutating func markReviewed(page: Int, date: Date = Date(), calendar: Calendar = .hifz) {
        guard (1...Self.pageCount).contains(page), state(page) != .none else { return }
        var e = entry(page)
        e.state = .memorized; e.lastReview = date; e.strength = min(5, e.strength + 1)
        entries[String(page)] = e
        touch(date, calendar)
    }

    mutating func touch(_ date: Date, _ calendar: Calendar) {
        let d = Self.dayKey(date, calendar)
        guard !activeDays.contains(d) else { return }
        activeDays.append(d); activeDays.sort()
        if activeDays.count > Self.maxDays { activeDays.removeFirst(activeDays.count - Self.maxDays) }
    }

    // MARK: التجميع
    public func summary(_ pages: ClosedRange<Int>) -> HifzSummary {
        var m = 0, p = 0, r = 0
        for n in pages { switch state(n) { case .memorized: m += 1; case .partial: p += 1; case .review: r += 1; case .none: break } }
        return HifzSummary(total: pages.count, memorized: m, partial: p, review: r)
    }
    public var overall: HifzSummary { summary(1...Self.pageCount) }

    public static func juzPages(_ juz: Int, juzStart: [Int]) -> ClosedRange<Int> {
        let j = min(max(juz, 1), juzStart.count)
        let lo = juzStart[j - 1]
        let hi = j < juzStart.count ? juzStart[j] - 1 : pageCount
        return lo...max(lo, hi)
    }
    public func juzSummary(_ juz: Int, juzStart: [Int]) -> HifzSummary { summary(Self.juzPages(juz, juzStart: juzStart)) }
    public func surahSummary(_ s: MushafSurah) -> HifzSummary { summary(s.firstPage...max(s.firstPage, s.lastPage)) }
    /// الحزب = نصف الجزء (٦٠ حزبًا) بتقسيم صفحات الجزء.
    public func hizbSummary(_ hizb: Int, juzStart: [Int]) -> HifzSummary {
        let juz = (hizb + 1) / 2, r = Self.juzPages(juz, juzStart: juzStart)
        let mid = r.lowerBound + r.count / 2
        return summary(hizb % 2 == 1 ? r.lowerBound...(mid - 1) : mid...r.upperBound)
    }
    public func topSurahs(_ surahs: [MushafSurah], limit: Int = 5) -> [(surah: MushafSurah, summary: HifzSummary)] {
        surahs.map { ($0, surahSummary($0)) }.filter { $0.1.memorizedTotal > 0 }
            .sorted { ($0.1.memorizedFraction, $0.1.memorizedTotal, -$0.0.id) > ($1.1.memorizedFraction, $1.1.memorizedTotal, -$1.0.id) }
            .prefix(limit).map { $0 }
    }

    // MARK: التتابع اليومي
    public func streak(today: Date = Date(), calendar: Calendar = .hifz) -> Int {
        let days = Set(activeDays)
        var d = today
        if !days.contains(Self.dayKey(d, calendar)) { d = calendar.date(byAdding: .day, value: -1, to: d) ?? d }
        var n = 0
        while days.contains(Self.dayKey(d, calendar)) {
            n += 1
            guard let prev = calendar.date(byAdding: .day, value: -1, to: d) else { break }
            d = prev
        }
        return n
    }
    static func dayKey(_ date: Date, _ calendar: Calendar) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    // MARK: الترحيل
    /// من العلامات الملوّنة وخطط الحفظ الحالية: صفحة بعلامة «حفظ» → محفوظ، «مراجعة» → مراجعة؛ وآيات علّمتها العلامات أو الخطط → جزئي لما بقي «غير محفوظ».
    static func migrated(marks: [MushafBookmark], plans: [MemorizationPlan], index: MushafIndex, date: Date = Date(), calendar: Calendar = .hifz) -> HifzProgress {
        var out = HifzProgress()
        for b in marks where b.color == .review && b.ayah == nil { out.set(.review, pages: b.page...b.page, date: date, calendar: calendar) }
        for b in marks where b.color == .hifz && b.ayah == nil && out.state(b.page) == .none { out.set(.memorized, pages: b.page...b.page, date: date, calendar: calendar) }
        var partial = Set<Int>()
        for b in marks where b.color == .hifz && b.ayah != nil { partial.insert(b.page) }
        for p in plans where p.isValid && p.memorizedUpTo >= p.ayahFrom {
            for a in p.ayahFrom...min(p.memorizedUpTo, p.ayahTo) { if let pg = index.ayahPage["\(p.surah):\(a)"] { partial.insert(pg) } }
        }
        for pg in partial where out.state(pg) == .none { out.set(.partial, pages: pg...pg, date: date, calendar: calendar) }
        out.activeDays = []
        return out
    }
}

extension Calendar {
    public static let hifz: Calendar = { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone.current; return c }()
}

/// مخزن الحفظ المشترك للخريطة والخطة (n2): يحفظ محليًا في `QuranLocalStore`، ويرحّل بيانات الخطط والعلامات مرة واحدة.
@MainActor
public final class HifzProgressStore: ObservableObject {
    @Published public private(set) var progress: HifzProgress
    private let local: QuranLocalStore
    private let now: () -> Date

    init(local: QuranLocalStore = QuranLocalStore(), now: @escaping () -> Date = { Date() }) {
        self.local = local; self.now = now
        progress = local.load(HifzProgress.self, .hifzPages) ?? HifzProgress()
    }

    /// يُستدعى عند فتح الشاشة: يرحّل مرة واحدة إن لم تُنشأ بيانات بعد.
    func migrateIfNeeded(marks: [MushafBookmark], index: MushafIndex?) {
        guard !local.defaults.bool(forKey: QuranLocalStore.migratedKey), let index else { return }
        local.defaults.set(true, forKey: QuranLocalStore.migratedKey)
        guard progress.entries.isEmpty else { return }
        let plans = local.load([MemorizationPlan].self, .plans) ?? []
        let m = HifzProgress.migrated(marks: marks, plans: plans, index: index, date: now())
        guard !m.entries.isEmpty else { return }
        progress = m; persist()
    }

    public func set(_ state: HifzState, pages: ClosedRange<Int>) { progress.set(state, pages: pages, date: now()); persist() }
    public func markReviewed(page: Int) { progress.markReviewed(page: page, date: now()); persist() }
    private func persist() { local.save(progress, .hifzPages) }
}

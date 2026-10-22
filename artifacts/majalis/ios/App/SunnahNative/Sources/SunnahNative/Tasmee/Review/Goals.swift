import Foundation

public enum TasmeeGoalKind: String, Codable, Sendable { case surahWeekly, juzReview, dailyAyahs }

/// هدف: مثل «الكهف كل جمعة» (weekday بتقويم Calendar: 1=الأحد … 6=الجمعة) أو «مراجعة جزء» أو «N آية يوميًا».
public struct TasmeeGoal: Codable, Sendable, Equatable, Identifiable {
    public var id: UUID
    public var kind: TasmeeGoalKind
    public var surah: Int?
    public var juz: Int?
    public var weekday: Int?
    public var dailyAyahs: Int?

    public init(id: UUID = UUID(), kind: TasmeeGoalKind, surah: Int? = nil, juz: Int? = nil,
                weekday: Int? = nil, dailyAyahs: Int? = nil) {
        self.id = id; self.kind = kind; self.surah = surah; self.juz = juz
        self.weekday = weekday; self.dailyAyahs = dailyAyahs
    }

    /// هل الهدف مستحق في هذا اليوم؟
    public func isDue(on day: Date, calendar: Calendar = .current) -> Bool {
        switch kind {
        case .surahWeekly: return weekday == calendar.component(.weekday, from: day)
        case .juzReview, .dailyAyahs: return true
        }
    }

    /// هل أنجزته الجلسات المعطاة في ذلك اليوم؟
    public func isMet(on day: Date, sessions: [TasmeeSessionRecord], calendar: Calendar = .current) -> Bool {
        let today = sessions.filter { calendar.isDate($0.startedAt, inSameDayAs: day) }
        switch kind {
        case .surahWeekly:
            guard let s = surah else { return false }
            return today.contains { $0.surah == s }
        case .dailyAyahs:
            let n = today.reduce(0) { $0 + max(0, $1.toAyah - $1.fromAyah + 1) }
            return n >= (dailyAyahs ?? 1)
        case .juzReview:
            return !today.isEmpty
        }
    }
}

public enum TasmeeStreak {
    /// عدد الأيام المتتالية المنتهية باليوم (أو أمسه إن لم يُسمَّع اليوم بعد) التي فيها جلسة.
    public static func current(sessions: [TasmeeSessionRecord], now: Date, calendar: Calendar = .current) -> Int {
        let days = Set(sessions.map { calendar.startOfDay(for: $0.startedAt) })
        var d = calendar.startOfDay(for: now)
        if !days.contains(d) { d = calendar.date(byAdding: .day, value: -1, to: d) ?? d }
        var n = 0
        while days.contains(d) { n += 1; d = calendar.date(byAdding: .day, value: -1, to: d) ?? d }
        return n
    }
}

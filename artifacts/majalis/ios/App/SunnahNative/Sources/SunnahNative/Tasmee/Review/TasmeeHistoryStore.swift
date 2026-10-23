import Foundation

public enum SurahStrength: Sendable, Equatable { case untouched, strong, needsReview }

/// مخزن محلي (JSON في Application Support): الجلسات والمراجعة والأهداف. على الجهاز فقط، لا صوت ولا شبكة.
@MainActor
public final class TasmeeHistoryStore: ObservableObject {
    public static let shared = TasmeeHistoryStore()

    private struct Payload: Codable {
        var sessions: [TasmeeSessionRecord] = []
        var review: [TasmeeReviewItem] = []
        var goals: [TasmeeGoal] = []
        var weakWords: [TasmeeWeakWord]? = nil
    }

    @Published public private(set) var sessions: [TasmeeSessionRecord] = []
    @Published public private(set) var review: [TasmeeReviewItem] = []
    @Published public private(set) var goals: [TasmeeGoal] = []
    @Published public private(set) var weakWords: [TasmeeWeakWord] = []

    private let url: URL?
    private let maxSessions = 500
    /// ما دون هذه النسبة تُعدّ السورة «تحتاج مراجعة».
    public static let strongThreshold = 0.9

    public init(url: URL? = TasmeeHistoryStore.defaultURL()) {
        self.url = url
        load()
    }

    nonisolated public static func defaultURL() -> URL? {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
            .appendingPathComponent("tasmee-history.json")
    }

    /// تسجيل جلسة منتهية: تُضاف للسجل وتُحدَّث المراجعة (الآيات الضعيفة تدخل، والمصيبة ترتقي).
    public func append(_ r: TasmeeSessionRecord, calendar: Calendar = .current) {
        sessions.append(r)
        if sessions.count > maxSessions { sessions.removeFirst(sessions.count - maxSessions) }
        // كل آية ضعيفة بسورتها الحقيقية (لا تُنسب آية من سورة تالية إلى سورة السجل).
        for v in r.weakVerses {
            if let i = review.firstIndex(where: { $0.surah == v.surah && $0.ayah == v.ayah }) {
                review[i] = TasmeeSpacing.failed(review[i], now: r.startedAt, calendar: calendar)
            } else {
                review.append(TasmeeReviewItem(surah: v.surah, ayah: v.ayah,
                                               dueAt: TasmeeSpacing.due(afterBox: 0, from: r.startedAt, calendar: calendar)))
            }
        }
        let weak = Set(r.weakAyahs)
        for a in r.fromAyah...max(r.fromAyah, r.toAyah) where !weak.contains(a) {
            if let i = review.firstIndex(where: { $0.surah == r.surah && $0.ayah == a }), review[i].dueAt <= r.startedAt {
                if let up = TasmeeSpacing.passed(review[i], now: r.startedAt, calendar: calendar) { review[i] = up }
                else { review.remove(at: i) }
            }
        }
        weakWords = TasmeeWeakWordBank.apply(r, to: weakWords, calendar: calendar)
        save()
    }

    public func dueReview(now: Date) -> [TasmeeReviewItem] {
        review.filter { $0.dueAt <= now }.sorted { ($0.dueAt, $0.surah, $0.ayah) < ($1.dueAt, $1.surah, $1.ayah) }
    }

    public func addGoal(_ g: TasmeeGoal) { goals.append(g); save() }
    public func removeGoal(id: UUID) { goals.removeAll { $0.id == id }; save() }

    public func streak(now: Date = Date()) -> Int { TasmeeStreak.current(sessions: sessions, now: now) }

    /// قوة السورة: متوسط صحة آخر 3 جلسات عليها.
    public func strength(ofSurah s: Int) -> SurahStrength {
        let recent = sessions.filter { $0.surah == s }.suffix(3)
        guard !recent.isEmpty else { return .untouched }
        let avg = recent.map(\.accuracy).reduce(0, +) / Double(recent.count)
        return avg >= Self.strongThreshold ? .strong : .needsReview
    }

    /// أكثر الآيات خطأً (للسجل الدائم): مرتبة بعدد الجلسات التي أُخطئ فيها.
    public func errorLog(limit: Int = 50) -> [(surah: Int, ayah: Int, count: Int)] {
        var m: [String: (Int, Int, Int)] = [:]
        for r in sessions { for a in r.weakAyahs { let k = "\(r.surah):\(a)"; let v = m[k] ?? (r.surah, a, 0); m[k] = (v.0, v.1, v.2 + 1) } }
        return m.values.sorted { ($1.2, $0.0, $0.1) < ($0.2, $1.0, $1.1) }.prefix(limit).map { (surah: $0.0, ayah: $0.1, count: $0.2) }
    }

    private func load() {
        guard let url, let d = try? Data(contentsOf: url),
              let p = try? JSONDecoder().decode(Payload.self, from: d) else { return }
        sessions = p.sessions; review = p.review; goals = p.goals; weakWords = p.weakWords ?? []
    }

    private func save() {
        guard let url, let d = try? JSONEncoder().encode(Payload(sessions: sessions, review: review, goals: goals, weakWords: weakWords)) else { return }
        try? d.write(to: url, options: .atomic)
    }
}

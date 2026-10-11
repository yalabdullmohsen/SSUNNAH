import SwiftUI

// MARK: - النموذج

/// حديث من `Data/hadith/verified-sahih.json` (التصدير يُبقي `authenticity_class = sahih` بنص ومصدر ودرجة، ويستبعد المحجوز).
struct LearnHadith: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let text: String
    let narrator: String?
    let sourceName: String?
    let collection: String?
    let grade: String?
    let chapter: String?

    enum CodingKeys: String, CodingKey {
        case id, text, narrator, collection, grade, chapter
        case sourceName = "source_name"
    }

    /// ظهر البطاقة كما في `hadithToCard` في الويب: الراوي والمصدر والدرجة، بلا نص مضاف.
    var attribution: String {
        learnLine(narrator.map { "رواه: " + $0 }, sourceName.map { "المصدر: " + $0 }, grade.map { "الدرجة: " + $0 }, separator: "\n") ?? "حديث موثّق"
    }
}

/// SM-2 مطابق لـ`sm2` في `src/lib/spaced-repetition.ts` (تقريب السهولة لمنزلتين، والفاصل لأيام صحيحة ≥ 1).
enum LearnSM2 {
    struct State: Codable, Equatable, Sendable {
        var intervalDays = 0
        var easeFactor = 2.5
        var repetitions = 0
    }

    /// الجودة: 0 لم أتذكر، 3 صعب، 4 عرفته، 5 سهل (QUALITY_OPTIONS).
    struct Quality: Identifiable, Sendable { let value: Int; let label: String; var id: Int { value } }
    static let qualities = [Quality(value: 0, label: "لم أتذكر"), Quality(value: 3, label: "صعب"),
                            Quality(value: 4, label: "عرفته"), Quality(value: 5, label: "سهل")]

    static func review(_ state: State, quality: Int) -> State {
        var interval = quantizeInterval(Double(state.intervalDays))
        var ease = quantizeEase(state.easeFactor)
        var reps = max(0, state.repetitions)
        if quality >= 3 {
            if reps == 0 { interval = 1 } else if reps == 1 { interval = 6 } else {
                interval = quantizeInterval(Double(interval) * Double((ease * 100).rounded()) / 100)
            }
            reps += 1
        } else {
            reps = 0; interval = 1
        }
        let q = Double(5 - quality)
        ease = quantizeEase(ease + (0.1 - q * (0.08 + q * 0.02)))
        return State(intervalDays: interval, easeFactor: ease, repetitions: reps)
    }

    /// منتصف ليل UTC ليوم المراجعة ثم إضافة الفاصل (addUtcDays).
    static func nextReview(from now: Date, days: Int) -> Date {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "UTC")!
        return cal.date(byAdding: .day, value: days, to: cal.startOfDay(for: now)) ?? now
    }

    private static func quantizeEase(_ e: Double) -> Double { (max(1.3, e) * 100).rounded() / 100 }
    private static func quantizeInterval(_ d: Double) -> Int { d.isFinite && d > 0 ? max(1, Int(d.rounded())) : 1 }
}

/// مراجعات المستخدم محليًا (بدل جدول flashcard_reviews حتى يتوفر منفذ المزامنة).
struct LearnFlashcardDeck: Codable, Equatable, Sendable {
    struct Review: Codable, Equatable, Sendable {
        var state: LearnSM2.State
        var nextReviewAt: Date
        var lastQuality: Int
        var reviewedAt: Date
    }
    struct Stats: Equatable { var total = 0; var due = 0; var mastered = 0 }

    var reviews: [String: Review] = [:]

    /// المستحقّ أولًا (الأقدم موعدًا)، ثم بطاقات جديدة بترتيب الملف، حتى `limit` كما في getDueFlashCards.
    func session(from hadiths: [LearnHadith], now: Date, limit: Int = 20) -> [LearnHadith] {
        let byId = Dictionary(hadiths.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        let due = reviews.filter { $0.value.nextReviewAt <= now }
            .sorted { $0.value.nextReviewAt < $1.value.nextReviewAt }
            .compactMap { byId[$0.key] }
        let fresh = hadiths.filter { reviews[$0.id] == nil }
        return Array((due + fresh).prefix(limit))
    }

    mutating func record(_ id: String, quality: Int, now: Date) {
        let state = LearnSM2.review(reviews[id]?.state ?? LearnSM2.State(), quality: quality)
        reviews[id] = Review(state: state, nextReviewAt: LearnSM2.nextReview(from: now, days: state.intervalDays), lastQuality: quality, reviewedAt: now)
    }

    /// المراجَع، المستحق الآن، والمتقَن (فاصل > 21 يومًا).
    func stats(now: Date) -> Stats {
        Stats(total: reviews.count,
              due: reviews.values.filter { $0.nextReviewAt <= now }.count,
              mastered: reviews.values.filter { $0.state.intervalDays > 21 }.count)
    }
}

// MARK: - الشاشة

/// /flashcards — مراجعة الأحاديث الصحيحة المحزومة بالتكرار المتباعد. التقدّم محلي على الجهاز.
struct LearnFlashcardsScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.verifiedHadith) { (hadiths: [LearnHadith]) in
            LearnFlashcardSession(hadiths: hadiths.filter { !$0.text.isEmpty })
        }
        .navigationTitle("بطاقات المراجعة")
    }
}

struct LearnFlashcardSession: View {
    let hadiths: [LearnHadith]
    var store = LearnLocalStore()
    @State private var deck = LearnFlashcardDeck()
    @State private var queue: [LearnHadith] = []
    @State private var index = 0
    @State private var flipped = false
    @State private var loaded = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                let stats = deck.stats(now: Date())
                HStack(spacing: Sunnah.Spacing.s2) {
                    SunnahChip("مستحقة: \(stats.due)")
                    SunnahChip("روجعت: \(stats.total)")
                    SunnahChip("متقنة: \(stats.mastered)")
                }
                if queue.isEmpty {
                    EmptyStateView(title: "لا بطاقات مستحقة الآن")
                } else if index >= queue.count {
                    EmptyStateView(title: "أنهيت مراجعة \(queue.count) بطاقة")
                    SunnahButton("جلسة جديدة") { startSession() }
                } else {
                    card(queue[index])
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .onAppear {
            guard !loaded else { return }
            loaded = true
            deck = store.load(LearnFlashcardDeck.self, .flashcards) ?? LearnFlashcardDeck()
            startSession()
        }
    }

    @ViewBuilder private func card(_ h: LearnHadith) -> some View {
        Text("\(index + 1) من \(queue.count)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
        ProgressView(value: Double(index), total: Double(queue.count)).tint(Sunnah.Colors.primary)
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                if let c = h.chapter { SunnahChip(c) }
                Text(h.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                if flipped {
                    Text(h.attribution).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        if flipped {
            Text("كيف كان تذكّرك؟").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            ForEach(LearnSM2.qualities) { q in
                let days = LearnSM2.review(deck.reviews[h.id]?.state ?? LearnSM2.State(), quality: q.value).intervalDays
                SunnahButton("\(q.label) · \(Self.intervalLabel(days))", style: q.value >= 4 ? .primary : .secondary) { rate(h, q.value) }
            }
        } else {
            SunnahButton("إظهار المصدر") { flipped = true }
        }
    }

    private func startSession() {
        queue = deck.session(from: hadiths, now: Date())
        index = 0; flipped = false
    }

    private func rate(_ h: LearnHadith, _ quality: Int) {
        deck.record(h.id, quality: quality, now: Date())
        store.save(deck, .flashcards)
        index += 1; flipped = false
    }

    static func intervalLabel(_ days: Int) -> String {
        switch days {
        case ...1: return "غدًا"
        case 7: return "أسبوع"
        case 28...31: return "شهر"
        default: return "\(days) أيام"
        }
    }
}

import Foundation

/// حفظ محلي لبيانات التعلّم الشخصية (مراجعات البطاقات، خطط القراءة، الملف البحثي، دورات المذاكرة) في UserDefaults
/// كـJSON. لا أسرار هنا (الجلسة في Keychain عبر منفذ الحساب)، والمزامنة مع Supabase تنتظر منفذ بيانات المستخدم.
struct LearnLocalStore: @unchecked Sendable {
    enum Key: String, CaseIterable {
        case flashcards = "sunnah.learn.flashcards.v1"
        case readingPlans = "sunnah.learn.reading-plans.v1"
        case researcher = "sunnah.learn.researcher.v1"
        case studyCycles = "sunnah.learn.study-cycles.v1"
    }

    let defaults: UserDefaults
    init(defaults: UserDefaults = .standard) { self.defaults = defaults }

    func load<T: Decodable>(_ type: T.Type, _ key: Key) -> T? {
        guard let data = defaults.data(forKey: key.rawValue) else { return nil }
        return try? Self.decoder.decode(T.self, from: data)
    }

    func save<T: Encodable>(_ value: T, _ key: Key) {
        guard let data = try? Self.encoder.encode(value) else { return }
        defaults.set(data, forKey: key.rawValue)
    }

    /// «مسح بيانات التعلّم المحلية» في مركز التقدّم.
    func clearAll() { Key.allCases.forEach { defaults.removeObject(forKey: $0.rawValue) } }

    private static var encoder: JSONEncoder { let e = JSONEncoder(); e.dateEncodingStrategy = .iso8601; return e }
    private static var decoder: JSONDecoder { let d = JSONDecoder(); d.dateDecodingStrategy = .iso8601; return d }
}

/// ملخّص محلي يجمعه «مركز التقدّم» و«تعلّمي».
struct LearnLocalSummary: Equatable {
    var flashcards: LearnFlashcardDeck.Stats
    var activePlans: [LearnReadingPlan]
    var studyCycles: Int

    static func read(from store: LearnLocalStore, now: Date = Date()) -> LearnLocalSummary {
        let deck = store.load(LearnFlashcardDeck.self, .flashcards) ?? LearnFlashcardDeck()
        let plans = store.load([LearnReadingPlan].self, .readingPlans) ?? []
        return LearnLocalSummary(
            flashcards: deck.stats(now: now),
            activePlans: plans.filter { $0.status == .active || $0.status == .paused },
            studyCycles: store.load(Int.self, .studyCycles) ?? 0
        )
    }
}

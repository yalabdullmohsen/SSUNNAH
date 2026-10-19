import Foundation

/// حالة المستخدم في الحفظ محليًا على الجهاز (UserDefaults كـJSON) كخطط القراءة في التعلّم. بلا خادم ولا نص قرآني؛ مراجع (سورة/آيات) فقط.
struct QuranLocalStore: @unchecked Sendable {
    enum Key: String, CaseIterable {
        case plans = "sunnah.quran.memorization-plans.v1"
        case loop = "sunnah.quran.hifz-loop.v1"
        case pathUnits = "sunnah.quran.hifz-path-units.v1"
        case hifzPlan = "sunnah.quran.hifz-plan.v1"
        case hifzPages = "sunnah.quran.hifz-pages.v1"
    }
    static let migratedKey = "sunnah.quran.hifz-pages.migrated.v1"

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

    func clearAll() { Key.allCases.forEach { defaults.removeObject(forKey: $0.rawValue) } }

    private static var encoder: JSONEncoder { let e = JSONEncoder(); e.dateEncodingStrategy = .iso8601; return e }
    private static var decoder: JSONDecoder { let d = JSONDecoder(); d.dateDecodingStrategy = .iso8601; return d }
}

/// خطة حفظ: مقطع من سورة (آيات من..إلى) وما حُفظ منه.
struct MemorizationPlan: Codable, Identifiable, Equatable, Sendable {
    enum Status: String, Codable, Sendable { case active, paused, completed, cancelled }

    var id = UUID()
    var surah: Int
    var ayahFrom: Int
    var ayahTo: Int
    var startDate: Date
    var status: Status = .active
    /// آخر آية حُفظت (0 = لم يبدأ).
    var memorizedUpTo = 0

    var total: Int { max(0, ayahTo - ayahFrom + 1) }
    var done: Int { memorizedUpTo < ayahFrom ? 0 : min(total, memorizedUpTo - ayahFrom + 1) }
    var progress: Double { total > 0 ? Double(done) / Double(total) : 0 }
    var isValid: Bool { surah >= 1 && ayahFrom >= 1 && ayahTo >= ayahFrom }

    var statusLabel: String {
        switch status {
        case .active: return "جارية"
        case .paused: return "متوقفة"
        case .completed: return "مكتملة"
        case .cancelled: return "ملغاة"
        }
    }

    mutating func memorize(upTo ayah: Int) {
        memorizedUpTo = min(max(0, ayah), ayahTo)
        if done >= total && total > 0 { status = .completed }
    }
}

/// حلقة تكرار مقطع للحفظ: عدّاد مرات التكرار نحو هدف.
struct HifzLoop: Codable, Equatable, Sendable {
    var surah = 1
    var ayahFrom = 1
    var ayahTo = 1
    var target = 10
    var count = 0

    var progress: Double { target > 0 ? min(1, Double(count) / Double(target)) : 0 }
    var reachedTarget: Bool { count >= target }
    mutating func tick() { count += 1 }
    mutating func reset() { count = 0 }
}

/// وحدات مسارات الحفظ التي أتمّها المستخدم: معرّف المسار ← معرّفات الوحدات.
struct HifzPathProgress: Codable, Equatable, Sendable {
    var completed: [String: Set<String>] = [:]

    func isDone(path: String, unit: String) -> Bool { completed[path]?.contains(unit) ?? false }
    mutating func toggle(path: String, unit: String) {
        var set = completed[path] ?? []
        if set.contains(unit) { set.remove(unit) } else { set.insert(unit) }
        completed[path] = set.isEmpty ? nil : set
    }
    func doneCount(path: String, validUnits: Set<String>) -> Int { (completed[path] ?? []).intersection(validUnits).count }
}

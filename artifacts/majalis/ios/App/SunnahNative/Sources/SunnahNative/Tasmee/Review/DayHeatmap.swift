import Foundation

/// خلية يوم في خريطة نشاط التسميع: عدد الكلمات المُسمَّعة ودقة اليوم ومستواه 0…4 للتظليل.
public struct TasmeeHeatDay: Equatable, Sendable {
    public var day: Date
    public var words: Int
    public var accuracy: Double?
    public var level: Int
}

public enum TasmeeDayHeatmap {
    /// آخر `days` يومًا تنتهي باليوم الحالي (الأقدم أولًا). المستوى من حجم الكلمات؛ الدقة موزونة بعدد الكلمات.
    public static func build(sessions: [TasmeeSessionRecord], now: Date, days: Int = 84,
                             calendar: Calendar = .current) -> [TasmeeHeatDay] {
        guard days > 0 else { return [] }
        let today = calendar.startOfDay(for: now)
        var words: [Date: Int] = [:], good: [Date: Double] = [:]
        for s in sessions {
            let d = calendar.startOfDay(for: s.startedAt)
            words[d, default: 0] += s.totalWords
            good[d, default: 0] += s.accuracy * Double(s.totalWords)
        }
        return (0..<days).reversed().compactMap { back -> TasmeeHeatDay? in
            guard let d = calendar.date(byAdding: .day, value: -back, to: today) else { return nil }
            let w = words[d] ?? 0
            return TasmeeHeatDay(day: d, words: w, accuracy: w > 0 ? (good[d] ?? 0) / Double(w) : nil, level: level(words: w))
        }
    }

    /// 0 بلا نشاط، ثم 1…4 بحدود 1–49 / 50–199 / 200–499 / 500+ كلمة.
    public static func level(words: Int) -> Int {
        switch words {
        case ..<1: return 0
        case 1..<50: return 1
        case 50..<200: return 2
        case 200..<500: return 3
        default: return 4
        }
    }
}

import Foundation

/// مستويات الإخفاء في «التسميع المتدرّج»: تحدّد كيف تُقنَّع الكلمات المعلّقة (التي لم تُقَل صحيحة بعد).
public enum TasmeeHideLevel: String, Codable, Sendable, CaseIterable {
    case firstLetter    // أول حرف ظاهر لكل كلمة
    case alternate      // كلمة وكلمة
    case ayahEnd        // نصف الآية الأخير مخفي
    case ayah           // الآية كاملة مخفية
    case page           // الصفحة كاملة مخفية بلا أي دليل (أرقام الآيات تختفي)
}

/// قناع كلمة معلّقة: ظاهرة، أو أول حرف فقط، أو مخفية.
public enum TasmeeMask: Sendable, Equatable { case shown, firstLetter, hidden }

/// خيارات الجلسة المحفوظة (آخر اختيار).
public struct TasmeeModeOptions: Codable, Sendable, Equatable {
    public var mode: TasmeeMode = .recite
    public var level: TasmeeHideLevel = .firstLetter
    public var hideAyahNumbers = false
    public var haptics = true
    public var sound = false
    /// التكرار: عدد القراءات الصحيحة المتتالية المطلوبة (1…20).
    public var repeatTarget = 3
    public init() {}

    /// فكّ متسامح: مفتاح ناقص (حقل أُضيف لاحقًا) أو قيمة enum مجهولة لا تُصفّر بقية التفضيلات.
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        mode = (try? c.decodeIfPresent(TasmeeMode.self, forKey: .mode)) ?? mode
        level = (try? c.decodeIfPresent(TasmeeHideLevel.self, forKey: .level)) ?? level
        hideAyahNumbers = (try? c.decodeIfPresent(Bool.self, forKey: .hideAyahNumbers)) ?? hideAyahNumbers
        haptics = (try? c.decodeIfPresent(Bool.self, forKey: .haptics)) ?? haptics
        sound = (try? c.decodeIfPresent(Bool.self, forKey: .sound)) ?? sound
        repeatTarget = (try? c.decodeIfPresent(Int.self, forKey: .repeatTarget)) ?? repeatTarget
    }

    public static let repeatRange = 1...20

    /// أرقام الآيات تُخفى قسرًا في الاختبار وفي مستوى «الصفحة كاملة».
    public var effectiveHideNumbers: Bool {
        hideAyahNumbers || mode == .exam || (mode == .graded && level == .page)
    }

    /// الاختبار بلا تلميحات أبدًا.
    public var allowsHints: Bool { mode != .exam }

    /// قناع كلمة لم تُقَل بعد. `position` من 1 داخل الآية، `count` عدد كلمات الآية.
    public func mask(position: Int, count: Int) -> TasmeeMask {
        switch mode {
        case .follow: return .shown
        case .recite, .exam, .repeat: return .hidden
        case .graded:
            switch level {
            case .firstLetter: return .firstLetter
            case .alternate: return position % 2 == 1 ? .hidden : .shown
            case .ayahEnd: return position > count / 2 ? .hidden : .shown
            case .ayah, .page: return .hidden
            }
        }
    }
}

public extension TasmeeModeOptions {
    static let storageKey = "sunnah.tasmee.modeOptions.v1"
    static func load(_ d: UserDefaults = .standard) -> TasmeeModeOptions {
        guard let data = d.data(forKey: storageKey), let o = try? JSONDecoder().decode(TasmeeModeOptions.self, from: data) else { return TasmeeModeOptions() }
        var v = o; v.repeatTarget = min(max(o.repeatTarget, repeatRange.lowerBound), repeatRange.upperBound); return v
    }
    func save(_ d: UserDefaults = .standard) { if let data = try? JSONEncoder().encode(self) { d.set(data, forKey: Self.storageKey) } }
}

/// عدّاد وضع التكرار: يعدّ القراءات الصحيحة المتتالية للآية؛ أي خطأ يصفّره.
public struct TasmeeRepeatCounter: Sendable, Equatable {
    public let target: Int
    public private(set) var streak = 0
    public init(target: Int) { self.target = max(1, target) }
    public var isDone: Bool { streak >= target }
    /// نتيجة قراءة كاملة للآية. تُعيد true حين يكتمل الهدف.
    @discardableResult public mutating func record(clean: Bool) -> Bool {
        streak = clean ? streak + 1 : 0
        return isDone
    }
}

/// مخطّط الاختبار: بداية عشوائية داخل نطاق المستخدم + درجة من 100.
public enum TasmeeExam {
    /// يختار آية بداية من `range` (شاملة)، وبحيث يبقى `length` آية على الأقل داخل النطاق إن أمكن.
    public static func randomStart<R: RandomNumberGenerator>(in range: ClosedRange<Int>, length: Int, using g: inout R) -> Int {
        let hi = max(range.lowerBound, range.upperBound - max(length, 1) + 1)
        return Int.random(in: range.lowerBound...hi, using: &g)
    }

    /// الدرجة = نسبة الصحة × 100 مقرّبة؛ كل نظرة أو تلميح يخصم من الكلمة (لا تلميحات في الاختبار فتُحتسب خطأً).
    public static func score(_ r: TasmeeSessionRecord) -> Int { Int((r.accuracy * 100).rounded()) }
}

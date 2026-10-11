import Foundation

// نماذج نصوص قسم «الحساب والإعدادات» الثابتة. القيم نفسها في AccountTexts.swift (مستخرجة حرفيًا من الويب).

/// صفحة قانونية/منهجية: أقسام بعناوين، وكل قسم فقرات وقوائم. النص السطري Markdown (**غامق** و[رابط](majlisilm://مسار)).
struct AccountLegalDocument: Hashable, Sendable {
    let eyebrow: String
    let title: String
    let updatedAt: String?
    let sections: [AccountLegalSection]
}

struct AccountLegalSection: Hashable, Sendable, Identifiable {
    let title: String
    let blocks: [AccountLegalBlock]
    var id: String { title }
}

enum AccountLegalBlock: Hashable, Sendable {
    case paragraph(String)
    case bullets([String])
    case numbered([String])
    /// رقم إصدار التطبيق من الحزمة (يحل محل version.json في الويب).
    case appVersion
}

struct AccountFAQ: Hashable, Sendable, Identifiable {
    let question: String
    let answer: String
    var id: String { question }
}

struct AccountContactTopic: Hashable, Sendable, Identifiable {
    let id: String
    let label: String
    let note: String
    let subject: String
}

struct AccountTourSlide: Hashable, Sendable, Identifiable {
    let id: String
    let title: String
    let body: String
    let hint: String
}

struct AccountStatCard: Hashable, Sendable, Identifiable {
    let value: String
    let label: String
    let sub: String?
    var id: String { label + value }
}

struct AccountStatBar: Hashable, Sendable, Identifiable {
    let label: String
    let value: Double
    let max: Double
    let unit: String
    var id: String { label }
    var fraction: Double { max > 0 ? Swift.min(1, value / max) : 0 }
}

struct AccountTimelineItem: Hashable, Sendable, Identifiable {
    let year: String
    let event: String
    let note: String?
    var id: String { year + event }
}

struct AccountQiblaCity: Hashable, Sendable, Identifiable {
    let name: String
    let latitude: Double
    let longitude: Double
    var id: String { name }
}

struct AccountBadgeDef: Hashable, Sendable, Identifiable {
    let key: String
    let title: String
    let description: String
    let category: String
    var id: String { key }

    static let categoryLabels: [String: String] = [
        "streak": "الأيام المتواصلة",
        "lessons": "الدروس",
        "library": "المراجع",
        "tasbih": "الذكر والتسبيح",
        "path": "المسارات الشرعية",
        "content": "المحتوى المحفوظ",
        "recitation": "التلاوة"
    ]
}

struct AccountSourceEntry: Hashable, Sendable, Identifiable {
    let name: String
    let took: String
    let license: String
    let status: String
    let url: String?
    var id: String { name }
}

struct AccountSourceType: Hashable, Sendable, Identifiable {
    let id: String
    let label: String
    let entries: [AccountSourceEntry]
}

extension AccountTexts {
    /// مصادر لم يُحسم ترخيصها (مطابق لـ unknownLicenseEntries في الويب).
    static var unknownLicenseSources: [(entry: AccountSourceEntry, typeLabel: String)] {
        sourceTypes.flatMap { type in type.entries.filter { $0.status == "unknown" }.map { ($0, type.label) } }
    }
}

/// تطبيع عربي للبحث المحلي: بلا تشكيل ولا تطويل، وتوحيد الهمزات والتاء المربوطة والألف المقصورة.
enum AccountSearch {
    static func normalize(_ text: String) -> String {
        var out = ""
        out.reserveCapacity(text.count)
        for scalar in text.unicodeScalars {
            switch scalar.value {
            case 0x064B...0x065F, 0x0670, 0x0640, 0x06D6...0x06ED: continue
            case 0x0622, 0x0623, 0x0625, 0x0671: out.unicodeScalars.append("ا")
            case 0x0629: out.unicodeScalars.append("ه")
            case 0x0649: out.unicodeScalars.append("ي")
            case 0x0624: out.unicodeScalars.append("و")
            case 0x0626: out.unicodeScalars.append("ي")
            default: out.unicodeScalars.append(scalar)
            }
        }
        return out.lowercased().split(whereSeparator: \.isWhitespace).joined(separator: " ")
    }

    static func matches(_ fields: [String?], _ needle: String) -> Bool {
        let n = normalize(needle)
        if n.isEmpty { return true }
        return fields.contains { normalize($0 ?? "").contains(n) }
    }
}

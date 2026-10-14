import Foundation

/// منطق القسم الخالص (بلا واجهة): مصادر الملفات، وقبول المحتوى، والبحث العربي، وتقدّم مسار المسلم الجديد.
public enum AqidahContent {
    /// كل ملفات القسم تحت هذا المجلد المحزوم (على نمط `Data/adhkar`).
    public static let subdirectory = "Data/aqidah"

    public static func source(_ name: String) -> ContentSource {
        .bundled(name: name, subdirectory: subdirectory)
    }

    // MARK: قبول المحتوى — دفاع ثانٍ بعد سكربت التصدير: ما لم يُصدَّق لا يُعرض.

    /// الأسماء الحسنى: يُستبعد ما وُسم `unsourced` أو خلا من المعنى أو الإحالة.
    public static func accepted(_ items: [AsmaEntry]) -> [AsmaEntry] {
        items.filter { $0.documentationStatus != "unsourced" && !$0.meaning.aqidahIsBlank && !$0.reference.aqidahIsBlank }
            .sorted { $0.num < $1.num }
    }

    /// الفرق: المنشور (`PUBLISHED`) فقط، كما في `getPublishedIslamicSectById` على الويب.
    /// حالة الفرق المصوغة من مراجع موثقة وما زالت بانتظار مراجعة المالك؛ تُعرض بشارة «قيد المراجعة».
    public static let underReview = "UNDER_REVIEW"

    public static func accepted(_ items: [IslamicSect]) -> [IslamicSect] {
        items.filter { $0.publicationStatus == "PUBLISHED" || $0.publicationStatus == underReview }
    }

    /// المجموعات: تُحذف العناصر بلا عنوان والمجموعات الفارغة.
    public static func accepted(_ groups: [AqidahGroup]) -> [AqidahGroup] {
        groups.compactMap { g in
            let entries = g.entries.filter { !$0.title.aqidahIsBlank }
            return entries.isEmpty ? nil : AqidahGroup(id: g.id, title: g.title, entries: entries)
        }
    }

    public static func accepted(_ items: [DawahQuestion]) -> [DawahQuestion] {
        items.filter { !$0.slug.aqidahIsBlank && !($0.shortAnswer.aqidahIsBlank && $0.detailedAnswer.aqidahIsBlank) }
    }

    public static func accepted(_ items: [DawahShubha]) -> [DawahShubha] {
        items.filter { !$0.slug.aqidahIsBlank && !($0.shortAnswer.aqidahIsBlank && $0.detailedRefutation.aqidahIsBlank) }
    }

    public static func accepted(_ items: [DawahArticle]) -> [DawahArticle] {
        items.filter { !$0.slug.aqidahIsBlank && !$0.bodyAr.aqidahIsBlank }
    }

    public static func accepted(_ items: [NewMuslimDay]) -> [NewMuslimDay] {
        items.filter { !$0.contentAr.aqidahIsBlank }.sorted { $0.dayNumber < $1.dayNumber }
    }

    public static func accepted(_ items: [TawhidTopic]) -> [TawhidTopic] {
        items.filter { !$0.slug.aqidahIsBlank && !$0.blocks.isEmpty }
    }

    // MARK: البحث العربي

    /// تطبيع للمطابقة: حذف التشكيل والتطويل، وتوحيد الهمزات والألف المقصورة والتاء المربوطة.
    public static func normalize(_ text: String) -> String {
        var out = ""
        out.reserveCapacity(text.count)
        for scalar in text.unicodeScalars {
            switch scalar.value {
            case 0x064B...0x065F, 0x0670, 0x0640: continue
            case 0x0622, 0x0623, 0x0625, 0x0671: out.unicodeScalars.append("\u{0627}")
            case 0x0649: out.unicodeScalars.append("\u{064A}")
            case 0x0629: out.unicodeScalars.append("\u{0647}")
            case 0x0624: out.unicodeScalars.append("\u{0648}")
            case 0x0626: out.unicodeScalars.append("\u{064A}")
            default: out.unicodeScalars.append(scalar)
            }
        }
        return out.lowercased()
    }

    /// يطابق إن احتوى أحد النصوص على الاستعلام بعد التطبيع؛ الاستعلام الفارغ يطابق الكل.
    public static func matches(_ query: String, _ fields: [String?]) -> Bool {
        let q = normalize(query.trimmingCharacters(in: .whitespacesAndNewlines))
        if q.isEmpty { return true }
        return fields.contains { $0.map { normalize($0).contains(q) } ?? false }
    }

    public static func filter(_ groups: [AqidahGroup], query: String) -> [AqidahGroup] {
        groups.compactMap { g in
            if matches(query, [g.title]) { return g }
            let hits = g.entries.filter { matches(query, [$0.title, $0.summary, $0.body, $0.reference]) }
            return hits.isEmpty ? nil : AqidahGroup(id: g.id, title: g.title, entries: hits)
        }
    }

    // MARK: تقدّم مسار المسلم الجديد (محلي على الجهاز، كما يحفظه الويب في المتصفح)

    public static func decodeProgress(_ raw: String) -> Set<Int> {
        Set(raw.split(separator: ",").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) })
    }

    public static func encodeProgress(_ days: Set<Int>) -> String {
        days.sorted().map(String.init).joined(separator: ",")
    }
}

extension String {
    var aqidahIsBlank: Bool { trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
}

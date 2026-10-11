import Foundation

/// صفحة قراءة موحّدة لقسم الفقه: يبنيها محوّل (FiqhAdapters) من أي نموذج ويعرضها FiqhReadingView.
/// بلا SwiftUI حتى تُختبر المحوّلات وحدها.
struct FiqhReading: Hashable, Sendable {
    struct Block: Hashable, Sendable, Identifiable {
        let id: String
        var title: String?
        var paragraphs: [String] = []
        var bullets: [String] = []
        /// نص منقول (آية/حديث/قول) يُميَّز عن الشرح.
        var quote: String?
        var reference: String?
    }

    struct Tab: Hashable, Sendable, Identifiable {
        let id: String
        var label: String
        var blocks: [Block]
    }

    struct Link: Hashable, Sendable, Identifiable {
        let title: String
        var subtitle: String?
        let route: String
        /// عنوان المجموعة؛ الروابط المتتالية بالعنوان نفسه تُعرض تحته.
        var group: String?
        var id: String { (group ?? "") + "|" + route }
    }

    var title: String
    var subtitle: String?
    var tabs: [Tab] = []
    var links: [Link] = []

    /// كتلة نصية؛ nil إن خلت من نص ونقاط واقتباس (فلا تُعرض عناوين فارغة).
    static func block(_ id: String, _ title: String?, text: String? = nil, bullets: [String]? = nil, quote: String? = nil, reference: String? = nil) -> Block? {
        let paragraphs = (text ?? "").components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        let points = (bullets ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        let q = trimmed(quote)
        guard !paragraphs.isEmpty || !points.isEmpty || q != nil else { return nil }
        return Block(id: id, title: title, paragraphs: paragraphs, bullets: points, quote: q, reference: trimmed(reference))
    }

    /// نص مشذَّب أو nil إن فرغ.
    static func trimmed(_ s: String?) -> String? {
        guard let t = s?.trimmingCharacters(in: .whitespacesAndNewlines), !t.isEmpty else { return nil }
        return t
    }

    /// صفحة بلا تبويبات: تبويب واحد بلا عنوان.
    static func single(title: String, subtitle: String? = nil, blocks: [Block?], links: [Link] = []) -> FiqhReading {
        let kept = blocks.compactMap { $0 }
        return FiqhReading(title: title, subtitle: subtitle, tabs: kept.isEmpty ? [] : [Tab(id: "main", label: "", blocks: kept)], links: links)
    }

    var isEmpty: Bool { tabs.allSatisfy { $0.blocks.isEmpty } && links.isEmpty }
}

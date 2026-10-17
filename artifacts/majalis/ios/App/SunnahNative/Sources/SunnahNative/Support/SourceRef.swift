import Foundation

/// مصدر موحّد لعرضه في الذيل؛ يفكّ كل بنى `sources` الموثّقة في docs/native/SOURCES_FIELD.md
/// بنفس قاعدة scripts/native-sources-display.mjs (التوحيد في طبقة العرض لا في البيانات).
public struct SourceRef: Decodable, Hashable, Sendable {
    public let display: String
    public let url: URL?

    public init(display: String, url: URL? = nil) { self.display = display; self.url = url }

    private struct Raw: Decodable {
        let ref, author, book, locator, title, name_ar, platform, url, post_url: String?
    }

    private static func clean(_ v: String?) -> String {
        let t = (v ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        return t.count > 1 ? t : ""
    }

    private static func join(_ parts: [String?]) -> String {
        parts.map(clean).filter { !$0.isEmpty }.joined(separator: "، ")
    }

    /// نص العرض فارغ ⇒ العنصر غير صالح ويُهمل.
    public init?(raw: String) {
        let t = Self.clean(raw)
        guard !t.isEmpty else { return nil }
        self.init(display: t)
    }

    public init(from decoder: Decoder) throws {
        if let s = try? decoder.singleValueContainer().decode(String.self), let r = SourceRef(raw: s) {
            self = r; return
        }
        let r = try Raw(from: decoder)
        let text: String
        if !Self.clean(r.ref).isEmpty && Self.clean(r.book).isEmpty { text = Self.clean(r.ref) }
        else if !Self.clean(r.book).isEmpty { text = Self.join([r.author, r.book, r.locator ?? r.ref]) }
        else if !Self.clean(r.title).isEmpty { text = Self.join([r.title, r.author]) }
        else if !Self.clean(r.name_ar).isEmpty { text = Self.join([r.name_ar, r.platform]) }
        else { text = "" }
        guard !text.isEmpty else {
            throw DecodingError.dataCorrupted(.init(codingPath: decoder.codingPath, debugDescription: "مصدر بلا نص عرض"))
        }
        let link = [r.post_url, r.url].compactMap { $0 }.first { URL(string: $0)?.scheme?.hasPrefix("http") == true }
        self.init(display: text, url: link.flatMap(URL.init(string:)))
    }

    /// يفكّ قائمة مصادر ويُهمل غير المفهوم بدل إسقاط السجل كله.
    public static func list(_ data: Data) -> [SourceRef] {
        struct Lossy: Decodable { let v: SourceRef?; init(from d: Decoder) { v = try? SourceRef(from: d) } }
        return ((try? JSONDecoder().decode([Lossy].self, from: data)) ?? []).compactMap(\.v)
    }
}

import SwiftUI
import SunnahDataKit

/// استشهاد عام `/c/:slug`: يُجلب من `/api/citations/:slug` عبر طبقة الشبكة (مهلة 8ث، كاش قرص، إعادة محاولة).
struct CitationPayload: Decodable, Sendable {
    struct Source: Decodable, Sendable {
        let title_ar: String?
        let author_name: String?
        let book_name: String?
        let volume: String?
        let page_number: String?
        let publish_year: Int?
    }
    struct Citation: Decodable, Sendable {
        let quoted_text: String
        let source: Source?
    }
    let ok: Bool
    let citation: Citation?
}

enum CitationPath {
    static func path(slug: String) -> String {
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-_"))
        return "/api/citations/" + (slug.addingPercentEncoding(withAllowedCharacters: allowed) ?? slug)
    }

    /// 404/401 من الخادم (البوابة تطلب دخولًا للمجهول) أو `ok:false` = غير متاح؛ غير ذلك (شبكة/مهلة) = لا اتصال.
    static func isNotFound(_ error: Error) -> Bool {
        let d = String(describing: error)
        return d.contains("status(404)") || d.contains("status(401)")
    }
}

public struct CitationScreen: View {
    @Environment(\.platform) private var platform
    let slug: String
    @State private var phase: Phase = .loading
    private enum Phase { case loading, offline, notFound, ready(CitationPayload.Citation) }

    public init(slug: String) { self.slug = slug }

    public var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .offline: ErrorStateView { Task { await load() } }
            case .notFound: EmptyStateView(title: "الاقتباس غير موجود")
            case .ready(let c): content(c)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        .sunnahNavTitle("اقتباس")
        .task(id: slug) { await load() }
    }

    private func content(_ c: CitationPayload.Citation) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                        if let t = c.source?.title_ar, !t.isEmpty {
                            Text(t).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        }
                        SunnahArabicText(c.quoted_text, style: .hadith).foregroundStyle(Sunnah.Colors.textPrimary)
                            .textSelection(.enabled)
                        if let line = Self.meta(c.source), !line.isEmpty {
                            Text(line).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                SunnahContentFooter(title: c.source?.title_ar ?? "استشهاد", id: c.source?.title_ar ?? "citation", section: "استشهاد", source: Self.meta(c.source), inset: false)
            }.padding(Sunnah.Spacing.s4)
        }
    }

    static func meta(_ s: CitationPayload.Source?) -> String? {
        guard let s else { return nil }
        var parts: [String] = []
        if let a = s.author_name, !a.isEmpty { parts.append("الكاتب/الشيخ: \(a)") }
        if let b = s.book_name, !b.isEmpty {
            var line = "المصدر: \(b)"
            if let v = s.volume, !v.isEmpty { line += "، ج\(v)" }
            if let p = s.page_number, !p.isEmpty { line += "، ص\(p)" }
            parts.append(line)
        }
        if let y = s.publish_year { parts.append("السنة: \(y)") }
        return parts.joined(separator: "\n")
    }

    /// الاستشهاد العام كان يُجلب من نطاق الموقع (`/api/citations`)، ولا نطاق موقع في التطبيق الأصلي: «غير متاح» دائمًا بلا شبكة.
    private func load() async {
        phase = .notFound
    }
}

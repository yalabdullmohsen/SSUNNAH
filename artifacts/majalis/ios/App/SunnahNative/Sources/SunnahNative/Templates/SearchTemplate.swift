import SwiftUI

/// قالب 6 — بحث: حقل بحث أصلي يرشّح العناصر المحمّلة محليًا (عنوان/وصف/وسوم).
public struct SearchTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String
    @State private var query = ""

    public init(items: [ContentItem], detailBase: String) { self.items = items; self.detailBase = detailBase }

    private var results: [ContentItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard q.count >= 2 else { return [] }
        return items.filter { ([$0.title, $0.subtitle ?? ""] + $0.tags).contains { $0.localizedCaseInsensitiveContains(q) } }
    }

    public var body: some View {
        Group {
            if results.isEmpty { query.isEmpty ? EmptyStateView(title: "ابحث في المحتوى", message: "اكتب كلمة أو عبارة، مثل «الصلاة» أو «البقرة»، لتظهر النتائج هنا.", symbol: "magnifyingglass") : EmptyStateView(title: "لا نتائج", message: "جرّب كلمة أخرى أو تحقّق من الإملاء.", symbol: "magnifyingglass") } else {
                List(results) { item in
                    Button { openRoute(item.path(base: detailBase)) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                        .buttonStyle(.plain).listRowBackground(Sunnah.Colors.surface)
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .searchable(text: $query)
    }
}

import SwiftUI

/// قالب 6 — بحث: حقل بحث أصلي يرشّح العناصر المحمّلة محليًا (عنوان/وصف/وسوم).
public struct SearchTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String
    /// قوائم قابلة للتصفح (مثل الأربعين النووية): عند خلو الحقل تُعرض كل العناصر لا رسالة «ابحث».
    let browseWhenEmpty: Bool
    @State private var query = ""

    public init(items: [ContentItem], detailBase: String, browseWhenEmpty: Bool = false) { self.items = items; self.detailBase = detailBase; self.browseWhenEmpty = browseWhenEmpty }

    private var results: [ContentItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if q.isEmpty, browseWhenEmpty { return items }
        guard q.count >= 2 else { return [] }
        return items.filter { ([$0.title, $0.subtitle ?? ""] + $0.tags).contains { $0.localizedCaseInsensitiveContains(q) } }
    }

    public var body: some View {
        Group {
            if results.isEmpty { query.isEmpty ? EmptyStateView(title: "ابحث في المحتوى", message: "اكتب كلمة أو عبارة، مثل «الصلاة» أو «البقرة»، لتظهر النتائج هنا.", symbol: "magnifyingglass", declaresEmpty: false) : EmptyStateView(title: "لا نتائج", message: "جرّب كلمة أخرى أو تحقّق من الإملاء.", symbol: "magnifyingglass") } else {
                List(results) { item in
                    Button { openRoute(item.path(base: detailBase)) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                        .buttonStyle(.plain).sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .searchable(text: $query)
    }
}

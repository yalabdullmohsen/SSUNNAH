import SwiftUI

/// قالب 6 — بحث: حقل بحث أصلي يرشّح العناصر المحمّلة محليًا (عنوان/وصف/وسوم).
public struct SearchTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String
    /// قوائم قابلة للتصفح (مثل الأربعين النووية): عند خلو الحقل تُعرض كل العناصر لا رسالة «ابحث».
    let browseWhenEmpty: Bool
    @State private var query = ""
    /// آخر عمليات البحث: محلية على الجهاز فقط (UserDefaults)، ثمانية كحد أقصى.
    @State private var recent: [String] = SearchTemplate.loadRecent()

    static let recentKey = "sunnah.search.recent"
    static let suggestedIDs = ["quran", "hadith", "fiqh", "adhkar", "prayer", "qibla"]
    static let quickIDs = ["open-mushaf", "tafsir", "seerah", "lessons"]

    static func loadRecent() -> [String] { UserDefaults.standard.stringArray(forKey: recentKey) ?? [] }
    /// يضيف المصطلح في المقدمة بلا تكرار ويقصّ القائمة إلى 8.
    static func pushed(_ term: String, into list: [String]) -> [String] {
        let t = term.trimmingCharacters(in: .whitespacesAndNewlines)
        guard t.count >= 2 else { return list }
        return Array(([t] + list.filter { $0 != t }).prefix(8))
    }
    private func remember(_ term: String) {
        recent = SearchTemplate.pushed(term, into: recent)
        UserDefaults.standard.set(recent, forKey: SearchTemplate.recentKey)
    }
    private func item(_ id: String) -> ContentItem? { items.first { $0.id == id } }

    public init(items: [ContentItem], detailBase: String, browseWhenEmpty: Bool = false) { self.items = items; self.detailBase = detailBase; self.browseWhenEmpty = browseWhenEmpty }

    private var results: [ContentItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if q.isEmpty, browseWhenEmpty { return items }
        guard q.count >= 2 else { return [] }
        return items.filter { ([$0.title, $0.subtitle ?? ""] + $0.tags).contains { $0.localizedCaseInsensitiveContains(q) } }
    }

    public var body: some View {
        VStack(spacing: 0) {
            SunnahSearchField(text: $query, prompt: "ابحث في المحتوى", idPrefix: "search.field")
                .padding(.vertical, Sunnah.Spacing.s2)
                .onSubmit { remember(query) }
            Group {
                if results.isEmpty { query.isEmpty ? AnyView(startPage) : AnyView(EmptyStateView(title: "لا نتائج", message: "جرّب كلمة أخرى أو تحقّق من الإملاء.", symbol: "magnifyingglass")) } else {
                    SunnahRowStack {
                        ForEach(results) { item in
                            Button { openRoute(item.path(base: detailBase)) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                                .sunnahPressable().sunnahStackRow()
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Sunnah.Colors.bg)
    }

    /// قبل الكتابة: آخر عمليات البحث + اقتراحات + أقسام سريعة (عناصر الفهرس نفسه فلا اقتراح بلا نتيجة).
    private var startPage: some View {
        let suggested = SearchTemplate.suggestedIDs.compactMap(item)
        let quick = SearchTemplate.quickIDs.compactMap(item)
        return SunnahRowStack {
            if !recent.isEmpty {
                HStack {
                    SunnahRowGroupHeader("آخر عمليات البحث")
                    Button("مسح") { recent = []; UserDefaults.standard.removeObject(forKey: SearchTemplate.recentKey) }
                        .font(Sunnah.Typography.secondary).frame(minHeight: Sunnah.Spacing.touch)
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                }
                ForEach(recent, id: \.self) { term in
                    Button { query = term } label: { Label(term, systemImage: "clock.arrow.circlepath") }
                        .sunnahPressable().sunnahStackRow()
                }
            }
            if !suggested.isEmpty {
                SunnahRowGroupHeader("عمليات بحث مقترحة")
                ForEach(suggested) { it in
                    Button { query = it.title } label: { Label(it.title, systemImage: "magnifyingglass") }
                        .sunnahPressable().sunnahStackRow()
                }
            }
            if !quick.isEmpty {
                SunnahRowGroupHeader("أقسام سريعة")
                ForEach(quick) { it in
                    Button { openRoute(it.path(base: detailBase)) } label: { SunnahListRow(title: it.title, subtitle: it.subtitle) }
                        .sunnahPressable().sunnahStackRow()
                }
            }
        }
    }
}

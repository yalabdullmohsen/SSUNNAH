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

    /// اقتراحات من الفهرس نفسه؛ إن لم يحوِ المعرّفات المعروفة فأوائل عناصره (لا صفحة بحث بلا اقتراح).
    private var suggestionTitles: [String] {
        let known = SearchTemplate.suggestedIDs.compactMap(item).map(\.title)
        return known.isEmpty ? Array(items.prefix(6).map(\.title)) : known
    }

    private var results: [ContentItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if q.isEmpty, browseWhenEmpty { return items }
        guard q.count >= 2 else { return [] }
        return items.filter { ([$0.title, $0.subtitle ?? ""] + $0.tags).contains { $0.localizedCaseInsensitiveContains(q) } }
    }

    public var body: some View {
        VStack(spacing: 0) {
            SunnahSearchField(text: $query, prompt: "ابحث", suggestions: query.isEmpty ? suggestionTitles : [], idPrefix: "search.field")
                .padding(.vertical, Sunnah.Spacing.s2)
                .onSubmit(of: .search) { remember(query) }
            if results.isEmpty {
                if query.isEmpty { startPage } else { EmptyStateView(title: "لا نتائج", message: "جرّب كلمة أخرى أو تحقّق من الإملاء.", symbol: "magnifyingglass").frame(maxHeight: .infinity) }
            } else {
                ScrollView {
                    SunnahTileGrid(results.map { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.subtitle) }, idPrefix: "search.result") { t in
                        if let it = item(t.id) { openRoute(it.path(base: detailBase)) }
                    }
                    .padding(.bottom, 96)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahReadableWidth()
    }

    /// قبل الكتابة: آخر عمليات البحث + أقسام سريعة (اقتراحات البحث شرائح تحت الحقل؛ من الفهرس نفسه فلا اقتراح بلا نتيجة).
    private var startPage: some View {
        let known = SearchTemplate.quickIDs.compactMap(item)
        let quick = known.isEmpty ? Array(items.prefix(8)) : known
        return ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                if !recent.isEmpty {
                    SunnahSettingsGroup("آخر عمليات البحث") {
                        ForEach(Array(recent.enumerated()), id: \.element) { i, term in
                            Button { query = term } label: { SunnahSettingsRow(term, symbol: "clock.arrow.circlepath", isLast: i == recent.count - 1) }
                                .buttonStyle(.plain)
                        }
                    }
                    Button("مسح") { recent = []; UserDefaults.standard.removeObject(forKey: SearchTemplate.recentKey) }
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                        .frame(minHeight: 44).padding(.horizontal, Sunnah.Spacing.pageX + 4)
                }
                if !quick.isEmpty {
                    Text("أقسام سريعة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                        .padding(.horizontal, Sunnah.Spacing.pageX + 4).accessibilityAddTraits(.isHeader)
                    SunnahTileGrid(quick.map { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.subtitle) }, idPrefix: "search.quick") { t in
                        if let it = item(t.id) { openRoute(it.path(base: detailBase)) }
                    }
                }
            }
            .padding(.bottom, 96)
        }
    }
}

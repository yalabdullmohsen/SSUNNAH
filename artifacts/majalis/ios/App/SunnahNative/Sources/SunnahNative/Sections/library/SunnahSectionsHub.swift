import SwiftUI

/// شاشة «الأقسام» (النموذج ٢): بحث ← بطاقة القرآن الخضراء ← «العلم» ← «العبادة اليومية» ← كل الأقسام.
/// البيانات من `SectionsCatalog` عبر `LibraryAdapters.sectionsPage`؛ كل مسار يبقى له صف `sections.item.<route>`.
struct SunnahSectionsHub: View {
    @Environment(\.openRoute) private var openRoute
    let groups: [LibraryAdapters.NavGroup]
    @State private var query = ""

    private struct Featured { let route: String; let title: String; let subtitle: String; let symbol: String; let gold: Bool }
    private static let knowledge: [Featured] = [
        .init(route: "/hadith", title: "الحديث", subtitle: "مع درجة الصحة", symbol: "text.book.closed", gold: false),
        .init(route: "/prophets", title: "قصص الأنبياء", subtitle: "٢٥ نبيًّا", symbol: "sparkle", gold: true),
        .init(route: "/seerah", title: "السيرة", subtitle: "السيرة النبوية", symbol: "map", gold: true),
        .init(route: "/fiqh", title: "الفقه", subtitle: "المسائل بأدلتها", symbol: "building.columns", gold: false),
        .init(route: "/tawhid", title: "العقيدة", subtitle: "أصول الإيمان", symbol: "shield", gold: false),
        .init(route: "/lessons", title: "الدروس", subtitle: "مجالس العلم", symbol: "graduationcap", gold: true)
    ]
    private static let daily: [Featured] = [
        .init(route: "/prayer-times", title: "الصلاة", subtitle: "الأوقات والتنبيه", symbol: "moon", gold: false),
        .init(route: "/adhkar", title: "الأذكار", subtitle: "الصباح والمساء", symbol: "lightbulb", gold: true),
        .init(route: "/qibla", title: "القبلة", subtitle: "البوصلة", symbol: "location.north.line", gold: true),
        .init(route: "/calendar", title: "التقويم", subtitle: "هجري وميلادي", symbol: "calendar", gold: false)
    ]

    private var available: Set<String> { Set(groups.flatMap { $0.links.map(\.route) }) }
    private func present(_ list: [Featured]) -> [Featured] { list.filter { available.contains($0.route) } }

    private var matches: [LibraryAdapters.NavGroup] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return groups }
        return groups.compactMap { g in
            let links = g.links.filter { $0.title.contains(q) || ($0.subtitle ?? "").contains(q) }
            return links.isEmpty ? nil : LibraryAdapters.NavGroup(title: g.title, links: links)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SunnahPageTitle("الأقسام")
                searchField
                if query.isEmpty {
                    if available.contains("/quran-hub") { quranCard }
                    tiles("العلم", present(Self.knowledge))
                    tiles("العبادة اليومية", present(Self.daily))
                    Text("كل الأقسام").font(AppearancePrefs.ui(.extraBold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.primary)
                        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, 6)
                }
                if matches.isEmpty {
                    EmptyStateView(title: "لا نتائج مطابقة", message: "جرّب كلمة أخرى أو امسح البحث", symbol: "magnifyingglass")
                }
                ForEach(matches, id: \.title) { group in
                    SunnahSettingsGroup(group.title) {
                        ForEach(Array(group.links.enumerated()), id: \.element.id) { i, link in
                            Button { openRoute(link.route) } label: {
                                SunnahSettingsRow(link.title, symbol: "doc.text", isLast: i == group.links.count - 1) {
                                    Image(systemName: "chevron.left").font(.system(size: 13, weight: .bold)).foregroundStyle(Sunnah.Colors.textSecondary)
                                }
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("sections.item.\(link.route)")
                        }
                    }
                }
                SunnahContentFooter(title: "الأقسام", id: "sections", section: "الأقسام", inset: false)
            }
            .padding(.bottom, 96)
        }
        .background(Sunnah.Colors.bg)
        .sunnahRootChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass").font(.system(size: 16, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary)
            TextField("ابحث في كل الأقسام", text: $query)
                .font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                .submitLabel(.search).accessibilityIdentifier("sections.search")
            if !query.isEmpty {
                Button { query = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.textSecondary).frame(width: 44, height: 44) }
                    .accessibilityLabel("مسح البحث")
            }
        }
        .padding(.horizontal, 16).frame(minHeight: 50)
        .background(Sunnah.Colors.surface, in: Capsule())
        .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private var quranCard: some View {
        Button { openRoute("/quran-hub") } label: {
            SunnahHeroCard {
                HStack(spacing: 14) {
                    SunnahIconTile("book", tone: .mint, size: 48)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("القرآن الكريم").font(AppearancePrefs.ui(.extraBold, 22, .title2)).foregroundStyle(.white)
                        Text("المصحف · التفسير · الاستماع").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                    }
                    Spacer(minLength: 4)
                    Image(systemName: "chevron.left").font(.system(size: 14, weight: .bold)).foregroundStyle(.white)
                }
            }
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityIdentifier("sections.feature./quran-hub")
    }

    private func tiles(_ title: String, _ items: [Featured]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(AppearancePrefs.ui(.extraBold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.primary)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
                ForEach(items, id: \.route) { f in
                    Button { openRoute(f.route) } label: {
                        SunnahTile(title: f.title, subtitle: f.subtitle, symbol: f.symbol, tone: f.gold ? .gold : .mint)
                    }
                    .buttonStyle(.plain).sunnahPressable()
                    .accessibilityIdentifier("sections.feature.\(f.route)")
                }
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

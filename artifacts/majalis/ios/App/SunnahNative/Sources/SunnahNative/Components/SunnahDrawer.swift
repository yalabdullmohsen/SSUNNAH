import SwiftUI

/// القائمة الجانبية: بحث في الأعلى ومجموعات (الأساسي/العلم/أدوات/التطبيق). كل وجهة بنقرة واحدة.
/// الترتيب بحسب الاستعمال اليومي (الأكثر استعمالًا أولًا)؛ كل أيقونة لعنصر واحد فقط (يفرضه native-drawer-guard).
public struct SunnahDrawer: View {
    let selectedPath: String
    let open: (String) -> Void
    let close: () -> Void
    @Environment(\.layoutDirection) private var direction
    public init(selectedPath: String = "/", open: @escaping (String) -> Void, close: @escaping () -> Void) {
        self.selectedPath = selectedPath; self.open = open; self.close = close
    }

    struct Item: Identifiable { let title: String, icon: String, path: String; var id: String { path } }
    struct Group { let title: String; let items: [Item] }

    static let groups: [Group] = [
        Group(title: "الأساسي", items: [Item(title: "الرئيسية", icon: "house", path: "/"), Item(title: "الصلاة", icon: "moon.stars", path: "/prayer-times"), Item(title: "المصحف", icon: "character.book.closed", path: "/mushaf"), Item(title: "الأذكار", icon: "hands.sparkles", path: "/adhkar")]),
        Group(title: "العلم", items: [Item(title: "الحديث", icon: "quote.bubble", path: "/hadith"), Item(title: "القرآن وعلومه", icon: "books.vertical", path: "/quran-hub"), Item(title: "الفقه", icon: "building.columns", path: "/fiqh"), Item(title: "الدروس", icon: "graduationcap", path: "/lessons"), Item(title: "السيرة", icon: "map", path: "/seerah")]),
        Group(title: "أدوات", items: [Item(title: "القبلة", icon: "location.north.line", path: "/qibla"), Item(title: "السبحة", icon: "circle.dotted", path: "/tasbih"), Item(title: "التقويم", icon: "calendar", path: "/calendar"), Item(title: "الزكاة", icon: "banknote", path: "/zakat")]),
        Group(title: "التطبيق", items: [Item(title: "الإعدادات", icon: "gearshape", path: "/settings"), Item(title: "المصادر", icon: "text.book.closed", path: "/sources"), Item(title: "عن التطبيق", icon: "info.circle", path: "/about"), Item(title: "اتصل بنا", icon: "envelope", path: "/contact")]),
    ]

    static func isSelected(_ item: Item, current: String) -> Bool {
        item.path == "/" ? current == "/" : (current == item.path || current.hasPrefix(item.path + "/"))
    }

    public var body: some View {
        // المحتوى يحترم safe area العلوية: الرأس يبدأ تحت شريط الحالة فلا يُخفي الساعة.
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("سُنّة").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textOnPrimary)
                Button { Sunnah.Haptics.select(); close(); open("/search") } label: {
                    HStack { Image(systemName: "magnifyingglass"); Text("ابحث في التطبيق"); Spacer() }
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        .padding(.horizontal, 14).frame(minHeight: Sunnah.Spacing.touch)
                        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }.buttonStyle(.plain)
            }
            .padding(Sunnah.Spacing.s4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .sunnahMotifCorner(size: 130, tint: .white, opacity: 0.14).clipped()
            .sunnahPatternedBackground(radius: 0)
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Self.groups, id: \.title) { g in
                        SunnahSectionLabel(g.title)
                        SunnahGroupedCard(g.items) { item in
                            Button { Sunnah.Haptics.select(); close(); open(item.path) } label: {
                                SunnahCompactRow(title: item.title, icon: item.icon, selected: Self.isSelected(item, current: selectedPath))
                            }.buttonStyle(.plain)
                        }
                    }
                }.padding(.horizontal, Sunnah.Spacing.s3).padding(.bottom, Sunnah.Spacing.s4)
            }
        }
        .frame(width: 310).frame(maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .clipShape(SunnahSidePanelShape(roundsLeft: direction == .rightToLeft))
        .shadow(color: .black.opacity(0.25), radius: 16, x: direction == .rightToLeft ? -4 : 4, y: 0)
    }
}

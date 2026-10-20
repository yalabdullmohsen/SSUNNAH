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
        Group(title: "العلم", items: [Item(title: "الحديث", icon: "quote.bubble", path: "/hadith"), Item(title: "القرآن وعلومه", icon: "books.vertical", path: "/quran-hub"), Item(title: "الفقه", icon: "building.columns", path: "/fiqh"), Item(title: "الدروس", icon: "graduationcap", path: "/lessons"), Item(title: "السيرة", icon: "map", path: "/seerah"), Item(title: "قصص الأنبياء", icon: "sparkle", path: "/prophets")]),
    ]
    static let tools: [Item] = [Item(title: "القبلة", icon: "location.north.line", path: "/qibla"), Item(title: "السبحة", icon: "circle.dotted", path: "/tasbih"), Item(title: "التقويم", icon: "calendar", path: "/calendar"), Item(title: "الزكاة", icon: "banknote", path: "/zakat")]
    static let footer: [Item] = [Item(title: "الإعدادات", icon: "gearshape", path: "/settings"), Item(title: "عن التطبيق", icon: "info.circle", path: "/about")]

    static func isSelected(_ item: Item, current: String) -> Bool {
        item.path == "/" ? current == "/" : (current == item.path || current.hasPrefix(item.path + "/"))
    }

    public var body: some View {
        // اللوحة تمتدّ حتى الحافة السفلية (تحت مؤشر الصفحة الرئيسية) والمحتوى يحترم safe area أعلى وأسفل.
        GeometryReader { geo in
            panel(bottomInset: geo.safeAreaInsets.bottom)
                .frame(height: geo.size.height + geo.safeAreaInsets.bottom, alignment: .top)
        }
        .frame(width: 310)
    }

    private func go(_ path: String) { Sunnah.Haptics.select(); close(); open(path) }

    private func panel(bottomInset: CGFloat) -> some View {
        VStack(spacing: 0) {
            header
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    ForEach(Self.groups, id: \.title) { g in
                        SunnahSectionLabel(g.title)
                        LazyVGrid(columns: Self.columns, spacing: Sunnah.Spacing.s2) { ForEach(g.items) { tile($0) } }
                    }
                    SunnahSectionLabel("أدوات")
                    LazyVGrid(columns: Self.columns, spacing: Sunnah.Spacing.s2) { ForEach(Self.tools) { tile($0) } }
                }.padding(.horizontal, Sunnah.Spacing.s3).padding(.bottom, Sunnah.Spacing.s4)
            }
            HStack {
                ForEach(Self.footer) { item in
                    Button { go(item.path) } label: {
                        Label(item.title, systemImage: item.icon).font(AppearancePrefs.ui(.bold, 14, .subheadline))
                            .foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
                    }.buttonStyle(.plain)
                    if item.path != Self.footer.last?.path { Spacer() }
                }
            }
            .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, bottomInset)
            .background(Sunnah.Colors.surface)
            .overlay(alignment: .top) { Rectangle().fill(Sunnah.Colors.border).frame(height: 1) }
        }
        .frame(width: 310).frame(maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .clipShape(SunnahSidePanelShape(roundsLeft: direction == .rightToLeft))
        .shadow(color: .black.opacity(0.25), radius: 16, x: direction == .rightToLeft ? -4 : 4, y: 0)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            HStack(alignment: .top) {
                SunnahRoundButton(symbol: "xmark", label: "إغلاق") { close() }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("سُنّة").font(AppearancePrefs.ui(.extraBold, 30, .title)).foregroundStyle(.white)
                    Text(Sunnah.digits(HomeScreen.hijriDate(Date()))).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                }
            }
            Button { go("/search") } label: {
                HStack { Image(systemName: "magnifyingglass"); Text("ابحث في التطبيق"); Spacer() }
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    .padding(.horizontal, Sunnah.Spacing.s4).frame(height: 48)
                    .background(Sunnah.Colors.surface, in: Capsule())
            }.buttonStyle(.plain)
        }
        .padding(Sunnah.Spacing.s4)
        .background { ZStack { Sunnah.Colors.hero; SunnahOctagonOrnament() }.ignoresSafeArea(edges: .top) }
    }

    private static let columns = [GridItem(.flexible(), spacing: Sunnah.Spacing.s2), GridItem(.flexible(), spacing: Sunnah.Spacing.s2)]

    /// بلاطة شبكية: أيقونة ملوّنة ناعمة فوق العنوان؛ المحدَّدة تأخذ خلفية خضراء ناعمة.
    private func tile(_ item: Item) -> some View {
        let sel = Self.isSelected(item, current: selectedPath)
        return Button { go(item.path) } label: {
            VStack(alignment: .leading, spacing: 8) {
                SunnahIconTile(item.icon, tone: Self.gold.contains(item.path) ? .gold : .mint, size: 36)
                Text(item.title).font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                    .lineLimit(1).minimumScaleFactor(0.85)
            }
            .frame(maxWidth: .infinity, minHeight: 84, alignment: .leading).padding(Sunnah.Spacing.s3)
            .background(sel ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(sel ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: 1))
        }.buttonStyle(.plain).sunnahPressable()
        .accessibilityAddTraits(sel ? .isSelected : [])
    }

    private static let gold: Set<String> = ["/adhkar", "/seerah", "/lessons", "/qibla", "/zakat"]
}


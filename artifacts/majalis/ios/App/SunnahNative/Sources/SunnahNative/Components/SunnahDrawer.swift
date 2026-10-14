import SwiftUI

/// القائمة الجانبية: بحث في الأعلى ومجموعات (الأساسي/العلم/أدوات/التطبيق). كل وجهة بنقرة واحدة.
public struct SunnahDrawer: View {
    let open: (String) -> Void
    let close: () -> Void
    public init(open: @escaping (String) -> Void, close: @escaping () -> Void) { self.open = open; self.close = close }

    private let groups: [(title: String, items: [(String, String, String)])] = [
        ("الأساسي", [("الرئيسية", "house", "/"), ("المصحف", "book.closed", "/mushaf"), ("الصلاة", "clock", "/prayer-times"), ("الأذكار", "sparkles", "/adhkar")]),
        ("العلم", [("الحديث", "text.book.closed", "/hadith"), ("الفقه", "scalemass", "/fiqh"), ("السيرة", "scroll", "/seerah"), ("الدروس", "graduationcap", "/lessons"), ("القرآن وعلومه", "books.vertical", "/quran-hub")]),
        ("أدوات", [("القبلة", "location.north.line", "/qibla"), ("التقويم", "calendar", "/calendar"), ("السبحة", "circle.dotted", "/tasbih"), ("الزكاة", "banknote", "/zakat")]),
        ("التطبيق", [("الإعدادات", "gearshape", "/settings"), ("المصادر", "doc.text", "/sources"), ("عن التطبيق", "info.circle", "/about"), ("اتصل بنا", "envelope", "/contact")]),
    ]

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("سُنّة").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textOnPrimary)
                Button { Sunnah.Haptics.select(); close(); open("/search") } label: {
                    HStack { Image(systemName: "magnifyingglass"); Text("ابحث في التطبيق"); Spacer() }
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        .padding(.horizontal, 14).frame(height: 44)
                        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }.buttonStyle(.plain)
            }
            .padding(Sunnah.Spacing.s4).padding(.top, Sunnah.Spacing.s6)
            .frame(maxWidth: .infinity, alignment: .leading)
            .sunnahPatternedBackground(radius: 0)
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    ForEach(groups, id: \.title) { g in
                        Text(g.title).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.gold).padding(.horizontal, 6)
                        ForEach(g.items, id: \.2) { item in
                            Button { Sunnah.Haptics.select(); close(); open(item.2) } label: {
                                SunnahListRow(title: item.0, showsChevron: false, icon: item.1).sunnahRowChromeStatic()
                            }.buttonStyle(.plain)
                        }
                    }
                }.padding(Sunnah.Spacing.s4)
            }
        }
        .frame(width: 310).frame(maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
    }
}

extension View {
    /// بطاقة خارج القوائم (بلا وسوم List).
    func sunnahRowChromeStatic() -> some View {
        self.padding(.horizontal, 14).padding(.vertical, 8)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
    }
}

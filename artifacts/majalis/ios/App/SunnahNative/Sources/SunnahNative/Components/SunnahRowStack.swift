import SwiftUI

/// بديل `List` لصفوف البطاقات: تمرير + LazyVStack بهامش الصفحة، بلا قوائم النظام. الصفوف تُلفّ بـ`sunnahRowChrome()`.
struct SunnahRowStack<Content: View>: View {
    @ViewBuilder let content: () -> Content
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) { content() }
                .padding(.vertical, Sunnah.Spacing.s2)
        }
        .background(Sunnah.Colors.bg)
    }
}

/// عنوان مجموعة داخل `SunnahRowStack`.
struct SunnahRowGroupHeader: View {
    let title: String
    init(_ title: String) { self.title = title }
    var body: some View {
        Text(title).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s3).padding(.bottom, Sunnah.Spacing.s1)
            .accessibilityAddTraits(.isHeader)
    }
}

extension View {
    /// صف بطاقة كامل العرض داخل `SunnahRowStack`.
    func sunnahStackRow() -> some View {
        self.frame(maxWidth: .infinity, alignment: .leading).sunnahRowChrome()
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, 5)
    }
}

/// صفحة تمرير بطاقات بهامش الصفحة (بديل `List`/`Form` لمجموعات من البطاقات).
struct LearnCardsPage<Content: View>: View {
    @ViewBuilder let content: () -> Content
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) { content() }
                .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s2)
        }
        .background(Sunnah.Colors.bg)
    }
}

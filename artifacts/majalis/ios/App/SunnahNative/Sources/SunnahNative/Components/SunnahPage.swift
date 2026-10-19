import SwiftUI

/// صفحة كاملة بشريط علوي من النموذج ٢ (رجوع + عنوان) — بديل `.sheet` لصفحات المحتوى. تُدفع كمسار أو تُعرض بـ`fullScreenCover`.
public struct SunnahPage<Trailing: View, Content: View>: View {
    let title: String; let trailing: Trailing; let content: Content
    @Environment(\.dismiss) private var dismiss
    public init(_ title: String, @ViewBuilder trailing: () -> Trailing, @ViewBuilder content: () -> Content) {
        self.title = title; self.trailing = trailing(); self.content = content()
    }
    public var body: some View {
        VStack(spacing: 0) {
            SunnahTopBar(onBack: { dismiss() }) { trailing }.padding(.vertical, Sunnah.Spacing.s2)
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    SunnahPageTitle(title)
                    content
                }
                .padding(.bottom, 96)
            }
        }
        .background(Sunnah.Colors.bg.ignoresSafeArea())
        .sunnahSubChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
    }
}

public extension SunnahPage where Trailing == EmptyView {
    init(_ title: String, @ViewBuilder content: () -> Content) { self.init(title, trailing: { EmptyView() }, content: content) }
}

import SwiftUI

/// بديل `.searchable` للشاشات تحت شريط تنقّل مخفي (`sunnahRootChrome`/`sunnahSubChrome`): حقل بحث ظاهر فوق المحتوى بنمط حقل بحث الأنبياء،
/// فلا يبقى `.searchable` معلّقًا في شريط لا يُرى (الحقل لا يظهر ولا يمكن للمستخدم البحث).
private struct SunnahSearchable: ViewModifier {
    @Binding var text: String
    let prompt: String

    func body(content: Content) -> some View {
        content.safeAreaInset(edge: .top, spacing: 0) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass").font(.system(size: 16, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
                TextField(prompt, text: $text)
                    .font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityIdentifier("sunnah.searchable")
                if !text.isEmpty {
                    Button { text = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.textSecondary).frame(width: 44, height: 44) }
                        .accessibilityLabel("مسح البحث")
                }
            }
            .padding(.horizontal, 16).frame(minHeight: 50)
            .background(Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s2)
            .background(Sunnah.Colors.bg)
        }
    }
}

public extension View {
    func sunnahSearchable(text: Binding<String>, prompt: String = "ابحث") -> some View {
        modifier(SunnahSearchable(text: text, prompt: prompt))
    }
}

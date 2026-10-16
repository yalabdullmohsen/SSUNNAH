import SwiftUI

/// رمز زر شريط التنقل بكبسولة مصمتة ورمز أبيض: لا يعتمد على زجاج النظام الذي يُبهت الرمز فوق الترويسة الخضراء (فاتح/XXXL).
/// الخلفية ثابتة في الوضعين (`heroTop`) والرمز `onHero`، فالتباين ثابت ≥ 3:1 ويحرسه `SunnahToolbarContrastTests` بالبكسل.
struct SunnahToolbarGlyph<Content: View>: View {
    var size: CGFloat = 15
    @ViewBuilder var content: Content
    var body: some View {
        content
            .font(.system(size: size, weight: .semibold))
            .foregroundStyle(Sunnah.Colors.onHero)
            .frame(minWidth: 36, minHeight: 32)
            .padding(.horizontal, 4)
            .background(Sunnah.Colors.heroTop, in: Capsule())
            .overlay(Capsule().stroke(Color.white.opacity(0.28), lineWidth: 1))
            .contentShape(Capsule())
    }
}

/// زر شريط تنقل موحّد: يُستعمل داخل `ToolbarItem` في كل الشاشات.
struct SunnahToolbarButton: View {
    let systemImage: String
    var glyphSize: CGFloat = 15
    let label: String
    let action: () -> Void
    var body: some View {
        Button(action: action) { SunnahToolbarGlyph(size: glyphSize) { Image(systemName: systemImage) } }
            .buttonStyle(.plain)
            .accessibilityLabel(label)
    }
}

/// مجموعة أزرار الشريط بلا خلفية الزجاج المشتركة (iOS 26) كي تبقى الكبسولة المصمتة هي الخلفية الوحيدة.
struct SunnahCapsuleToolbar<Content: View>: ToolbarContent {
    @ViewBuilder let content: () -> Content

    @ToolbarContentBuilder var body: some ToolbarContent {
        if #available(iOS 26.0, *) {
            ToolbarItemGroup(placement: .primaryAction) { content() }
                .sharedBackgroundVisibility(.hidden)
        } else {
            ToolbarItemGroup(placement: .primaryAction) { content() }
        }
    }
}

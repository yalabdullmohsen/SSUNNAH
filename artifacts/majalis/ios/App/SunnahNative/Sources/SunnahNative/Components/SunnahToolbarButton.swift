import SwiftUI

/// رمز زر شريط التنقل بكبسولة مصمتة ورمز أبيض: لا يعتمد على زجاج النظام الذي يُبهت الرمز فوق الترويسة الخضراء (فاتح/XXXL).
/// الخلفية ثابتة في الوضعين (`heroTop`) والرمز `onHero`، فالتباين ثابت ≥ 3:1 ويحرسه `SunnahToolbarContrastTests` بالبكسل.
struct SunnahToolbarGlyph<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        content
            .font(.system(size: 15, weight: .semibold))
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
    let label: String
    let action: () -> Void
    var body: some View {
        Button(action: action) { SunnahToolbarGlyph { Image(systemName: systemImage) } }
            .buttonStyle(.plain)
            .accessibilityLabel(label)
    }
}

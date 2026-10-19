import SwiftUI

/// بطاقة بيضاء قابلة للفتح (بديل `DisclosureGroup`): ترويسة ≥44 بسهم يدور + محتوى. حركة فورية مع «تقليل الحركة».
public struct SunnahExpandableCard<Content: View>: View {
    let title: String; let subtitle: String?; let content: Content
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var expanded: Bool
    public init(_ title: String, subtitle: String? = nil, startsExpanded: Bool = false, @ViewBuilder content: () -> Content) {
        self.title = title; self.subtitle = subtitle; self.content = content(); _expanded = State(initialValue: startsExpanded)
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                Sunnah.Haptics.select()
                withAnimation(reduceMotion ? nil : SunnahMotion.standard) { expanded.toggle() }
            } label: {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(title.arabicDigits).font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let subtitle { Text(subtitle.arabicDigits).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    Image(systemName: "chevron.down").font(.system(size: 14, weight: .semibold)).foregroundStyle(Sunnah.Colors.primary)
                        .rotationEffect(.degrees(expanded ? 180 : 0)).accessibilityHidden(true)
                }
                .frame(minHeight: 56).contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityElement(children: .combine).accessibilityAddTraits(.isHeader)
            .accessibilityValue(expanded ? "مفتوح" : "مطوي")
            if expanded {
                Divider().overlay(Sunnah.Colors.border)
                content.padding(.vertical, 12).transition(reduceMotion ? .identity : .opacity)
            }
        }
        .padding(.horizontal, 16)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

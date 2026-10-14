import SwiftUI

/// الشريط السفلي العائم: ارتفاع 68، زوايا 26، أبيض شفاف، والتبويب النشط بخلفية أخضر فاتح.
public struct SunnahTabBar: View {
    let selected: AppTab
    let onSelect: (AppTab) -> Void
    public init(selected: AppTab, onSelect: @escaping (AppTab) -> Void) {
        self.selected = selected; self.onSelect = onSelect
    }
    public var body: some View {
        HStack(spacing: 2) {
            ForEach(AppTab.allCases) { tab in
                let on = tab == selected
                Button {
                    Sunnah.Haptics.select(); onSelect(tab)
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: tab.systemImage).font(.system(size: 19, weight: on ? .bold : .regular))
                        Text(tab.title).font(Sunnah.Typography.tag)
                    }
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .foregroundStyle(on ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                    .background(on ? Sunnah.Colors.primarySoft : .clear, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(6)
        .frame(height: 68)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .background(Sunnah.Colors.surface.opacity(0.85), in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .shadow(color: .black.opacity(0.1), radius: 14, y: 6)
        .padding(.horizontal, Sunnah.Spacing.s4)
        .padding(.bottom, Sunnah.Spacing.s2)
    }
}

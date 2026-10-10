import SwiftUI

public struct SunnahButton: View {
    public enum Style { case primary, secondary }
    let title: String; let style: Style; let action: () -> Void
    public init(_ title: String, style: Style = .primary, action: @escaping () -> Void) {
        self.title = title; self.style = style; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            Text(title).font(Sunnah.Typography.cardTitle)
                .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.buttonHeight)
                .foregroundStyle(style == .primary ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.primary)
                .background(style == .primary ? Sunnah.Colors.primary : Sunnah.Colors.primarySoft,
                            in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
        }
        .buttonStyle(.plain)
    }
}

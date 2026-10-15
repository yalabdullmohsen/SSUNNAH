import SwiftUI

/// حقل إدخال بالرموز: سطح وحدّ يتبعان الوضع الداكن (بدل roundedBorder النظامي الذي يصير شبه أسود فوق خلفية التطبيق).
private struct SunnahFieldChrome: ViewModifier {
    func body(content: Content) -> some View {
        content
            .textFieldStyle(.plain)
            .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            .padding(.horizontal, Sunnah.Spacing.s3)
            .frame(minHeight: Sunnah.Spacing.buttonHeight)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.small).stroke(Sunnah.Colors.surface2, lineWidth: Sunnah.Spacing.hairline))
    }
}

extension View {
    func sunnahFieldChrome() -> some View { modifier(SunnahFieldChrome()) }
}

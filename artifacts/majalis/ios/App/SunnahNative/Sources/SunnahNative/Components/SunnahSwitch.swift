import SwiftUI

/// مفتاح أخضر 48×28 بعنوان (بديل `Toggle`). الحالة تُقرأ «مفعّل/معطّل» لقارئ الشاشة.
public struct SunnahSwitch: View {
    @Binding var isOn: Bool
    let title: String?
    public init(_ title: String? = nil, isOn: Binding<Bool>) { self.title = title; _isOn = isOn }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            if let title {
                Text(title.arabicDigits).font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer(minLength: Sunnah.Spacing.s3)
            }
            Button { Sunnah.Haptics.select(); sunnahAnimate { isOn.toggle() } } label: {
                ZStack(alignment: isOn ? .trailing : .leading) {
                    Capsule().fill(isOn ? Sunnah.Colors.primary : Sunnah.Colors.switchOff).frame(width: 48, height: 28)
                    Circle().fill(.white).frame(width: 22, height: 22).padding(3)
                }
                .environment(\.layoutDirection, .leftToRight)
                .frame(minWidth: 48, minHeight: 44).contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(title ?? "مفتاح").accessibilityValue(isOn ? "مفعّل" : "معطّل")
            .accessibilityAddTraits(.isButton)
        }
    }
}

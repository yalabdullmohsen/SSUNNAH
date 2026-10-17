import SwiftUI

/// «السابق / التالي» + مؤشر تقدم (n من m)؛ يُستعمل في ExplainerTemplate وبين الأنبياء.
public struct SunnahStepper: View {
    @Binding var index: Int
    let count: Int
    var previousTitle = "السابق", nextTitle = "التالي"
    public init(index: Binding<Int>, count: Int, previousTitle: String = "السابق", nextTitle: String = "التالي") {
        _index = index; self.count = count; self.previousTitle = previousTitle; self.nextTitle = nextTitle
    }
    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            ProgressView(value: Double(index + 1), total: Double(max(count, 1))).tint(Sunnah.Colors.primary)
                .accessibilityLabel("المرحلة \(index + 1) من \(count)")
            HStack {
                step(previousTitle, "chevron.right", enabled: index > 0) { index -= 1 }.accessibilityIdentifier("stepper.previous")
                Spacer()
                Text("\(index + 1) / \(count)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                Spacer()
                step(nextTitle, "chevron.left", enabled: index < count - 1, trailingIcon: true) { index += 1 }.accessibilityIdentifier("stepper.next")
            }
        }
    }
    private func step(_ title: String, _ icon: String, enabled: Bool, trailingIcon: Bool = false, action: @escaping () -> Void) -> some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            HStack(spacing: Sunnah.Spacing.s2) {
                if !trailingIcon { Image(systemName: icon) }
                Text(title)
                if trailingIcon { Image(systemName: icon) }
            }
            .font(Sunnah.Typography.secondary).frame(minHeight: 44)
        }
        .buttonStyle(.plain).foregroundStyle(enabled ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary.opacity(0.4)).disabled(!enabled)
    }
}

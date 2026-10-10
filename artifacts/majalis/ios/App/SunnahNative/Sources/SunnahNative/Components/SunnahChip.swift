import SwiftUI

public struct SunnahChip: View {
    let text: String; let selected: Bool
    public init(_ text: String, selected: Bool = false) { self.text = text; self.selected = selected }
    public var body: some View {
        Text(text).font(Sunnah.Typography.tag)
            .padding(.horizontal, Sunnah.Spacing.s3).padding(.vertical, Sunnah.Spacing.s1)
            .foregroundStyle(selected ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.primary)
            .background(selected ? Sunnah.Colors.primary : Sunnah.Colors.primarySoft, in: Capsule())
    }
}

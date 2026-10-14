import SwiftUI

/// رقاقة: المختارة خضراء، وغيرها بيضاء بحد #E6DFCF.
public struct SunnahChip: View {
    let text: String; let selected: Bool
    public init(_ text: String, selected: Bool = false) { self.text = text; self.selected = selected }
    public var body: some View {
        Text(text).font(Sunnah.Typography.tag)
            .padding(.horizontal, 16).frame(minHeight: 38)
            .foregroundStyle(selected ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary)
            .background(selected ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(selected ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: 1))
    }
}

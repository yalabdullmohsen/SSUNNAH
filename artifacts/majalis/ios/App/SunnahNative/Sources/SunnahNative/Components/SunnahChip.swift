import SwiftUI

/// رقاقة: المختارة خضراء، وغيرها بيضاء بحد #E6DFCF.
public struct SunnahChip: View {
    let text: String; let selected: Bool
    public init(_ text: String, selected: Bool = false) { self.text = text; self.selected = selected }
    /// الرقاقة لا تُرسم إن كان نصها فارغًا أو مسافات (حتى لا تظهر كبسولة بيضاء بلا كتابة).
    public static func isRenderable(_ text: String) -> Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    @ViewBuilder public var body: some View {
        if Self.isRenderable(text) { chip }
    }
    private var chip: some View {
        Text(text).font(Sunnah.Typography.tag)
            .padding(.horizontal, 16).frame(minHeight: 38)
            .foregroundStyle(selected ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary)
            .background(selected ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(selected ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: 1))
    }
}

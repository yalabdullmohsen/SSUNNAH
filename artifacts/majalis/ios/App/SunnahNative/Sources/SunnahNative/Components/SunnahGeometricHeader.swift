import SwiftUI

/// ترويسة بالنمط الهندسي الإسلامي (الأخضر + `SunnahStarPattern`) باسم الصفحة وسطر ثانوي اختياري.
public struct SunnahGeometricHeader: View {
    let title: String; var subtitle: String?; var height: CGFloat
    public init(title: String, subtitle: String? = nil, height: CGFloat = 96) { self.title = title; self.subtitle = subtitle; self.height = height }
    public var body: some View {
        ZStack(alignment: .bottomLeading) {
            Sunnah.Colors.primary
            SunnahStarPattern().accessibilityHidden(true)
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textOnPrimary)
                if let subtitle, !subtitle.isEmpty { Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textOnPrimary.opacity(0.85)) }
            }
            .padding(Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s4)
        }
        .frame(maxWidth: .infinity).frame(height: height).clipped()
        .accessibilityElement(children: .combine).accessibilityAddTraits(.isHeader)
        .accessibilityIdentifier("geometricHeader")
    }
}

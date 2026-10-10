import SwiftUI

public struct SunnahListRow: View {
    let title: String; let subtitle: String?
    public init(title: String, subtitle: String? = nil) { self.title = title; self.subtitle = subtitle }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let subtitle { Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2) }
            }
            Spacer(minLength: Sunnah.Spacing.s2)
            Image(systemName: "chevron.forward").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
        }
        .frame(minHeight: Sunnah.Spacing.touch)
        .padding(.vertical, Sunnah.Spacing.s2)
        .contentShape(Rectangle())
    }
}

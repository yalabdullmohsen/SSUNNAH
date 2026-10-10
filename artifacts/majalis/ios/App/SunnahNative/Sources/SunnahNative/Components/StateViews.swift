import SwiftUI

public struct EmptyStateView: View {
    let title: String
    public init(title: String = "لا يوجد محتوى بعد") { self.title = title }
    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            Image(systemName: "tray").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textSecondary)
            Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
        }
        .frame(maxWidth: .infinity).padding(Sunnah.Spacing.s6)
        .accessibilityElement(children: .combine)
    }
}

public struct LoadingStateView: View {
    public init() {}
    public var body: some View {
        ProgressView().tint(Sunnah.Colors.primary)
            .frame(maxWidth: .infinity).padding(Sunnah.Spacing.s6)
            .accessibilityLabel("جارٍ التحميل")
    }
}

public struct ErrorStateView: View {
    let retry: (() -> Void)?
    public init(retry: (() -> Void)? = nil) { self.retry = retry }
    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            Image(systemName: "exclamationmark.triangle").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.danger)
            Text("تعذّر تحميل المحتوى").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            if let retry { SunnahButton("إعادة المحاولة", style: .secondary, action: retry) }
        }
        .frame(maxWidth: .infinity).padding(Sunnah.Spacing.s6)
    }
}

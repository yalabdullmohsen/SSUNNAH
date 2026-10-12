import SwiftUI

private struct RowChevronKey: EnvironmentKey { static let defaultValue = true }

extension EnvironmentValues {
    /// يُضبط على `false` داخل `SunnahNavigationLink` فلا يرسم الصف سهمًا ثانيًا فوق مؤشر النظام.
    var sunnahRowChevron: Bool {
        get { self[RowChevronKey.self] }
        set { self[RowChevronKey.self] = newValue }
    }
}

/// بديل `NavigationLink` للقوائم: يمنع `SunnahListRow` في وسمه من رسم سهمه (النظام يرسم مؤشر الانتقال).
/// استعمله دائمًا بدل `NavigationLink` مع `SunnahListRow`؛ `scripts/native-lint-chevron.sh` يفشل عند المخالفة.
public struct SunnahNavigationLink<Destination: View, Label: View>: View {
    let destination: Destination; let label: Label
    public init(@ViewBuilder destination: () -> Destination, @ViewBuilder label: () -> Label) {
        self.destination = destination(); self.label = label()
    }
    public var body: some View {
        NavigationLink { destination } label: { label.environment(\.sunnahRowChevron, false) }
    }
}

public struct SunnahListRow: View {
    @Environment(\.sunnahRowChevron) private var envChevron
    let title: String; let subtitle: String?; let showsChevron: Bool?
    /// `showsChevron` اختياري للاستثناء اليدوي فقط؛ الأصل أن يقرر السياق (`SunnahNavigationLink` يخفيه، `Button` يُظهره).
    public init(title: String, subtitle: String? = nil, showsChevron: Bool? = nil) {
        self.title = title; self.subtitle = subtitle; self.showsChevron = showsChevron
    }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let subtitle { Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2) }
            }
            Spacer(minLength: Sunnah.Spacing.s2)
            if showsChevron ?? envChevron { Image(systemName: "chevron.forward").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
        }
        .frame(minHeight: Sunnah.Spacing.touch)
        .padding(.vertical, Sunnah.Spacing.s2)
        .contentShape(Rectangle())
    }
}

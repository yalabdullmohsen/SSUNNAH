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

/// رابط بقيمة Route (للروابط داخل النص مثل مرجع الآية) — يمرّ من هنا لتبقى NavigationLink الخام محصورة في هذا الملف.
public struct SunnahValueLink<Value: Hashable, Label: View>: View {
    let value: Value; let label: Label
    public init(value: Value, @ViewBuilder label: () -> Label) { self.value = value; self.label = label() }
    public var body: some View {
        NavigationLink(value: value) { label.environment(\.sunnahRowChevron, false) }
    }
}

public struct SunnahListRow: View {
    @Environment(\.sunnahRowChevron) private var envChevron
    let title: String; let subtitle: String?; let showsChevron: Bool?; let icon: String?
    /// `showsChevron` اختياري للاستثناء اليدوي فقط؛ الأصل أن يقرر السياق (`SunnahNavigationLink` يخفيه، `Button` يُظهره).
    /// `icon` (SF Symbol) أو نص قصير (رقم) يُرسم في مربع أخضر فاتح 40×40.
    public init(title: String, subtitle: String? = nil, showsChevron: Bool? = nil, icon: String? = nil) {
        self.title = title; self.subtitle = subtitle; self.showsChevron = showsChevron; self.icon = icon
    }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            if let icon {
                Group {
                    if icon.count <= 3 && icon.first?.isLetter != true || icon.count <= 2 { Text(icon.arabicDigits).font(Sunnah.Typography.cardTitle) }
                    else { Image(systemName: icon).font(.system(size: 17, weight: .semibold)) }
                }
                .frame(width: 40, height: 40)
                .foregroundStyle(Sunnah.Colors.primary)
                .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: 13, style: .continuous))
            }
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(title.arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let subtitle { Text(subtitle.arabicDigits).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2) }
            }
            Spacer(minLength: Sunnah.Spacing.s2)
            if showsChevron ?? envChevron { Image(systemName: "chevron.forward").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
        }
        .frame(minHeight: Sunnah.Spacing.touch)
        .padding(.vertical, Sunnah.Spacing.s2)
        .contentShape(Rectangle())
    }
}

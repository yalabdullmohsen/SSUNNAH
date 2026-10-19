import SwiftUI

/// عنصر معلومة: أيقونة + عنوان صغير + قيمة. القيمة الفارغة لا تُعرض.
public struct SunnahInfoItem: Identifiable {
    public let id: String
    public let icon: String
    public let label: String
    public let value: String?
    public init(icon: String, label: String, value: String?) { self.id = label; self.icon = icon; self.label = label; self.value = value }
}

/// شبكة معلومات موحّدة لكل شاشات التفاصيل (الشيخ، الموعد، المكان، الحضور…): عمودان على الجوال وعمود واحد مع الخط الكبير.
public struct SunnahInfoGrid: View {
    let items: [SunnahInfoItem]
    @Environment(\.dynamicTypeSize) private var typeSize
    public init(_ items: [SunnahInfoItem]) { self.items = items.filter { !($0.value ?? "").trimmingCharacters(in: .whitespaces).isEmpty } }

    public var body: some View {
        if !items.isEmpty {
            let columns = typeSize.isAccessibilitySize
                ? [GridItem(.flexible(), spacing: Sunnah.Spacing.s3, alignment: .top)]
                : [GridItem(.adaptive(minimum: 150), spacing: Sunnah.Spacing.s3, alignment: .top)]
            LazyVGrid(columns: columns, alignment: .leading, spacing: Sunnah.Spacing.s3) {
                ForEach(items) { cell($0) }
            }
        }
    }

    private func cell(_ item: SunnahInfoItem) -> some View {
        HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
            Image(systemName: item.icon).font(.system(size: 18, weight: .regular))
                .foregroundStyle(Sunnah.Colors.primary).frame(width: 24).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(item.label).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                Text((item.value ?? "").arabicDigits).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(Sunnah.Spacing.s3)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .accessibilityElement(children: .combine)
    }
}

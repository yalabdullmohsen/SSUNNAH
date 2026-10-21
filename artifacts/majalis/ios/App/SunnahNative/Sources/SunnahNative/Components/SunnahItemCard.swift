import SwiftUI

/// بطاقة عنصر قابلة للّمس: أيقونة + عنوان + سطر ثانوي + سهم؛ بديل صف القائمة في المكتبة والبحث.
struct SunnahItemCard: View {
    let title: String; var subtitle: String? = nil; var symbol: String = "doc.text"; var gold = false
    var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            SunnahIconTile(symbol, tone: gold ? .gold : .mint, size: 40)
            VStack(alignment: .leading, spacing: 2) {
                Text(title.arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(2).multilineTextAlignment(.leading)
                if let s = subtitle, s.contains(where: { $0.isLetter || $0.isNumber }) {
                    Text(s.arabicDigits).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2).multilineTextAlignment(.leading)
                }
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.forward").font(.system(size: 13, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
        }
        .padding(Sunnah.Spacing.s3)
        .frame(maxWidth: .infinity, minHeight: 64, alignment: .leading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: Sunnah.Spacing.hairline))
        .contentShape(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

/// عمود بطاقات قابل للتمرير بهامش الصفحة، مع عناوين مجموعات اختيارية عبر `SunnahCardGroupHeader`.
struct SunnahCardStack<Content: View>: View {
    @ViewBuilder let content: () -> Content
    var body: some View {
        ScrollView {
            LazyVStack(spacing: Sunnah.Spacing.s2) { content() }
                .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s3)
        }
        .background(Sunnah.Colors.bg)
    }
}

/// عنوان مجموعة نتائج مع عددها.
struct SunnahCardGroupHeader: View {
    let title: String; var count: Int? = nil
    var body: some View {
        HStack {
            Text(title.arabicDigits).font(Sunnah.Typography.secondary.weight(.bold)).foregroundStyle(Sunnah.Colors.primary).accessibilityAddTraits(.isHeader)
            Spacer()
            if let count { Text(Sunnah.digits("\(count)")).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
        }
        .padding(.top, Sunnah.Spacing.s3).padding(.horizontal, 4)
    }
}

import SwiftUI

/// عدّ تنازلي بصيغة «٠٣:١٢:٤٠» بأرقام عربية؛ يُمرَّر له الفارق محسوبًا من محرك المواقيت (عرض فقط، لا حساب مواقيت).
public enum SunnahClockFormat {
    public static func countdown(_ interval: TimeInterval) -> String {
        let total = max(0, Int(interval.rounded(.down)))
        return Sunnah.digits(String(format: "%02d:%02d:%02d", total / 3600, total % 3600 / 60, total % 60))
    }
}

/// حلقة تقدّم: مسار نعناعي + قوس أخضر، والمحتوى في الوسط. تُستعمل في الورد والعدّادات.
public struct SunnahProgressRing<Center: View>: View {
    let value: Double; let lineWidth: CGFloat; let size: CGFloat; let center: Center
    public init(value: Double, lineWidth: CGFloat = 10, size: CGFloat = 120, @ViewBuilder center: () -> Center) {
        self.value = value; self.lineWidth = lineWidth; self.size = size; self.center = center()
    }
    public var body: some View {
        ZStack {
            Circle().stroke(Sunnah.Colors.primarySoft, lineWidth: lineWidth)
            Circle().trim(from: 0, to: min(max(value, 0), 1))
                .stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
            center
        }
        .frame(width: size, height: size)
    }
}

/// بطاقة تقدّم: أيقونة وعنوان فوق حلقة وصف سطري، بإطار البطاقات القياسي (زاوية 26 وحد 1).
public struct SunnahProgressCard<Content: View>: View {
    let title: String; let symbol: String; let tone: SunnahIconTile.Tone; let content: Content
    public init(_ title: String, symbol: String, tone: SunnahIconTile.Tone = .mint, @ViewBuilder content: () -> Content) {
        self.title = title; self.symbol = symbol; self.tone = tone; self.content = content()
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                SunnahIconTile(symbol, tone: tone, size: 38)
                Text(title).font(AppearancePrefs.ui(.extraBold, 17, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer(minLength: 0)
            }
            .accessibilityElement(children: .combine).accessibilityAddTraits(.isHeader)
            content
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .sunnahElevation()
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

/// رقم إحصائي صغير (قيمة كبيرة فوق وصف) لصفوف التقدّم.
public struct SunnahStatCell: View {
    let value: String; let label: String
    public init(_ value: String, _ label: String) { self.value = value; self.label = label }
    public var body: some View {
        VStack(spacing: 2) {
            Text(value).font(AppearancePrefs.ui(.extraBold, 20, .title3)).foregroundStyle(Sunnah.Colors.primary).minimumScaleFactor(0.7).lineLimit(1)
            Text(label).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }
}

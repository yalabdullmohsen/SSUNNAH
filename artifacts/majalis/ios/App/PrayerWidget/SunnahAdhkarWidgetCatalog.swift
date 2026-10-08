import SwiftUI
import SunnahWidgetKit
import WidgetKit

struct MorningAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarMorning
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarCollectionView(
                entry: entry,
                title: entry.adhkar?.morningTitleAr ?? "أذكار الصباح",
                action: entry.adhkar?.morningActionAr ?? "ابدأ ورد الصباح",
                url: SunnahWidgetDeepLinkFactory.adhkar(collection: "morning")
            )
        }
        .configurationDisplayName("أذكار الصباح")
        .description("مدخل سريع لورد أذكار الصباح.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct EveningAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarEvening
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarCollectionView(
                entry: entry,
                title: entry.adhkar?.eveningTitleAr ?? "أذكار المساء",
                action: entry.adhkar?.eveningActionAr ?? "ابدأ ورد المساء",
                url: SunnahWidgetDeepLinkFactory.adhkar(collection: "evening")
            )
        }
        .configurationDisplayName("أذكار المساء")
        .description("مدخل سريع لورد أذكار المساء.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct TimeAwareAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarTimeAware
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            TimeAwareAdhkarView(entry: entry)
        }
        .configurationDisplayName("أذكار الوقت")
        .description("يعرض الذكر المناسب للوقت: صباح أو مساء أو نوم أو بعد الصلاة.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct RotatingAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarRotating
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            RotatingAdhkarView(entry: entry)
        }
        .configurationDisplayName("ذكر اليوم")
        .description("ذكر معتمد قصير يتجدد مع اليوم لا مع كل دقيقة.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct AdhkarStreakWidget: Widget {
    let kind = SunnahWidgetKind.adhkarStreak
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarStreakView(entry: entry)
        }
        .configurationDisplayName("سلسلة الأذكار")
        .description("إنجاز اليوم وعدد أيام السلسلة المتتالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkarStreak)
    }
}

private struct AdhkarSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

struct AdhkarCollectionView: View {
    let entry: CatalogWidgetEntry
    let title: String
    let action: String
    let url: URL

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline.bold())
                .foregroundStyle(.white)
            Text(action)
                .font(.subheadline)
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            Spacer(minLength: 0)
        }
        .padding(12)
        .modifier(AdhkarSurface())
        .environment(\.layoutDirection, .rightToLeft)
        .widgetURL(url)
        .accessibilityLabel("\(title). \(action)")
    }
}

struct TimeAwareAdhkarView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        let collection = entry.adhkar?.activeCollection ?? "morning"
        let title = entry.adhkar?.activeTitleAr ?? "أذكار الصباح"
        VStack(alignment: .leading, spacing: 8) {
            Text("أذكار الوقت")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            Text(title)
                .font(.title3.bold())
                .foregroundStyle(.white)
            Text("من أذكار سُنّة")
                .font(.caption)
                .foregroundStyle(SunnahWidgetTheme.secondaryText)
        }
        .padding(12)
        .modifier(AdhkarSurface())
        .environment(\.layoutDirection, .rightToLeft)
        .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: collection))
        .accessibilityLabel(title)
    }
}

struct RotatingAdhkarView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.adhkar?.rotatingCollection ?? "ذكر")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            Text(entry.adhkar?.rotatingText ?? "افتح سُنّة لعرض الذكر")
                .font(.headline)
                .foregroundStyle(.white)
                .minimumScaleFactor(0.7)
                .lineLimit(4)
            if let source = entry.adhkar?.rotatingSource {
                Text(source)
                    .font(.caption2)
                    .foregroundStyle(SunnahWidgetTheme.tertiaryText)
            }
        }
        .padding(12)
        .modifier(AdhkarSurface())
        .environment(\.layoutDirection, .rightToLeft)
        .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
        .accessibilityLabel(entry.adhkar?.rotatingText ?? "ذكر")
    }
}

struct AdhkarStreakView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    /// الوحدة وحدها (بلا الرقم) تحت العدد الكبير: يوم / يومان / أيام / يومًا.
    private func streakUnit(_ n: Int) -> String {
        WidgetFormat.days(n).split(separator: " ", maxSplits: 1).last.map(String.init) ?? "يوم"
    }

    var body: some View {
        Group {
            if let progress = entry.progress, progress.hasCanonicalTracking {
                if family == .accessoryCircular {
                    VStack(spacing: 2) {
                        Text(SunnahWidgetTimeFormatting.arabic(progress.adhkarStreakDays ?? 0))
                            .font(.headline.bold())
                        Text(streakUnit(progress.adhkarStreakDays ?? 0))
                            .font(.caption2)
                    }
                } else if family == .accessoryRectangular {
                    HStack {
                        Text(todayLabel)
                        Spacer()
                        Text("سلسلة \(WidgetFormat.days(progress.adhkarStreakDays ?? 0))")
                    }
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("أذكار اليوم")
                            .font(.caption.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                        Text(todayLabel)
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text("السلسلة \(WidgetFormat.days(progress.adhkarStreakDays ?? 0))")
                            .font(.title2.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    }
                    .padding(12)
                }
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لتسجيل ورد الأذكار")
            }
        }
        .modifier(AdhkarSurface())
        .environment(\.layoutDirection, .rightToLeft)
        .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
        .accessibilityLabel(todayLabel)
    }

    private var todayLabel: String {
        guard let progress = entry.progress else { return "لا تتبع بعد" }
        if progress.morningAdhkarDone && progress.eveningAdhkarDone {
            return "صباح ومساء مكتملان"
        }
        if progress.morningAdhkarDone { return "أذكار الصباح مكتملة" }
        if progress.eveningAdhkarDone { return "أذكار المساء مكتملة" }
        return "لم يُسجَّل ورد اليوم"
    }
}

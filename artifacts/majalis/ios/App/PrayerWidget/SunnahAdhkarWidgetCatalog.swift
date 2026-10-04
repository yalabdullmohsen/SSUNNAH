import SwiftUI
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
        .description("المجموعة المعتمدة حسب نافذة التطبيق: صباح أو مساء أو نوم أو بعد الصلاة.")
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
            Text(title)
                .font(.title3.bold())
                .foregroundStyle(.white)
            Text("من التصنيف المعتمد في سُنّة")
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

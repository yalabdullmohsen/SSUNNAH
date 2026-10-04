import SwiftUI
import WidgetKit

struct DailyHadithWidget: Widget {
    let kind = SunnahWidgetKind.contentHadith
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            SpotlightContentView(
                title: "حديث اليوم",
                text: entry.content?.hadithText,
                source: entry.content?.hadithSource,
                empty: "افتح سُنّة لعرض الحديث المعتمد"
            )
            .environment(\.layoutDirection, .rightToLeft)
            .widgetURL(SunnahWidgetDeepLinkFactory.hadith())
        }
        .configurationDisplayName("حديث اليوم")
        .description("حديث قصير معتمد مع ذكر المصدر.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct DailyFaidahWidget: Widget {
    let kind = SunnahWidgetKind.contentFaidah
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            SpotlightContentView(
                title: "فائدة اليوم",
                text: entry.content?.faidahText,
                source: entry.content?.faidahSource,
                empty: "افتح سُنّة لعرض الفائدة"
            )
            .environment(\.layoutDirection, .rightToLeft)
            .widgetURL(SunnahWidgetDeepLinkFactory.fawaid())
        }
        .configurationDisplayName("فائدة اليوم")
        .description("فائدة إسلامية موجزة من محتوى سُنّة المعتمد.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct DailyDuaWidget: Widget {
    let kind = SunnahWidgetKind.contentDua
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            SpotlightContentView(
                title: "دعاء اليوم",
                text: entry.content?.duaText,
                source: entry.content?.duaSource,
                empty: "افتح سُنّة لعرض الدعاء"
            )
            .environment(\.layoutDirection, .rightToLeft)
            .widgetURL(SunnahWidgetDeepLinkFactory.dua())
        }
        .configurationDisplayName("دعاء اليوم")
        .description("دعاء معتمد لليوم مع المصدر إن وُجد.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct SpotlightContentView: View {
    let title: String
    let text: String?
    let source: String?
    let empty: String

    var body: some View {
        Group {
            if let text, !text.isEmpty, text != empty {
                VStack(alignment: .leading, spacing: 8) {
                    Text(title)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    Text(text)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.7)
                        .lineLimit(6)
                    if let source, !source.isEmpty {
                        Text(source)
                            .font(.caption2)
                            .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                    }
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: empty)
            }
        }
        .modifier(SpotlightSurface())
        .accessibilityLabel("\(title). \(text ?? empty)")
    }
}

private struct SpotlightSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradientDeep }
        } else {
            content.background(SunnahWidgetTheme.homeGradientDeep)
        }
    }
}

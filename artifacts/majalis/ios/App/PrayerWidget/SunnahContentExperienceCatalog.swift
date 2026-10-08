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
        .description("حديث قصير مع ذكر المصدر.")
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
        .description("فائدة إسلامية موجزة من محتوى سُنّة.")
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
        .description("دعاء لليوم مع المصدر إن وُجد.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct SpotlightContentView: View {
    @Environment(\.widgetFamily) private var family
    let title: String
    let text: String?
    let source: String?
    let empty: String

    /// حجم الخط وعدد الأسطر حسب مساحة الويدجت — حتى لا يُقطع النص الشرعي وسطه بلا تنبيه.
    private var bodyFont: Font {
        switch family {
        case .systemSmall: return .caption
        case .systemLarge: return .title3
        default: return .subheadline
        }
    }
    private var bodyLineLimit: Int {
        switch family {
        case .systemSmall: return 9
        case .systemLarge: return 14
        default: return 6
        }
    }
    /// عدد الأحرف التقريبي الذي يتسع كاملًا؛ ما فوقه يُعلَّم بأن التتمة في التطبيق.
    private var fitsCharacters: Int {
        switch family {
        case .systemSmall: return 110
        case .systemLarge: return 420
        default: return 230
        }
    }

    var body: some View {
        Group {
            if let text, !text.isEmpty, text != empty {
                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    Text(text)
                        .font(bodyFont)
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.75)
                        .lineLimit(bodyLineLimit)
                    if text.count > fitsCharacters {
                        Text("تتمة النص في التطبيق")
                            .font(.caption2.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    }
                    Spacer(minLength: 0)
                    if let source, !source.isEmpty {
                        Text(source)
                            .font(.caption2)
                            .foregroundStyle(SunnahWidgetTheme.secondaryText)
                            .lineLimit(family == .systemSmall ? 2 : 3)
                            .minimumScaleFactor(0.8)
                    }
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: empty)
            }
        }
        .modifier(SpotlightSurface())
        .accessibilityLabel("\(title). \(text ?? empty). \(source ?? "")")
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

import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct CustomContentWidget: Widget {
    let kind = SunnahWidgetKind.custom
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: SelectCustomContentIntent.self,
            provider: CustomContentIntentProvider()
        ) { entry in
            CustomContentView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(entry.itemURL)
        }
        .configurationDisplayName("محتوى اختياري")
        .description("آية أو حديث أو ذكر أو دعاء تختاره من سُنّة.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct CustomContentStaticWidget: Widget {
    let kind = SunnahWidgetKind.custom
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            CustomContentView(catalog: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.url(path: entry.custom?.items.first?.deepLinkPath ?? "/prayer-times"))
        }
        .configurationDisplayName("محتوى اختياري")
        .description("اختر المحتوى من إعدادات الويدجت بعد التحديث.")
        .supportedFamilies(SunnahWidgetFamilySupport.custom)
    }
}

struct CustomContentView: View {
    var item: SharedCustomContentItem?
    var showSource: Bool = true
    var compact: Bool = false
    var isSample: Bool = false

    init(entry: CustomIntentEntry) {
        self.item = entry.item
        self.showSource = entry.showSource
        self.compact = entry.compactText
        self.isSample = entry.isSample
    }

    init(catalog: CatalogWidgetEntry) {
        self.item = catalog.custom?.items.first
        self.showSource = true
        self.compact = false
        self.isSample = catalog.isSampleData
    }

    var body: some View {
        Group {
            if let item {
                VStack(alignment: .leading, spacing: 8) {
                    Text(item.titleAr)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    Text(item.text)
                        .font(compact ? .caption : .headline)
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.7)
                    if showSource, let source = item.source, !source.isEmpty {
                        Text(source)
                            .font(.caption2)
                            .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                    }
                    if isSample {
                        Text("معاينة")
                            .font(.caption2)
                            .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                    }
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: "اختر المحتوى من إعدادات الويدجت")
            }
        }
        .modifier(CustomSurface())
        .accessibilityLabel(item.map { "\($0.titleAr) \($0.text)" } ?? "اختر المحتوى من إعدادات الويدجت")
    }
}

private struct CustomSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradientDeep }
        } else {
            content.background(SunnahWidgetTheme.homeGradientDeep)
        }
    }
}

struct CustomIntentEntry: TimelineEntry {
    let date: Date
    let item: SharedCustomContentItem?
    let showSource: Bool
    let compactText: Bool
    let isSample: Bool

    var itemURL: URL {
        if let path = item?.deepLinkPath, !path.isEmpty {
            return SunnahWidgetDeepLinkFactory.url(path: path)
        }
        return SunnahWidgetDeepLinkFactory.widgetHelp()
    }
}

@available(iOS 17.0, *)
struct CustomContentIntentProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> CustomIntentEntry {
        placeholder(for: SelectCustomContentIntent())
    }

    func placeholder(for configuration: SelectCustomContentIntent) -> CustomIntentEntry {
        CustomIntentEntry(
            date: Date(),
            item: SunnahWidgetPreviewFixtures.custom.items.first,
            showSource: true,
            compactText: false,
            isSample: true
        )
    }

    func snapshot(for configuration: SelectCustomContentIntent, in context: Context) async -> CustomIntentEntry {
        if context.isPreview {
            return placeholder(for: configuration)
        }
        return live(for: configuration, allowsSampleFallback: true)
    }

    func timeline(for configuration: SelectCustomContentIntent, in context: Context) async -> Timeline<CustomIntentEntry> {
        let entry = live(for: configuration, allowsSampleFallback: false)
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(12 * 3600)))
    }

    private func live(for configuration: SelectCustomContentIntent, allowsSampleFallback: Bool) -> CustomIntentEntry {
        let payload = CustomContentWidgetAdapter.payload()
        let id = configuration.content?.id
        let item = payload?.items.first(where: { $0.id == id }) ?? payload?.items.first
        if item == nil && allowsSampleFallback {
            return placeholder(for: configuration)
        }
        return CustomIntentEntry(
            date: Date(),
            item: item,
            showSource: configuration.showSource,
            compactText: configuration.compactText,
            isSample: false
        )
    }
}

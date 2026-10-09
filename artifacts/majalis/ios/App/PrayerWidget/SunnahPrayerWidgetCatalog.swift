import SwiftUI
import SunnahWidgetKit
import WidgetKit

struct AllPrayerTimesWidget: Widget {
    let kind = SunnahWidgetKind.prayerAll
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            AllPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("مواقيت اليوم")
        .description("مواقيت الصلوات كلها في قائمة واحدة.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerAll)
    }
}

private struct CatalogSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

private struct PrayerCardShell<Content: View>: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry
    let label: String
    @ViewBuilder let content: Content

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahCalmCard(compact: family == .accessoryRectangular)
                    .foregroundStyle(SunnahWidgetTheme.primaryText)
            } else {
                content
            }
        }
        .modifier(CatalogSurface())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
    }
}

struct AllPrayerCatalogView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        PrayerCardShell(entry: entry, label: "مواقيت اليوم") {
            PrayerSixGrid(entry: entry)
                .foregroundStyle(SunnahWidgetTheme.primaryText)
                .sunnahCardLayout(16)
        }
    }
}


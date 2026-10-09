import SunnahWidgetKit
import SwiftUI
import WidgetKit

struct MushafContinueWidget: Widget {
    let kind = SunnahWidgetKind.mushafContinue
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            MushafContinueView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(mushafContinueURL(entry))
        }
        .configurationDisplayName("المصحف")
        .description("تابع القراءة من آخر موضع وصلتَ إليه.")
        .supportedFamilies(SunnahWidgetFamilySupport.mushaf)
    }
}

private func mushafContinueURL(_ entry: CatalogWidgetEntry) -> URL {
    SunnahWidgetDeepLinkFactory.mushaf(page: entry.mushaf?.lastPage)
}

private struct QuranSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradientDeep }.sunnahDynamicTypeCap()
        } else {
            content.background(SunnahWidgetTheme.homeGradientDeep).sunnahDynamicTypeCap()
        }
    }
}

struct MushafContinueView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let mushaf = entry.mushaf, mushaf.hasProgress, let page = mushaf.lastPage {
                SunnahMushafPositionCard(surah: mushaf.lastSurahNameAr, page: page, cue: "تابع")
                    .sunnahCardLayout(14)
            } else {
                SunnahCalmCard(symbol: "book.closed", phrase: "افتح سُنّة")
            }
        }
        .modifier(QuranSurface())
        .accessibilityLabel(continueA11y)
    }

    private var continueA11y: String {
        guard let mushaf = entry.mushaf, mushaf.hasProgress, let page = mushaf.lastPage else {
            return "افتح سُنّة"
        }
        return "تابع المصحف صفحة \(WidgetFormat.digits(page))"
    }
}


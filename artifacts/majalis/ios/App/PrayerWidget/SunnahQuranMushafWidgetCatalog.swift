import SunnahWidgetKit
import SwiftUI
import WidgetKit

struct QuranAyahWidget: Widget {
    let kind = SunnahWidgetKind.quranAyah
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            QuranAyahView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(quranURL(entry))
        }
        .configurationDisplayName("آية")
        .description("آية من القرآن الكريم مع اسم السورة ورقم الآية.")
        .supportedFamilies(SunnahWidgetFamilySupport.quran)
    }
}

struct MushafContinueWidget: Widget {
    let kind = SunnahWidgetKind.mushafContinue
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            MushafContinueView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(mushafContinueURL(entry))
        }
        .configurationDisplayName("متابعة المصحف")
        .description("آخر موضع قراءة وصلتَ إليه في المصحف.")
        .supportedFamilies(SunnahWidgetFamilySupport.mushaf)
    }
}

struct MushafBookmarkWidget: Widget {
    let kind = SunnahWidgetKind.mushafBookmark
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            MushafBookmarkView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(mushafBookmarkURL(entry))
        }
        .configurationDisplayName("إشارة المصحف")
        .description("الإشارة التي اخترتها في سُنّة.")
        .supportedFamilies(SunnahWidgetFamilySupport.mushaf)
    }
}

struct QuranDailyGoalWidget: Widget {
    let kind = SunnahWidgetKind.quranGoal
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            QuranDailyGoalView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.quranHub())
        }
        .configurationDisplayName("هدف القرآن")
        .description("عدد الصفحات التي قرأتها اليوم من هدفك.")
        .supportedFamilies(SunnahWidgetFamilySupport.quranGoal)
    }
}

struct MushafProgressWidget: Widget {
    let kind = SunnahWidgetKind.mushafProgress
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            MushafProgressView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(mushafContinueURL(entry))
        }
        .configurationDisplayName("رحلة المصحف")
        .description("موضع القراءة الحالي ونسبة الإتمام المحفوظة.")
        .supportedFamilies(SunnahWidgetFamilySupport.mushaf)
    }
}

struct MushafQuickOpenWidget: Widget {
    let kind = SunnahWidgetKind.mushafQuickOpen
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            MushafQuickOpenView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(mushafContinueURL(entry))
        }
        .configurationDisplayName("افتح المصحف")
        .description("هدف كبير يفتح آخر موضع قراءة مباشرة.")
        .supportedFamilies(SunnahWidgetFamilySupport.mushafQuickOpen)
    }
}

private func quranURL(_ entry: CatalogWidgetEntry) -> URL {
    if let path = entry.quran?.deepLinkPath, !path.isEmpty {
        return SunnahWidgetDeepLinkFactory.url(path: path)
    }
    return SunnahWidgetDeepLinkFactory.mushaf(page: entry.quran?.page)
}

private func mushafContinueURL(_ entry: CatalogWidgetEntry) -> URL {
    SunnahWidgetDeepLinkFactory.mushaf(page: entry.mushaf?.lastPage)
}

private func mushafBookmarkURL(_ entry: CatalogWidgetEntry) -> URL {
    let ayah: String? = {
        guard let s = entry.mushaf?.bookmarkSurahNumber, let a = entry.mushaf?.bookmarkAyahNumber else { return nil }
        return "\(s):\(a)"
    }()
    return SunnahWidgetDeepLinkFactory.mushaf(page: entry.mushaf?.bookmarkPage, ayah: ayah)
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

struct QuranAyahView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: homeBody,
            standBy: StandByDailyQuranView(entry: entry)
        )
        .modifier(QuranSurface())
        .accessibilityLabel(entry.quran.map { "آية \($0.ayahNumber) من سورة \($0.surahNameAr). \($0.ayahText)" } ?? "الآية غير متاحة")
    }

    @ViewBuilder
    private var homeBody: some View {
        if let quran = entry.quran, !quran.ayahText.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text(quran.ayahText)
                    .font(.headline)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.leading)
                    .lineLimit(family == .systemLarge ? 14 : 6)
                    .minimumScaleFactor(0.6)
                Text("سورة \(quran.surahNameAr) · آية \(SunnahWidgetTimeFormatting.arabic(quran.ayahNumber))")
                    .font(.caption.bold())
                    .foregroundStyle(SunnahBrandColors.gold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                    .widgetAccentable()
            }
            .sunnahCardLayout()
        } else {
            SunnahWidgetEmptyState(message: "افتح سُنّة لعرض الآية")
        }
    }
}

struct MushafContinueView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let mushaf = entry.mushaf, mushaf.hasProgress, let page = mushaf.lastPage {
                VStack(alignment: .leading, spacing: 6) {
                    Text("متابعة القراءة")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    if let name = mushaf.lastSurahNameAr {
                        Text(name)
                            .font(.title3.bold())
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    Text("صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                        .font(.headline)
                        .foregroundStyle(.white)
                }
                .sunnahCardLayout(12)
            } else {
                SunnahWidgetEmptyState(message: "ابدأ القراءة")
            }
        }
        .modifier(QuranSurface())
        .accessibilityLabel(continueA11y)
    }

    private var continueA11y: String {
        guard let mushaf = entry.mushaf, mushaf.hasProgress, let page = mushaf.lastPage else {
            return "ابدأ القراءة"
        }
        return "متابعة المصحف صفحة \(SunnahWidgetTimeFormatting.arabic(page))"
    }
}

struct MushafBookmarkView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let mushaf = entry.mushaf, mushaf.hasBookmark, let page = mushaf.bookmarkPage {
                VStack(alignment: .leading, spacing: 6) {
                    Text("إشارتك")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    Text(mushaf.bookmarkSurahNameAr ?? "المصحف")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                        .font(.headline)
                        .foregroundStyle(.white)
                    if let ayah = mushaf.bookmarkAyahNumber {
                        Text("آية \(SunnahWidgetTimeFormatting.arabic(ayah))")
                            .font(.caption)
                            .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    }
                }
                .sunnahCardLayout(12)
            } else {
                SunnahWidgetEmptyState(message: "اختر إشارة من المصحف")
            }
        }
        .modifier(QuranSurface())
        .accessibilityLabel(entry.mushaf?.bookmarkSurahNameAr.map { "إشارة \($0)" } ?? "لا إشارة مختارة")
    }
}

struct QuranDailyGoalView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let quran = entry.quran, quran.hasCanonicalGoal == true {
                let done = max(0, quran.pagesCompletedToday ?? 0)
                let target = max(1, quran.dailyTarget ?? 1)
                content(done: done, target: target)
            } else {
                SunnahCalmCard(symbol: "book.closed", phrase: "افتح سُنّة", compact: family == .accessoryCircular)
            }
        }
        .modifier(QuranSurface())
        .accessibilityLabel("هدف القرآن اليوم")
    }

    @ViewBuilder
    private func content(done: Int, target: Int) -> some View {
        let fraction = Double(min(done, target)) / Double(target)
        let caption = "من \(WidgetFormat.digits(target))"
        switch family {
        case .accessoryCircular:
            SunnahRingStat(value: WidgetFormat.digits(done), fraction: fraction, caption: caption, lockScreen: true)
        case .accessoryRectangular:
            HStack(spacing: 8) {
                SunnahRingStat(value: WidgetFormat.digits(done), fraction: fraction, caption: caption, lockScreen: true)
                    .frame(width: 44)
                Text("هدف القرآن \(caption)")
                    .font(WidgetType.primary(13))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        case .systemMedium:
            SunnahTwoZone {
                SunnahRingStat(value: WidgetFormat.digits(done), fraction: fraction, caption: caption)
            } secondary: {
                VStack(spacing: 6) {
                    Image(systemName: "book.fill")
                        .font(WidgetType.icon(22))
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                        .accessibilityHidden(true)
                    Text("هدف القرآن")
                        .font(WidgetType.secondary(13))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
                .frame(width: 84)
            }
            .sunnahCardLayout(12)
        default:
            SunnahRingStat(value: WidgetFormat.digits(done), fraction: fraction, caption: caption)
                .sunnahCardLayout(12)
        }
    }
}

struct MushafProgressView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let mushaf = entry.mushaf, mushaf.hasProgress, let page = mushaf.lastPage {
                VStack(alignment: .leading, spacing: 6) {
                    Text("رحلة القراءة")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    Text(mushaf.lastSurahNameAr ?? "المصحف")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                        .font(.headline)
                        .foregroundStyle(.white)
                    if let percent = mushaf.journeyPercent {
                        Text("أتممت \(SunnahWidgetTimeFormatting.arabic(percent))٪")
                            .font(.subheadline.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    }
                }
                .sunnahCardLayout(12)
            } else {
                SunnahWidgetEmptyState(message: "ابدأ القراءة ليظهر تقدّمك هنا")
            }
        }
        .modifier(QuranSurface())
        .accessibilityLabel("رحلة المصحف")
    }
}

struct MushafQuickOpenView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(spacing: 10) {
            Text("افتح المصحف")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            if let page = entry.mushaf?.lastPage {
                Text("صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundStyle(.white)
                Text(entry.mushaf?.lastSurahNameAr ?? "آخر موضع")
                    .font(.headline)
                    .foregroundStyle(.white)
            } else {
                Text("ابدأ من الفاتحة")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(14)
        .modifier(QuranSurface())
        .accessibilityLabel("افتح المصحف على آخر موضع")
        .accessibilityAddTraits(.isButton)
    }
}

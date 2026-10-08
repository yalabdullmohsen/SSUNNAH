import SwiftUI
import SunnahWidgetKit
import WidgetKit

struct CurrentPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerCurrent
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            CurrentPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("الصلاة الحالية")
        .description("الصلاة الجارية ووقت بدايتها والوقت المنقضي.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerCurrent)
    }
}

struct NextPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerNext
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            NextPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("الصلاة التالية")
        .description("الصلاة التالية ووقتها والعد التنازلي.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerNext)
    }
}

struct PreviousPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerPrevious
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PreviousPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("الصلاة السابقة")
        .description("الصلاة السابقة ووقتها والوقت المنقضي.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerPrevious)
    }
}

struct PreviousNextPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerPreviousNext
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PreviousNextPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("السابقة والتالية")
        .description("الصلاة السابقة والتالية مع العد التنازلي.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerPreviousNext)
    }
}

struct MorningPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerMorning
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            GroupedPrayerCatalogView(entry: entry, keys: [.fajr, .sunrise, .dhuhr], title: "فجر · شروق · ظهر")
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("الفجر والشروق والظهر")
        .description("مجموعة صلوات الصباح مع تمييز الحالية أو التالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerMorning)
    }
}

struct EveningPrayerWidget: Widget {
    let kind = SunnahWidgetKind.prayerEvening
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            GroupedPrayerCatalogView(entry: entry, keys: [.asr, .maghrib, .isha], title: "عصر · مغرب · عشاء")
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("العصر والمغرب والعشاء")
        .description("مجموعة صلوات المساء مع تمييز الحالية أو التالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerEvening)
    }
}

struct AllPrayerTimesWidget: Widget {
    let kind = SunnahWidgetKind.prayerAll
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            AllPrayerCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("جميع المواقيت")
        .description("الفجر حتى العشاء بتمييز الصلاة التالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerAll)
    }
}

struct PrayerHijriWidget: Widget {
    let kind = SunnahWidgetKind.prayerHijri
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PrayerHijriCatalogView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.prayer())
        }
        .configurationDisplayName("صلاة وتاريخ هجري")
        .description("التاريخ الهجري مع الصلاة التالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.prayerHijri)
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

/// جسم بطاقة صلاة موحّد (حالية/تالية/سابقة): اسم + وقت فقط، بلا عدّاد.
private struct PrayerCardBody: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry
    let key: PrayerSlotKey?
    let date: Date?
    var filled = false

    var body: some View {
        if let key {
            let tz = entry.displayTimeZone
            switch family {
            case .accessoryInline:
                Text("\(key.nameAr) \(date.map { WidgetFormat.time($0, timeZone: tz) } ?? "")")
            case .accessoryRectangular:
                SunnahTwoZone {
                    if let date {
                        PrayerTimeText(date: date, timeZone: tz, size: 24)
                    }
                } secondary: {
                    VStack(spacing: 2) {
                        Image(systemName: key.symbol(filled: filled))
                            .font(WidgetType.icon(16))
                            .widgetAccentable()
                            .accessibilityHidden(true)
                        Text(key.nameAr)
                            .font(WidgetType.secondary(13))
                            .lineLimit(1)
                            .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    }
                }
            default:
                PrayerNameTime(key: key, date: date, timeZone: tz,
                               nameSize: family == .systemSmall ? 20 : 24,
                               timeSize: family == .systemSmall ? 22 : 28, filled: filled)
                    .foregroundStyle(SunnahWidgetTheme.primaryText)
                    .sunnahCardLayout(14)
            }
        } else {
            SunnahCalmCard(compact: family == .accessoryRectangular)
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

struct CurrentPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: PrayerCardShell(entry: entry, label: label) {
                PrayerCardBody(entry: entry, key: entry.currentKey, date: entry.currentStartDate, filled: true)
            },
            standBy: StandByCurrentPrayerView(entry: entry)
        )
    }

    private var label: String {
        guard let key = entry.currentKey else { return "افتح سُنّة" }
        return "الصلاة الحالية \(key.nameAr)"
    }
}

struct NextPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: PrayerCardShell(entry: entry, label: PrayerCounterA11y.label(entry)) {
                PrayerCardBody(entry: entry, key: entry.nextKey, date: entry.nextDate)
            },
            standBy: StandByPrayerCountdownView(entry: entry)
        )
    }
}

struct PreviousPrayerCatalogView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        PrayerCardShell(entry: entry, label: "الصلاة السابقة \(entry.previousNameAr ?? "")") {
            PrayerCardBody(entry: entry, key: entry.previousKey ?? entry.currentKey,
                           date: entry.previousDate ?? entry.currentStartDate)
        }
    }
}

/// تقدّم اليوم: مقياس نظيف بين الصلاة السابقة والتالية وتحته وقتاهما.
struct PreviousNextPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        PrayerCardShell(entry: entry, label: "بين \(entry.previousNameAr ?? "") و\(entry.nextNameAr ?? "")") {
            if let prev = entry.previousDate, let next = entry.nextDate, next > prev,
               let pk = entry.previousKey, let nk = entry.nextKey {
                let tz = entry.displayTimeZone
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        endpoint(pk, prev, tz)
                        Spacer(minLength: 8)
                        endpoint(nk, next, tz)
                    }
                    PrayerDayProgressBar(entry: entry, from: prev, to: next)
                }
                .foregroundStyle(family == .accessoryRectangular ? Color.primary : SunnahWidgetTheme.primaryText)
                .sunnahCardLayout(family == .accessoryRectangular ? 0 : 14)
            } else {
                SunnahCalmCard(compact: family == .accessoryRectangular)
            }
        }
    }

    private func endpoint(_ key: PrayerSlotKey, _ date: Date, _ tz: TimeZone) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Image(systemName: key.symbol(filled: false))
                    .font(WidgetType.icon(13))
                    .widgetAccentable()
                    .accessibilityHidden(true)
                Text(key.nameAr)
                    .font(WidgetType.secondary(13))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            }
            PrayerTimeText(date: date, timeZone: tz, size: 17)
        }
    }
}

/// مجموعة صلوات (3 خلايا) بنفس مكوّن الشبكة.
struct GroupedPrayerCatalogView: View {
    let entry: PrayerWidgetEntry
    let keys: [PrayerSlotKey]
    let title: String

    var body: some View {
        PrayerCardShell(entry: entry, label: title) {
            PrayerSixGrid(entry: entry, keys: keys)
                .foregroundStyle(SunnahWidgetTheme.primaryText)
                .sunnahCardLayout(12)
        }
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

struct PrayerHijriCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        PrayerCardShell(entry: entry, label: "\(entry.hijriDateText ?? "") \(entry.focus.key?.nameAr ?? "")") {
            let tz = entry.displayTimeZone
            if let key = entry.focus.key {
                SunnahTwoZone {
                    PrayerNameTime(key: key, date: entry.focus.date, timeZone: tz,
                                   nameSize: 17, timeSize: 20, filled: entry.focus.isCurrent)
                } secondary: {
                    Text(HijriCalendar.short(HijriCalendar.date(entry.date, timeZone: tz)))
                        .font(WidgetType.secondary(13))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
                .foregroundStyle(family == .accessoryRectangular ? Color.primary : SunnahWidgetTheme.primaryText)
                .sunnahCardLayout(family == .accessoryRectangular ? 0 : 14)
            } else {
                SunnahCalmCard(compact: family == .accessoryRectangular)
            }
        }
    }
}

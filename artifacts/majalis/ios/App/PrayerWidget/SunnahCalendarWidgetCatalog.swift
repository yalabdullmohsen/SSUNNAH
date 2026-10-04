import SwiftUI
import WidgetKit

struct HijriDateWidget: Widget {
    let kind = SunnahWidgetKind.calendarHijri
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            HijriCalendarView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.occasions())
        }
        .configurationDisplayName("التاريخ الهجري")
        .description("اليوم والشهر والسنة الهجرية.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarHijri)
    }
}

struct DualDateWidget: Widget {
    let kind = SunnahWidgetKind.calendarDual
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            DualDateView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.occasions())
        }
        .configurationDisplayName("هجري وميلادي")
        .description("التاريخ الهجري والميلادي مع اسم اليوم.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarDual)
    }
}

struct TodayDateWidget: Widget {
    let kind = SunnahWidgetKind.calendarToday
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            TodayDateView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.occasions())
        }
        .configurationDisplayName("اليوم والتاريخ")
        .description("اسم اليوم مع التاريخ الهجري.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarToday)
    }
}

struct RamadanCountdownWidget: Widget {
    let kind = SunnahWidgetKind.calendarRamadan
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            RamadanCountdownView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.occasions())
        }
        .configurationDisplayName("عداد رمضان")
        .description("الأيام المتبقية لرمضان أو حالة الشهر.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarRamadan)
    }
}

struct IslamicEventWidget: Widget {
    let kind = SunnahWidgetKind.calendarEvent
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            IslamicEventView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.occasions())
        }
        .configurationDisplayName("المناسبة القادمة")
        .description("أقرب مناسبة إسلامية معتمدة وعدد الأيام المتبقية.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarEvent)
    }
}

private struct CalSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradientDeep }
        } else {
            content.background(SunnahWidgetTheme.homeGradientDeep)
        }
    }
}

private func calendarOrEmpty(_ entry: CatalogWidgetEntry) -> SharedCalendarPayload? {
    entry.calendar
}

struct HijriCalendarView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: homeBody,
            standBy: StandByHijriDateView(entry: entry)
        )
        .modifier(CalSurface())
        .accessibilityLabel(entry.calendar.map { "\($0.weekdayAr) \($0.hijriDisplay)" } ?? "التاريخ الهجري غير متاح")
    }

    @ViewBuilder
    private var homeBody: some View {
        if let cal = calendarOrEmpty(entry) {
            if family == .accessoryInline {
                Text("\(SunnahWidgetTimeFormatting.arabic(cal.hijriDay)) \(cal.hijriMonthAr)")
            } else if family == .accessoryCircular {
                VStack {
                    Text(SunnahWidgetTimeFormatting.arabic(cal.hijriDay))
                        .font(.headline.bold())
                    Text(cal.hijriMonthAr)
                        .font(.caption2)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                }
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    Text(cal.weekdayAr)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    Text(SunnahWidgetTimeFormatting.arabic(cal.hijriDay))
                        .font(.largeTitle.bold())
                        .foregroundStyle(.white)
                    Text(cal.hijriMonthAr)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(SunnahWidgetTimeFormatting.arabic(cal.hijriYear))
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                }
                .padding(12)
            }
        } else {
            SunnahWidgetEmptyState(message: "افتح سُنّة لعرض التاريخ الهجري")
        }
    }
}

struct DualDateView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                VStack(alignment: .leading, spacing: 6) {
                    Text(cal.weekdayAr)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    Text(cal.hijriDisplay)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.8)
                    Text(cal.gregorianDisplay)
                        .font(.subheadline)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لعرض التاريخ")
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(entry.calendar.map { "\($0.weekdayAr) هجري \($0.hijriDisplay) ميلادي \($0.gregorianDisplay)" } ?? "التاريخ غير متاح")
    }
}

struct TodayDateView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                VStack(alignment: .leading, spacing: 4) {
                    Text(cal.weekdayAr)
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                    Text(SunnahWidgetTimeFormatting.arabic(cal.hijriDay))
                        .font(.system(size: 42, weight: .bold))
                        .foregroundStyle(SunnahBrandColors.gold)
                    Text("\(cal.hijriMonthAr) \(SunnahWidgetTimeFormatting.arabic(cal.hijriYear))")
                        .font(.subheadline)
                        .foregroundStyle(.white)
                    Text(cal.gregorianDisplay)
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لعرض اليوم")
            }
        }
        .modifier(CalSurface())
    }
}

struct RamadanCountdownView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                VStack(alignment: .leading, spacing: 6) {
                    Text(cal.hijriDisplay)
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    if cal.inRamadan {
                        Text("رمضان مبارك")
                            .font(.title3.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                        Text("نحن في شهر رمضان")
                            .font(.subheadline)
                            .foregroundStyle(.white)
                    } else if let days = cal.daysUntilRamadan {
                        Text(SunnahWidgetTimeFormatting.arabic(days))
                            .font(.system(size: 36, weight: .bold))
                            .foregroundStyle(SunnahBrandColors.gold)
                        Text(cal.ramadanLabelAr)
                            .font(.headline)
                            .foregroundStyle(.white)
                    } else {
                        Text("افتح سُنّة لعدّ رمضان")
                            .font(.subheadline)
                            .foregroundStyle(.white)
                    }
                }
                .padding(12)
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لعدّ أيام رمضان")
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(ramadanA11y)
    }

    private var ramadanA11y: String {
        guard let cal = entry.calendar else { return "عداد رمضان غير متاح" }
        if cal.inRamadan { return "نحن في شهر رمضان" }
        if let days = cal.daysUntilRamadan {
            return "باقي \(SunnahWidgetTimeFormatting.arabic(days)) يوماً على رمضان"
        }
        return cal.ramadanLabelAr
    }
}

struct IslamicEventView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar, let name = cal.upcomingEventNameAr, !name.isEmpty {
                if family == .accessoryRectangular {
                    HStack {
                        Text(name)
                            .lineLimit(1)
                        Spacer()
                        if let days = cal.upcomingEventDays {
                            Text(days == 0 ? "اليوم" : SunnahWidgetTimeFormatting.arabic(days))
                        }
                    }
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("المناسبة القادمة")
                            .font(.caption.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                        Text(name)
                            .font(.title3.bold())
                            .foregroundStyle(.white)
                            .minimumScaleFactor(0.8)
                        if let days = cal.upcomingEventDays {
                            if days == 0 {
                                Text("اليوم")
                                    .font(.headline)
                                    .foregroundStyle(SunnahBrandColors.gold)
                            } else {
                                Text("بعد \(SunnahWidgetTimeFormatting.arabic(days)) يوماً")
                                    .font(.headline)
                                    .foregroundStyle(SunnahBrandColors.gold)
                            }
                        }
                    }
                    .padding(12)
                }
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لعرض المناسبات")
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(entry.calendar?.upcomingEventNameAr ?? "لا مناسبة قادمة")
    }
}

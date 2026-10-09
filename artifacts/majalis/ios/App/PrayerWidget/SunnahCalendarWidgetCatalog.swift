import SwiftUI
import SunnahWidgetKit
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
        .description("أقرب مناسبة إسلامية وعدد الأيام المتبقية.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarEvent)
    }
}

private struct CalSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

private let calInk = SunnahWidgetTheme.primaryText

/// سطر نص واحد لا يُقصّ: يصغَّر حتى 0.8 ثم يبقى مقروءًا.
private func calLine(_ text: String, _ font: Font) -> some View {
    Text(text)
        .font(font)
        .lineLimit(1)
        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
}

private extension SharedCalendarPayload {
    var monthYear: String { "\(hijriMonthAr) \(WidgetFormat.digits(hijriYear))" }
    var dayMonth: String { "\(WidgetFormat.digits(hijriDay)) \(hijriMonthAr)" }

    /// ميلادي قصير بأرقام لاتينية من الحقول المنظَّمة (لا من نص جاهز قد يحمل أرقامًا هندية).
    func gregorianShort(fallback: Date) -> String {
        if let d = gregorianDay, let m = gregorianMonth, let y = gregorianYear,
           (1...12).contains(m) {
            return "\(WidgetFormat.digits(d)) \(WidgetFormat.gregorianMonthsAr[m]) \(WidgetFormat.digits(y))"
        }
        return WidgetFormat.gregorian(fallback, timeZone: TimeZone(identifier: timezoneIdentifier) ?? .current)
    }
}

private struct CalEmpty: View {
    var compact = false
    var body: some View {
        SunnahCalmCard(symbol: "calendar", compact: compact).foregroundStyle(calInk)
    }
}

/// عدد كبير + وحدته الصغيرة (142 يومًا) بلا صيغة «أشهر وأيام».
private struct CalBigDays: View {
    let days: Int
    let size: CGFloat

    var body: some View {
        switch days {
        case ...0: calLine("اليوم", WidgetType.primary(size * 0.7))
        case 1: calLine("غدًا", WidgetType.primary(size * 0.7))
        default:
            VStack(alignment: .leading, spacing: 0) {
                calLine(WidgetFormat.digits(days), WidgetType.primary(size))
                calLine(WidgetFormat.dayUnit(days), WidgetType.secondary(15))
            }
        }
    }
}

// MARK: - الهجري

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
        .accessibilityLabel(entry.calendar.map { "\($0.weekdayAr) \($0.dayMonth) \(WidgetFormat.digits($0.hijriYear))" } ?? "افتح سُنّة")
    }

    @ViewBuilder
    private var homeBody: some View {
        if let cal = entry.calendar {
            switch family {
            case .accessoryInline:
                Text(cal.dayMonth)
            case .accessoryCircular:
                ZStack {
                    AccessoryWidgetBackground()
                    VStack(spacing: 0) {
                        Text(WidgetFormat.digits(cal.hijriDay))
                            .font(WidgetType.primary(20))
                            .widgetAccentable()
                        calLine(cal.hijriMonthAr, WidgetType.secondary(WidgetType.minSize))
                    }
                    .padding(.horizontal, 2)
                }
            case .accessoryRectangular:
                SunnahTwoZone {
                    VStack(alignment: .leading, spacing: 0) {
                        calLine(cal.hijriMonthAr, WidgetType.primary(15))
                        calLine(WidgetFormat.digits(cal.hijriYear), WidgetType.secondary(13))
                    }
                } secondary: {
                    Text(WidgetFormat.digits(cal.hijriDay))
                        .font(WidgetType.primary(26))
                        .widgetAccentable()
                }
            case .systemMedium:
                SunnahTwoZone {
                    VStack(alignment: .leading, spacing: 2) {
                        calLine(WidgetFormat.digits(cal.hijriDay), WidgetType.primary(46))
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                        calLine(cal.monthYear, WidgetType.primary(17))
                    }
                } secondary: {
                    VStack(alignment: .leading, spacing: 2) {
                        calLine(cal.weekdayAr, WidgetType.primary(15))
                        calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(13))
                    }
                    .frame(width: 104, alignment: .leading)
                }
                .foregroundStyle(calInk)
                .sunnahCardLayout(14)
            default:
                VStack(alignment: .leading, spacing: 2) {
                    calLine(cal.weekdayAr, WidgetType.secondary(13))
                    calLine(WidgetFormat.digits(cal.hijriDay), WidgetType.primary(48))
                        .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    calLine(cal.monthYear, WidgetType.primary(16))
                    Spacer(minLength: 0)
                    calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(13))
                }
                .foregroundStyle(calInk)
                .sunnahCardLayout(14)
            }
        } else {
            CalEmpty(compact: family == .accessoryRectangular)
        }
    }
}

// MARK: - هجري وميلادي

struct DualDateView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                switch family {
                case .accessoryInline:
                    Text("\(cal.dayMonth)")
                case .accessoryRectangular:
                    SunnahTwoZone {
                        VStack(alignment: .leading, spacing: 0) {
                            calLine(cal.dayMonth, WidgetType.primary(15))
                            calLine(WidgetFormat.digits(cal.hijriYear), WidgetType.secondary(13))
                        }
                    } secondary: {
                        calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(13))
                            .frame(width: 84, alignment: .leading)
                    }
                case .systemMedium:
                    SunnahTwoZone {
                        VStack(alignment: .leading, spacing: 2) {
                            calLine(cal.weekdayAr, WidgetType.secondary(13))
                            calLine(cal.dayMonth, WidgetType.primary(24))
                            calLine(WidgetFormat.digits(cal.hijriYear), WidgetType.secondary(15))
                        }
                    } secondary: {
                        calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(15))
                            .frame(width: 110, alignment: .leading)
                    }
                    .foregroundStyle(calInk)
                    .sunnahCardLayout(14)
                default:
                    VStack(alignment: .leading, spacing: 2) {
                        calLine(cal.weekdayAr, WidgetType.secondary(13))
                        calLine(cal.dayMonth, WidgetType.primary(22))
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                        calLine(WidgetFormat.digits(cal.hijriYear), WidgetType.secondary(13))
                        Spacer(minLength: 0)
                        calLine(cal.gregorianShort(fallback: entry.date), WidgetType.primary(15))
                    }
                    .foregroundStyle(calInk)
                    .sunnahCardLayout(14)
                }
            } else {
                CalEmpty(compact: family == .accessoryRectangular)
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(entry.calendar.map { "\($0.weekdayAr) \($0.dayMonth) \(WidgetFormat.digits($0.hijriYear)) الموافق \($0.gregorianShort(fallback: entry.date))" } ?? "افتح سُنّة")
    }
}

// MARK: - اليوم

struct TodayDateView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                if family == .systemMedium {
                    SunnahTwoZone {
                        VStack(alignment: .leading, spacing: 0) {
                            calLine(cal.weekdayAr, WidgetType.primary(22))
                            calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(15))
                        }
                    } secondary: {
                        VStack(alignment: .leading, spacing: 0) {
                            calLine(WidgetFormat.digits(cal.hijriDay), WidgetType.primary(40))
                                .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                            calLine(cal.monthYear, WidgetType.secondary(13))
                        }
                        .frame(width: 120, alignment: .leading)
                    }
                    .foregroundStyle(calInk)
                    .sunnahCardLayout(14)
                } else {
                    VStack(alignment: .leading, spacing: 2) {
                        calLine(cal.weekdayAr, WidgetType.primary(20))
                        calLine(WidgetFormat.digits(cal.hijriDay), WidgetType.primary(40))
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                        calLine(cal.monthYear, WidgetType.secondary(13))
                        Spacer(minLength: 0)
                        calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(13))
                    }
                    .foregroundStyle(calInk)
                    .sunnahCardLayout(14)
                }
            } else {
                CalEmpty()
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(entry.calendar.map { "\($0.weekdayAr) \($0.dayMonth) \(WidgetFormat.digits($0.hijriYear))" } ?? "افتح سُنّة")
    }
}

// MARK: - رمضان

struct RamadanCountdownView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar {
                if cal.inRamadan {
                    inRamadan(cal)
                } else if let days = cal.daysUntilRamadan {
                    untilRamadan(days)
                } else {
                    CalEmpty()
                }
            } else {
                CalEmpty()
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(ramadanA11y)
    }

    @ViewBuilder
    private func untilRamadan(_ days: Int) -> some View {
        if family == .systemMedium {
            SunnahTwoZone {
                CalBigDays(days: days, size: 48).foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
            } secondary: {
                calLine("حتى رمضان", WidgetType.primary(17))
                    .frame(width: 104, alignment: .leading)
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        } else {
            VStack(alignment: .leading, spacing: 4) {
                CalBigDays(days: days, size: 44).foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                Spacer(minLength: 0)
                calLine("حتى رمضان", WidgetType.primary(15))
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        }
    }

    private func inRamadan(_ cal: SharedCalendarPayload) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            calLine(WidgetFormat.digits(cal.hijriDay), WidgetType.primary(44))
                .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
            Spacer(minLength: 0)
            calLine("رمضان", WidgetType.primary(17))
        }
        .foregroundStyle(calInk)
        .sunnahCardLayout(14)
    }

    private var ramadanA11y: String {
        guard let cal = entry.calendar else { return "افتح سُنّة" }
        if cal.inRamadan { return "اليوم \(WidgetFormat.digits(cal.hijriDay)) من رمضان" }
        if let days = cal.daysUntilRamadan { return "باقي \(WidgetFormat.days(days)) على رمضان" }
        return "افتح سُنّة"
    }
}

// MARK: - المناسبة القادمة

struct IslamicEventView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let cal = entry.calendar, let name = cal.upcomingEventNameAr, !name.isEmpty,
               let days = cal.upcomingEventDays {
                content(name: name, days: days, cal: cal)
            } else {
                CalEmpty(compact: family == .accessoryRectangular)
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(a11y)
    }

    /// تاريخ المناسبة الهجري = اليوم + عدد الأيام المتبقية (يُحسب لا يُنقل نصًّا).
    private func target(_ cal: SharedCalendarPayload, days: Int) -> String {
        let tz = TimeZone(identifier: cal.timezoneIdentifier) ?? .current
        var gregorian = Calendar(identifier: .gregorian)
        gregorian.timeZone = tz
        let date = gregorian.date(byAdding: .day, value: max(0, days), to: entry.date) ?? entry.date
        return HijriCalendar.short(HijriCalendar.date(date, timeZone: tz))
    }

    @ViewBuilder
    private func content(name: String, days: Int, cal: SharedCalendarPayload) -> some View {
        switch family {
        case .accessoryRectangular:
            SunnahTwoZone {
                calLine(name, WidgetType.primary(15))
            } secondary: {
                calLine(WidgetFormat.daysUntil(days), WidgetType.primary(15))
                    .widgetAccentable()
                    .frame(width: 72, alignment: .leading)
            }
        case .systemMedium:
            SunnahTwoZone {
                VStack(alignment: .leading, spacing: 4) {
                    calLine(name, WidgetType.primary(22))
                    calLine(target(cal, days: days), WidgetType.secondary(13))
                }
            } secondary: {
                CalBigDays(days: days, size: 40)
                    .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    .frame(width: 96, alignment: .leading)
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        default:
            VStack(alignment: .leading, spacing: 4) {
                calLine(name, WidgetType.primary(18))
                CalBigDays(days: days, size: 40).foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                Spacer(minLength: 0)
                calLine(target(cal, days: days), WidgetType.secondary(13))
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        }
    }

    private var a11y: String {
        guard let cal = entry.calendar, let name = cal.upcomingEventNameAr, let days = cal.upcomingEventDays else { return "افتح سُنّة" }
        return "\(name) \(WidgetFormat.daysUntil(days))"
    }
}

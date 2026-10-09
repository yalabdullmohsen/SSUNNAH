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
        .configurationDisplayName("التاريخ")
        .description("التاريخ الهجري والميلادي واسم اليوم.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarHijri)
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
        .configurationDisplayName("رمضان والمناسبات")
        .description("الأيام المتبقية لرمضان وأقرب مناسبة.")
        .supportedFamilies(SunnahWidgetFamilySupport.calendarRamadan)
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
    var inRamadan = false

    var body: some View {
        if inRamadan {
            VStack(alignment: .leading, spacing: 0) {
                calLine(WidgetFormat.digits(days), WidgetType.primary(size))
                calLine("من رمضان", WidgetType.secondary(15))
            }
        } else {
            plain
        }
    }

    @ViewBuilder
    private var plain: some View {
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
                    Spacer(minLength: 4)
                    Divider().opacity(0.35)
                    calLine(cal.gregorianShort(fallback: entry.date), WidgetType.secondary(13))
                        .padding(.top, 2)
                }
                .foregroundStyle(calInk)
                .sunnahCardLayout(14)
            }
        } else {
            CalEmpty(compact: family == .accessoryRectangular)
        }
    }
}

// MARK: - رمضان والمناسبات

/// الأقرب زمنيًا: رمضان أو أقرب مناسبة. داخل رمضان يُعرض يوم الشهر.
struct RamadanCountdownView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    private struct Pick {
        let name: String
        let days: Int
        let inRamadan: Bool
    }

    private var pick: Pick? {
        guard let cal = entry.calendar else { return nil }
        if cal.inRamadan { return Pick(name: "رمضان", days: cal.hijriDay, inRamadan: true) }
        let ramadan = cal.daysUntilRamadan
        if let name = cal.upcomingEventNameAr, !name.isEmpty, let d = cal.upcomingEventDays,
           ramadan.map({ d < $0 }) ?? true {
            return Pick(name: name, days: d, inRamadan: false)
        }
        return ramadan.map { Pick(name: "رمضان", days: $0, inRamadan: false) }
    }

    var body: some View {
        Group {
            if let p = pick {
                content(p)
            } else {
                CalEmpty(compact: family == .accessoryRectangular)
            }
        }
        .modifier(CalSurface())
        .accessibilityLabel(a11y)
    }

    private func nameText(_ name: String, _ size: CGFloat) -> some View {
        Text(name)
            .font(WidgetType.primary(size))
            .lineLimit(2)
            .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            .fixedSize(horizontal: false, vertical: true)
    }

    private func countLine(_ p: Pick) -> String {
        p.inRamadan ? "اليوم \(WidgetFormat.digits(p.days))" : WidgetFormat.days(p.days)
    }

    @ViewBuilder
    private func content(_ p: Pick) -> some View {
        switch family {
        case .accessoryRectangular:
            SunnahTwoZone {
                calLine(p.name, WidgetType.primary(15))
            } secondary: {
                calLine(countLine(p), WidgetType.primary(15))
                    .widgetAccentable()
                    .frame(width: 84, alignment: .leading)
            }
        case .systemMedium:
            SunnahTwoZone {
                VStack(alignment: .leading, spacing: 4) {
                    nameText(p.name, 22)
                    if !p.inRamadan {
                        calLine(WidgetFormat.daysUntil(p.days), WidgetType.secondary(13))
                    }
                }
            } secondary: {
                CalBigDays(days: p.days, size: 44, inRamadan: p.inRamadan)
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
                    .frame(width: 104, alignment: .leading)
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        default:
            VStack(alignment: .leading, spacing: 4) {
                nameText(p.name, 18)
                Spacer(minLength: 0)
                CalBigDays(days: p.days, size: 44, inRamadan: p.inRamadan)
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
            }
            .foregroundStyle(calInk)
            .sunnahCardLayout(14)
        }
    }

    private var a11y: String {
        guard let p = pick else { return "افتح سُنّة" }
        return p.inRamadan ? "اليوم \(WidgetFormat.digits(p.days)) من رمضان" : "\(p.name) \(WidgetFormat.daysUntil(p.days))"
    }
}

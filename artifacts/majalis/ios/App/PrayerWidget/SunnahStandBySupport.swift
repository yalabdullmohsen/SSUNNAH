import SwiftUI
import SunnahWidgetKit
import WidgetKit

/// Dedicated StandBy layouts. Do not stretch Home Screen cards.
enum SunnahStandBySupport {
    static func isStandByFamily(_ family: WidgetFamily) -> Bool {
        switch family {
        case .accessoryInline, .accessoryCircular, .accessoryRectangular:
            return false
        default:
            return true
        }
    }
}

struct SunnahStandBySwitch<Home: View, StandBy: View>: View {
    let family: WidgetFamily
    let home: Home
    let standBy: StandBy

    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            SunnahStandByEnvironmentSwitch(family: family, home: home, standBy: standBy)
        } else {
            home
        }
    }
}

@available(iOSApplicationExtension 17.0, *)
private struct SunnahStandByEnvironmentSwitch<Home: View, StandBy: View>: View {
    @Environment(\.showsWidgetContainerBackground) private var showsBackground
    let family: WidgetFamily
    let home: Home
    let standBy: StandBy

    var body: some View {
        if SunnahStandBySupport.isStandByFamily(family) && !showsBackground {
            standBy
        } else {
            home
        }
    }
}

struct StandByPrayerCountdownView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let key = entry.focus.key {
                PrayerNameTime(key: key, date: entry.focus.date, timeZone: entry.displayTimeZone,
                               nameSize: 24, timeSize: 20, filled: entry.focus.isCurrent)
                    .foregroundStyle(SunnahWidgetTheme.primaryText)
                SunnahCounterFace(entry: entry, size: 44)
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
            } else {
                SunnahCalmCard()
                    .foregroundStyle(SunnahWidgetTheme.primaryText)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel(PrayerCounterA11y.label(entry))
    }
}

/// StandBy للصلاة الحالية: نفس الوجه الموحّد؛ العدّ التصاعدي يأتي من المحرك لنافذة الـ30 دقيقة فقط.
struct StandByCurrentPrayerView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        StandByPrayerCountdownView(entry: entry)
    }
}

struct StandByDailyQuranView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        SunnahAyahCard(quran: entry.quran, large: true)
            .accessibilityLabel(entry.quran.map { "آية \(WidgetFormat.digits($0.ayahNumber)) من سورة \($0.surahNameAr)" } ?? "آية اليوم")
    }
}

struct StandByHijriDateView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        if let cal = entry.calendar {
            VStack(alignment: .leading, spacing: 4) {
                Text(cal.weekdayAr)
                    .font(WidgetType.secondary(20))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                Text(WidgetFormat.digits(cal.hijriDay))
                    .font(WidgetType.primary(64))
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
                Text("\(cal.hijriMonthAr) \(WidgetFormat.digits(cal.hijriYear))")
                    .font(WidgetType.primary(24))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            }
            .foregroundStyle(SunnahWidgetTheme.primaryText)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(16)
            .accessibilityLabel("\(cal.weekdayAr) \(WidgetFormat.digits(cal.hijriDay)) \(cal.hijriMonthAr) \(WidgetFormat.digits(cal.hijriYear))")
        } else {
            SunnahCalmCard(symbol: "calendar").foregroundStyle(SunnahWidgetTheme.primaryText)
        }
    }
}

struct StandByTodayInSunnahView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("اليوم في سُنّة")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            Text(entry.prayer.nextDisplayName ?? entry.prayer.currentNameAr ?? "الصلاة")
                .font(.largeTitle.bold())
                .foregroundStyle(.white)
            PrayerCountdownText(entry: entry.prayer)
                .font(.title.monospacedDigit().bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            Text(entry.progress?.currentAdhkarTitleAr ?? entry.adhkar?.activeTitleAr ?? "أذكار الوقت")
                .font(.title3)
                .foregroundStyle(.white)
            if let mushaf = entry.mushaf, let page = mushaf.lastPage {
                Text("المصحف · صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                    .font(.headline)
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
            } else {
                Text("هدف القراءة جاهز في سُنّة")
                    .font(.headline)
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel("اليوم في سُنّة")
    }
}

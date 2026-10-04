import SwiftUI
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
            Text(entry.nextNameAr ?? "الصلاة التالية")
                .font(.title2.bold())
                .foregroundStyle(.white)
            PrayerCountdownText(entry: entry)
                .font(.system(size: 44, weight: .bold, design: .rounded).monospacedDigit())
                .foregroundStyle(SunnahBrandColors.gold)
                .minimumScaleFactor(0.5)
            if let hijri = entry.hijriDateText {
                Text(hijri)
                    .font(.headline)
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel("العد التنازلي للصلاة التالية \(entry.nextNameAr ?? "")")
    }
}

struct StandByCurrentPrayerView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("الصلاة الحالية")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
            Text(entry.currentNameAr ?? "قبل الفجر")
                .font(.largeTitle.bold())
                .foregroundStyle(.white)
            if let start = entry.currentStartDate {
                Text(SunnahWidgetTimeFormatting.clock(start))
                    .font(.title3.monospacedDigit().bold())
                    .foregroundStyle(.white)
                PrayerElapsedText(entry: entry)
                    .font(.title2.monospacedDigit().bold())
                    .foregroundStyle(SunnahBrandColors.gold)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel("الصلاة الحالية \(entry.currentNameAr ?? "قبل الفجر")")
    }
}

struct StandByDailyQuranView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("آية اليوم")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
            Text(entry.quran?.ayahText ?? "افتح سُنّة لعرض الآية")
                .font(.title3)
                .foregroundStyle(.white)
                .minimumScaleFactor(0.6)
            if let quran = entry.quran {
                Text("سورة \(quran.surahNameAr) · آية \(SunnahWidgetTimeFormatting.arabic(quran.ayahNumber))")
                    .font(.headline)
                    .foregroundStyle(SunnahBrandColors.gold)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel(entry.quran.map { "آية \($0.ayahNumber) من سورة \($0.surahNameAr)" } ?? "آية اليوم")
    }
}

struct StandByHijriDateView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(entry.calendar?.weekdayAr ?? "اليوم")
                .font(.title3.bold())
                .foregroundStyle(SunnahBrandColors.gold)
            Text(SunnahWidgetTimeFormatting.arabic(entry.calendar?.hijriDay ?? 1))
                .font(.system(size: 56, weight: .bold))
                .foregroundStyle(.white)
            Text(entry.calendar?.hijriMonthAr ?? "التقويم الهجري")
                .font(.title2.bold())
                .foregroundStyle(.white)
            if let year = entry.calendar?.hijriYear {
                Text(SunnahWidgetTimeFormatting.arabic(year))
                    .font(.headline)
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .accessibilityLabel(entry.calendar?.hijriDisplay ?? "التاريخ الهجري")
    }
}

struct StandByTodayInSunnahView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("اليوم في سُنّة")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
            Text(entry.prayer.nextNameAr ?? entry.prayer.currentNameAr ?? "الصلاة")
                .font(.largeTitle.bold())
                .foregroundStyle(.white)
            PrayerCountdownText(entry: entry.prayer)
                .font(.title.monospacedDigit().bold())
                .foregroundStyle(SunnahBrandColors.gold)
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

struct PrayerElapsedText: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if let start = entry.currentStartDate, start <= entry.date {
            if entry.allowsLiveCountdown {
                Text(timerInterval: start...start.addingTimeInterval(36 * 3600), countsDown: false)
            } else {
                Text(SunnahWidgetTimeFormatting.staticElapsed(from: start, to: entry.date))
            }
        } else if entry.isSampleData {
            Text("مضى ٤٠ د")
        } else {
            Text("قبل الفجر")
        }
    }
}

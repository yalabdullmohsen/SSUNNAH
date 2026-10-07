import SwiftUI
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

struct CurrentPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: homeBody,
            standBy: StandByCurrentPrayerView(entry: entry)
        )
        .modifier(CatalogSurface())
        .accessibilityLabel(currentA11y)
    }

    @ViewBuilder
    private var homeBody: some View {
        if entry.needsAppOpenAction {
            SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
        } else if family == .accessoryRectangular {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.currentNameAr ?? "قبل الفجر")
                        .font(.headline)
                    if let start = entry.currentStartDate {
                        Text(SunnahWidgetTimeFormatting.clock(start))
                            .font(.caption.monospacedDigit())
                    }
                }
                Spacer()
                PrayerElapsedText(entry: entry)
                    .font(.caption.monospacedDigit().bold())
            }
        } else {
            VStack(alignment: .leading, spacing: 6) {
                Text("الحالية")
                    .font(.caption.bold())
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
                Text(entry.currentNameAr ?? "قبل الفجر")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                if let start = entry.currentStartDate {
                    Text(SunnahWidgetTimeFormatting.clock(start))
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(SunnahBrandColors.gold)
                }
                PrayerElapsedText(entry: entry)
                    .font(family == .systemMedium ? SunnahWidgetTheme.countdownFont : .caption.monospacedDigit().bold())
                    .foregroundStyle(SunnahBrandColors.gold)
            }
            .padding(12)
        }
    }

    private var currentA11y: String {
        "الصلاة الحالية \(entry.currentNameAr ?? "قبل الفجر")"
    }
}

struct NextPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: homeBody,
            standBy: StandByPrayerCountdownView(entry: entry)
        )
        .modifier(CatalogSurface())
        .accessibilityLabel(nextA11y)
    }

    @ViewBuilder
    private var homeBody: some View {
        if entry.needsAppOpenAction {
            SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
        } else if family == .accessoryInline {
            Text(entry.nextLine("التالي") ?? "الصلاة التالية")
        } else if family == .accessoryCircular {
            VStack(spacing: 2) {
                Text(entry.nextDisplayName ?? "التالي")
                    .font(.caption2.bold())
                    .lineLimit(1)
                PrayerCountdownText(entry: entry)
                    .font(.caption2.monospacedDigit())
            }
        } else if family == .systemLarge || family == .systemMedium {
            VStack(alignment: .leading, spacing: 8) {
                Text(entry.nextCaption("التالي"))
                    .font(.caption.bold())
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
                Text(entry.nextDisplayName ?? "الصلاة التالية")
                    .font(.title.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                if let date = entry.nextDate {
                    Text(SunnahWidgetTimeFormatting.clock(date))
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(.white)
                }
                PrayerCountdownText(entry: entry)
                    .font(.system(size: family == .systemLarge ? 42 : 32, weight: .bold, design: .rounded).monospacedDigit())
                    .foregroundStyle(SunnahBrandColors.gold)
                    .minimumScaleFactor(0.5)
                if let hijri = entry.hijriDateText {
                    Text(hijri)
                        .font(.subheadline)
                        .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                }
            }
            .padding(14)
        } else {
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.nextCaption("التالي"))
                    .font(.caption.bold())
                    .foregroundStyle(SunnahWidgetTheme.secondaryText)
                Text(entry.nextDisplayName ?? "الصلاة التالية")
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                if let date = entry.nextDate {
                    Text(SunnahWidgetTimeFormatting.clock(date))
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(SunnahBrandColors.gold)
                }
                PrayerCountdownText(entry: entry)
                    .font(SunnahWidgetTheme.countdownFont)
                    .foregroundStyle(SunnahBrandColors.gold)
            }
            .padding(12)
        }
    }

    private var nextA11y: String {
        if let elapsed = entry.elapsedNameAr { return "مضى على أذان \(elapsed)" }
        let name = entry.nextNameAr ?? "غير محددة"
        return "الصلاة التالية \(name)"
    }
}

struct PreviousPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
            } else if family == .accessoryInline {
                Text(entry.previousNameAr.map { "السابقة \($0)" } ?? "الصلاة السابقة")
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    Text("السابقة")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    Text(entry.previousNameAr ?? entry.currentNameAr ?? "لا صلاة سابقة")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                    if let date = entry.previousDate ?? entry.slot(for: entry.currentKey ?? .fajr)?.date {
                        Text(SunnahWidgetTimeFormatting.clock(date))
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(SunnahBrandColors.gold)
                        Text("مضى \(SunnahWidgetTimeFormatting.staticRemaining(from: date, to: entry.date))")
                            .font(.caption)
                            .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    }
                }
                .padding(12)
            }
        }
        .modifier(CatalogSurface())
        .accessibilityLabel("الصلاة السابقة \(entry.previousNameAr ?? entry.currentNameAr ?? "")")
    }
}

struct PreviousNextPrayerCatalogView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("السابقة")
                                .font(.caption2)
                                .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                            Text(entry.previousNameAr ?? "غير متاحة")
                                .font(.headline)
                                .foregroundStyle(.white)
                            if let d = entry.previousDate {
                                Text(SunnahWidgetTimeFormatting.clock(d))
                                    .font(.caption.monospacedDigit())
                                    .foregroundStyle(SunnahBrandColors.gold)
                            }
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text(entry.nextCaption("التالية"))
                                .font(.caption2)
                                .foregroundStyle(SunnahWidgetTheme.tertiaryText)
                            Text(entry.nextDisplayName ?? "الصلاة التالية")
                                .font(.headline)
                                .foregroundStyle(.white)
                            if let d = entry.nextDate {
                                Text(SunnahWidgetTimeFormatting.clock(d))
                                    .font(.caption.monospacedDigit())
                                    .foregroundStyle(SunnahBrandColors.gold)
                            }
                        }
                    }
                    PrayerCountdownText(entry: entry)
                        .font(SunnahWidgetTheme.countdownFont)
                        .foregroundStyle(SunnahBrandColors.gold)
                }
                .padding(14)
            }
        }
        .modifier(CatalogSurface())
        .accessibilityLabel("السابقة \(entry.previousNameAr ?? "") والتالية \(entry.nextNameAr ?? "")")
    }
}

struct GroupedPrayerCatalogView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerWidgetEntry
    let keys: [PrayerSlotKey]
    let title: String

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
            } else if family == .systemSmall {
                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.caption2.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    ForEach(keys, id: \.self) { key in
                        groupedRow(key)
                    }
                }
                .padding(10)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text(title)
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    HStack(spacing: 6) {
                        ForEach(keys, id: \.self) { key in
                            groupedCell(key)
                        }
                    }
                }
                .padding(14)
            }
        }
        .modifier(CatalogSurface())
    }

    @ViewBuilder
    private func groupedRow(_ key: PrayerSlotKey) -> some View {
        let slot = entry.slot(for: key)
        let isMark = entry.nextKey == key || entry.currentKey == key
        HStack {
            Text(key.nameAr)
                .font(.caption.bold())
                .foregroundStyle(.white)
            Spacer()
            if let slot {
                Text(SunnahWidgetTimeFormatting.clock(slot.date))
                    .font(.caption.monospacedDigit().bold())
                    .foregroundStyle(isMark ? SunnahBrandColors.gold : .white)
            } else {
                Text("غير متاح")
                    .font(.caption2)
                    .foregroundStyle(SunnahWidgetTheme.tertiaryText)
            }
        }
        .accessibilityLabel("\(key.nameAr) \(slot.map { SunnahWidgetTimeFormatting.clock($0.date) } ?? "غير متاح")")
    }

    @ViewBuilder
    private func groupedCell(_ key: PrayerSlotKey) -> some View {
        let slot = entry.slot(for: key)
        let isMark = entry.nextKey == key || entry.currentKey == key
        VStack(spacing: 4) {
            Text(key.nameAr)
                .font(.caption.bold())
                .foregroundStyle(.white)
            if let slot {
                Text(SunnahWidgetTimeFormatting.clock(slot.date))
                    .font(.subheadline.monospacedDigit().bold())
                    .foregroundStyle(isMark ? SunnahBrandColors.gold : .white)
            } else {
                Text("غير متاح")
                    .font(.caption2)
                    .foregroundStyle(SunnahWidgetTheme.tertiaryText)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isMark ? SunnahWidgetTheme.selectedFill : SunnahWidgetTheme.raisedSurface)
        )
        .accessibilityLabel("\(key.nameAr) \(slot.map { SunnahWidgetTimeFormatting.clock($0.date) } ?? "غير متاح")")
    }
}

struct AllPrayerCatalogView: View {
    let entry: PrayerWidgetEntry
    private let keys: [PrayerSlotKey] = [.fajr, .sunrise, .dhuhr, .asr, .maghrib, .isha]

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("مواقيت اليوم")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            ForEach(Array(keys.prefix(3)), id: \.self) { key in
                                allPrayerCell(key)
                            }
                        }
                        HStack(spacing: 8) {
                            ForEach(Array(keys.suffix(3)), id: \.self) { key in
                                allPrayerCell(key)
                            }
                        }
                    }
                }
                .padding(14)
            }
        }
        .modifier(CatalogSurface())
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func allPrayerCell(_ key: PrayerSlotKey) -> some View {
        let slot = entry.slot(for: key)
        let isMark = entry.nextKey == key || entry.currentKey == key
        VStack(spacing: 2) {
            Text(key.nameAr)
                .font(.caption2.bold())
                .foregroundStyle(.white)
            if let slot {
                Text(SunnahWidgetTimeFormatting.clock(slot.date))
                    .font(.caption.monospacedDigit().bold())
                    .foregroundStyle(isMark ? SunnahBrandColors.gold : .white)
            } else {
                Text("غير متاح")
                    .font(.caption2)
                    .foregroundStyle(SunnahWidgetTheme.tertiaryText)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isMark ? SunnahWidgetTheme.selectedFill : SunnahWidgetTheme.raisedSurface)
        )
        .accessibilityLabel("\(key.nameAr) \(slot.map { SunnahWidgetTimeFormatting.clock($0.date) } ?? "غير متاح")")
    }
}

struct PrayerHijriCatalogView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahWidgetEmptyState(message: PrayerWidgetCopy.noData)
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    if let hijri = entry.hijriDateText {
                        Text(hijri)
                            .font(.headline)
                            .foregroundStyle(SunnahBrandColors.gold)
                            .lineLimit(2)
                            .minimumScaleFactor(0.8)
                    }
                    Text(entry.nextDisplayName ?? entry.currentNameAr ?? "الصلاة التالية")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                    if let d = entry.nextDate {
                        Text(SunnahWidgetTimeFormatting.clock(d))
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.white)
                    }
                    PrayerCountdownText(entry: entry)
                        .font(.caption.monospacedDigit().bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                }
                .padding(12)
            }
        }
        .modifier(CatalogSurface())
        .accessibilityLabel("\(entry.hijriDateText ?? "") الصلاة \(entry.nextNameAr ?? "")")
    }
}

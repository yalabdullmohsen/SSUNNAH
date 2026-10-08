import SwiftUI
import WidgetKit

struct TodayInSunnahWidget: Widget {
    let kind = SunnahWidgetKind.homeToday
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            TodayInSunnahView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.home())
        }
        .configurationDisplayName("اليوم في سُنّة")
        .description("حالة الصلاة وأذكار الوقت وهدف القراءة في نظرة واحدة.")
        .supportedFamilies(SunnahWidgetFamilySupport.homeToday)
    }
}

struct TodayActionsWidget: Widget {
    let kind = SunnahWidgetKind.homeActions
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            TodayActionsView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
        }
        .configurationDisplayName("اختصارات اليوم")
        .description("اختصارات سريعة إلى الصلاة والأذكار والمصحف والقرآن.")
        .supportedFamilies(SunnahWidgetFamilySupport.homeActions)
    }
}

struct SpiritualDayWidget: Widget {
    let kind = SunnahWidgetKind.homeSpiritual
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            SpiritualDayView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .widgetURL(SunnahWidgetDeepLinkFactory.home())
        }
        .configurationDisplayName("اليوم الروحي")
        .description("أذكارك وقراءتك اليوم، والصلاة التالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.homeSpiritual)
    }
}

private struct HomeSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }.sunnahDynamicTypeCap()
        } else {
            content.background(SunnahWidgetTheme.homeGradient).sunnahDynamicTypeCap()
        }
    }
}

struct TodayInSunnahView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    var body: some View {
        SunnahStandBySwitch(
            family: family,
            home: homeBody,
            standBy: StandByTodayInSunnahView(entry: entry)
        )
        .modifier(HomeSurface())
        .accessibilityLabel(todayA11y)
    }

    @ViewBuilder
    private var homeBody: some View {
        if entry.prayer.needsAppOpenAction && entry.adhkar == nil {
            SunnahWidgetEmptyState(message: "افتح سُنّة لتظهر صلاة اليوم وأذكاره")
        } else {
            VStack(alignment: .leading, spacing: 10) {
                Text("اليوم في سُنّة")
                    .font(.caption.bold())
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.prayer.currentNameAr ?? "قبل الفجر")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                        Text(entry.prayer.nextLine("التالي") ?? "الصلاة التالية")
                            .font(.caption)
                            .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    }
                    Spacer(minLength: 8)
                    PrayerCountdownText(entry: entry.prayer)
                        .font(.headline.monospacedDigit().bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                }
                Text(entry.progress?.currentAdhkarTitleAr ?? entry.adhkar?.activeTitleAr ?? "أذكار الوقت")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                if let mushaf = entry.mushaf, let page = mushaf.lastPage {
                    Text("القراءة · صفحة \(SunnahWidgetTimeFormatting.arabic(page))")
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                } else if entry.quran?.hasCanonicalGoal == true {
                    let done = entry.quran?.pagesCompletedToday ?? 0
                    let target = entry.quran?.dailyTarget ?? 1
                    Text("هدف القراءة \(SunnahWidgetTimeFormatting.arabic(done))/\(SunnahWidgetTimeFormatting.arabic(target))")
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                } else {
                    Text("حدّد هدف القراءة في سُنّة")
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                }
            }
            .sunnahCardLayout()
        }
    }

    private var todayA11y: String {
        "اليوم في سُنّة. الصلاة \(entry.prayer.currentNameAr ?? ""). الأذكار \(entry.adhkar?.activeTitleAr ?? "")"
    }
}

struct TodayActionsView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("اختصارات")
                .font(.caption.bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                actionCell("صلاة", system: "moon.stars.fill", url: SunnahWidgetDeepLinkFactory.prayer())
                actionCell("أذكار", system: "heart.fill", url: SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
                actionCell("مصحف", system: "book.fill", url: SunnahWidgetDeepLinkFactory.mushaf(page: entry.mushaf?.lastPage))
                actionCell("قرآن", system: "text.book.closed.fill", url: SunnahWidgetDeepLinkFactory.quranHub())
            }
        }
        .sunnahCardLayout()
        .modifier(HomeSurface())
        .widgetURL(SunnahWidgetDeepLinkFactory.home())
        .accessibilityLabel("اختصارات الصلاة والأذكار والمصحف والقرآن")
    }

    @ViewBuilder
    private func actionCell(_ title: String, system: String, url: URL) -> some View {
        let label = VStack(spacing: 4) {
            Image(systemName: system)
                .font(.headline)
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
                .accessibilityHidden(true)
            Text(title)
                .font(.caption.bold())
                .foregroundStyle(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, minHeight: 44)
        .padding(.vertical, 8)
        .background(RoundedRectangle(cornerRadius: 10).fill(SunnahWidgetTheme.raisedSurface))
        .accessibilityLabel(title)
        .accessibilityAddTraits(.isButton)

        if #available(iOSApplicationExtension 17.0, *) {
            Link(destination: url) { label }
        } else {
            label
        }
    }
}

struct SpiritualDayView: View {
    let entry: CatalogWidgetEntry

    var body: some View {
        Group {
            if let progress = entry.progress, progress.hasCanonicalTracking {
                VStack(alignment: .leading, spacing: 8) {
                    Text("اليوم الروحي")
                        .font(.caption.bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    infoRow("الصلاة التالية", value: entry.prayer.nextNameAr ?? "—")
                    statusRow("الأذكار", done: progress.morningAdhkarDone || progress.eveningAdhkarDone)
                    statusRow("القراءة", done: progress.quranDone || entry.mushaf?.hasProgress == true)
                }
                .sunnahCardLayout()
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة ليظهر تقدّمك اليوم هنا")
            }
        }
        .modifier(HomeSurface())
        .accessibilityLabel("متابعة اليوم الروحي")
    }

    @ViewBuilder
    private func infoRow(_ title: String, value: String) -> some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)
            Spacer(minLength: 8)
            Text(value)
                .font(.caption.bold())
                .foregroundStyle(SunnahWidgetTheme.secondaryText)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .accessibilityElement(children: .combine)
    }

    @ViewBuilder
    private func statusRow(_ title: String, done: Bool) -> some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)
            Spacer(minLength: 8)
            Text(done ? "مكتمل" : "بانتظارك")
                .font(.caption.bold())
                .foregroundStyle(done ? SunnahBrandColors.gold : SunnahWidgetTheme.secondaryText)
        }
        .accessibilityLabel("\(title) \(done ? "مكتمل" : "بانتظارك")")
    }
}

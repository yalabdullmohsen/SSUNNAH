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
        .description("صلاة، أذكار، مصحف، قرآن — بلا فتح قائمة.")
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
        .description("إتمام الصلاة والأذكار والقراءة إن وُجد تتبع معتمد.")
        .supportedFamilies(SunnahWidgetFamilySupport.homeSpiritual)
    }
}

private struct HomeSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
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
            SunnahWidgetEmptyState(message: "افتح سُنّة لتهيئة اليوم")
        } else {
            VStack(alignment: .leading, spacing: 10) {
                Text("اليوم في سُنّة")
                    .font(.caption.bold())
                    .foregroundStyle(SunnahBrandColors.gold)
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.prayer.currentNameAr ?? "قبل الفجر")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(entry.prayer.nextLine("التالي") ?? "الصلاة التالية")
                            .font(.caption)
                            .foregroundStyle(SunnahWidgetTheme.secondaryText)
                    }
                    Spacer()
                    PrayerCountdownText(entry: entry.prayer)
                        .font(.headline.monospacedDigit().bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                }
                Text(entry.progress?.currentAdhkarTitleAr ?? entry.adhkar?.activeTitleAr ?? "أذكار الوقت")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
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
                    Text("هدف القراءة من سُنّة")
                        .font(.caption)
                        .foregroundStyle(SunnahWidgetTheme.secondaryText)
                }
            }
            .padding(14)
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
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                actionCell("صلاة", system: "moon.stars.fill", url: SunnahWidgetDeepLinkFactory.prayer())
                actionCell("أذكار", system: "heart.fill", url: SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
                actionCell("مصحف", system: "book.fill", url: SunnahWidgetDeepLinkFactory.mushaf(page: entry.mushaf?.lastPage))
                actionCell("قرآن", system: "text.book.closed.fill", url: SunnahWidgetDeepLinkFactory.quranHub())
            }
        }
        .padding(14)
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
                .accessibilityHidden(true)
            Text(title)
                .font(.caption.bold())
                .foregroundStyle(.white)
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
                    statusRow("الصلاة", done: entry.prayer.currentNameAr != nil)
                    statusRow("الأذكار", done: progress.morningAdhkarDone || progress.eveningAdhkarDone)
                    statusRow("القراءة", done: progress.quranDone || entry.mushaf?.hasProgress == true)
                }
                .padding(14)
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لتفعيل متابعة اليوم")
            }
        }
        .modifier(HomeSurface())
        .accessibilityLabel("متابعة اليوم الروحي")
    }

    @ViewBuilder
    private func statusRow(_ title: String, done: Bool) -> some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)
            Spacer()
            Text(done ? "مكتمل" : "بانتظارك")
                .font(.caption.bold())
                .foregroundStyle(done ? SunnahBrandColors.gold : SunnahWidgetTheme.secondaryText)
        }
        .accessibilityLabel("\(title) \(done ? "مكتمل" : "بانتظارك")")
    }
}

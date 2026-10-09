import SwiftUI
import SunnahWidgetKit
import WidgetKit

struct MorningAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarMorning
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarCollectionView(entry: entry, fixedCollection: "morning")
        }
        .configurationDisplayName("أذكار الصباح")
        .description("مدخل سريع لورد أذكار الصباح.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct EveningAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarEvening
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarCollectionView(entry: entry, fixedCollection: "evening")
        }
        .configurationDisplayName("أذكار المساء")
        .description("مدخل سريع لورد أذكار المساء.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct TimeAwareAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarTimeAware
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            TimeAwareAdhkarView(entry: entry)
        }
        .configurationDisplayName("أذكار الوقت")
        .description("يعرض الذكر المناسب للوقت: صباح أو مساء أو نوم أو بعد الصلاة.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct RotatingAdhkarWidget: Widget {
    let kind = SunnahWidgetKind.adhkarRotating
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HourlyAdhkarProvider()) { entry in
            RotatingAdhkarView(entry: entry)
        }
        .configurationDisplayName("ذكر اليوم")
        .description("ذكر قصير يتجدد كل ساعة.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkar)
    }
}

struct AdhkarStreakWidget: Widget {
    let kind = SunnahWidgetKind.adhkarStreak
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CatalogWidgetProvider()) { entry in
            AdhkarStreakView(entry: entry)
        }
        .configurationDisplayName("سلسلة الأذكار")
        .description("إنجاز اليوم وعدد أيام السلسلة المتتالية.")
        .supportedFamilies(SunnahWidgetFamilySupport.adhkarStreak)
    }
}


/// جدول ساعي: مدخل لكل بداية ساعة ⇒ يتغيّر الذكر في رأس الساعة دون فتح التطبيق.
struct HourlyAdhkarProvider: TimelineProvider {
    private let base = CatalogWidgetProvider()
    static let horizonHours = 6

    static func timeZone(for entry: CatalogWidgetEntry) -> TimeZone {
        let id = entry.calendar?.timezoneIdentifier ?? entry.prayer.snapshot?.timeZoneIdentifier
        return id.flatMap { TimeZone(identifier: $0) } ?? .current
    }

    func placeholder(in context: Context) -> CatalogWidgetEntry { base.placeholder(in: context) }

    func getSnapshot(in context: Context, completion: @escaping (CatalogWidgetEntry) -> Void) {
        base.getSnapshot(in: context, completion: completion)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CatalogWidgetEntry>) -> Void) {
        let now = Date()
        let first = CatalogWidgetEntry.live(now: now)
        let tz = Self.timeZone(for: first)
        let hours = AdhkarRotation.hourStarts(after: now, timeZone: tz, count: Self.horizonHours)
        let entries = [first] + hours.map { CatalogWidgetEntry.live(now: $0) }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

private struct AdhkarSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradientDeep }
        } else {
            content.background(SunnahWidgetTheme.homeGradientDeep)
        }
    }
}

/// مدخل سريع لورد الوقت: أيقونة + عنوان قصير + حالة (✓ أو «ابدأ»)، يفتح الورد مباشرة بلا إعداد.
struct AdhkarCollectionView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry
    /// يُحدَّد تلقائيًا بالوقت عند nil (صباح/مساء/نوم/بعد الصلاة).
    var fixedCollection: String?

    private var collection: String { fixedCollection ?? entry.adhkar?.activeCollection ?? "morning" }

    private var title: String {
        let a = entry.adhkar
        switch collection {
        case "morning": return a?.morningTitleAr ?? "أذكار الصباح"
        case "evening": return a?.eveningTitleAr ?? "أذكار المساء"
        case "sleep": return "أذكار النوم"
        case "after-salah": return "أذكار بعد الصلاة"
        default: return a?.activeTitleAr ?? "الأذكار"
        }
    }

    private var symbol: String {
        switch collection {
        case "morning": return "sun.max.fill"
        case "evening": return "sunset.fill"
        case "sleep": return "moon.zzz.fill"
        default: return "hands.sparkles.fill"
        }
    }

    /// الإكمال معلوم للصباح والمساء فقط (من التقدّم المعتمد)؛ غيرهما «ابدأ».
    private var isDone: Bool {
        guard let p = entry.progress, p.hasCanonicalTracking else { return false }
        switch collection {
        case "morning": return p.morningAdhkarDone
        case "evening": return p.eveningAdhkarDone
        default: return false
        }
    }

    private var status: String { isDone ? "تم" : "ابدأ" }
    private var statusSymbol: String { isDone ? "checkmark.circle.fill" : "arrow.left.circle" }

    var body: some View {
        content
            .modifier(AdhkarSurface())
            .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: collection))
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(title). \(status)")
            .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryInline:
            Text("\(title) · \(status)")
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
        case .accessoryRectangular:
            HStack(spacing: 8) {
                Image(systemName: symbol)
                    .font(WidgetType.icon(20))
                    .widgetAccentable()
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(WidgetType.primary(14))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    Text(status)
                        .font(WidgetType.secondary(12))
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        default:
            SunnahTwoZone {
                VStack(alignment: .leading, spacing: 6) {
                    Image(systemName: symbol)
                        .font(WidgetType.icon(family == .systemSmall ? 28 : 32))
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                    Text(title)
                        .font(WidgetType.primary(family == .systemSmall ? 17 : 20))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
            } secondary: {
                VStack(spacing: 4) {
                    Image(systemName: statusSymbol)
                        .font(WidgetType.icon(22))
                        .foregroundStyle(isDone ? SunnahBrandColors.gold : Color.white.opacity(0.8))
                        .widgetAccentable(isDone)
                    Text(status)
                        .font(WidgetType.secondary(13))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
            }
            .sunnahCardLayout(14)
        }
    }
}

/// الأذكار المعروضة تلقائيًا بالوقت: نفس المدخل السريع بلا اختيار يدوي.
struct TimeAwareAdhkarView: View {
    let entry: CatalogWidgetEntry
    var body: some View { AdhkarCollectionView(entry: entry) }
}

/// ذكر الساعة: ≤6 كلمات من أذكار معتمدة حرفيًا، وعنوان صغير فقط.
struct RotatingAdhkarView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    private var dhikr: String? {
        guard let a = entry.adhkar else { return nil }
        return AdhkarRotation.pick(
            from: a.rotatingPool ?? [a.rotatingText],
            at: entry.date,
            timeZone: HourlyAdhkarProvider.timeZone(for: entry)
        )
    }

    var body: some View {
        Group {
            if let dhikr {
                filled(dhikr)
            } else {
                SunnahCalmCard(symbol: "sparkles", phrase: "افتح سُنّة", compact: family == .accessoryRectangular)
            }
        }
        .modifier(AdhkarSurface())
        .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(dhikr.map { "ذكر. \($0)" } ?? "افتح سُنّة")
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func filled(_ dhikr: String) -> some View {
        switch family {
        case .accessoryInline:
            Text(dhikr)
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text("ذكر")
                    .font(WidgetType.secondary(11))
                    .widgetAccentable()
                Text(dhikr)
                    .font(WidgetType.primary(15))
                    .lineLimit(2)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        default:
            VStack(alignment: .leading, spacing: 8) {
                Text("ذكر")
                    .font(WidgetType.secondary(12))
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
                Text(dhikr)
                    .font(WidgetType.primary(family == .systemSmall ? 18 : 24))
                    .foregroundStyle(.white)
                    .lineLimit(3)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
            .sunnahCardLayout(14)
        }
    }
}

struct AdhkarStreakView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CatalogWidgetEntry

    /// الوحدة وحدها (بلا الرقم) تحت العدد الكبير: يوم / يومان / أيام / يومًا.
    private func streakUnit(_ n: Int) -> String {
        WidgetFormat.dayUnit(n)
    }

    var body: some View {
        Group {
            if let progress = entry.progress, progress.hasCanonicalTracking {
                if family == .accessoryCircular {
                    VStack(spacing: 2) {
                        Text(SunnahWidgetTimeFormatting.arabic(progress.adhkarStreakDays ?? 0))
                            .font(.headline.bold())
                        Text(streakUnit(progress.adhkarStreakDays ?? 0))
                            .font(.caption2)
                    }
                } else if family == .accessoryRectangular {
                    HStack {
                        Text(todayLabel)
                        Spacer()
                        Text("سلسلة \(WidgetFormat.streak(progress.adhkarStreakDays ?? 0))")
                    }
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("أذكار اليوم")
                            .font(.caption.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                        Text(todayLabel)
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text("السلسلة \(WidgetFormat.streak(progress.adhkarStreakDays ?? 0))")
                            .font(.title2.bold())
                            .foregroundStyle(SunnahBrandColors.gold)
                            .widgetAccentable()
                    }
                    .padding(12)
                }
            } else {
                SunnahWidgetEmptyState(message: "افتح سُنّة لتسجيل ورد الأذكار")
            }
        }
        .modifier(AdhkarSurface())
        .environment(\.layoutDirection, .rightToLeft)
        .widgetURL(SunnahWidgetDeepLinkFactory.adhkar(collection: entry.adhkar?.activeCollection ?? "morning"))
        .accessibilityLabel(todayLabel)
    }

    private var todayLabel: String {
        guard let progress = entry.progress else { return "لا تتبع بعد" }
        if progress.morningAdhkarDone && progress.eveningAdhkarDone {
            return "صباح ومساء مكتملان"
        }
        if progress.morningAdhkarDone { return "أذكار الصباح مكتملة" }
        if progress.eveningAdhkarDone { return "أذكار المساء مكتملة" }
        return "لم يُسجَّل ورد اليوم"
    }
}

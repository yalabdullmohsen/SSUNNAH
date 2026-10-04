import SwiftUI
import WidgetKit

enum SunnahWidgetFamilySupport {
    static let prayerNext: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryCircular, .accessoryRectangular,
    ]
    static let prayerPrevious: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular,
    ]
    static let prayerPreviousNext: [WidgetFamily] = [
        .systemMedium, .systemLarge, .accessoryRectangular,
    ]
    static let prayerMorning: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let prayerEvening: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let prayerAll: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let prayerHijri: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryRectangular,
    ]
    static let calendarHijri: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular, .accessoryCircular,
    ]
    static let calendarDual: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular,
    ]
    static let calendarToday: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let calendarRamadan: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let adhkar: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let custom: [WidgetFamily] = [.systemSmall, .systemMedium, .systemLarge]
    static let quran: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let mushaf: [WidgetFamily] = [.systemSmall, .systemMedium]
}

enum SunnahWidgetRegistry {
    static let platformName = "SunnahWidgetPlatform"
    static var kindCount: Int { Set(SunnahWidgetKind.allUnique).count }
}

struct SunnahWidgetChrome: ViewModifier {
    func body(content: Content) -> some View {
        content
            .environment(\.layoutDirection, .rightToLeft)
            .environment(\.locale, Locale(identifier: "ar"))
            .modifier(SunnahWidgetSurface())
    }
}

private struct SunnahWidgetSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

struct SunnahWidgetEmptyState: View {
    let message: String
    var body: some View {
        Text(message)
            .font(SunnahWidgetTheme.bodyFont)
            .foregroundStyle(SunnahWidgetTheme.primaryText)
            .multilineTextAlignment(.trailing)
            .minimumScaleFactor(0.8)
            .padding(SunnahWidgetTheme.spacingMD)
    }
}

struct SunnahWidgetErrorState: View {
    let message: String
    var body: some View {
        VStack(alignment: .leading, spacing: SunnahWidgetTheme.spacingSM) {
            Text(message)
                .font(SunnahWidgetTheme.bodyFont)
                .foregroundStyle(SunnahWidgetTheme.primaryText)
        }
        .padding(SunnahWidgetTheme.spacingMD)
    }
}

struct SunnahWidgetTimelineFactory {
    static func prayerTimeline(now: Date = Date()) -> Timeline<PrayerWidgetEntry> {
        let snapshot = SunnahSharedStore.loadCanonicalPrayer() ?? SunnahSharedStore.loadPrayer()
        let entry = PrayerWidgetEntry.make(date: now, snapshot: snapshot)
        var dates: [Date] = [now]
        if let next = entry.nextDate, next > now {
            dates.append(next)
        }
        for slot in entry.slots where slot.date > now {
            dates.append(slot.date)
        }
        let unique = Array(Set(dates)).sorted().prefix(8)
        let entries = unique.map { PrayerWidgetEntry.make(date: $0, snapshot: snapshot) }
        let policy: TimelineReloadPolicy
        if let next = entry.nextDate, next > now {
            policy = .after(next)
        } else if entry.needsAppOpenAction {
            policy = .after(now.addingTimeInterval(15 * 60))
        } else {
            policy = .after(now.addingTimeInterval(30 * 60))
        }
        return Timeline(entries: entries.isEmpty ? [entry] : Array(entries), policy: policy)
    }
}

struct CatalogWidgetEntry: TimelineEntry {
    let date: Date
    let presentation: SunnahWidgetPresentation
    let prayer: PrayerWidgetEntry
    let calendar: SharedCalendarPayload?
    let adhkar: SharedAdhkarPayload?
    let quran: SharedQuranPayload?
    let mushaf: SharedMushafPayload?
    let custom: SharedCustomContentPayload?
    let selectedCustomId: String?
    let isSampleData: Bool

    static func gallery() -> CatalogWidgetEntry {
        let prayer = PrayerWidgetEntry.galleryPreview()
        return CatalogWidgetEntry(
            date: Date(),
            presentation: .galleryPreview,
            prayer: prayer,
            calendar: SunnahWidgetPreviewFixtures.calendar,
            adhkar: SunnahWidgetPreviewFixtures.adhkar,
            quran: SunnahWidgetPreviewFixtures.quran,
            mushaf: SunnahWidgetPreviewFixtures.mushaf,
            custom: SunnahWidgetPreviewFixtures.custom,
            selectedCustomId: SunnahWidgetPreviewFixtures.custom.items.first?.id,
            isSampleData: true
        )
    }

    static func placeholder() -> CatalogWidgetEntry {
        var entry = gallery()
        entry = CatalogWidgetEntry(
            date: entry.date,
            presentation: .placeholder,
            prayer: .placeholder(),
            calendar: entry.calendar,
            adhkar: entry.adhkar,
            quran: entry.quran,
            mushaf: entry.mushaf,
            custom: entry.custom,
            selectedCustomId: entry.selectedCustomId,
            isSampleData: true
        )
        return entry
    }

    static func live(now: Date = Date(), selectedCustomId: String? = nil) -> CatalogWidgetEntry {
        let envelope = SunnahSharedStore.loadEnvelope()
        let prayerSnap = envelope?.prayerPayload ?? SunnahSharedStore.loadPrayer()
        let prayer = PrayerWidgetEntry.make(date: now, snapshot: prayerSnap)
        let presentation: SunnahWidgetPresentation = {
            if prayerSnap == nil && envelope == nil { return .liveNoData }
            return prayer.presentation
        }()
        return CatalogWidgetEntry(
            date: now,
            presentation: presentation,
            prayer: prayer,
            calendar: envelope?.calendarPayload,
            adhkar: envelope?.adhkarPayload,
            quran: envelope?.quranPayload,
            mushaf: envelope?.mushafPayload,
            custom: envelope?.customContentPayload,
            selectedCustomId: selectedCustomId,
            isSampleData: false
        )
    }
}

struct CatalogWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CatalogWidgetEntry { .placeholder() }

    func getSnapshot(in context: Context, completion: @escaping (CatalogWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.gallery())
            return
        }
        let live = CatalogWidgetEntry.live()
        if live.prayer.isGlanceable || live.calendar != nil || live.adhkar != nil {
            completion(live)
        } else {
            completion(.gallery())
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CatalogWidgetEntry>) -> Void) {
        let now = Date()
        let live = CatalogWidgetEntry.live(now: now)
        var dates = [now]
        if let next = live.prayer.nextDate, next > now { dates.append(next) }
        var cal = Calendar.current
        if let midnight = cal.nextDate(after: now, matching: DateComponents(hour: 0, minute: 1), matchingPolicy: .nextTime) {
            dates.append(midnight)
        }
        let entries = Array(Set(dates)).sorted().prefix(6).map { CatalogWidgetEntry.live(now: $0) }
        let policy: TimelineReloadPolicy = {
            if let next = live.prayer.nextDate, next > now { return .after(next) }
            if let midnight = cal.nextDate(after: now, matching: DateComponents(hour: 0, minute: 1), matchingPolicy: .nextTime) {
                return .after(midnight)
            }
            return .after(now.addingTimeInterval(6 * 3600))
        }()
        completion(Timeline(entries: Array(entries), policy: policy))
    }
}

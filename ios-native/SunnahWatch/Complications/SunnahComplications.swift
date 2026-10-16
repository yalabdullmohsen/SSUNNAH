import SwiftUI
import WidgetKit
import SunnahWidgetKit

/// Complications وSmart Stack: الصلاة التالية بالحالات الثلاث. تقرأ الحمولة المحفوظة من مجموعة الساعة.
struct PrayerEntry: TimelineEntry {
    let date: Date
    let payload: WatchPayload?
    var phase: PrayerPhase { payload?.phase(at: date) ?? .none }
}

struct PrayerProvider: TimelineProvider {
    private func load() -> WatchPayload? {
        WatchShared.suite.data(forKey: WatchShared.payloadKey).flatMap { try? JSONDecoder().decode(WatchPayload.self, from: $0) }
    }
    func placeholder(in context: Context) -> PrayerEntry { PrayerEntry(date: Date(), payload: nil) }
    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(PrayerEntry(date: Date(), payload: load()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let now = Date(), p = load()
        let dates = [now] + (p.map { PrayerPhase.boundaries(after: now, adhans: $0.adhans, window: $0.window).prefix(20) } ?? [])
        completion(Timeline(entries: dates.map { PrayerEntry(date: $0, payload: p) }, policy: .atEnd))
    }
}

struct SunnahPrayerComplication: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "SunnahWatchPrayer", provider: PrayerProvider()) { entry in
            PrayerComplicationView(entry: entry)
                .containerBackground(WatchTheme.emeraldDark, for: .widget)
                .environment(\.layoutDirection, .rightToLeft)
        }
        .configurationDisplayName("الصلاة التالية")
        .description("عدّاد الصلاة التالية والمدة المنقضية بعد الأذان.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}

private struct PrayerComplicationView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerEntry

    /// الهدف (اسم، نطاق العدّ، تصاعدي؟) حسب الحالة.
    private var target: (name: String, range: ClosedRange<Date>, up: Bool)? {
        guard let p = entry.payload else { return nil }
        switch entry.phase {
        case .before(let n): return (p.prayer(at: n)?.nameAr ?? "", entry.date...n, false)
        case .inWindow(let a, let u, _): return (p.prayer(at: a)?.nameAr ?? "", a...u, true)
        case .afterWindow(_, let n?): return (p.prayer(at: n)?.nameAr ?? "", entry.date...n, false)
        default: return nil
        }
    }

    var body: some View {
        if let t = target {
            switch family {
            case .accessoryCircular:
                ZStack {
                    AccessoryWidgetBackground()
                    VStack(spacing: 0) {
                        Text(t.name).font(.system(size: 11, weight: .bold)).widgetAccentable()
                        Text(timerInterval: t.range, countsDown: !t.up).font(.system(size: 13, weight: .bold).monospacedDigit())
                            .minimumScaleFactor(0.6).multilineTextAlignment(.center)
                    }.padding(2)
                }
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text(t.up ? "حان وقت \(t.name)" : "بقي على \(t.name)").font(.headline).widgetAccentable()
                    Text(timerInterval: t.range, countsDown: !t.up).font(.title3.monospacedDigit().bold())
                    if let h = entry.payload?.hijriDisplay { Text(h).font(.caption2).foregroundStyle(.secondary) }
                }.frame(maxWidth: .infinity, alignment: .leading)
            case .accessoryInline:
                Text("\(t.name) \(Text(timerInterval: t.range, countsDown: !t.up, showsHours: true))")
            case .accessoryCorner:
                Text(timerInterval: t.range, countsDown: !t.up).font(.system(.body).monospacedDigit().bold()).widgetAccentable()
                    .widgetLabel { Text(t.up ? "حان \(t.name)" : t.name) }
            default:
                Text(t.name)
            }
        } else {
            Image(systemName: "moon.stars.fill").widgetAccentable()
        }
    }
}

@main
struct SunnahWatchComplications: WidgetBundle {
    var body: some Widget { SunnahPrayerComplication() }
}

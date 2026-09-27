import WidgetKit
import SwiftUI

/// ودجت الشاشة الرئيسية — الصلاة القادمة (صغير/متوسط).
struct NextPrayerHomeWidget: Widget {
    let kind = "SunnahNextPrayerHome"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NextPrayerTimelineProvider()) { entry in
            NextPrayerHomeView(entry: entry)
                .modifier(SunnahWidgetBackgroundModifier())
        }
        .configurationDisplayName("الصلاة القادمة")
        .description("الوقت المتبقي للصلاة التالية — سُنّة")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

private struct SunnahWidgetBackgroundModifier: ViewModifier {
    private let paper = Color(red: 0.973, green: 0.965, blue: 0.945) // #F8F6F1

    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(for: .widget) { paper }
        } else {
            content.background(paper)
        }
    }
}

struct NextPrayerEntry: TimelineEntry {
    let date: Date
    let snapshot: SunnahWidgetSnapshot?
}

struct NextPrayerTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextPrayerEntry {
        NextPrayerEntry(date: Date(), snapshot: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (NextPrayerEntry) -> Void) {
        completion(NextPrayerEntry(date: Date(), snapshot: SunnahWidgetStore.loadSnapshot()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextPrayerEntry>) -> Void) {
        let entry = NextPrayerEntry(date: Date(), snapshot: SunnahWidgetStore.loadSnapshot())
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct NextPrayerHomeView: View {
    var entry: NextPrayerEntry

    private var ink: Color { Color(red: 0.082, green: 0.220, blue: 0.176) } // #15382D
    private var secondary: Color { Color(red: 0.282, green: 0.392, blue: 0.353) } // #48645A
    private var emerald: Color { Color(red: 0.059, green: 0.361, blue: 0.247) } // #0F5C3F

    var body: some View {
        let prayer = entry.snapshot?.prayer
        let nextName = prayer?.next?.nameAr ?? "—"
        let remain = prayer?.remainingLabel ?? "حدّث من التطبيق"
        let city = prayer?.city ?? ""
        Link(destination: URL(string: "https://www.ssunnah.com/prayer-times")!) {
            VStack(alignment: .trailing, spacing: 6) {
                Text("الصلاة القادمة")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(emerald)
                Text(nextName)
                    .font(.title2.weight(.heavy))
                    .foregroundStyle(ink)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                Text(remain)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(secondary)
                if !city.isEmpty {
                    Text(city)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(secondary)
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            .padding(14)
            .environment(\.layoutDirection, .rightToLeft)
        }
    }
}

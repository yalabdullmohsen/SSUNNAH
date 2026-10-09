import WidgetKit
import SwiftUI

/// Prayer-only home + lock screen widgets. Data: App Group `sunnah.shared.prayer.v1` only.
struct PrayerTimesWidget: Widget {
    let kind = SunnahWidgetKind.prayerTimes

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PrayerWidgetRootView(entry: entry)
        }
        .configurationDisplayName("الصلاة القادمة")
        .description("عدّ حيّ إلى الصلاة القادمة، ومنذ الأذان بعد دخول الوقت.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryInline,
            .accessoryCircular,
            .accessoryRectangular,
        ])
    }
}

#if DEBUG
struct PrayerTimesWidget_Previews: PreviewProvider {
    static var previews: some View {
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .systemLarge))
            .previewDisplayName("Large")
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .accessoryInline))
            .previewDisplayName("Inline")
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .accessoryCircular))
            .previewDisplayName("Circular")
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .accessoryRectangular))
            .previewDisplayName("Rectangular")
    }
}
#endif

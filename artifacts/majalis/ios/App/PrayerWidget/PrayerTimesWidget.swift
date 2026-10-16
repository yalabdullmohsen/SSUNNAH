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

@available(iOS 17.0, *)
struct PrayerStyledProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> PrayerStyledEntry {
        PrayerStyledEntry(base: .placeholder(), design: .classic)
    }

    func snapshot(for configuration: SelectPrayerDesignIntent, in context: Context) async -> PrayerStyledEntry {
        await withCheckedContinuation { c in
            PrayerWidgetProvider().getSnapshot(in: context) {
                c.resume(returning: PrayerStyledEntry(base: $0, design: configuration.design.design))
            }
        }
    }

    /// الجدولة هي نفسها جدولة ودجت الصلاة (PrayerWidgetProvider) بلا تعديل؛ يُضاف التصميم المختار فقط.
    func timeline(for configuration: SelectPrayerDesignIntent, in context: Context) async -> Timeline<PrayerStyledEntry> {
        await withCheckedContinuation { c in
            PrayerWidgetProvider().getTimeline(in: context) { t in
                c.resume(returning: Timeline(
                    entries: t.entries.map { PrayerStyledEntry(base: $0, design: configuration.design.design) },
                    policy: t.policy))
            }
        }
    }
}

/// ودجت الصلاة بتصاميم يختارها المستخدم (صغير/متوسط): كلاسيكي، خطاطي، السابقة، رقم كبير، السابقة والقادمة، الخمس، السابقة|القادمة.
@available(iOS 17.0, *)
struct PrayerStyledWidget: Widget {
    let kind = SunnahWidgetKind.prayerStyled

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectPrayerDesignIntent.self, provider: PrayerStyledProvider()) { entry in
            PrayerStyledRootView(entry: entry.base, design: entry.design)
        }
        .configurationDisplayName("الصلاة — تصاميم")
        .description("اختر تصميم الصلاة: كلاسيكي، خطاطي، السابقة، رقم كبير، أو الصلوات الخمس.")
        .supportedFamilies([.systemSmall, .systemMedium])
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

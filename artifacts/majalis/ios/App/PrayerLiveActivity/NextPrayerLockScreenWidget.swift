import WidgetKit
import SwiftUI

/// ودجت قفل الشاشة — دائري / مستطيل / سطر.
struct NextPrayerLockScreenWidget: Widget {
    let kind = "SunnahNextPrayerLock"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NextPrayerTimelineProvider()) { entry in
            NextPrayerLockView(entry: entry)
                .modifier(SunnahLockClearBackgroundModifier())
        }
        .configurationDisplayName("عدّاد الصلاة")
        .description("الصلاة القادمة على شاشة القفل")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

private struct SunnahLockClearBackgroundModifier: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(for: .widget) { Color.clear }
        } else {
            content
        }
    }
}

struct NextPrayerLockView: View {
    @Environment(\.widgetFamily) var family
    var entry: NextPrayerEntry

    var body: some View {
        let next = entry.snapshot?.prayer?.next?.nameAr ?? "صلاة"
        let remain = entry.snapshot?.prayer?.remainingLabel ?? "—"
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 2) {
                    Text(next)
                        .font(.caption2.weight(.bold))
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                    Text(remain)
                        .font(.caption2)
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                }
            }
            .environment(\.layoutDirection, .rightToLeft)
        case .accessoryRectangular:
            VStack(alignment: .trailing, spacing: 2) {
                Text("القادمة: \(next)")
                    .font(.headline)
                Text(remain)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
            .environment(\.layoutDirection, .rightToLeft)
        default:
            Text("\(next) · \(remain)")
                .environment(\.layoutDirection, .rightToLeft)
        }
    }
}

import SwiftUI
import WidgetKit

#if DEBUG
/// معاينات مركز الودجات بقيم placeholder فقط (لا كتابة في App Group).
struct SunnahWidgetCenterPreviews: PreviewProvider {
    static var previews: some View {
        ForEach([ColorScheme.light, .dark], id: \.self) { scheme in
            PrayerWidgetRootView(entry: .placeholder())
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .environment(\.colorScheme, scheme)
                .environment(\.layoutDirection, .rightToLeft)
                .previewDisplayName("Small \(scheme == .dark ? "داكن" : "فاتح")")
        }
        PrayerWidgetRootView(entry: .placeholder())
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .environment(\.layoutDirection, .rightToLeft)
            .previewDisplayName("Medium")
    }
}
#endif

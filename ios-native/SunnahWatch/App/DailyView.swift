import SwiftUI

/// آية اليوم ودعاء اليوم: النص من حمولة التطبيق حرفيًا، بلا تعديل.
struct DailyView: View {
    @EnvironmentObject private var store: WatchStore

    var body: some View {
        if let p = store.payload, p.ayahOfDay != nil || p.duaOfDay != nil {
            ScrollView {
                VStack(spacing: 12) {
                    if let a = p.ayahOfDay { card(title: "آية اليوم", s: a) }
                    if let d = p.duaOfDay { card(title: "دعاء اليوم", s: d) }
                }
                .padding(.horizontal, 4)
            }
        } else {
            WatchEmptyState()
        }
    }

    private func card(title: String, s: WatchPayload.Spotlight) -> some View {
        VStack(spacing: 4) {
            Text(title).font(.caption).foregroundStyle(WatchTheme.gold)
            Text(s.text).font(.body).multilineTextAlignment(.center).foregroundStyle(WatchTheme.textPrimary)
            if let src = s.source { Text(src).font(.caption2).foregroundStyle(WatchTheme.textSecondary) }
        }
        .padding(10).frame(maxWidth: .infinity)
        .background(WatchTheme.raised, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

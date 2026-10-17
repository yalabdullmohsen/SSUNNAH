import SwiftUI

@main
struct SunnahWatchApp: App {
    @StateObject private var store = WatchStore.shared

    var body: some Scene {
        WindowGroup {
            WatchRootView()
                .environmentObject(store)
                .watchRTL()
                .task {
                    #if DEBUG
                    WatchSnapshot.applyIfRequested(to: store)
                    #endif
                    store.activate()
                }
        }
    }
}

/// صفحات عمودية بالتاج: الصلاة، الأذكار، القبلة، آية/دعاء اليوم.
struct WatchRootView: View {
    @Environment(\.colorScheme) private var scheme
    @EnvironmentObject private var store: WatchStore
    #if DEBUG
    @State private var tab = WatchSnapshot.requestedTab ?? 0
    #else
    @State private var tab = 0
    #endif

    var body: some View {
        TabView(selection: $tab) {
            PrayerHomeView().tag(0)
            AdhkarListView().tag(1)
            QiblaView().tag(2)
            DailyView().tag(3)
        }
        .tabViewStyle(.verticalPage)
        .containerBackground(WatchTheme.background(scheme).opacity(1), for: .tabView)
    }
}

struct WatchEmptyState: View {
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: "iphone.and.arrow.forward").font(.title3).foregroundStyle(WatchTheme.gold)
            Text("افتح سُنّة على الآيفون للمزامنة")
                .font(.footnote).multilineTextAlignment(.center).foregroundStyle(WatchTheme.textPrimary)
        }
        .padding()
    }
}

#if DEBUG
/// لقطات الساعة: `-snapshotWatchState empty|prayer|adhkar|qibla|daily` (DEBUG فقط، لا يدخل الإصدار).
/// الحمولة مثال تجريبي بنصوص نائبة لا محتوى شرعيًا؛ تُوثَّق في PROVENANCE اللقطات.
enum WatchSnapshot {
    static var state: String? {
        let a = CommandLine.arguments
        guard let i = a.firstIndex(of: "-snapshotWatchState"), a.indices.contains(i + 1) else { return nil }
        return a[i + 1]
    }
    static var requestedTab: Int? {
        ["prayer": 0, "empty": 0, "adhkar": 1, "qibla": 2, "daily": 3][state ?? ""]
    }
    @MainActor static func applyIfRequested(to store: WatchStore) {
        guard let s = state else { return }
        store.debugSet(payload: s == "empty" ? nil : sample())
    }
    private static func sample() -> WatchPayload {
        let now = Date()
        let keys = [("fajr", "الفجر"), ("dhuhr", "الظهر"), ("asr", "العصر"), ("maghrib", "المغرب"), ("isha", "العشاء")]
        let prayers = keys.enumerated().map { i, k in
            WatchPayload.Prayer(key: k.0, nameAr: k.1, epochMs: Int64((now.timeIntervalSince1970 + Double(i - 2) * 3 * 3600 + 900) * 1000))
        }
        let items = (1...3).map { WatchPayload.Dhikr(id: "d\($0)", text: "ذكر تجريبي \($0)", count: 3, source: nil) }
        return WatchPayload(generatedAtEpochMs: Int64(now.timeIntervalSince1970 * 1000), timeZoneIdentifier: TimeZone.current.identifier,
            locationLabel: "موقع تجريبي", latitude: 21.4225, longitude: 39.8262, prayers: prayers, elapsedWindowMinutes: 30,
            hijriDisplay: nil, adhkar: [WatchPayload.AdhkarSet(id: "morning", titleAr: "أذكار الصباح", items: items)],
            ayahOfDay: WatchPayload.Spotlight(text: "نص تجريبي", source: nil), duaOfDay: WatchPayload.Spotlight(text: "نص تجريبي", source: nil))
    }
}
#endif

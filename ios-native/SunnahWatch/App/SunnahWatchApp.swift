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
                    store.activate()
                    await WatchNotifications.requestAuthorization()
                }
        }
    }
}

/// صفحات عمودية بالتاج: الصلاة، الأذكار، القبلة، آية/دعاء اليوم.
struct WatchRootView: View {
    @Environment(\.colorScheme) private var scheme
    @EnvironmentObject private var store: WatchStore

    var body: some View {
        TabView {
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

#if os(iOS)
import SwiftUI
import UIKit
import UserNotifications

/// تُعرض فقط عند رفض الإذن، وتختفي تلقائيًا إذا مُنح الإذن من الإعدادات ثم عاد المستخدم.
public struct NotificationPermissionBanner: View {
    @State private var denied = false
    @Environment(\.scenePhase) private var scenePhase

    public init() {}

    public var body: some View {
        Group {
            if denied {
                VStack(alignment: .leading, spacing: 10) {
                    Label("إشعارات الصلاة متوقفة", systemImage: "bell.slash")
                        .font(.headline)
                    Text("لن تصلك تنبيهات دخول الوقت ولا الأذان لأن الإشعارات مرفوضة لهذا التطبيق. يمكنك تفعيلها من الإعدادات.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Button("فتح الإعدادات") {
                        if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .task { await refresh() }
        .onChange(of: scenePhase) { phase in
            if phase == .active { Task { await refresh() } }
        }
    }

    private func refresh() async {
        let status = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
        denied = status == .denied
    }
}
#endif

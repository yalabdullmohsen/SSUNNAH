import Foundation
import SunnahNative

/// محوّل النشاط الحي: يفوّض إلى PrayerLiveActivityController (بلا Capacitor).
struct LiveActivityAdapter: LiveActivityControlling {
    var isSupported: Bool {
        if #available(iOS 16.2, *) { return PrayerLiveActivityController.isSupported }
        return false
    }

    func sync() async -> Bool {
        guard #available(iOS 16.2, *) else { return false }
        switch await PrayerLiveActivityController.syncFromSharedSnapshot() {
        case .started, .updated: return true
        case .disabled, .failed: return false
        }
    }

    func end() async -> Bool {
        guard #available(iOS 16.2, *) else { return false }
        return await PrayerLiveActivityController.end()
    }
}

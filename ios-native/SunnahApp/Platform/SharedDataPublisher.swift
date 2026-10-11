import Foundation
import WidgetKit
import SunnahNative

/// ينفّذ SharedDataPublishing فوق SunnahSharedStore (Shared/SunnahSharedData.swift) كما هو.
struct SharedDataPublisher: SharedDataPublishing {
    var isAvailable: Bool { SunnahAppGroup.defaults != nil }

    func publishProgress(dailyWirdCompleted: Int, dailyWirdTarget: Int, mushafPagesReadToday: Int) -> Bool {
        let snap = SharedProgressSnapshot(
            schemaVersion: SharedProgressSnapshot.currentSchema,
            dailyWirdCompleted: dailyWirdCompleted,
            dailyWirdTarget: dailyWirdTarget,
            mushafPagesReadToday: mushafPagesReadToday,
            updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
        )
        let ok = SunnahSharedStore.publishProgress(snap)
        if ok { WidgetCenter.shared.reloadTimelines(ofKind: SunnahWidgetKind.prayerTimes) }
        return ok
    }
}

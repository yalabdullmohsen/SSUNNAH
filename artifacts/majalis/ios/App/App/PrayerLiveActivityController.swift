import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif

/// نواة النشاط الحي للصلاة — بلا Capacitor (يفوّض إليها PrayerLiveActivityPlugin ويستعملها التطبيق الأصلي).
/// البيانات من App Group `sunnah.shared.prayer.v1` بلا شبكة أو إعادة حساب مواقيت.
@available(iOS 16.2, *)
public enum PrayerLiveActivityController {
    public static var isSupported: Bool { ActivityAuthorizationInfo().areActivitiesEnabled }

    static func staleDate(for state: PrayerActivityAttributes.ContentState) -> Date? {
        switch state.phase {
        case .upcoming, .active: return state.prayerTime
        case .completed: return state.nextPrayerTime
        case .appLaunch: return Date().addingTimeInterval(30 * 60)
        }
    }

    static func launchState(locationLabel: String = "") -> PrayerActivityAttributes.ContentState {
        PrayerActivityAttributes.ContentState(
            prayerName: "مواقيت الصلاة",
            prayerTime: Date().addingTimeInterval(3600),
            locationLabel: locationLabel,
            hasStarted: false,
            phase: .appLaunch,
            statusLabel: "افتح مواقيت الصلاة"
        )
    }

    @discardableResult
    static func request(prayerKey: String, state: PrayerActivityAttributes.ContentState) -> Bool {
        for activity in Activity<PrayerActivityAttributes>.activities {
            Task { await activity.end(nil, dismissalPolicy: .immediate) }
        }
        do {
            _ = try Activity<PrayerActivityAttributes>.request(
                attributes: PrayerActivityAttributes(prayerKey: prayerKey),
                content: .init(state: state, staleDate: staleDate(for: state))
            )
            return true
        } catch {
            return false
        }
    }

    static func mirrorToAppGroup(prayerKey: String, state: PrayerActivityAttributes.ContentState) {
        guard state.phase != .appLaunch else { return }
        _ = SunnahSharedStore.publishLiveActivityState(
            prayerKey: prayerKey,
            prayerNameAr: state.prayerName,
            prayerTime: state.prayerTime,
            locationLabel: state.locationLabel,
            hasStarted: state.phase == .active || state.hasStarted
        )
    }

    public static func end() async -> Bool {
        let activities = Activity<PrayerActivityAttributes>.activities
        guard !activities.isEmpty else { return false }
        for activity in activities { await activity.end(nil, dismissalPolicy: .immediate) }
        return true
    }

    enum SyncResult: Equatable { case disabled, started(PrayerLivePhase), updated(PrayerLivePhase), failed }

    /// يحدّث/يبدأ النشاط من لقطة App Group فقط.
    static func syncFromSharedSnapshot() async -> SyncResult {
        guard isSupported else { return .disabled }
        guard let snap = SunnahSharedStore.loadPrayer() else {
            return request(prayerKey: "launch", state: launchState()) ? .started(.appLaunch) : .failed
        }
        let phase: PrayerLivePhase = snap.nextHasStarted ? .active : .upcoming
        let key = snap.nextPrayerKey ?? "fajr"
        let time: Date = snap.nextPrayerEpochMs.map { Date(timeIntervalSince1970: TimeInterval($0) / 1000) }
            ?? Date().addingTimeInterval(3600)
        let state = PrayerActivityAttributes.ContentState(
            prayerName: snap.nextPrayerNameAr ?? key,
            prayerTime: time,
            locationLabel: snap.locationLabel,
            hasStarted: snap.nextHasStarted,
            phase: phase,
            statusLabel: PrayerActivityAttributes.ContentState.defaultStatus(for: phase)
        )
        if let activity = Activity<PrayerActivityAttributes>.activities.first {
            await activity.update(.init(state: state, staleDate: time))
            return .updated(phase)
        }
        return request(prayerKey: key, state: state) ? .started(phase) : .failed
    }
}

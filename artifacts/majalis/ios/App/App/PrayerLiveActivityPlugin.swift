import Foundation
import Capacitor
#if canImport(ActivityKit)
import ActivityKit
#endif

/// جسر Capacitor لـ Prayer Live Activity — حالات upcoming/active/completed/appLaunch.
/// البيانات المعروضة تتزامن مع App Group `sunnah.shared.prayer.v1` بلا طلبات شبكة.
@objc(PrayerLiveActivityPlugin)
public class PrayerLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PrayerLiveActivityPlugin"
    public let jsName = "PrayerLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "areActivitiesSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "syncFromSharedSnapshot", returnType: CAPPluginReturnPromise),
    ]

    @objc func areActivitiesSupported(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            call.resolve(["supported": PrayerLiveActivityController.isSupported])
            return
        }
        #endif
        call.resolve(["supported": false])
    }

    @objc func startActivity(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            guard PrayerLiveActivityController.isSupported else {
                call.resolve(["started": false])
                return
            }
            let phase = Self.parsePhase(call.getString("phase")) ?? .upcoming
            let locationLabel = call.getString("locationLabel") ?? ""

            if phase == .appLaunch {
                let started = PrayerLiveActivityController.request(
                    prayerKey: "launch",
                    state: PrayerLiveActivityController.launchState(locationLabel: locationLabel)
                )
                call.resolve(["started": started])
                return
            }

            guard
                let prayerKey = call.getString("prayerKey"),
                let prayerName = call.getString("prayerName"),
                let prayerTimeIso = call.getString("prayerTimeIso"),
                let prayerTime = Self.parseISO(prayerTimeIso)
            else {
                call.resolve(["started": false])
                return
            }

            let hasStarted = phase == .active || (call.getBool("hasStarted") ?? false)
            let state = PrayerActivityAttributes.ContentState(
                prayerName: prayerName,
                prayerTime: prayerTime,
                locationLabel: locationLabel,
                hasStarted: hasStarted,
                phase: phase,
                statusLabel: call.getString("statusLabel"),
                nextPrayerName: call.getString("nextPrayerName"),
                nextPrayerKey: call.getString("nextPrayerKey"),
                nextPrayerTime: Self.parseISO(call.getString("nextPrayerTimeIso"))
            )
            let started = PrayerLiveActivityController.request(prayerKey: prayerKey, state: state)
            if started {
                PrayerLiveActivityController.mirrorToAppGroup(prayerKey: prayerKey, state: state)
            }
            call.resolve(["started": started])
            return
        }
        #endif
        call.resolve(["started": false])
    }

    @objc func updateActivity(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            guard let activity = Activity<PrayerActivityAttributes>.activities.first else {
                call.resolve(["updated": false])
                return
            }
            var state = activity.content.state
            if let phase = Self.parsePhase(call.getString("phase")) {
                state.phase = phase
                state.hasStarted = (phase == .active || phase == .completed)
            } else if let hasStarted = call.getBool("hasStarted") {
                state.hasStarted = hasStarted
                state.phase = hasStarted ? .active : .upcoming
            }
            if let status = call.getString("statusLabel") {
                state.statusLabel = status
            } else {
                state.statusLabel = PrayerActivityAttributes.ContentState.defaultStatus(for: state.phase)
            }
            if let name = call.getString("prayerName") { state.prayerName = name }
            if let iso = call.getString("prayerTimeIso"), let d = Self.parseISO(iso) {
                state.prayerTime = d
            }
            if let nextName = call.getString("nextPrayerName") { state.nextPrayerName = nextName }
            if let nextKey = call.getString("nextPrayerKey") { state.nextPrayerKey = nextKey }
            if let nextIso = call.getString("nextPrayerTimeIso") {
                state.nextPrayerTime = Self.parseISO(nextIso)
            }
            if let loc = call.getString("locationLabel") { state.locationLabel = loc }

            let stale: Date? = {
                switch state.phase {
                case .upcoming:
                    return state.prayerTime
                case .active:
                    return Date().addingTimeInterval(20 * 60)
                case .completed:
                    return state.nextPrayerTime ?? Date().addingTimeInterval(10 * 60)
                case .appLaunch:
                    return Date().addingTimeInterval(30 * 60)
                }
            }()

            PrayerLiveActivityController.mirrorToAppGroup(prayerKey: activity.attributes.prayerKey, state: state)
            Task {
                await activity.update(.init(state: state, staleDate: stale))
                call.resolve(["updated": true, "phase": state.phase.rawValue])
            }
            return
        }
        #endif
        call.resolve(["updated": false])
    }

    @objc func endActivity(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            Task { call.resolve(["ended": await PrayerLiveActivityController.end()]) }
            return
        }
        #endif
        call.resolve(["ended": false])
    }

    /// يحدّث/يبدأ النشاط من لقطة App Group فقط — بلا شبكة أو إعادة حساب مواقيت.
    @objc func syncFromSharedSnapshot(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            Task {
                switch await PrayerLiveActivityController.syncFromSharedSnapshot() {
                case .disabled: call.resolve(["synced": false, "reason": "disabled"])
                case .started(let phase): call.resolve(["synced": true, "phase": phase.rawValue, "started": true])
                case .updated(let phase): call.resolve(["synced": true, "phase": phase.rawValue, "updated": true])
                case .failed: call.resolve(["synced": false])
                }
            }
            return
        }
        #endif
        call.resolve(["synced": false])
    }

    // MARK: - Helpers

    private static func parsePhase(_ raw: String?) -> PrayerLivePhase? {
        guard let raw else { return nil }
        return PrayerLivePhase(rawValue: raw)
    }

    private static func parseISO(_ raw: String?) -> Date? {
        guard let raw else { return nil }
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = f.date(from: raw) { return d }
        f.formatOptions = [.withInternetDateTime]
        return f.date(from: raw)
    }
}

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
            call.resolve(["supported": ActivityAuthorizationInfo().areActivitiesEnabled])
            return
        }
        #endif
        call.resolve(["supported": false])
    }

    @objc func startActivity(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                call.resolve(["started": false])
                return
            }
            let phase = Self.parsePhase(call.getString("phase")) ?? .upcoming
            let locationLabel = call.getString("locationLabel") ?? ""

            if phase == .appLaunch {
                let started = Self.request(
                    prayerKey: "launch",
                    state: PrayerActivityAttributes.ContentState(
                        prayerName: "مواقيت الصلاة",
                        prayerTime: Date().addingTimeInterval(3600),
                        locationLabel: locationLabel,
                        hasStarted: false,
                        phase: .appLaunch,
                        statusLabel: "افتح مواقيت الصلاة"
                    )
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
            let started = Self.request(prayerKey: prayerKey, state: state)
            if started {
                Self.mirrorToAppGroup(prayerKey: prayerKey, state: state)
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

            Self.mirrorToAppGroup(prayerKey: activity.attributes.prayerKey, state: state)
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
            let activities = Activity<PrayerActivityAttributes>.activities
            guard !activities.isEmpty else {
                call.resolve(["ended": false])
                return
            }
            Task {
                for activity in activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                call.resolve(["ended": true])
            }
            return
        }
        #endif
        call.resolve(["ended": false])
    }

    /// يحدّث/يبدأ النشاط من لقطة App Group فقط — بلا شبكة أو إعادة حساب مواقيت.
    @objc func syncFromSharedSnapshot(_ call: CAPPluginCall) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                call.resolve(["synced": false, "reason": "disabled"])
                return
            }
            guard let snap = SunnahSharedStore.loadPrayer() else {
                let started = Self.request(
                    prayerKey: "launch",
                    state: PrayerActivityAttributes.ContentState(
                        prayerName: "مواقيت الصلاة",
                        prayerTime: Date().addingTimeInterval(3600),
                        locationLabel: "",
                        hasStarted: false,
                        phase: .appLaunch,
                        statusLabel: "افتح مواقيت الصلاة"
                    )
                )
                call.resolve(["synced": started, "phase": PrayerLivePhase.appLaunch.rawValue])
                return
            }
            let phase: PrayerLivePhase = snap.nextHasStarted ? .active : .upcoming
            let key = snap.nextPrayerKey ?? "fajr"
            let name = snap.nextPrayerNameAr ?? key
            let time: Date = {
                if let ms = snap.nextPrayerEpochMs {
                    return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
                }
                return Date().addingTimeInterval(3600)
            }()
            let state = PrayerActivityAttributes.ContentState(
                prayerName: name,
                prayerTime: time,
                locationLabel: snap.locationLabel,
                hasStarted: snap.nextHasStarted,
                phase: phase,
                statusLabel: PrayerActivityAttributes.ContentState.defaultStatus(for: phase)
            )
            if let activity = Activity<PrayerActivityAttributes>.activities.first {
                Task {
                    await activity.update(.init(state: state, staleDate: time))
                }
                call.resolve(["synced": true, "phase": phase.rawValue, "updated": true])
            } else {
                let started = Self.request(prayerKey: key, state: state)
                call.resolve(["synced": started, "phase": phase.rawValue, "started": started])
            }
            return
        }
        #endif
        call.resolve(["synced": false])
    }

    // MARK: - Helpers

    @available(iOS 16.2, *)
    @discardableResult
    private static func request(prayerKey: String, state: PrayerActivityAttributes.ContentState) -> Bool {
        for activity in Activity<PrayerActivityAttributes>.activities {
            Task { await activity.end(nil, dismissalPolicy: .immediate) }
        }
        let attributes = PrayerActivityAttributes(prayerKey: prayerKey)
        let stale: Date? = {
            switch state.phase {
            case .upcoming, .active: return state.prayerTime
            case .completed: return state.nextPrayerTime
            case .appLaunch: return Date().addingTimeInterval(30 * 60)
            }
        }()
        do {
            _ = try Activity<PrayerActivityAttributes>.request(
                attributes: attributes,
                content: .init(state: state, staleDate: stale)
            )
            return true
        } catch {
            return false
        }
    }

    @available(iOS 16.2, *)
    private static func mirrorToAppGroup(prayerKey: String, state: PrayerActivityAttributes.ContentState) {
        guard state.phase != .appLaunch else { return }
        _ = SunnahSharedStore.publishLiveActivityState(
            prayerKey: prayerKey,
            prayerNameAr: state.prayerName,
            prayerTime: state.prayerTime,
            locationLabel: state.locationLabel,
            hasStarted: state.phase == .active || state.hasStarted
        )
    }

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

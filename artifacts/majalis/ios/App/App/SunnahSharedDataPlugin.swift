import Foundation
import Capacitor
import WidgetKit
import SunnahPrayer

/// Capacitor bridge — publish non-secret prayer/progress snapshots into App Group
/// for future Widget / Watch / Live Activity readers.
@objc(SunnahSharedDataPlugin)
public class SunnahSharedDataPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SunnahSharedDataPlugin"
    public let jsName = "SunnahSharedData"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getAppGroupId", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "publishPrayerSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "publishProgressSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "publishWidgetEnvelope", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readPrayerSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readWidgetDiagnostics", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "publishNotificationOptIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getNativeNotificationsState", returnType: CAPPluginReturnPromise),
    ]

    /// الويب يكتب موافقة المستخدم (تفعيل/إيقاف تذكير الصلاة أو الأذكار من الإعدادات) ثم يطبّقها الأصلي فورًا.
    /// بلا هذا الاستدعاء لا يجدول الأصلي شيئًا (opt-in)، والعلم المستقل off يعيد الجدولة كلها إلى الويب.
    @objc func publishNotificationOptIn(_ call: CAPPluginCall) {
        guard let defaults = SunnahAppGroup.defaults else {
            call.resolve(["ok": false, "nativeEnabled": NativeNotificationsGate.isEnabled])
            return
        }
        let optIn = NativeNotificationsOptIn(
            prayer: call.getBool("prayer") ?? false,
            adhkar: call.getBool("adhkar") ?? false
        )
        optIn.write(to: defaults)
        let enabled = NativeNotificationsGate.isEnabled
        NativeNotificationsLifecycle.didBecomeActive(notificationsEnabled: enabled, optIn: optIn)
        call.resolve(["ok": true, "nativeEnabled": enabled])
    }

    /// حالة العلم المستقل (لا علاقة له بعلم الصدفة) — الويب يقرّر منها هل يتنحّى عن جدولة المجموعات الأصلية.
    @objc func getNativeNotificationsState(_ call: CAPPluginCall) {
        call.resolve(["nativeEnabled": NativeNotificationsGate.isEnabled])
    }

    @objc func getAppGroupId(_ call: CAPPluginCall) {
        call.resolve([
            "appGroupId": SunnahAppGroup.identifier,
            "available": SunnahAppGroup.defaults != nil,
        ])
    }

    @objc func publishPrayerSnapshot(_ call: CAPPluginCall) {
        guard let locationLabel = call.getString("locationLabel"),
              let timeZoneIdentifier = call.getString("timeZoneIdentifier"),
              let dayKey = call.getString("dayKey")
        else {
            call.resolve(["ok": false])
            return
        }
        func epochMap(_ obj: JSObject?) -> [String: Int64] {
            var out: [String: Int64] = [:]
            for (k, v) in obj ?? [:] {
                if let n = v as? NSNumber {
                    out[k.lowercased()] = n.int64Value
                } else if let i = v as? Int {
                    out[k.lowercased()] = Int64(i)
                } else if let d = v as? Double {
                    out[k.lowercased()] = Int64(d)
                }
            }
            return out
        }
        let times = epochMap(call.getObject("timesEpochMs"))
        let upcomingDays: [SharedPrayerDay] = (call.getArray("upcomingDays", JSObject.self) ?? []).compactMap { day in
            guard let key = day["dayKey"] as? String else { return nil }
            let dayTimes = epochMap(day["timesEpochMs"] as? JSObject)
            return dayTimes.isEmpty ? nil : SharedPrayerDay(dayKey: key, timesEpochMs: dayTimes)
        }
        func optEpoch(_ key: String) -> Int64? {
            if let n = call.getDouble(key) { return Int64(n) }
            if let i = call.getInt(key) { return Int64(i) }
            return nil
        }
        var snap = SharedPrayerSnapshot(
            schemaVersion: SharedPrayerSnapshot.currentSchema,
            locationLabel: locationLabel,
            timeZoneIdentifier: timeZoneIdentifier,
            dayKey: dayKey,
            timesEpochMs: times,
            nextPrayerKey: call.getString("nextPrayerKey"),
            nextPrayerNameAr: call.getString("nextPrayerNameAr"),
            nextPrayerEpochMs: optEpoch("nextPrayerEpochMs"),
            nextHasStarted: call.getBool("nextHasStarted") ?? false,
            updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
        )
        snap.previousPrayerKey = call.getString("previousPrayerKey")
        snap.previousPrayerNameAr = call.getString("previousPrayerNameAr")
        snap.previousPrayerEpochMs = optEpoch("previousPrayerEpochMs")
        snap.currentPrayerKey = call.getString("currentPrayerKey")
        snap.currentPrayerNameAr = call.getString("currentPrayerNameAr")
        snap.currentPrayerStartedAtEpochMs = optEpoch("currentPrayerStartedAtEpochMs")
        snap.nextTransitionAtEpochMs = optEpoch("nextTransitionAtEpochMs")
        snap.elapsedWindowMinutes = call.getInt("elapsedWindowMinutes")
        snap.calculationDate = call.getString("calculationDate")
        snap.calculationMethodIdentifier = call.getString("calculationMethodIdentifier")
        snap.permissionState = call.getString("permissionState")
        snap.initializationState = call.getString("initializationState")
        snap.upcomingDays = upcomingDays.isEmpty ? nil : upcomingDays
        let ok = SunnahWidgetRefreshCoordinator.commitPrayer(snap)
        if ok {
            // Reload only after App Group write+synchronize committed.
            WidgetCenter.shared.reloadTimelines(ofKind: SunnahWidgetKind.prayerTimes)
        }
        call.resolve([
            "ok": ok,
            "schemaVersion": SharedPrayerSnapshot.currentSchema,
            "suiteAvailable": SunnahAppGroup.defaults != nil,
        ])
    }

    @objc func publishProgressSnapshot(_ call: CAPPluginCall) {
        let snap = SharedProgressSnapshot(
            schemaVersion: SharedProgressSnapshot.currentSchema,
            dailyWirdCompleted: call.getInt("dailyWirdCompleted") ?? 0,
            dailyWirdTarget: call.getInt("dailyWirdTarget") ?? 0,
            mushafPagesReadToday: call.getInt("mushafPagesReadToday") ?? 0,
            updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
        )
        let ok = SunnahSharedStore.publishProgress(snap)
        if ok {
            WidgetCenter.shared.reloadTimelines(ofKind: SunnahWidgetKind.prayerTimes)
        }
        call.resolve(["ok": ok])
    }

    @objc func publishWidgetEnvelope(_ call: CAPPluginCall) {
        guard let json = call.getString("envelopeJson"),
              let data = json.data(using: .utf8)
        else {
            call.resolve(["ok": false])
            return
        }
        let env = SunnahWidgetEnvelopeCodec.decodeIsolated(from: data)
        let rawDomains = call.getArray("domains", String.self) ?? []
        var domains = Set(rawDomains.compactMap { SunnahWidgetRefreshCoordinator.Domain(rawValue: $0) })
        if domains.isEmpty { domains = [.calendar, .adhkar, .quran, .mushaf, .custom] }
        let ok = SunnahWidgetRefreshCoordinator.commitEnvelope(env, domains: domains)
        call.resolve(["ok": ok, "schemaVersion": env.schemaVersion])
    }

    @objc func readPrayerSnapshot(_ call: CAPPluginCall) {
        guard let snap = SunnahSharedStore.loadPrayer() else {
            call.resolve(["found": false])
            return
        }
        call.resolve([
            "found": true,
            "locationLabel": snap.locationLabel,
            "timeZoneIdentifier": snap.timeZoneIdentifier,
            "dayKey": snap.dayKey,
            "timesEpochMs": snap.timesEpochMs,
            "nextPrayerKey": snap.nextPrayerKey as Any,
            "nextPrayerNameAr": snap.nextPrayerNameAr as Any,
            "nextPrayerEpochMs": snap.nextPrayerEpochMs as Any,
            "nextHasStarted": snap.nextHasStarted,
            "updatedAtEpochMs": snap.updatedAtEpochMs,
        ])
    }

    @objc func readWidgetDiagnostics(_ call: CAPPluginCall) {
        let env = SunnahSharedStore.loadEnvelope()
        var domains: [String] = []
        if env?.prayerPayload != nil { domains.append("prayer") }
        if env?.calendarPayload != nil { domains.append("calendar") }
        if env?.adhkarPayload != nil { domains.append("adhkar") }
        if env?.quranPayload != nil { domains.append("quran") }
        if env?.mushafPayload != nil { domains.append("mushaf") }
        if env?.islamicEventsPayload != nil { domains.append("islamicEvents") }
        if env?.hadithPayload != nil { domains.append("hadith") }
        if env?.duaPayload != nil { domains.append("dua") }
        if env?.progressPayload != nil { domains.append("progress") }
        if env?.diagnosticsPayload != nil { domains.append("diagnostics") }
        call.resolve([
            "appGroupAvailable": SunnahAppGroup.defaults != nil,
            "schemaVersion": env?.schemaVersion as Any,
            "generatedAtEpochMs": env?.generatedAtEpochMs as Any,
            "domainsPresent": domains,
            "futureBinaryRequired": true,
        ])
    }
}

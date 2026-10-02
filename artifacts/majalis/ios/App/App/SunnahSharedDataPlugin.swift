import Foundation
import Capacitor
import WidgetKit

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
        CAPPluginMethod(name: "readPrayerSnapshot", returnType: CAPPluginReturnPromise),
    ]

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
        var times: [String: Int64] = [:]
        if let obj = call.getObject("timesEpochMs") {
            for (k, v) in obj {
                if let n = v as? NSNumber {
                    times[k.lowercased()] = n.int64Value
                } else if let i = v as? Int {
                    times[k.lowercased()] = Int64(i)
                } else if let d = v as? Double {
                    times[k.lowercased()] = Int64(d)
                }
            }
        }
        let snap = SharedPrayerSnapshot(
            schemaVersion: SharedPrayerSnapshot.currentSchema,
            locationLabel: locationLabel,
            timeZoneIdentifier: timeZoneIdentifier,
            dayKey: dayKey,
            timesEpochMs: times,
            nextPrayerKey: call.getString("nextPrayerKey"),
            nextPrayerNameAr: call.getString("nextPrayerNameAr"),
            nextPrayerEpochMs: {
                if let n = call.getDouble("nextPrayerEpochMs") { return Int64(n) }
                if let i = call.getInt("nextPrayerEpochMs") { return Int64(i) }
                return nil
            }(),
            nextHasStarted: call.getBool("nextHasStarted") ?? false,
            updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
        )
        let ok = SunnahSharedStore.publishPrayer(snap)
        if ok {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve(["ok": ok])
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
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve(["ok": ok])
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
}

import Foundation
import Capacitor
import WidgetKit

/// يكتب لقطة الودجت إلى App Group ويطلب إعادة تحميل WidgetKit.
@objc(SunnahWidgetsPlugin)
public class SunnahWidgetsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SunnahWidgetsPlugin"
    public let jsName = "SunnahWidgets"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadAll", returnType: CAPPluginReturnPromise),
    ]

    private let appGroupId = "group.com.yousef.majlisilm.widgets"
    private let snapshotKey = "snapshot_v1"

    @objc func isSupported(_ call: CAPPluginCall) {
        call.resolve(["supported": true])
    }

    @objc func writeSnapshot(_ call: CAPPluginCall) {
        guard let json = call.getString("json"), let data = json.data(using: .utf8) else {
            call.resolve(["ok": false, "reason": "invalid_json"])
            return
        }
        let defaults = UserDefaults(suiteName: appGroupId) ?? .standard
        defaults.set(data, forKey: snapshotKey)
        call.resolve(["ok": true])
    }

    @objc func reloadAll(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve(["ok": true])
    }
}

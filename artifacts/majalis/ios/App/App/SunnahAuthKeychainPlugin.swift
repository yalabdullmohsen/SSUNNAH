import Foundation
import Capacitor

/// Capacitor bridge — Supabase auth session blob stored only via KeychainStore.
@objc(SunnahAuthKeychainPlugin)
public class SunnahAuthKeychainPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SunnahAuthKeychainPlugin"
    public let jsName = "SunnahAuthKeychain"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
    ]

    private func account(for call: CAPPluginCall) -> String? {
        guard let key = call.getString("key")?.trimmingCharacters(in: .whitespacesAndNewlines), !key.isEmpty else {
            return nil
        }
        // Namespace Cap storage keys away from native NetworkService account.
        return "cap.supabase.\(key)"
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let account = account(for: call) else {
            call.reject("missing_key")
            return
        }
        do {
            guard let data = try KeychainStore.get(account: account) else {
                call.resolve(["value": NSNull()])
                return
            }
            guard let value = String(data: data, encoding: .utf8) else {
                call.reject("invalid_utf8")
                return
            }
            call.resolve(["value": value])
        } catch {
            call.reject("keychain_get_failed")
        }
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let account = account(for: call) else {
            call.reject("missing_key")
            return
        }
        guard let value = call.getString("value") else {
            call.reject("missing_value")
            return
        }
        guard let data = value.data(using: .utf8) else {
            call.reject("invalid_utf8")
            return
        }
        do {
            try KeychainStore.set(data, account: account)
            call.resolve(["ok": true])
        } catch {
            call.reject("keychain_set_failed")
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let account = account(for: call) else {
            call.reject("missing_key")
            return
        }
        do {
            try KeychainStore.delete(account: account)
            call.resolve(["ok": true])
        } catch {
            call.reject("keychain_remove_failed")
        }
    }
}

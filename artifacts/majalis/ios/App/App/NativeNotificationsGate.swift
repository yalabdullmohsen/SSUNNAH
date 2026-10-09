import Foundation

/// مفتاح الإشعارات الأصلية — مستقل تمامًا عن `NativeShellGate` (الصدفة تبقى مطفأة إلى 1.2).
/// مفعّل افتراضيًا لكنه لا يجدول شيئًا بلا موافقة المستخدم (`NativeNotificationsOptIn`).
/// الإيقاف عن بُعد off-only: `{"enabled": false}` في native-notifications.json يطفئ الأصلي ويعيد الويب للجدولة.
enum NativeNotificationsGate {
    static let defaultsKey = "native_notifications_enabled"
    static let compiledDefault = true
    static let remoteKey = "native_notifications_remote_enabled"
    static let remoteURL = URL(string: "https://www.ssunnah.com/native-notifications.json")!

    /// أولوية: الإيقاف عن بُعد ← اختيار الجهاز الصريح ← القيمة المجمَّعة.
    static var isEnabled: Bool {
        let d = UserDefaults.standard
        if let remote = d.object(forKey: remoteKey) as? Bool, !remote { return false }
        if let explicit = d.object(forKey: defaultsKey) as? Bool { return explicit }
        return compiledDefault
    }

    /// يخزّن آخر قيمة بعيدة؛ غياب الملف أو فشل الشبكة لا يغيّر شيئًا.
    static func refreshRemoteSwitch() {
        var request = URLRequest(url: remoteURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 8)
        request.httpMethod = "GET"
        URLSession.shared.dataTask(with: request) { data, response, _ in
            guard let data, (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let enabled = json["enabled"] as? Bool else { return }
            UserDefaults.standard.set(enabled, forKey: remoteKey)
        }.resume()
    }
}

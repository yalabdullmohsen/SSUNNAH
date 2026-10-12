import Foundation

/// بوابة الإصدار: مسارات بلا محتوى موثّق («قيد التوثيق») لا تظهر في أي قائمة أو مركز أو بحث في نسخة release.
/// تظهر في البناء الداخلي (DEBUG) أو بعلم تجريبي صريح `sunnah.internal.showUnfinished`. الشاشات نفسها تبقى مسجّلة (هبوط آمن للروابط العميقة).
public enum ReleaseGate {
    /// مسارات بلا مصدر معتمد بعد: تُرفع من هنا حين يُصدَّر محتواها.
    public static let hiddenRoutes: Set<String> = [
        "/mutashabihat", "/quran/offline-player", "/quran-hub/tilawa", "/quran-circles", "/quran-engine", "/quran/worship-hub", "/ulum-quran",
    ]

    public static var showUnfinished: Bool {
        #if DEBUG
        return true
        #else
        return UserDefaults.standard.bool(forKey: "sunnah.internal.showUnfinished")
        #endif
    }

    /// المسار (بلا استعلام أو مرساة) ظاهر للمستخدم؟
    public static func isVisible(_ route: String) -> Bool {
        if showUnfinished { return true }
        let cut = route.firstIndex { $0 == "?" || $0 == "#" } ?? route.endIndex
        return !hiddenRoutes.contains(String(route[..<cut]))
    }
}

import Foundation
#if canImport(UserNotifications)
import UserNotifications
#endif

/// أصوات الإشعارات الأصلية المسموح بها. البوابة scripts/check-sound-pack.mjs تُفشل CI إن أُدرج هنا
/// صوت غير معتمد في docs/audio-rights/sound-pack.manifest.json. الافتراضي صوت iOS النظامي؛
/// اختيار صوت الأذان قرار المالك، فالقائمة فارغة حتى يُتخذ.
public enum NotificationSoundPack {
    public static let approvedNotificationSounds: Set<String> = []

    /// اسم الملف إن كان معتمدًا، وإلا nil (يعني صوت النظام).
    public static func approvedName(_ name: String) -> String? {
        approvedNotificationSounds.contains(name) ? name : nil
    }

    #if canImport(UserNotifications)
    public static func sound(named name: String) -> UNNotificationSound {
        approvedName(name).map { UNNotificationSound(named: UNNotificationSoundName($0)) } ?? .default
    }
    #endif
}

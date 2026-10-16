import Foundation
#if canImport(UserNotifications)
import UserNotifications
#endif

/// أصوات الإشعارات الأصلية المسموح بها. البوابة scripts/check-sound-pack.mjs تُفشل CI إن أُدرج هنا
/// صوت غير معتمد في docs/audio-rights/sound-pack.manifest.json. الافتراضي صوت iOS النظامي؛
/// القائمة فارغة: لا أذان ولا صوت ديني في التطبيق؛ مقاطع العبارة في phraseSounds.
public enum NotificationSoundPack {
    public static let approvedNotificationSounds: Set<String> = []

    /// عشرة مقاطع عبارة قصيرة (اقترب/حان الآن موعد أذان X) بأسماء ثابتة. لا أذان في التطبيق (قرار المالك).
    /// تُستعمل فقط إن وُجد الملف فعلًا في حزمة التطبيق (وإلا صوت النظام)، فلا يُسكت الإشعار بملف غائب.
    public static let phraseSounds: Set<String> = Set(PrayerNotificationPlanner.allSoundNames)

    /// اسم الملف إن كان معتمدًا، وإلا nil (يعني صوت النظام).
    public static func approvedName(_ name: String) -> String? {
        approvedNotificationSounds.contains(name) ? name : nil
    }

    #if canImport(UserNotifications)
    public static func sound(named name: String, bundle: Bundle = .main) -> UNNotificationSound {
        #if os(watchOS)
        return .default  // UNNotificationSound(named:) غير متاح على watchOS
        #else
        let base = (name as NSString).deletingPathExtension
        if phraseSounds.contains(name), bundle.url(forResource: base, withExtension: "caf") != nil {
            return UNNotificationSound(named: UNNotificationSoundName(name))
        }
        return approvedName(name).map { UNNotificationSound(named: UNNotificationSoundName($0)) } ?? .default
        #endif
    }
    #endif
}

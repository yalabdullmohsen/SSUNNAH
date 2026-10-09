import Foundation

/// إشعارات جدولها الويب (Capacitor LocalNotifications) قبل تفعيل الصدفة الأصلية؛ معرّفاتها أرقام نصية.
/// حين تُفعَّل مجموعة أصلية تُزال نظيرتها من الويب حتى لا يصل التذكير مرتين.
/// المصدر: ADHKAR_ID_BASE…ADHKAR_SNOOZE_ID في src/lib/adhkar-reminders، وإزاحات adhkar-* في
/// notifications/native-daily-reminders، وDHIKR_PHRASE_NATIVE_ID_BASE، وQURAN_DAILY_REMINDER_NATIVE_ID.
public enum LegacyWebNotifications {
    static let adhkarReminders = 9700...9999
    static let dailyAdhkar = 9601...9604
    static let dhikrPhrases = 9401...9407
    static let quranDaily = 9301...9301

    /// معرّفات الويب التي تحل محلها المجموعات الأصلية المفعّلة.
    public static func identifiers(replacedBy options: GeneralNotificationOptions) -> Set<String> {
        var ranges: [ClosedRange<Int>] = []
        if options.adhkarEnabled { ranges += [adhkarReminders, dailyAdhkar] }
        if options.periodicEnabled { ranges.append(dhikrPhrases) }
        if options.wirdEnabled { ranges.append(quranDaily) }
        return Set(ranges.flatMap { $0.map(String.init) })
    }
}

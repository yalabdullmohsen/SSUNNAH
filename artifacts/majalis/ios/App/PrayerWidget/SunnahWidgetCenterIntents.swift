import AppIntents
import WidgetKit

@available(iOS 17.0, *)
enum SunnahPrayerStyleOption: String, AppEnum {
    case compact, detailed

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "نمط الصلوات"
    static var caseDisplayRepresentations: [SunnahPrayerStyleOption: DisplayRepresentation] = [
        .compact: "مختصر",
        .detailed: "مفصّل",
    ]
}

/// يضبط نمط عرض الصلوات من مركز الودجات ثم يحدّث الأسطح الظاهرة.
@available(iOS 17.0, *)
struct SetPrayerWidgetStyleIntent: AppIntent {
    static var title: LocalizedStringResource = "ضبط نمط الصلوات"
    static var description = IntentDescription("اختر عرضًا مختصرًا أو مفصّلًا لمواقيت الصلاة في الودجات.")
    static var openAppWhenRun = false

    @Parameter(title: "النمط", default: .detailed)
    var style: SunnahPrayerStyleOption

    func perform() async throws -> some IntentResult {
        SunnahWidgetPreferences.prayerStyle = SunnahWidgetPreferences.PrayerStyle(rawValue: style.rawValue) ?? .detailed
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

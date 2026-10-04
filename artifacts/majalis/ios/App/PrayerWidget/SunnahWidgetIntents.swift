import AppIntents
import Foundation

@available(iOS 17.0, *)
struct SunnahCustomContentEntity: AppEntity, Identifiable, Hashable {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "محتوى سُنّة"
    static var defaultQuery = SunnahCustomContentQuery()

    var id: String
    var titleAr: String
    var contentType: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(titleAr)")
    }
}

@available(iOS 17.0, *)
struct SunnahCustomContentQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [SunnahCustomContentEntity] {
        let items = CustomContentWidgetAdapter.payload()?.items ?? SunnahWidgetPreviewFixtures.custom.items
        return items.filter { identifiers.contains($0.id) }.map {
            SunnahCustomContentEntity(id: $0.id, titleAr: $0.titleAr, contentType: $0.contentType)
        }
    }

    func suggestedEntities() async throws -> [SunnahCustomContentEntity] {
        let items = CustomContentWidgetAdapter.payload()?.items ?? SunnahWidgetPreviewFixtures.custom.items
        return items.map { SunnahCustomContentEntity(id: $0.id, titleAr: $0.titleAr, contentType: $0.contentType) }
    }
}

@available(iOS 17.0, *)
struct SelectCustomContentIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "اختيار المحتوى"
    static var description = IntentDescription("اختر آية أو حديثاً أو ذكراً أو دعاءً معتمداً من سُنّة.")

    @Parameter(title: "المحتوى")
    var content: SunnahCustomContentEntity?

    @Parameter(title: "إظهار المصدر", default: true)
    var showSource: Bool

    @Parameter(title: "نص أصغر", default: false)
    var compactText: Bool
}

@available(iOS 17.0, *)
struct SelectPrayerWidgetStyleIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "نمط ويدجت الصلاة"
    @Parameter(title: "النمط", default: .next)
    var style: PrayerWidgetStyleAppEnum
}

@available(iOS 17.0, *)
enum PrayerWidgetStyleAppEnum: String, AppEnum {
    case next, previous, previousNext, all
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "نمط الصلاة"
    static var caseDisplayRepresentations: [PrayerWidgetStyleAppEnum: DisplayRepresentation] = [
        .next: "التالية",
        .previous: "السابقة",
        .previousNext: "السابقة والتالية",
        .all: "الكل",
    ]
}

@available(iOS 17.0, *)
struct SelectPrayerGroupIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "مجموعة الصلوات"
    @Parameter(title: "المجموعة", default: .morning)
    var group: PrayerGroupAppEnum
}

@available(iOS 17.0, *)
enum PrayerGroupAppEnum: String, AppEnum {
    case morning, evening
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "مجموعة"
    static var caseDisplayRepresentations: [PrayerGroupAppEnum: DisplayRepresentation] = [
        .morning: "الفجر والشروق والظهر",
        .evening: "العصر والمغرب والعشاء",
    ]
}

@available(iOS 17.0, *)
struct SelectCalendarStyleIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "نمط التقويم"
    @Parameter(title: "النمط", default: .hijri)
    var style: CalendarStyleAppEnum
}

@available(iOS 17.0, *)
enum CalendarStyleAppEnum: String, AppEnum {
    case hijri, dual, today, ramadan
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "نمط التاريخ"
    static var caseDisplayRepresentations: [CalendarStyleAppEnum: DisplayRepresentation] = [
        .hijri: "هجري",
        .dual: "هجري وميلادي",
        .today: "اليوم",
        .ramadan: "رمضان",
    ]
}

@available(iOS 17.0, *)
struct SelectAdhkarTypeIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "نوع الأذكار"
    @Parameter(title: "النوع", default: .morning)
    var type: AdhkarTypeAppEnum
}

@available(iOS 17.0, *)
enum AdhkarTypeAppEnum: String, AppEnum {
    case morning, evening, timeAware, rotating
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "أذكار"
    static var caseDisplayRepresentations: [AdhkarTypeAppEnum: DisplayRepresentation] = [
        .morning: "الصباح",
        .evening: "المساء",
        .timeAware: "حسب الوقت",
        .rotating: "ذكر اليوم",
    ]
}

@available(iOS 17.0, *)
struct SelectMushafBookmarkIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "إشارة المصحف"
    @Parameter(title: "عرض الإشارة المحفوظة", default: true)
    var useSelectedBookmark: Bool
}

@available(iOS 17.0, *)
struct SelectWidgetAppearanceIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "مظهر الويدجت"
    @Parameter(title: "المظهر", default: .fullColor)
    var appearance: WidgetAppearanceAppEnum
}

@available(iOS 17.0, *)
enum WidgetAppearanceAppEnum: String, AppEnum {
    case fullColor, light, dark
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "مظهر"
    static var caseDisplayRepresentations: [WidgetAppearanceAppEnum: DisplayRepresentation] = [
        .fullColor: "ألوان سُنّة",
        .light: "فاتح",
        .dark: "داكن",
    ]
}

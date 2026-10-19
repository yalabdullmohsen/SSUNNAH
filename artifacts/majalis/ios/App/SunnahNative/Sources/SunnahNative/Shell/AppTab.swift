import Foundation

/// تبويبات الشريط السفلي — مطابقة لـ`BOTTOM_NAV_TABS` في `src/lib/nav-map.ts` (الترتيب والمسارات).
public enum AppTab: String, CaseIterable, Identifiable, Hashable {
    case home
    case quran
    case prayer
    case sections
    case more

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .home: return "الرئيسية"
        case .quran: return "المصحف"
        case .prayer: return "الصلاة"
        case .sections: return "الأقسام"
        case .more: return "المزيد"
        }
    }

    public var systemImage: String {
        switch self {
        case .home: return "house"
        case .quran: return "book.closed"
        case .prayer: return "clock"
        case .sections: return "square.grid.2x2"
        case .more: return "ellipsis"
        }
    }

    /// المسار الجذري للتبويب على الويب.
    public var rootPath: String {
        switch self {
        case .home: return "/"
        case .quran: return "/quran-hub"
        case .prayer: return "/prayer-times"
        case .sections: return "/sections"
        case .more: return "/more"
        }
    }

    public var rootRoute: Route { .web(path: rootPath) }

    /// التبويب الذي يملك مسارًا معيّنًا (أطول بادئة مطابقة)، والرئيسية لما عداه.
    public static func owning(path: String) -> AppTab {
        let normalized = Route.normalize(path)
        let candidates = allCases.filter { $0 != .home }
        let match = candidates
            .filter { normalized == $0.rootPath || normalized.hasPrefix($0.rootPath + "/") }
            .max { $0.rootPath.count < $1.rootPath.count }
        if let match { return match }
        if let alias = prefixAliases.first(where: { normalized == $0.prefix || normalized.hasPrefix($0.prefix + "/") }) { return alias.tab }
        // الجذر وحده للرئيسية؛ أي شاشة محتوى أخرى تتبع «الأقسام» لا «الرئيسية».
        return normalized == "/" ? .home : .sections
    }

    /// مسارات تابعة لتبويب دون أن تبدأ بمساره الجذري.
    private static let prefixAliases: [(prefix: String, tab: AppTab)] = [
        ("/quran", .quran), ("/mushaf", .quran), ("/tafsir", .quran), ("/tajweed", .quran), ("/qiraat", .quran),
        ("/mutashabihat", .quran), ("/hifz-path", .quran), ("/memorization", .quran), ("/listen", .quran),
        ("/prayer", .prayer), ("/adhan", .prayer), ("/qibla", .prayer), ("/mosque-mode", .prayer),
        // الإعدادات والحساب والمساهمات والإحصاءات والتعريف بالتطبيق تتبع «المزيد»
        ("/settings", .more), ("/stats", .more), ("/my-submissions", .more), ("/submit", .more), ("/feature-tour", .more), ("/car-mode", .more),
        ("/account", .more), ("/login", .more), ("/about", .more), ("/privacy", .more), ("/fatwa-policy", .more), ("/vault", .more),
        ("/sources", .more), ("/bookmarks", .more), ("/favorites", .more),
    ]
}

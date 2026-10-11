import Foundation

/// تبويبات الشريط السفلي — مطابقة لـ`BOTTOM_NAV_TABS` في `src/lib/nav-map.ts` (الترتيب والمسارات).
public enum AppTab: String, CaseIterable, Identifiable, Hashable {
    case quran
    case lessons
    case home
    case prayer
    case sections

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .quran: return "القرآن"
        case .lessons: return "الدروس"
        case .home: return "الرئيسية"
        case .prayer: return "الصلاة"
        case .sections: return "الأقسام"
        }
    }

    public var systemImage: String {
        switch self {
        case .quran: return "book.closed"
        case .lessons: return "graduationcap"
        case .home: return "house"
        case .prayer: return "clock"
        case .sections: return "square.grid.2x2"
        }
    }

    /// المسار الجذري للتبويب على الويب.
    public var rootPath: String {
        switch self {
        case .quran: return "/quran-hub"
        case .lessons: return "/lessons"
        case .home: return "/"
        case .prayer: return "/prayer-times"
        case .sections: return "/sections"
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
        return prefixAliases.first { normalized == $0.prefix || normalized.hasPrefix($0.prefix + "/") }?.tab ?? .home
    }

    /// مسارات تابعة لتبويب دون أن تبدأ بمساره الجذري.
    private static let prefixAliases: [(prefix: String, tab: AppTab)] = [
        ("/quran", .quran),
        ("/mushaf", .quran),
        ("/prayer", .prayer),
        ("/adhan", .prayer),
        ("/qibla", .prayer),
    ]
}

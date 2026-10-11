import SwiftUI

/// قسم «الدروس والتعلم» (learn): نقطة الربط الوحيدة. تُستدعى من جذر التطبيق بجانب GeneratedScreens/SpecialScreens:
/// `LearnSection.register(in: .shared)` و`LearnSection.resolve(path:)` لمسارات :id.
/// المعرّفات بصيغة المولّد (المقاطع موصولة بنقطة) ليطابق `Route.native(id:)` بقية الأقسام.
public enum LearnSection {
    /// المسارات بلا معاملات → معرّف السجل.
    static let screenIds: [String: String] = [
        "/lessons": "lessons",
        "/lessons/archive": "lessons.archive",
        "/kuwait-lessons": "kuwait-lessons",
        "/quiz": "quiz",
        "/competitions": "competitions",
        "/universities": "universities",
        "/universities/compare": "universities.compare",
        "/institutions": "institutions",
        "/knowledge-graph": "knowledge-graph",
        "/durus-imaniyya": "durus-imaniyya",
        "/durus-mutanawwia": "durus-mutanawwia",
        "/study-room": "study-room",
    ]

    /// مسارات القسم التي تنتظر منفذًا غير موجود بعد في الحزمة (حساب/Supabase/تقدّم مشترك) — docs/native/requests/learn.md.
    public static let pendingRoutes = ["/annual-courses/:id", "/fawaid", "/flashcards", "/my-learning", "/progress", "/reading-plans", "/researcher"]

    @MainActor public static func register(in registry: TemplateRegistry) {
        for (path, id) in screenIds {
            registry.registerView(id: id) { resolve(path: path) ?? AnyView(EmptyStateView()) }
        }
    }

    /// يحوّل مسار القسم (بمعاملات أو بدونها) إلى شاشته، أو nil لما ليس من القسم.
    public static func resolve(path raw: String) -> AnyView? {
        let base = Route.normalize(raw).split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? "/"
        let c = base.split(separator: "/").map(String.init)
        switch c.count {
        case 1:
            switch c[0] {
            case "lessons": return AnyView(LearnLessonsScreen(archived: false))
            case "kuwait-lessons": return AnyView(LearnKuwaitLessonsScreen())
            case "quiz": return AnyView(LearnQuizScreen())
            case "competitions": return AnyView(LearnCompetitionsScreen())
            case "universities": return AnyView(LearnUniversitiesScreen())
            case "institutions": return AnyView(LearnInstitutionsScreen())
            case "knowledge-graph": return AnyView(LearnKnowledgeGraphScreen())
            case "durus-imaniyya": return AnyView(LearnDurusScreen(source: LearnSources.durusImaniyya, title: "الدروس الإيمانية والتربوية"))
            case "durus-mutanawwia": return AnyView(LearnDurusScreen(source: LearnSources.durusMutanawwia, title: "دروس متنوعة"))
            case "study-room": return AnyView(LearnStudyRoomScreen())
            default: return nil
            }
        case 2:
            let id = c[1].removingPercentEncoding ?? c[1]
            switch c[0] {
            case "lessons": return AnyView(id == "archive" ? AnyView(LearnLessonsScreen(archived: true)) : AnyView(LearnLessonDetailScreen(id: id)))
            case "universities": return AnyView(id == "compare" ? AnyView(LearnUniversitiesCompareScreen()) : AnyView(LearnUniversityDetailScreen(slug: id)))
            case "competitions": return AnyView(LearnCompetitionDetailScreen(id: id))
            case "knowledge": return LearnKnowledgeSections.files(for: id) == nil ? nil : AnyView(LearnKnowledgeSectionScreen(section: id))
            default: return nil
            }
        default:
            return nil
        }
    }
}

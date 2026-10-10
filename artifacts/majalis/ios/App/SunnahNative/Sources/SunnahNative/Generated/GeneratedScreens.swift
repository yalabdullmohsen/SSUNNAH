// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

public enum GeneratedScreens {
    /// يسجّل كل القوالب بلا معاملات؛ يُستدعى مرة من نقطة الدخول.
    @MainActor public static func registerAll(in registry: TemplateRegistry) {
        HadithScreens.register(in: registry)
        KnowledgeScreens.register(in: registry)
        LessonsScreens.register(in: registry)
        FiqhScreens.register(in: registry)
        QaScreens.register(in: registry)
        StoriesScreens.register(in: registry)
        QuizzesScreens.register(in: registry)
        SearchScreens.register(in: registry)
    }

    /// يحوّل مسار /section/:id إلى شاشته، أو nil.
    public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        if let v = HadithScreens.resolve(c) { return v }
        if let v = KnowledgeScreens.resolve(c) { return v }
        if let v = LessonsScreens.resolve(c) { return v }
        if let v = FiqhScreens.resolve(c) { return v }
        if let v = QaScreens.resolve(c) { return v }
        if let v = StoriesScreens.resolve(c) { return v }
        if let v = QuizzesScreens.resolve(c) { return v }
        if let v = SearchScreens.resolve(c) { return v }
        return nil
    }
}

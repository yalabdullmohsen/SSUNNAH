// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

public enum GeneratedScreens {
    /// يحوّل مسارًا أصليًا إلى شاشته، أو nil إن لم يكن له قالب.
    public static func resolve(path: String, open: @escaping (String) -> Void) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        if let v = HadithScreens.resolve(c, open: open) { return v }
        if let v = KnowledgeScreens.resolve(c, open: open) { return v }
        if let v = LessonsScreens.resolve(c, open: open) { return v }
        if let v = FiqhScreens.resolve(c, open: open) { return v }
        if let v = QaScreens.resolve(c, open: open) { return v }
        if let v = StoriesScreens.resolve(c, open: open) { return v }
        if let v = QuizzesScreens.resolve(c, open: open) { return v }
        if let v = SearchScreens.resolve(c, open: open) { return v }
        return nil
    }
}

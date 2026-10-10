// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «القصص».
public enum StoriesScreens {
    public static let title = "القصص"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "stories" { return AnyView(CardGridTemplate(section: "stories", title: "القصص", open: { open($0.route ?? "/stories" + "/" + $0.id) })) }
        if c.count == 2, c[0] == "stories" { return AnyView(ArticleTemplate(section: "stories", id: c[1])) }
        return nil
    }
}

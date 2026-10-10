// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «الفقه».
public enum FiqhScreens {
    public static let title = "الفقه"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 2, c[0] == "fiqh", c[1] == "topics" { return AnyView(ListTemplate(section: "fiqh", title: "الفقه", open: { open($0.route ?? "/fiqh/topics" + "/" + $0.id) })) }
        if c.count == 1, c[0] == "fiqh" { return AnyView(SectionsListTemplate(section: "fiqh", title: "الفقه", open: { open($0.route) })) }
        if c.count == 3, c[0] == "fiqh", c[1] == "topics" { return AnyView(ArticleTemplate(section: "fiqh", id: c[2])) }
        return nil
    }
}

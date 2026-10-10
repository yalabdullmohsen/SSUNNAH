// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «المعرفة».
public enum KnowledgeScreens {
    public static let title = "المعرفة"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 2, c[0] == "knowledge", c[1] == "topics" { return AnyView(CardGridTemplate(section: "knowledge", title: "المعرفة", open: { open($0.route ?? "/knowledge/topics" + "/" + $0.id) })) }
        if c.count == 1, c[0] == "knowledge" { return AnyView(SectionsListTemplate(section: "knowledge", title: "المعرفة", open: { open($0.route) })) }
        if c.count == 3, c[0] == "knowledge", c[1] == "topics" { return AnyView(ArticleTemplate(section: "knowledge", id: c[2])) }
        return nil
    }
}

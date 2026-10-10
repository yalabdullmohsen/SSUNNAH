// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «الحديث وعلومه».
public enum HadithScreens {
    public static let title = "الحديث وعلومه"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "hadith" { return AnyView(ListTemplate(section: "hadith", title: "الحديث وعلومه", open: { open($0.route ?? "/hadith" + "/" + $0.id) })) }
        if c.count == 2, c[0] == "hadith" { return AnyView(ArticleTemplate(section: "hadith", id: c[1])) }
        return nil
    }
}

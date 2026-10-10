// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «البحث».
public enum SearchScreens {
    public static let title = "البحث"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "search" { return AnyView(SearchTemplate(section: nil, title: "البحث", open: { open($0.route ?? "/search" + "/" + $0.id) })) }
        return nil
    }
}

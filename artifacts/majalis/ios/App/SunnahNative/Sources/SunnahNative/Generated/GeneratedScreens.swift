// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

public enum GeneratedScreens {
    /// يسجّل كل القوالب بلا معاملات؛ يُستدعى مرة من نقطة الدخول.
    @MainActor public static func registerAll(in registry: TemplateRegistry) {
        SirahScreens.register(in: registry)
        AqidahScreens.register(in: registry)
        FiqhScreens.register(in: registry)
        LibraryScreens.register(in: registry)
    }

    /// يحوّل مسار /section/:id إلى شاشته، أو nil.
    public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        if let v = SirahScreens.resolve(c) { return v }
        if let v = AqidahScreens.resolve(c) { return v }
        if let v = FiqhScreens.resolve(c) { return v }
        if let v = LibraryScreens.resolve(c) { return v }
        return nil
    }
}

// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct FiqhAmrBilMarufScreen: ScreenTemplate {
    static let id = "amr-bil-maruf"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "amr-bil-maruf")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/amr-bil-maruf") }
}

struct FiqhArkanScreen: ScreenTemplate {
    static let id = "arkan"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "arkan")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/arkan") }
}

struct FiqhArkanImanScreen: ScreenTemplate {
    static let id = "arkan-iman"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "arkan-iman")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/arkan-iman") }
}

struct FiqhFadailAamalScreen: ScreenTemplate {
    static let id = "fadail-aamal"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "fadail-aamal")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fadail-aamal") }
}

struct FiqhFamilyScreen: ScreenTemplate {
    static let id = "family"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "family")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/family") }
}

struct FiqhFiqhScreen: ScreenTemplate {
    static let id = "fiqh"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "fiqh")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fiqh") }
}

struct FiqhFiqhQawaidScreen: ScreenTemplate {
    static let id = "fiqh-qawaid"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "fiqh-qawaid")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fiqh-qawaid") }
}

struct FiqhFiqhUsulScreen: ScreenTemplate {
    static let id = "fiqh.usul"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "fiqh-usul")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fiqh/usul") }
}

struct FiqhHajjScreen: ScreenTemplate {
    static let id = "hajj"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "hajj")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/hajj") }
}

struct FiqhJanazaScreen: ScreenTemplate {
    static let id = "janaza"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "janaza")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/janaza") }
}

struct FiqhJumuahScreen: ScreenTemplate {
    static let id = "jumuah"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "jumuah")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/jumuah") }
}

struct FiqhMadhahibScreen: ScreenTemplate {
    static let id = "madhahib"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "madhahib")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/madhahib") }
}

struct FiqhMaqasidShariaScreen: ScreenTemplate {
    static let id = "maqasid-sharia"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "maqasid-sharia")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/maqasid-sharia") }
}

struct FiqhMawarithScreen: ScreenTemplate {
    static let id = "mawarith"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "mawarith")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/mawarith") }
}

struct FiqhMawarithCalculatorScreen: ScreenTemplate {
    static let id = "mawarith.calculator"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "mawarith-calculator")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/mawarith/calculator") }
}

struct FiqhNikahScreen: ScreenTemplate {
    static let id = "nikah"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "nikah")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/nikah") }
}

struct FiqhPrayerRanksScreen: ScreenTemplate {
    static let id = "prayer-ranks"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "prayer-ranks")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/prayer-ranks") }
}

struct FiqhPrayerTimesScreen: ScreenTemplate {
    static let id = "prayer-times"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "prayer-times")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/prayer-times") }
}

struct FiqhPropheticMedicineScreen: ScreenTemplate {
    static let id = "prophetic-medicine"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "prophetic-medicine")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/prophetic-medicine") }
}

struct FiqhRibaScreen: ScreenTemplate {
    static let id = "riba"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "riba")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/riba") }
}

struct FiqhRuqyaScreen: ScreenTemplate {
    static let id = "ruqya"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "ruqya")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/ruqya") }
}

struct FiqhSadaqaScreen: ScreenTemplate {
    static let id = "sadaqa"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "sadaqa")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sadaqa") }
}

struct FiqhSalahGuideScreen: ScreenTemplate {
    static let id = "salah-guide"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "salah-guide")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/salah-guide") }
}

struct FiqhSawmScreen: ScreenTemplate {
    static let id = "sawm"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "sawm")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sawm") }
}

struct FiqhSinsAndRightsScreen: ScreenTemplate {
    static let id = "sins-and-rights"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "sins-and-rights")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sins-and-rights") }
}

struct FiqhSujoodSahwScreen: ScreenTemplate {
    static let id = "sujood-sahw"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "sujood-sahw")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sujood-sahw") }
}

struct FiqhTaharaScreen: ScreenTemplate {
    static let id = "tahara"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "tahara")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/tahara") }
}

struct FiqhTalaqScreen: ScreenTemplate {
    static let id = "talaq"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "talaq")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/talaq") }
}

struct FiqhTawbaScreen: ScreenTemplate {
    static let id = "tawba"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "tawba")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/tawba") }
}

struct FiqhUdhiyaScreen: ScreenTemplate {
    static let id = "udhiya"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "udhiya")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/udhiya") }
}

struct FiqhWaqfScreen: ScreenTemplate {
    static let id = "waqf"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "waqf")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/waqf") }
}

struct FiqhWorshipScreen: ScreenTemplate {
    static let id = "worship"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "worship")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/worship") }
}

struct FiqhZakatScreen: ScreenTemplate {
    static let id = "zakat"
    static let title = "الفقه والعبادات"
    static let source = ContentSource.bundled(name: "zakat")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/zakat") }
}

/// قسم «الفقه والعبادات». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum FiqhScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(FiqhAmrBilMarufScreen.self)
        registry.register(FiqhArkanScreen.self)
        registry.register(FiqhArkanImanScreen.self)
        registry.register(FiqhFadailAamalScreen.self)
        registry.register(FiqhFamilyScreen.self)
        registry.register(FiqhFiqhScreen.self)
        registry.register(FiqhFiqhQawaidScreen.self)
        registry.register(FiqhFiqhUsulScreen.self)
        registry.register(FiqhHajjScreen.self)
        registry.register(FiqhJanazaScreen.self)
        registry.register(FiqhJumuahScreen.self)
        registry.register(FiqhMadhahibScreen.self)
        registry.register(FiqhMaqasidShariaScreen.self)
        registry.register(FiqhMawarithScreen.self)
        registry.register(FiqhMawarithCalculatorScreen.self)
        registry.register(FiqhNikahScreen.self)
        registry.register(FiqhPrayerRanksScreen.self)
        registry.register(FiqhPrayerTimesScreen.self)
        registry.register(FiqhPropheticMedicineScreen.self)
        registry.register(FiqhRibaScreen.self)
        registry.register(FiqhRuqyaScreen.self)
        registry.register(FiqhSadaqaScreen.self)
        registry.register(FiqhSalahGuideScreen.self)
        registry.register(FiqhSawmScreen.self)
        registry.register(FiqhSinsAndRightsScreen.self)
        registry.register(FiqhSujoodSahwScreen.self)
        registry.register(FiqhTaharaScreen.self)
        registry.register(FiqhTalaqScreen.self)
        registry.register(FiqhTawbaScreen.self)
        registry.register(FiqhUdhiyaScreen.self)
        registry.register(FiqhWaqfScreen.self)
        registry.register(FiqhWorshipScreen.self)
        registry.register(FiqhZakatScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 5, c[0] == "fiqh", c[1] == "books", c[3] == "chapters" { return AnyView(ItemHost(source: .bundled(name: "fiqh-books"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 5, c[0] == "fiqh", c[1] == "books", c[3] == "lessons" { return AnyView(ItemHost(source: .bundled(name: "fiqh-books"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 3, c[0] == "fiqh", c[1] == "books" { return AnyView(ItemHost(source: .bundled(name: "fiqh-books"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 3, c[0] == "fiqh", c[1] == "topics" { return AnyView(ItemHost(source: .bundled(name: "fiqh-topics"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "madhahib" { return AnyView(ItemHost(source: .bundled(name: "madhahib"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "sins-and-rights" { return AnyView(ItemHost(source: .bundled(name: "sins-and-rights"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}

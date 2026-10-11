// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct AqidahAdabTalabIlmScreen: ScreenTemplate {
    static let id = "adab-talab-ilm"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "adab-talab-ilm")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/adab-talab-ilm") }
}

struct AqidahAkhlaqScreen: ScreenTemplate {
    static let id = "akhlaq"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "akhlaq")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/akhlaq") }
}

struct AqidahAlamatSaahScreen: ScreenTemplate {
    static let id = "alamat-saah"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "alamat-saah")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/alamat-saah") }
}

struct AqidahAmradQalbiyyaScreen: ScreenTemplate {
    static let id = "amrad-qalbiyya"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "amrad-qalbiyya")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/amrad-qalbiyya") }
}

struct AqidahAsmaHusnaScreen: ScreenTemplate {
    static let id = "asma-husna"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "asma-husna")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/asma-husna") }
}

struct AqidahDiscoverIslamScreen: ScreenTemplate {
    static let id = "discover-islam"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam") }
}

struct AqidahDiscoverIslamContactScreen: ScreenTemplate {
    static let id = "discover-islam.contact"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam-contact")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam/contact") }
}

struct AqidahDiscoverIslamDoubtsScreen: ScreenTemplate {
    static let id = "discover-islam.doubts"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam-doubts")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam/doubts") }
}

struct AqidahDiscoverIslamHowToConvertScreen: ScreenTemplate {
    static let id = "discover-islam.how-to-convert"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam-how-to-convert")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam/how-to-convert") }
}

struct AqidahDiscoverIslamNewMuslimScreen: ScreenTemplate {
    static let id = "discover-islam.new-muslim"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam-new-muslim")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam/new-muslim") }
}

struct AqidahDiscoverIslamQuestionsScreen: ScreenTemplate {
    static let id = "discover-islam.questions"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "discover-islam-questions")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/discover-islam/questions") }
}

struct AqidahHikamSalafScreen: ScreenTemplate {
    static let id = "hikam-salaf"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "hikam-salaf")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/hikam-salaf") }
}

struct AqidahImanTopicsScreen: ScreenTemplate {
    static let id = "iman-topics"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "iman-topics")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/iman-topics") }
}

struct AqidahIslamicSectsScreen: ScreenTemplate {
    static let id = "islamic-sects"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "islamic-sects")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/islamic-sects") }
}

struct AqidahJannaNaarScreen: ScreenTemplate {
    static let id = "janna-naar"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "janna-naar")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/janna-naar") }
}

struct AqidahMalaikaScreen: ScreenTemplate {
    static let id = "malaika"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "malaika")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/malaika") }
}

struct AqidahRaqaiqScreen: ScreenTemplate {
    static let id = "raqaiq"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "raqaiq")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/raqaiq") }
}

struct AqidahTawhidScreen: ScreenTemplate {
    static let id = "tawhid"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "tawhid")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/tawhid") }
}

struct AqidahTazkiyaScreen: ScreenTemplate {
    static let id = "tazkiya"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "tazkiya")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct AqidahTazkiyaTopicsScreen: ScreenTemplate {
    static let id = "tazkiya-topics"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "tazkiya-topics")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/tazkiya-topics") }
}

struct AqidahUsraMujtamaScreen: ScreenTemplate {
    static let id = "usra-mujtama"
    static let title = "العقيدة والتزكية"
    static let source = ContentSource.bundled(name: "usra-mujtama")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/usra-mujtama") }
}

/// قسم «العقيدة والتزكية». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum AqidahScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(AqidahAdabTalabIlmScreen.self)
        registry.register(AqidahAkhlaqScreen.self)
        registry.register(AqidahAlamatSaahScreen.self)
        registry.register(AqidahAmradQalbiyyaScreen.self)
        registry.register(AqidahAsmaHusnaScreen.self)
        registry.register(AqidahDiscoverIslamScreen.self)
        registry.register(AqidahDiscoverIslamContactScreen.self)
        registry.register(AqidahDiscoverIslamDoubtsScreen.self)
        registry.register(AqidahDiscoverIslamHowToConvertScreen.self)
        registry.register(AqidahDiscoverIslamNewMuslimScreen.self)
        registry.register(AqidahDiscoverIslamQuestionsScreen.self)
        registry.register(AqidahHikamSalafScreen.self)
        registry.register(AqidahImanTopicsScreen.self)
        registry.register(AqidahIslamicSectsScreen.self)
        registry.register(AqidahJannaNaarScreen.self)
        registry.register(AqidahMalaikaScreen.self)
        registry.register(AqidahRaqaiqScreen.self)
        registry.register(AqidahTawhidScreen.self)
        registry.register(AqidahTazkiyaScreen.self)
        registry.register(AqidahTazkiyaTopicsScreen.self)
        registry.register(AqidahUsraMujtamaScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 3, c[0] == "discover-islam", c[1] == "articles" { return AnyView(ItemHost(source: .bundled(name: "discover-islam-articles"), id: c[2]) { ArticleTemplate(item: $0) }) }
        if c.count == 3, c[0] == "discover-islam", c[1] == "doubts" { return AnyView(ItemHost(source: .bundled(name: "discover-islam-doubts"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 3, c[0] == "discover-islam", c[1] == "new-muslim" { return AnyView(ItemHost(source: .bundled(name: "discover-islam-new-muslim"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 3, c[0] == "discover-islam", c[1] == "questions" { return AnyView(ItemHost(source: .bundled(name: "discover-islam-questions"), id: c[2]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "islamic-sects" { return AnyView(ItemHost(source: .bundled(name: "islamic-sects"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "tawhid" { return AnyView(ItemHost(source: .bundled(name: "tawhid"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}

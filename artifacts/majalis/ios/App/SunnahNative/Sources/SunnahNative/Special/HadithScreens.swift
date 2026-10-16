import SwiftUI

/// حديث موثَّق كما في عقد البيانات (`Data/hadith/verified-sahih.json`) — يُقرأ كما هو، الصحيح فقط.
public struct HadithItem: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public let text: String
    public var collection: String?
    public var hadithNumber: String?
    public var narrator: String?
    public var sourceName: String?
    public var grade: String?
    public var chapter: String?
    public var explanation: String?

    enum CodingKeys: String, CodingKey {
        case id, title, text, collection, narrator, grade, chapter, explanation
        case hadithNumber = "hadith_number"
        case sourceName = "source_name"
    }
}

/// صف من البخاري/مسلم: n الرقم، t النص، b الكتاب، h رقمه في الكتاب.
public struct HadithRaw: Decodable, Identifiable, Hashable, Sendable {
    public let n: Int
    public let t: String
    public var b: Int?
    public var h: Int?
    public var id: Int { n }
}

public struct HadithCollectionFile: Decodable, Sendable {
    public let label: String?
    public let hadiths: [HadithRaw]
}

enum ArabicSearch {
    /// تطبيع للبحث: إزالة التشكيل والتطويل وتوحيد الألف والياء والتاء المربوطة.
    static func normalize(_ s: String) -> String {
        var out = String.UnicodeScalarView()
        for u in s.unicodeScalars {
            switch u.value {
            case 0x064B...0x065F, 0x0670, 0x0640: continue
            case 0x0623, 0x0625, 0x0622: out.append("ا")
            case 0x0649: out.append("ي")
            case 0x0629: out.append("ه")
            default: out.append(u)
            }
        }
        return String(out)
    }
}

/// الأحاديث الصحيحة الموثَّقة: بحث ثم تفاصيل (الراوي والمصدر والدرجة والشرح).
struct HadithListView: View {
    let items: [HadithItem]
    @State private var query = ""

    private var filtered: [HadithItem] {
        let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
        guard !q.isEmpty else { return items }
        return items.filter { ArabicSearch.normalize($0.title + " " + $0.text).contains(q) }
    }

    var body: some View {
        #if DEBUG
        if ProcessInfo.processInfo.environment["SNAP_DETAIL"] == "1", let first = items.first { HadithDetailView(item: first) } else { listBody }   // لقطات التدقيق فقط
        #else
        listBody
        #endif
    }

    @ViewBuilder private var listBody: some View {
        if items.isEmpty { EmptyStateView() } else {
            List(filtered) { item in
                SunnahNavigationLink { HadithDetailView(item: item) } label: {
                    SunnahListRow(title: item.title, subtitle: item.sourceName ?? item.chapter)
                }.sunnahRowChrome()
            }
            .listStyle(.plain).scrollContentBackground(.hidden).sunnahReadableWidth().background(Sunnah.Colors.bg)
            .searchable(text: $query, prompt: "ابحث في الأحاديث")
        }
    }
}

struct HadithDetailView: View {
    let item: HadithItem
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        SunnahArabicText(item.text, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let narrator = item.narrator {
                            Text(narrator).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        if let source = item.sourceName { Text(source).font(Sunnah.Typography.cardTitle) }
                        if let grade = item.grade { Text(grade).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary) }
                        if let chapter = item.chapter { Text(chapter).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                }
                if let explanation = item.explanation {
                    SunnahCard { SunnahSectionedMarkdown(explanation, key: "hadith-\(item.id)", style: .body).foregroundStyle(Sunnah.Colors.textPrimary) }
                }
                SunnahReportIssueButton(title: item.title, id: item.id, section: item.collection ?? "الحديث", inset: false)
            }.padding(Sunnah.Spacing.pageX)
        }
        .sunnahReadableWidth().background(Sunnah.Colors.bg)
        .navigationTitle(item.title)
        .sunnahReportIssueToolbar(title: item.title, id: item.id, section: item.collection ?? "الحديث")
    }
}

struct HadithScreen: ScreenTemplate {
    static let id = "hadith"
    static let title = "الحديث"
    static let source = ContentSource.bundled(name: "verified-sahih", subdirectory: "Data/hadith")
    let content: [HadithItem]
    init(content: [HadithItem]) { self.content = content }
    var body: some View { HadithListView(items: content) }
}

struct HadithSahihScreen: ScreenTemplate {
    static let id = "hadith.sahih"
    static let title = "الأحاديث الصحيحة"
    static let source = ContentSource.bundled(name: "verified-sahih", subdirectory: "Data/hadith")
    let content: [HadithItem]
    init(content: [HadithItem]) { self.content = content }
    var body: some View { HadithListView(items: content) }
}

/// كتب الحديث المحزومة: صحيح البخاري وصحيح مسلم.
struct HadithBooksView: View {
    var body: some View {
        List {
            SunnahNavigationLink { HadithCollectionView(file: "bukhari", title: "صحيح البخاري", showNumber: true) } label: {
                SunnahListRow(title: "صحيح البخاري", subtitle: "الجامع الصحيح")
            }.sunnahRowChrome()
            SunnahNavigationLink { HadithCollectionView(file: "muslim", title: "صحيح مسلم", showNumber: false) } label: {
                SunnahListRow(title: "صحيح مسلم", subtitle: "المسند الصحيح")
            }.sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).sunnahReadableWidth().background(Sunnah.Colors.bg)
    }
}

/// مجموعة كاملة بتحميل كسول وبحث؛ رقم مسلم تسلسلي محلي فلا يُعرض مرجعًا.
struct HadithCollectionView: View {
    @Environment(\.contentLoader) private var loader
    let file: String; let title: String; let showNumber: Bool
    @State private var phase: Phase = .loading
    @State private var query = ""
    private enum Phase { case loading, failed, ready([HadithRaw]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .ready(let all):
                let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
                let rows = q.isEmpty ? all : all.filter { ArabicSearch.normalize($0.t).contains(q) }
                List(rows) { row in
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        SunnahArabicText(row.t, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                        if showNumber { Text("رقم \(row.n)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }.sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
                .searchable(text: $query, prompt: "ابحث في \(title)")
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        .navigationTitle(title)
        .task(id: file) { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let f = try await loader.load(HadithCollectionFile.self, from: .bundled(name: file, subdirectory: "Data/hadith"))
            phase = .ready(f.hadiths)
        } catch { phase = .failed }
    }
}

/// شاشة بلا محتوى محزوم بعد (أقسام لم تُصدَّر بياناتها).
struct ContentPendingView: View {
    let message: String
    var body: some View {
        EmptyStateView(title: message).frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
    }
}

public enum HadithScreens {
    @MainActor
    public static func register(in registry: TemplateRegistry) {
        registry.register(HadithScreen.self)
        registry.register(HadithSahihScreen.self)
        registry.registerView(id: "hadith.books") { HadithBooksView().navigationTitle("كتب الحديث") }
        registry.registerView(id: "hadith.daif") { WeakHadithListView(file: "weak-daif", title: "الأحاديث الضعيفة") }
        registry.registerView(id: "hadith.mawdu") { WeakHadithListView(file: "weak-mawdu", title: "الأحاديث الموضوعة") }
        // بياناتها ليست في عقد البيانات بعد (صفحات ويب مضمّنة): تنتظر تصديرًا من ن1.
        registry.registerView(id: "arbaeen-nawawi") { ReaderDataScreens.arbaeenList() }
        registry.registerView(id: "wasaya-nabawiyya") { ReaderDataScreens.wasayaScreen() }
    }

    /// مسارات بمعاملات لا تُسجَّل بمعرّف: `/arbaeen-nawawi/:id` (من hadith/arbaeen-nawawi) و`/c/:slug` (استشهاد عام يُجلب من الخادم: CitationScreen).
    public static func resolve(path base: String) -> AnyView? {
        let c = base.split(separator: "/").map(String.init)
        guard c.count == 2 else { return nil }
        switch c[0] {
        case "arbaeen-nawawi":
            return AnyView(ReaderDataScreens.arbaeenDetail(id: c[1].removingPercentEncoding ?? c[1]))
        case "c":
            return AnyView(CitationScreen(slug: c[1].removingPercentEncoding ?? c[1]))
        default:
            return nil
        }
    }
}

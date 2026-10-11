import SwiftUI

/// مصادر بيانات القسم. المحزوم تحت `Data/<مجموعة>/` في `Bundle.main` (مثل الأذكار)، والمتغيّر يوميًا من الشبكة
/// بمسار الموقع نفسه (`/data/...`) عبر DataStore كما ينص DATA_CONTRACT §2.
enum LearnSources {
    static let lessons = ContentSource.remote(path: "/data/lessons/chunk-000.json", maxAge: 3600)
    static let quizManifest = ContentSource.bundled(name: "manifest", subdirectory: "Data/quiz")
    static func quizChunk(_ chunk: LearnQuizManifest.Chunk) -> ContentSource {
        .bundled(name: chunk.resourceName, subdirectory: "Data/quiz")
    }
    static let universities = ContentSource.bundled(name: "universities", subdirectory: "Data/learn")
    static let institutions = ContentSource.bundled(name: "institutions", subdirectory: "Data/learn")
    static let competitions = ContentSource.bundled(name: "competitions", subdirectory: "Data/learn")
    static let kuwaitSheikhs = ContentSource.bundled(name: "kuwait-sheikhs", subdirectory: "Data/learn")
    static let durusImaniyya = ContentSource.bundled(name: "durus-imaniyya", subdirectory: "Data/learn")
    static let durusMutanawwia = ContentSource.bundled(name: "durus-mutanawwia", subdirectory: "Data/learn")
    static let graph = ContentSource.bundled(name: "links", subdirectory: "Data/graph")
    static func knowledge(_ relativePath: String) -> ContentSource {
        .remote(path: "/data/knowledge/" + relativePath, maxAge: 86_400)
    }

    /// يحمّل عناصر قسم المعرفة من ملفاته (الملف الغائب يُتجاوز كما في الويب)، ويُبقي `verified` فقط.
    static func loadKnowledge(section: String, with loader: ContentLoader) async throws -> [LearnKnowledgeItem] {
        guard let files = LearnKnowledgeSections.files(for: section) else { return [] }
        var items: [LearnKnowledgeItem] = []
        var loadedAny = false
        var lastError: Error?
        for file in files {
            do {
                items += try await loader.load(LearnKnowledgeFile.self, from: knowledge(file)).items
                loadedAny = true
            } catch { lastError = error }
        }
        if !loadedAny, let lastError { throw lastError }
        return items.filter(\.isVerified)
    }
}

/// يحمّل قيمة بأي طريقة ثم يعرضها، بحالات التحميل/الخطأ الموحّدة نفسها في ItemHost.
struct LearnLoadHost<Value: Sendable, Content: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let load: @Sendable (ContentLoader) async throws -> Value
    @ViewBuilder let content: (Value) -> Content

    private enum Phase { case loading, failed, ready(Value) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await reload() } }
            case .ready(let value): content(value)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await reload() }
    }

    private func reload() async {
        phase = .loading
        do { phase = .ready(try await load(loader)) } catch { phase = .failed }
    }
}

extension LearnLoadHost where Value: Decodable {
    /// اختصار لمصدر واحد.
    init(_ source: ContentSource, @ViewBuilder content: @escaping (Value) -> Content) {
        self.load = { try await $0.load(Value.self, from: source) }
        self.content = content
    }
}

/// سطر «عنوان: قيمة» في صفحات التفاصيل؛ يختفي إن كانت القيمة فارغة.
struct LearnInfoRow: View {
    let label: String; let value: String?
    var body: some View {
        if let value, !value.isEmpty {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(label).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                Text(value).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityElement(children: .combine)
        }
    }
}

/// رابط خارجي (موقع، خريطة، بث) يفتح في المتصفح؛ لا يظهر إن لم يكن http(s) صالحًا.
struct LearnExternalLink: View {
    let title: String; let urlString: String?
    var body: some View {
        if let s = urlString, let url = URL(string: s), ["http", "https"].contains(url.scheme?.lowercased() ?? "") {
            Link(destination: url) {
                Text(title).font(Sunnah.Typography.cardTitle)
                    .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.buttonHeight)
                    .foregroundStyle(Sunnah.Colors.primary)
                    .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
            }
        }
    }
}

/// صفحة تفاصيل قابلة للتمرير بهوامش القسم الموحّدة.
struct LearnDetailPage<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                Text(title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                content()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(title)
    }
}

/// قائمة مُنسَّقة بنمط القوالب (ListTemplate) لعناصر غير ContentItem.
struct LearnList<Item: Identifiable, Row: View>: View {
    let items: [Item]
    var emptyTitle: String = "لا يوجد محتوى بعد"
    @ViewBuilder let row: (Item) -> Row
    var body: some View {
        if items.isEmpty { EmptyStateView(title: emptyTitle) } else {
            List(items) { item in row(item).listRowBackground(Sunnah.Colors.surface) }
                .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
}

/// يجمع الأجزاء غير الفارغة بفاصل؛ nil إن لم يبقَ شيء (لا سطر ثانوي فارغ).
func learnLine(_ parts: String?..., separator: String = " — ") -> String? {
    let kept = parts.compactMap { $0 }.filter { !$0.isEmpty }
    return kept.isEmpty ? nil : kept.joined(separator: separator)
}

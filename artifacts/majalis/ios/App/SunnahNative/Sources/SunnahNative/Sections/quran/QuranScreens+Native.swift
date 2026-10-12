import SwiftUI

/// يحمّل فهرس المصحف المحزوم وترتيب النزول ثم يعرض صفوف السور. غياب ملف الترتيب لا يحجب القائمة (ينقص الترتيب فقط).
struct QuranRowsView<V: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    @ViewBuilder let content: (MushafIndex, [QuranSurahRow]) -> V

    private enum Phase { case loading, failed, unavailable, ready(MushafIndex, [QuranSurahRow]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let idx, let rows): content(idx, rows)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await load() }
    }

    private func load() async {
        phase = .loading
        guard let repo = MushafRepository(bundle: .main) else { phase = .unavailable; return }
        do {
            let idx = try repo.index()
            let meta = (try? await loader.load([QuranSurahMeta].self, from: QuranData.metaFile)) ?? []
            phase = .ready(idx, QuranAdapters.rows(index: idx, meta: meta))
        } catch { phase = .failed }
    }
}

/// قائمة سور تفتح المصحف الأصلي عند صفحة السورة.
struct QuranSurahList: View {
    let rows: [QuranSurahRow]
    let index: MushafIndex
    var showOrder = false
    @StateObject private var store = MushafStore()

    var body: some View {
        if rows.isEmpty { EmptyStateView(title: QuranSection.pendingTitle) } else {
            List(rows) { r in
                NavigationLink {
                    MushafReaderView(repo: MushafRepository(bundle: .main) ?? MushafRepository(root: URL(fileURLWithPath: "/")),
                                     index: index, search: nil, store: store, startPage: r.firstPage)
                        .environment(\.layoutDirection, .rightToLeft)
                } label: {
                    SunnahListRow(title: "\(showOrder ? r.revelationOrder ?? r.id : r.id). \(r.name)",
                                  subtitle: "\(r.placeName) · \(r.ayahs) آية · صفحة \(r.firstPage)", showsChevron: false)
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
            .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
}

/// شاشات قسم «القرآن» الأصلية فوق المصحف الأصلي. الربط: `QuranSection.register(in:)` بعد `GeneratedScreens.registerAll`
/// (انظر docs/native/requests/quran.md). المعرّفات: المسار بلا الشرطة المائلة الأولى وبنقطة بدل `/`.
public enum QuranSection {
    static let title = "القرآن الكريم"
    static let pendingTitle = "المحتوى قيد التوثيق"

    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "quran-hub") { SectionsListTemplate(links: QuranLinks.hub).navigationTitle(title) }
        registry.registerView(id: "tafsir") { TafsirHomeView().navigationTitle("التفسير") }
        registry.registerView(id: "quran.surahs") {
            QuranRowsView { idx, rows in QuranSurahList(rows: rows, index: idx) }.navigationTitle("فهرس السور")
        }
        registry.registerView(id: "quran.revelation-order") {
            QuranRowsView { idx, rows in QuranSurahList(rows: QuranAdapters.byRevelation(rows), index: idx, showOrder: true) }
                .navigationTitle("ترتيب النزول")
        }
        registry.registerView(id: "quran.makki-madani") {
            QuranRowsView { idx, rows in
                QuranSurahList(rows: QuranAdapters.makki(rows) + QuranAdapters.madani(rows), index: idx)
            }.navigationTitle("المكي والمدني")
        }
    }
}

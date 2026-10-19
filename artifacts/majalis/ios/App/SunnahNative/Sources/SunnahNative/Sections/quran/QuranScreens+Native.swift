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
            ScrollView { LazyVStack(spacing: 0) {
              SunnahGroupedCard(rows) { r in
                SunnahNavigationLink {
                    MushafReaderView(repo: MushafRepository(bundle: .main) ?? MushafRepository(root: URL(fileURLWithPath: "/")),
                                     index: index, search: nil, store: store, startPage: r.firstPage)
                        .environment(\.layoutDirection, .rightToLeft)
                } label: {
                    SunnahListRow(title: "\(showOrder ? r.revelationOrder ?? r.id : r.id). \(r.name)",
                                  subtitle: "\(r.placeName) · \(r.ayahs) آية · صفحة \(r.firstPage)")
                }
              }
            }.padding(.horizontal, Sunnah.Spacing.s4) }
            .background(Sunnah.Colors.bg)
        }
    }
}

/// شاشات قسم «القرآن» الأصلية فوق المصحف الأصلي. الربط: `QuranSection.register(in:)` بعد `GeneratedScreens.registerAll`
/// (انظر docs/native/requests/quran.md). المعرّفات: المسار بلا الشرطة المائلة الأولى وبنقطة بدل `/`.
public enum QuranSection {
    static let title = "القرآن الكريم"
    static let pendingTitle = "المحتوى قيد التوثيق"

    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "quran-hub") { SectionsListTemplate(links: QuranLinks.hub).quranTitle(title) }
        // مشغّل الأوفلاين: تنزيل/إيقاف/حذف التلاوات وتشغيل المحلي أولًا (التشغيل نفسه في المصحف)
        registry.registerView(id: "quran.offline-player") { TemplateHost<OfflineAudioScreen>() }
        // محرك القرآن: المصحف الأصلي بمتابعة آخر موضع (اللوحة والعارض سطحان لشاشة واحدة أصلية)
        registry.registerView(id: "quran-engine") { MushafScreen() }
        registry.registerView(id: "tafsir") { TafsirHomeView().quranTitle("التفسير") }
        registry.registerView(id: "quran.people") {
            QuranPeopleLoader { people in
                QuranPeopleListView(people: people, surahNames: Self.surahNames())
            }.quranTitle("أعلام القرآن")
        }
        registry.registerView(id: "quran.search") { MushafScreen(startSearching: true) }   // البحث داخل صفحة المصحف نفسها
        registry.registerView(id: "quran.surahs") {
            QuranRowsView { idx, rows in QuranSurahList(rows: rows, index: idx) }.quranTitle("فهرس السور")
        }
        registry.registerView(id: "quran.revelation-order") {
            QuranRowsView { idx, rows in QuranSurahList(rows: QuranAdapters.byRevelation(rows), index: idx, showOrder: true) }
                .quranTitle("ترتيب النزول")
        }
        registry.registerView(id: "quran.makki-madani") {
            QuranRowsView { idx, rows in
                QuranSurahList(rows: QuranAdapters.makki(rows) + QuranAdapters.madani(rows), index: idx)
            }.quranTitle("المكي والمدني")
        }
        registry.registerView(id: "quran-hub.tajweed") {
            QuranBundledLoader(name: "tajweed", isEmpty: { (f: TajweedFile) in f.chapters.isEmpty }) { TajweedListView(file: $0) }.quranTitle("التجويد")
        }
        registry.registerView(id: "quran.surah-stories") {
            QuranBundledLoader(name: "surah-stories", isEmpty: { (s: [SurahStory]) in s.isEmpty }) { SurahStoriesListView(stories: $0) }.quranTitle("قصص السور")
        }
        registry.registerView(id: "hifz-path") {
            QuranBundledLoader(name: "hifz-paths", isEmpty: { (p: [HifzPath]) in p.isEmpty }) { HifzPathsListView(paths: $0) }.quranTitle("مسار الحفظ")
        }
        registry.registerView(id: "quran-hub.numbers") {
            QuranBundledLoader(name: "stats", isEmpty: { (s: [QuranStat]) in s.isEmpty }) { QuranStatsView(stats: $0) }.quranTitle("أرقام القرآن")
        }
        registry.registerView(id: "quran-hub.qiraat") {
            QuranBundledLoader(name: "qiraat", isEmpty: { (f: QiraatFile) in f.sections.isEmpty && f.ashara.isEmpty }) { QiraatView(file: $0) }.quranTitle("القراءات")
        }
        registry.registerView(id: "quran-hub.seven-ahruf") {
            QuranBundledLoader(name: "ahruf", isEmpty: { (a: [AhrufSection]) in a.isEmpty }) { AhrufListView(sections: $0) }.quranTitle("الأحرف السبعة")
        }
        registry.registerView(id: "quran-hub.terms") {
            LibraryLoadedView(source: LibrarySection.File.glossary, adapt: { (t: [LibraryGlossaryTerm]) in LibraryAdapters.glossary(t.filter { $0.category == "quran" }) }) {
                LibraryInlineItemsView(items: $0, layout: .list, reader: .detail)
            }.quranTitle("مصطلحات علوم القرآن")
        }
        registry.registerView(id: "miracles") {
            QuranBundledLoader(name: "miracles", isEmpty: { (m: [MiracleItem]) in m.isEmpty }) { MiraclesListView(items: $0) }.quranTitle("الإشارات الكونية")
        }
        registry.registerView(id: "mutashabihat") {
            QuranBundledLoader(name: "mutashabihat", isEmpty: { (m: [MutashabihatPair]) in m.isEmpty }) { MutashabihatListView(pairs: $0) }.quranTitle("المتشابهات")
        }
        registry.registerView(id: "ulum-quran") {
            QuranBundledLoader(name: "ulum-quran", isEmpty: { (u: [UlumQuranItem]) in u.isEmpty }) { UlumQuranListView(items: $0) }.quranTitle("علوم القرآن")
        }
        registry.registerView(id: "quran-hub.tilawa") {
            QuranBundledLoader(name: "tilawa-reciters", isEmpty: { (r: [TilawaReciter]) in r.isEmpty }) { TilawaListView(reciters: $0) }.quranTitle("التلاوة")
        }
        registry.registerView(id: "quran-circles") {
            QuranBundledLoader(name: "circles", isEmpty: { (c: [QuranCircle]) in c.isEmpty }) { QuranCirclesListView(circles: $0) }.quranTitle("حلقات التحفيظ")
        }
        registry.registerView(id: "quran.worship-hub") { SectionsListTemplate(links: WorshipHubLinks.all).quranTitle("عبادات القرآن") }
        // حالة مستخدم محلية على الجهاز (UserDefaults) بلا خادم
        registry.registerView(id: "memorization") { MemorizationHubView().quranTitle("الحفظ") }
        registry.registerView(id: "quran-memorization") { QuranMemorizationView().quranTitle("حفظ القرآن") }
        registry.registerView(id: "quran-knowledge") { SectionsListTemplate(links: QuranLinks.knowledge).quranTitle("القرآن وعلومه") }
        registry.registerView(id: "quran.memorization-plans") { HifzPlanScreen() }
        registry.registerView(id: "quran.hifz-loop") { HifzLoopScreen() }
        registry.registerView(id: "hifz-path.my") {
            QuranBundledLoader(name: "hifz-paths", isEmpty: { (p: [HifzPath]) in p.isEmpty }) { MyHifzPathsView(paths: $0) }.quranTitle("مساري في الحفظ")
        }
        registry.registerView(id: "mushaf.bookmarks") { MushafBookmarksScreen() }
        // مسارات بلا مصدر موثّق/حالة اعتماد (متشابهات مراجع فقط، حالة مستخدم، صوت، علوم/مصطلحات غير مصدَّرة): «قيد التوثيق» بدل شاشة «تعرّف إلى الإسلام»
        for id in pendingIDs {
            registry.registerView(id: id) { EmptyStateView(title: pendingTitle) }
        }
    }

    static let pendingIDs: [String] = []

    static func surahNames() -> [Int: String] {
        guard let idx = try? MushafRepository(bundle: .main)?.index() else { return [:] }
        return Dictionary(uniqueKeysWithValues: idx.surahs.map { ($0.id, $0.name) })
    }
}

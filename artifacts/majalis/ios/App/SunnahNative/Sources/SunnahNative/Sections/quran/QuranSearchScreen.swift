import SwiftUI

/// بحث نص المصحف الحرفي (Tanzil) بالتطبيع المشترك؛ النتيجة تفتح المصحف الأصلي عند صفحة الآية.
struct QuranSearchView: View {
    private struct Loaded { let repo: MushafRepository; let index: MushafIndex; let search: MushafSearch }
    @State private var loaded: Loaded?
    @State private var failed = false
    @State private var query = ""
    @StateObject private var store = MushafStore()

    var body: some View {
        Group {
            if let l = loaded { results(l) }
            else if failed { EmptyStateView(title: QuranSection.pendingTitle) }
            else { LoadingStateView() }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { load() }
        #if DEBUG
        // لقطات التدقيق فقط: `-snapshotSearchQuery <نص>` يملأ مربع البحث.
        .onAppear { if let q = UserDefaults.standard.string(forKey: "snapshotSearchQuery"), !q.isEmpty { query = q } }
        #endif
    }

    private func results(_ l: Loaded) -> some View {
        let hits = l.search.search(query)
        return List {
            if query.count >= 2 && hits.isEmpty { EmptyStateView(title: "لا نتائج").frame(maxWidth: .infinity).listRowBackground(Color.clear).listRowSeparator(.hidden) }
            ForEach(hits) { h in
                SunnahNavigationLink {
                    MushafReaderView(repo: l.repo, index: l.index, search: l.search, store: store, startPage: h.page)
                        .environment(\.layoutDirection, .rightToLeft)
                } label: {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        Text(h.text).font(Sunnah.Typography.quran).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text("\(h.ayah) · صفحة \(h.page)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
            .sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        .searchable(text: $query, prompt: "ابحث في القرآن")
    }

    private func load() {
        guard loaded == nil, let repo = MushafRepository(bundle: .main), let idx = try? repo.index(),
              let dir = Bundle.main.url(forResource: "quran", withExtension: nil, subdirectory: "Data"),
              let s = try? MushafSearch(surahDirectory: dir, ayahPage: idx.ayahPage) else { failed = true; return }
        loaded = Loaded(repo: repo, index: idx, search: s)
    }
}

import SwiftUI
import os

/// شاشة المصحف: تحمّل `Data/mushaf` (مضمّنة في الحزمة) وتعرض `MushafReaderView`؛ حالة خطأ صريحة بدل صفحة فارغة.
struct MushafScreen: View {
    /// رابط عميق اختياري (`/mushaf/page/N` أو `/mushaf/ayah/S:A`)؛ بلا رابط تُفتح آخر صفحة محفوظة.
    var target: MushafRoute?
    /// يفتح المصحف وحقل البحث مركَّز (مسار /quran/search).
    var startSearching = false
    @StateObject private var store = MushafStore()
    @State private var state: Loaded?
    @Environment(\.platform) private var platform
    @Environment(\.scenePhase) private var scenePhase

    private struct Loaded { let repo: MushafRepository; let index: MushafIndex; var search: MushafSearch? }

    var body: some View {
        Group {
            if let s = state {
                MushafReaderView(repo: s.repo, index: s.index, search: s.search, store: store, startPage: Self.startPage(target, s.index), startSearching: startSearching)
            } else {
                ProgressView().screenState(.loading).task {
                    // الفهرس والمستودع خفيفان فتُفتح الصفحة فورًا؛ فهرس البحث يُبنى خلفيًا خارج الخيط الرئيسي ويصل لاحقًا.
                    let log = Logger(subsystem: "com.yousef.majlisilm", category: "mushaf-perf"); log.notice("MUSHAF_PERF screen_task_start")
                    state = await Task.detached(priority: .userInitiated) { Self.load() }.value
                    log.notice("MUSHAF_PERF repo_index_ready")
                    if let s = state, let dir = Self.quranDirectory {
                        let idx = s.index
                        let search = await Task.detached(priority: .utility) { try? MushafSearch(surahDirectory: dir, ayahPage: idx.ayahPage) }.value
                        state?.search = search
                        log.notice("MUSHAF_PERF search_ready")
                    }
                }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        // «أين توقفت»: نشر آخر موضع للويدجت عند مغادرة المصحف وعند الذهاب للخلفية.
        .onDisappear { publishPosition() }
        .onChange(of: scenePhase) { if $0 == .background { publishPosition() } }
    }

    private func publishPosition() {
        guard let idx = state?.index else { return }
        MushafPositionPublisher.publish(page: store.lastPage, index: idx, to: platform.sharedData)
    }

    private static func startPage(_ t: MushafRoute?, _ idx: MushafIndex) -> Int? {
        switch t {
        case .page(let n): return n
        case .ayah(let s, let a): return idx.ayahPage["\(s):\(a)"]
        case nil: return nil
        }
    }

    private nonisolated static var quranDirectory: URL? { Bundle.main.url(forResource: "quran", withExtension: nil, subdirectory: "Data") }

    private nonisolated static func load() -> Loaded? {
        guard let repo = MushafRepository(bundle: .main), let idx = try? repo.index() else { return nil }
        return Loaded(repo: repo, index: idx, search: nil)
    }
}

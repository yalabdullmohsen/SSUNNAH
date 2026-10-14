import SwiftUI

/// شاشة المصحف: تحمّل `Data/mushaf` (مضمّنة في الحزمة) وتعرض `MushafReaderView`؛ حالة خطأ صريحة بدل صفحة فارغة.
struct MushafScreen: View {
    /// رابط عميق اختياري (`/mushaf/page/N` أو `/mushaf/ayah/S:A`)؛ بلا رابط تُفتح آخر صفحة محفوظة.
    var target: MushafRoute?
    @StateObject private var store = MushafStore()
    @State private var state: Loaded?

    private struct Loaded { let repo: MushafRepository; let index: MushafIndex; let search: MushafSearch? }

    var body: some View {
        Group {
            if let s = state {
                MushafReaderView(repo: s.repo, index: s.index, search: s.search, store: store, startPage: Self.startPage(target, s.index))
            } else {
                ProgressView().task { state = Self.load() }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    private static func startPage(_ t: MushafRoute?, _ idx: MushafIndex) -> Int? {
        switch t {
        case .page(let n): return n
        case .ayah(let s, let a): return idx.ayahPage["\(s):\(a)"]
        case nil: return nil
        }
    }

    private static func load() -> Loaded? {
        guard let repo = MushafRepository(bundle: .main), let idx = try? repo.index() else { return nil }
        let dir = Bundle.main.url(forResource: "quran", withExtension: nil, subdirectory: "Data")
        let search = dir.flatMap { try? MushafSearch(surahDirectory: $0, ayahPage: idx.ayahPage) }
        return Loaded(repo: repo, index: idx, search: search)
    }
}

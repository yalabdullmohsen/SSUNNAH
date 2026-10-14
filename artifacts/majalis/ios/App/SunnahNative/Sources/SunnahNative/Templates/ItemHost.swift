import SwiftUI

/// يحمّل قائمة عناصر القسم ويعرض العنصر ذا المعرّف المطلوب (مسارات :id، التي لا يحملها ScreenTemplate).
struct ItemHost<Content: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let source: ContentSource; let id: String
    @ViewBuilder let content: (ContentItem) -> Content

    private enum Phase { case loading, failed, missing, ready(ContentItem) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .missing: EmptyStateView()
            case .ready(let item): content(item)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: "\(String(describing: source))|\(id)") { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let items = try await loader.load([ContentItem].self, from: source)
            if let item = items.first(where: { $0.id == id }) { phase = .ready(item) } else { phase = .missing }
        } catch { phase = .failed }
    }
}

/// يحمّل قائمة القسم كاملة ويعرضها بقالب جماعي (مسارات :id لقوالب البحث/القائمة/الشبكة).
struct CollectionHost<Content: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let source: ContentSource
    @ViewBuilder let content: ([ContentItem]) -> Content

    private enum Phase { case loading, failed, ready([ContentItem]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .ready(let items): content(items)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: String(describing: source)) { await load() }
    }

    private func load() async {
        phase = .loading
        do { phase = .ready(try await loader.load([ContentItem].self, from: source)) } catch { phase = .failed }
    }
}

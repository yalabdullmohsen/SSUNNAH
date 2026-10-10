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
        .task { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let items = try await loader.load([ContentItem].self, from: source)
            if let item = items.first(where: { $0.id == id }) { phase = .ready(item) } else { phase = .missing }
        } catch { phase = .failed }
    }
}

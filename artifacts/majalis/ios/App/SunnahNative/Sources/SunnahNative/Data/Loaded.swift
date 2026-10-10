import SwiftUI

/// يحمّل قيمة من المستودع المحقون ويعرض التحميل/الخطأ/الفراغ تلقائيًا.
struct Loaded<Value, Content: View>: View {
    @Environment(\.contentRepository) private var repo
    @State private var state: LoadState<Value> = .loading
    let load: (any ContentRepository) async throws -> Value
    let isEmpty: (Value) -> Bool
    @ViewBuilder let content: (Value) -> Content

    var body: some View {
        LoadStateView(state: state, isEmpty: isEmpty, retry: { Task { await run() } }, content: content)
            .task { await run() }
    }

    private func run() async {
        state = .loading
        do {
            guard let repo else { throw ContentError.noRepository }
            state = .loaded(try await load(repo))
        } catch { state = .failed }
    }
}

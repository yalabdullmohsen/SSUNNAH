import SwiftUI

/// قالب 6 — بحث: حقل بحث أصلي + نتائج؛ section = nil يعني كل الأقسام.
public struct SearchTemplate: View {
    @Environment(\.contentRepository) private var repo
    let section: String?; let title: String; let open: (ContentItem) -> Void
    @State private var query = ""
    @State private var state: LoadState<[ContentItem]>?

    public init(section: String? = nil, title: String, open: @escaping (ContentItem) -> Void = { _ in }) {
        self.section = section; self.title = title; self.open = open
    }

    public var body: some View {
        Group {
            if let state {
                LoadStateView(state: state, isEmpty: { $0.isEmpty }, retry: { Task { await run() } }) { items in
                    List(items) { item in
                        Button { open(item) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                            .buttonStyle(.plain).listRowBackground(Sunnah.Colors.surface)
                    }
                    .listStyle(.plain).scrollContentBackground(.hidden)
                }
            } else {
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg).navigationTitle(title)
        .searchable(text: $query)
        .task(id: query) { await run() }
    }

    private func run() async {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard q.count >= 2 else { state = nil; return }
        state = .loading
        do {
            guard let repo else { throw ContentError.noRepository }
            state = .loaded(try await repo.search(section: section, query: q))
        } catch { if !Task.isCancelled { state = .failed } }
    }
}

import SwiftUI

/// شاشات القراءة الكاملة (المصحف…) تخفي شريط التبويب العائم كي لا يغطي آخر سطر ولا رقم الصفحة.
/// تُعلن الشاشة نفسها بـ`.immersiveReader(revealed:)`؛ والغلاف (`RootTabView`) يقرأ الحالة فيخفي الشريط ويصفّر الهامش السفلي.
/// `revealed` يُظهر الشريط مؤقتًا (لمسة الصفحة مع ضوابط الأعلى) ويخفيه بلمسة ثانية.
@MainActor
public final class ImmersiveReaderState: ObservableObject {
    private struct Entry { let id: UUID; var revealed: Bool }
    @Published private var entries: [Entry] = []

    public init() {}

    /// الشاشة العليا في المكدّس هي صاحبة القرار.
    public var hidesTabBar: Bool { entries.last.map { !$0.revealed } ?? false }
    public var isActive: Bool { !entries.isEmpty }

    func enter(_ id: UUID, revealed: Bool) {
        if let i = entries.firstIndex(where: { $0.id == id }) { entries[i].revealed = revealed } else { entries.append(Entry(id: id, revealed: revealed)) }
    }
    func leave(_ id: UUID) { entries.removeAll { $0.id == id } }
}

private struct ImmersiveReaderKey: EnvironmentKey {
    @MainActor static let defaultValue = ImmersiveReaderState()
}

extension EnvironmentValues {
    var immersiveReader: ImmersiveReaderState {
        get { self[ImmersiveReaderKey.self] }
        set { self[ImmersiveReaderKey.self] = newValue }
    }
}

private struct ImmersiveReaderModifier: ViewModifier {
    let revealed: Bool
    @Environment(\.immersiveReader) private var state
    @State private var id = UUID()

    func body(content: Content) -> some View {
        content
            .onAppear { state.enter(id, revealed: revealed) }
            .onChange(of: revealed) { state.enter(id, revealed: $0) }
            .onDisappear { state.leave(id) }
    }
}

public extension View {
    /// يعلن أن هذه الشاشة قراءة كاملة: الشريط السفلي مخفي افتراضيًا، ويظهر حين `revealed`.
    func immersiveReader(revealed: Bool = false) -> some View { modifier(ImmersiveReaderModifier(revealed: revealed)) }
}

/// قاعدة واحدة: شريط التبويب مخفي في كل شاشات المصحف (الصفحة، البحث، القراءة) والتفسير، أيًّا كان مسار فتحها.
public enum ReaderRoutes {
    public static func hidesTabBar(path: String) -> Bool {
        let p = path.split(separator: "?", maxSplits: 1).first.map(String.init) ?? path
        return p == "/mushaf" || p.hasPrefix("/mushaf/") || p.hasPrefix("/tafsir/")
    }
}

import SwiftUI

/// عقد القوالب: كل شاشة محتوى تصف مصدر بياناتها ونوعها وطريقة عرضها،
/// ويتولى `TemplateHost` التحميل وحالات التحميل/الخطأ/الفراغ موحّدةً.
public protocol ScreenTemplate: View {
    associatedtype Content: Decodable & Sendable

    /// معرّف الشاشة في `TemplateRegistry` (يطابق `Route.native`).
    static var id: String { get }
    static var title: String { get }
    static var source: ContentSource { get }

    init(content: Content)
}

public extension ScreenTemplate {
    static var title: String { "" }
}

/// يحمّل محتوى القالب ثم يعرضه؛ يعيد المحاولة عند الخطأ.
public struct TemplateHost<T: ScreenTemplate>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading

    private enum Phase {
        case loading, failed, ready(T.Content)
    }

    public init(_ template: T.Type = T.self) {}

    public var body: some View {
        Group {
            switch phase {
            case .loading: ProgressView()
            case .failed:
                ErrorStateView { Task { await load() } }
            case .ready(let content): T(content: content)
            }
        }
        .navigationTitle(T.title)
        .task { await load() }
    }

    private func load() async {
        phase = .loading
        do { phase = .ready(try await loader.load(T.Content.self, from: T.source)) }
        catch { phase = .failed }
    }
}

private struct ContentLoaderKey: EnvironmentKey {
    static let defaultValue = ContentLoader()
}

public extension EnvironmentValues {
    var contentLoader: ContentLoader {
        get { self[ContentLoaderKey.self] }
        set { self[ContentLoaderKey.self] = newValue }
    }
}

/// سجل القوالب: يربط `Route.native(id)` بالشاشة. تسجّل ن2 قوالبها هنا.
@MainActor
public final class TemplateRegistry {
    public static let shared = TemplateRegistry()
    private var builders: [String: () -> AnyView] = [:]

    public init() {}

    public func register<T: ScreenTemplate>(_ template: T.Type) {
        builders[T.id] = { AnyView(TemplateHost<T>()) }
    }

    /// شاشة خاصة بلا محتوى JSON (المواقيت، الرئيسية...).
    public func registerView<V: View>(id: String, @ViewBuilder _ build: @escaping () -> V) {
        builders[id] = { AnyView(build()) }
    }

    public func view(for id: String) -> AnyView? { builders[id]?() }
}

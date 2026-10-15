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
            case .loading: ProgressView().screenState(.loading)
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

extension View {
    /// عنوان الشاشة معروض في المتن: شريط تنقل مضغوط بلا عنوان كي لا يتكرر.
    func bodyTitledNavigation() -> some View {
        #if os(iOS)
        return navigationTitle("").navigationBarTitleDisplayMode(.inline)
        #else
        return navigationTitle("")
        #endif
    }
}

extension View {
    /// شريط تنقل فوق ترويسة خضراء: خلفية بلون الترويسة نفسه ونمط داكن، فيبقى عنوان الشريط وساعة الحالة وأيقوناتها فاتحة في الوضعين وبعد تمرير الترويسة.
    func heroNavigationBar() -> some View { modifier(HeroNavigationBar()) }
}

private struct HeroNavigationBar: ViewModifier {
    /// يُقرأ هنا (مستوى التطبيق) لا داخل الشريط: نمط الشريط الداكن يقلب ألوان dynamic فيختلف لون الشريط عن الترويسة.
    @Environment(\.colorScheme) private var scheme
    func body(content: Content) -> some View {
        #if os(iOS)
        content
            .toolbarBackground(Sunnah.Colors.primaryStrongResolved(dark: scheme == .dark), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        #else
        content
        #endif
    }
}

extension String {
    /// أرقام لاتينية في كل نص معروض (أمر المالك): يحوّل ٠-٩ و۰-۹ ويُبقي غيرها.
    var asLatinDigits: String {
        String(unicodeScalars.map { u -> Character in
            switch u.value {
            case 0x0660...0x0669: return Character(UnicodeScalar(u.value - 0x0660 + 0x30)!)
            case 0x06F0...0x06F9: return Character(UnicodeScalar(u.value - 0x06F0 + 0x30)!)
            default: return Character(u)
            }
        })
    }
}

extension Data {
    /// أرقام لاتينية في بيانات JSON المعروضة (٠-٩ ۰-۹ والفواصل العشرية/الآلاف). حروف الآيات لا تتأثر.
    var asLatinDigitsJSON: Data {
        guard contains(where: { $0 == 0xD9 || $0 == 0xDB }), let s = String(data: self, encoding: .utf8) else { return self }
        let t = String(s.unicodeScalars.map { u -> Character in
            switch u.value {
            case 0x0660...0x0669: return Character(UnicodeScalar(u.value - 0x0660 + 0x30)!)
            case 0x06F0...0x06F9: return Character(UnicodeScalar(u.value - 0x06F0 + 0x30)!)
            case 0x066B: return "."
            case 0x066C: return ","
            default: return Character(u)
            }
        })
        return Data(t.utf8)
    }
}

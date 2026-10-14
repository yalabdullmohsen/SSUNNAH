import SwiftUI

/// توكنات الحركة الموحّدة للتطبيق (ن4). كل مدة ≤ 350ms. «تقليل الحركة» ⇒ تلاشٍ قصير فقط بلا حركة مكانية.
/// الاستعمال: `withAnimation(SunnahMotion.navigate) { … }` أو `.animation(SunnahMotion.quick, value:)`.
public enum SunnahMotion {
    /// سقف أي حركة (ثانية). يختبره `MotionTokensTests`.
    public static let maxDuration: TimeInterval = 0.35

    public enum Duration {
        public static let press: TimeInterval = 0.12
        public static let quick: TimeInterval = 0.18
        public static let standard: TimeInterval = 0.25
        public static let navigate: TimeInterval = 0.32
        public static let fade: TimeInterval = 0.15
    }

    public static var reduced: Bool {
        #if canImport(UIKit)
        UIAccessibility.isReduceMotionEnabled
        #else
        false
        #endif
    }

    /// ضغط البطاقات والأزرار.
    public static var press: Animation { reduced ? .easeOut(duration: Duration.fade) : .easeOut(duration: Duration.press) }
    /// تبدّلات صغيرة داخل الشاشة.
    public static var quick: Animation { reduced ? .easeOut(duration: Duration.fade) : .spring(response: 0.22, dampingFraction: 0.9) }
    public static var standard: Animation { reduced ? .easeOut(duration: Duration.fade) : .spring(response: 0.28, dampingFraction: 0.88) }
    /// دخول/خروج الأقسام والدرج.
    public static var navigate: Animation { reduced ? .easeOut(duration: Duration.fade) : .spring(response: 0.30, dampingFraction: 0.9) }

    /// انتقال عنصر (الدرج، اللوحات): انزلاق مع تلاشٍ، أو تلاشٍ فقط عند «تقليل الحركة».
    public static func slide(from edge: Edge) -> AnyTransition {
        reduced ? .opacity : .move(edge: edge).combined(with: .opacity)
    }
}

// MARK: - اهتزاز التنقل (قابل للإيقاف من الإعدادات)

public enum SunnahNavHaptics {
    /// مفتاح UserDefaults/@AppStorage لمفتاح الإعدادات؛ الافتراضي مفعّل.
    public static let defaultsKey = "sunnah.haptics.navigation"
    public static var enabled: Bool {
        get { UserDefaults.standard.object(forKey: defaultsKey) as? Bool ?? true }
        set { UserDefaults.standard.set(newValue, forKey: defaultsKey) }
    }
    @MainActor public static func enter() { fire(.light) }
    @MainActor public static func exit() { fire(.soft) }

    #if canImport(UIKit) && !os(watchOS)
    @MainActor private static func fire(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        guard enabled else { return }
        UIImpactFeedbackGenerator(style: style).impactOccurred(intensity: 0.6)
    }
    #else
    @MainActor private static func fire(_ style: Int) {}
    #endif
}

// MARK: - ضغط موحّد للبطاقات والصفوف

/// تأثير الضغط للبطاقات والصفوف (تصغير طفيف + خفوت). `SunnahButtonStyle` (ن1) له تأثيره الخاص ولا يُستبدل.
public struct SunnahPressStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !SunnahMotion.reduced ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.88 : 1)
            .animation(SunnahMotion.press, value: configuration.isPressed)
    }
}

public extension View {
    /// بديل `.buttonStyle(.plain)` للبطاقات والصفوف القابلة للنقر.
    func sunnahPressable() -> some View { buttonStyle(SunnahPressStyle()) }
}

// MARK: - zoom من البطاقة (iOS 18+) مع رجوع إلى الانزلاق القياسي

/// سجل مصادر الانتقال: المسارات التي لها بطاقة مرئية موسومة بـ`sunnahTransitionSource`.
@MainActor public final class SunnahTransitionSources {
    private var counts: [String: Int] = [:]
    public init() {}
    func add(_ id: String) { counts[id, default: 0] += 1 }
    func remove(_ id: String) { if let c = counts[id], c > 1 { counts[id] = c - 1 } else { counts[id] = nil } }
    public func has(_ id: String) -> Bool { counts[id] != nil }
}

private struct TransitionNamespaceKey: EnvironmentKey { static let defaultValue: Namespace.ID? = nil }
private struct TransitionSourcesKey: EnvironmentKey { static let defaultValue: SunnahTransitionSources? = nil }
extension EnvironmentValues {
    var sunnahTransitionNamespace: Namespace.ID? {
        get { self[TransitionNamespaceKey.self] }
        set { self[TransitionNamespaceKey.self] = newValue }
    }
    var sunnahTransitionSources: SunnahTransitionSources? {
        get { self[TransitionSourcesKey.self] }
        set { self[TransitionSourcesKey.self] = newValue }
    }
}

public extension View {
    /// يوسم البطاقة/الصف كمصدر لانتقال zoom إلى `path`. بلا أثر قبل iOS 18 أو بلا حاوية.
    func sunnahTransitionSource(_ path: String) -> some View { modifier(TransitionSourceModifier(path: Route.normalize(path))) }
}

private struct TransitionSourceModifier: ViewModifier {
    let path: String
    @Environment(\.sunnahTransitionNamespace) private var ns
    @Environment(\.sunnahTransitionSources) private var sources
    func body(content: Content) -> some View {
        if #available(iOS 18.0, macOS 15.0, *), let ns {
            content
                .matchedTransitionSource(id: path, in: ns)
                .onAppear { sources?.add(path) }
                .onDisappear { sources?.remove(path) }
        } else {
            content
        }
    }
}

/// غلاف الوجهة في `navigationDestination`: zoom إن وُجدت بطاقة مصدر، وإلا الانزلاق القياسي للنظام.
struct SunnahDestination<Content: View>: View {
    let route: Route
    let content: Content
    @Environment(\.sunnahTransitionNamespace) private var ns
    @Environment(\.sunnahTransitionSources) private var sources
    var body: some View {
        if #available(iOS 18.0, macOS 15.0, *), let ns, sources?.has(route.path) == true, !SunnahMotion.reduced {
            content.navigationTransition(.zoom(sourceID: route.path, in: ns))
        } else {
            content
        }
    }
}

// MARK: - تركيب نظام الحركة على حاوية التنقل بسطرين (لا يمسّ شكل الشريط/القائمة)

private struct NavigationMotionModifier: ViewModifier {
    let depth: Int
    @Namespace private var ns
    @State private var sources = SunnahTransitionSources()
    func body(content: Content) -> some View {
        content
            .environment(\.sunnahTransitionNamespace, ns)
            .environment(\.sunnahTransitionSources, sources)
            .onChange(of: depth) { [old = depth] new in
                if new > old { SunnahNavHaptics.enter() } else if new < old { SunnahNavHaptics.exit() }
            }
    }
}

public extension View {
    /// على جذر حاوية التنقل: يحقن مصادر zoom ويشغّل haptics الدخول/الخروج عند تغيّر عمق المكدّس.
    func sunnahNavigationMotion(depth: Int) -> some View { modifier(NavigationMotionModifier(depth: depth)) }
    /// على محتوى `navigationDestination`: zoom من البطاقة الموسومة أو الانزلاق القياسي.
    func sunnahDestination(_ route: Route) -> some View { SunnahDestination(route: route, content: self) }
}

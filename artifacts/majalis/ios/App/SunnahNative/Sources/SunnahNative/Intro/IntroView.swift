import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// وضعية البدء: `.start` هي الحالة الحيّة؛ `.assembled` (الشعار مكتمل بالذهب) لاختبارات اللقطة فقط.
enum IntroPose { case start, assembled }

/// المقدّمة المتحركة: تركيب الشعار → لمعة → اقتراب وتلاشٍ إلى الرئيسية (≈1.6ث). SwiftUI صرف.
struct IntroView: View {
    let style: IntroStyle
    let theme: IntroTheme
    /// يُستدعى لانتظار جاهزية البيانات بعد 1.6ث (يعيد عند الجاهزية).
    let waitUntilReady: () async -> Void
    let onApproach: () -> Void   // بدء ظهور الرئيسية
    let onFinish: () -> Void     // إزالة الطبقة

    @State private var assembled: Bool
    @State private var gold: Bool
    @State private var shimmer: CGFloat = -1
    @State private var approach = false
    @State private var layerOpacity = 1.0
    @State private var pulse = false
    @State private var finished = false
    @State private var simplifiedShown = false

    private let pieces: [IntroPiece]
    init(style: IntroStyle, theme: IntroTheme, pose: IntroPose = .start, waitUntilReady: @escaping () async -> Void, onApproach: @escaping () -> Void, onFinish: @escaping () -> Void) {
        _assembled = State(initialValue: pose == .assembled)
        _gold = State(initialValue: pose == .assembled)
        self.style = style; self.theme = theme; self.waitUntilReady = waitUntilReady
        self.onApproach = onApproach; self.onFinish = onFinish
        pieces = IntroPieces.build(theme)
    }

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            logo
                .frame(width: 200, height: 200)
                .scaleEffect(approach ? 7 : 1, anchor: .center)
                .opacity(style == .simplified ? (simplifiedShown ? 1 : 0) : (approach ? 0 : 1))
                .scaleEffect(pulse ? 1.015 : 1)
        }
        .opacity(layerOpacity)
        .contentShape(Rectangle())
        .onTapGesture { skip() }
        .accessibilityHidden(true)
        .task { await run() }
    }

    private var logo: some View {
        ZStack {
            ForEach(pieces) { piece in pieceView(piece) }
        }
        .overlay(shimmerOverlay)
    }

    private func pieceView(_ p: IntroPiece) -> some View {
        let full = style == .full
        let t = Double(p.order)
        return IntroPolyShape(points: p.points).fill(p.color)
            .modifier(PieceMotion(role: p.role, on: full ? (p.role == .gold ? gold : assembled) : true, full: full, order: t))
    }

    private var shimmerOverlay: some View {
        GeometryReader { g in
            LinearGradient(colors: [.clear, theme.shimmer.opacity(0.25), .clear], startPoint: .leading, endPoint: .trailing)
                .frame(width: g.size.width * 0.5)
                .rotationEffect(.degrees(25))
                .offset(x: shimmer * g.size.width)
                .frame(maxWidth: .infinity, alignment: .leading)
                .mask { ZStack { ForEach(pieces) { IntroPolyShape(points: $0.points).fill(.white) } } }
        }
        .allowsHitTesting(false)
        .opacity(style == .full ? 1 : 0)
    }

    @MainActor private func run() async {
        if style == .simplified {
            withAnimation(.easeOut(duration: 0.15)) { simplifiedShown = true }
            onApproach()
            try? await Task.sleep(nanoseconds: 150_000_000)
            await waitUntilReady()
            withAnimation(.easeOut(duration: 0.3)) { layerOpacity = 0 }
            try? await Task.sleep(nanoseconds: 300_000_000)
            finish(); return
        }
        let spring = Animation.spring(response: 0.5, dampingFraction: 0.8)
        withAnimation(spring) { assembled = true }
        try? await Task.sleep(nanoseconds: 250_000_000)
        withAnimation(spring) { gold = true }
        try? await Task.sleep(nanoseconds: UInt64((IntroPolicy.assembleEnd - 0.25) * 1e9))
        guard !finished else { return }
        withAnimation(.easeInOut(duration: 0.3)) { shimmer = 1.2 }
        #if canImport(UIKit)
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        #endif
        try? await Task.sleep(nanoseconds: 300_000_000)
        guard !finished else { return }
        // انتظار جاهزية البيانات: الشعار مركَّب مع نبض خفيف (حتى 3ث إجمالًا).
        let remaining = max(0, IntroPolicy.maxHold - IntroPolicy.shimmerEnd)
        let pulseTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: UInt64((IntroPolicy.totalEnd - IntroPolicy.shimmerEnd) * 1e9))
            guard !Task.isCancelled else { return }
            withAnimation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true)) { pulse = true }
        }
        let early = await withTaskGroup(of: Bool.self) { group -> Bool in
            group.addTask { await waitUntilReady(); return true }
            group.addTask { try? await Task.sleep(nanoseconds: UInt64(remaining * 1e9)); return false }
            let first = await group.next() ?? false
            group.cancelAll(); return first
        }
        _ = early
        pulseTask.cancel()
        guard !finished else { return }
        withAnimation(.easeOut(duration: 0.1)) { pulse = false }
        withAnimation(.easeIn(duration: 0.6)) { approach = true }
        onApproach()
        try? await Task.sleep(nanoseconds: 600_000_000)
        withAnimation(.easeOut(duration: 0.15)) { layerOpacity = 0 }
        try? await Task.sleep(nanoseconds: 150_000_000)
        finish()
    }

    @MainActor private func skip() {
        guard !finished else { return }
        onApproach()
        withAnimation(.easeOut(duration: 0.2)) { layerOpacity = 0 }
        Task { try? await Task.sleep(nanoseconds: 200_000_000); finish() }
    }

    @MainActor private func finish() {
        guard !finished else { return }
        finished = true
        onFinish()
    }
}

private struct PieceMotion: ViewModifier {
    let role: IntroPieceRole
    let on: Bool
    let full: Bool
    let order: Double

    func body(content: Content) -> some View {
        switch role {
        case .core:
            content
                .scaleEffect(on ? 1 : (full ? 0.6 : 1), anchor: .center)
                .rotationEffect(.degrees(on ? 0 : (full ? -22.5 : 0)), anchor: .center)
                .animation(.spring(response: 0.5, dampingFraction: 0.8).delay(order * 0.03), value: on)
        case .tile(let angle):
            content
                .offset(x: on ? 0 : cos(angle) * 140, y: on ? 0 : sin(angle) * 140)
                .opacity(on ? 1 : 0)
                .animation(.spring(response: 0.5, dampingFraction: 0.8).delay(order * 0.03), value: on)
        case .gold:
            content
                .scaleEffect(on ? 1 : 0.3, anchor: .center)
                .rotationEffect(.degrees(on ? 0 : 20), anchor: .center)
                .opacity(on ? 1 : 0)
                .animation(.spring(response: 0.5, dampingFraction: 0.8).delay(order * 0.03), value: on)
        }
    }
}

/// نقطة الدخول الوحيدة في جذر التطبيق: تلفّ المحتوى وتعرض المقدّمة فوقه.
public struct IntroHost<Content: View>: View {
    private let content: Content
    private let isReady: @MainActor () -> Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.colorScheme) private var scheme
    @State private var style: IntroStyle?
    @State private var homeVisible = false
    @State private var contentAppeared = false
    @State private var removed = false

    /// `isReady`: جاهزية البيانات (افتراضيًا: ظهر المحتوى).
    public init(isReady: @escaping @MainActor () -> Bool = { true }, @ViewBuilder content: () -> Content) {
        self.isReady = isReady
        self.content = content()
    }

    public var body: some View {
        ZStack {
            content
                .opacity(homeVisible ? 1 : 0)
                .scaleEffect(homeVisible ? 1 : 0.97)
                .onAppear { contentAppeared = true }
            if let style, style != .none, !removed {
                IntroView(
                    style: style,
                    theme: theme,
                    waitUntilReady: { await waitReady() },
                    onApproach: { withAnimation(.easeOut(duration: 0.6)) { homeVisible = true } },
                    onFinish: { removed = true; homeVisible = true })
                .zIndex(1)
            }
        }
        .onAppear {
            guard style == nil else { return }
            let cold = IntroPolicy.consumeColdLaunch()
            let s = IntroPolicy.style(isColdLaunch: cold, reduceMotion: reduceMotion)
            style = s
            if s == .none { homeVisible = true }
        }
    }

    private var theme: IntroTheme {
        #if DEBUG
        switch UserDefaults.standard.string(forKey: "introTheme") {  // للّقطات فقط
        case "starDish": return .starDish
        case "zellijDark": return .zellijDark
        case "primary": return .primary
        default: break
        }
        #endif
        #if canImport(UIKit)
        return IntroTheme.current(alternateIconName: UIApplication.shared.alternateIconName, dark: scheme == .dark)
        #else
        return IntroTheme.current(alternateIconName: nil, dark: scheme == .dark)
        #endif
    }

    @MainActor private func waitReady() async {
        let deadline = Date().addingTimeInterval(IntroPolicy.maxHold)
        while !(contentAppeared && isReady()) && Date() < deadline {
            try? await Task.sleep(nanoseconds: 50_000_000)
        }
    }
}

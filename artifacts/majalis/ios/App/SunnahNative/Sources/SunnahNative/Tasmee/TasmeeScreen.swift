import SwiftUI

/// حالة شاشة التسميع: تربط المحرك والجلسة بالواجهة. المحتوى (الكلمات) يُمرَّر من الخارج ولا يُعدَّل هنا.
@MainActor
public final class TasmeeViewModel: ObservableObject {
    public enum Phase: Equatable { case idle, downloading(Double), loading, listening, finished(TasmeeSessionReport), failed(String) }

    @Published public private(set) var phase: Phase = .idle
    @Published public private(set) var states: [TasmeeWordState]
    @Published public private(set) var hint: String?
    @Published public private(set) var modelStatus: RecitationModelStatus
    public let ref: [TasmeeRefWord]
    public var strictness: TasmeeStrictness

    private let engine: RecitationEngineControlling
    private var session: TasmeeSession?

    public init(engine: RecitationEngineControlling, ref: [TasmeeRefWord], strictness: TasmeeStrictness = .normal) {
        self.engine = engine; self.ref = ref; self.strictness = strictness
        self.states = Array(repeating: .pending, count: ref.count)
        self.modelStatus = engine.modelStatus
    }

    public var isListening: Bool { phase == .listening }
    public var progress: Double { ref.isEmpty ? 0 : Double(states.filter { $0 != .pending }.count) / Double(ref.count) }

    public func downloadModel() async {
        phase = .downloading(0)
        do {
            try await engine.downloadModel { [weak self] p in Task { @MainActor in self?.phase = .downloading(p) } }
            modelStatus = engine.modelStatus
            phase = .idle
        } catch { phase = .failed("تعذّر تنزيل النموذج") }
    }

    public func start() async {
        guard !ref.isEmpty, modelStatus == .installed else { return }
        states = Array(repeating: .pending, count: ref.count)
        hint = nil
        phase = .loading
        let s = TasmeeSession(engine: engine, ref: ref, strictness: strictness)
        s.onWord = { [weak self] e in self?.states[e.index] = e.state; self?.hint = nil }
        s.onHint = { [weak self] m in self?.hint = m }
        engine.onFailure = { [weak self] m in self?.phase = .failed(m) }
        session = s
        do {
            try await engine.load()
            try await s.start()
            phase = .listening
        } catch { session = nil; phase = .failed("تعذّر بدء التسميع") }
    }

    public func stop() async {
        guard let s = session else { return }
        session = nil
        phase = .finished(await s.stop())
    }
}

/// تخطيط يلفّ الكلمات سطرًا بعد سطر (يحترم اتجاه RTL تلقائيًا).
struct TasmeeFlowLayout: Layout {
    var spacing: CGFloat = Sunnah.Spacing.s2
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(proposal.width ?? 320, subviews).size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let r = arrange(bounds.width, subviews)
        for (i, p) in r.origins.enumerated() { subviews[i].place(at: CGPoint(x: bounds.minX + p.x, y: bounds.minY + p.y), proposal: .unspecified) }
    }
    private func arrange(_ width: CGFloat, _ subviews: Subviews) -> (origins: [CGPoint], size: CGSize) {
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0, maxX: CGFloat = 0
        var origins: [CGPoint] = []
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x > 0, x + s.width > width { x = 0; y += rowH + spacing; rowH = 0 }
            origins.append(CGPoint(x: x, y: y))
            x += s.width + spacing; rowH = max(rowH, s.height); maxX = max(maxX, x - spacing)
        }
        return (origins, CGSize(width: maxX, height: y + rowH))
    }
}

public struct TasmeeScreen: View {
    @StateObject private var model: TasmeeViewModel
    public init(model: @autoclosure @escaping () -> TasmeeViewModel) { _model = StateObject(wrappedValue: model()) }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                ProgressView(value: model.progress).tint(Sunnah.Colors.primary)
                    .accessibilityLabel("التقدّم").accessibilityValue("\(Int(model.progress * 100))٪")
                SunnahCard {
                    TasmeeFlowLayout {
                        ForEach(Array(model.ref.enumerated()), id: \.offset) { i, w in
                            Text(w.text).font(.custom("Almarai-Regular", size: 24, relativeTo: .title2))
                                .foregroundStyle(color(model.states[i]))
                                .underline(model.states[i] == .wrong, color: Sunnah.Colors.danger)
                                .accessibilityLabel("\(w.text)، \(label(model.states[i]))")
                        }
                    }.environment(\.layoutDirection, .rightToLeft)
                }
                if let h = model.hint {
                    Text(h).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                controls
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("التسميع")
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder private var controls: some View {
        switch model.phase {
        case .downloading(let p):
            ProgressView(value: p).tint(Sunnah.Colors.primary)
            Text("جارٍ تنزيل النموذج…").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        case .loading: LoadingStateView()
        case .listening: SunnahButton("إنهاء التسميع", style: .secondary) { Task { await model.stop() } }
        case .finished(let r):
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Text("النتيجة").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text("صحيحة \(r.correct) من \(r.total) · أخطاء \(r.wrong) · متجاوزة \(r.skipped)")
                        .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            SunnahButton("إعادة التسميع") { Task { await model.start() } }
        case .failed(let m):
            Text(m).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.danger)
            idleButton
        case .idle: idleButton
        }
    }

    @ViewBuilder private var idleButton: some View {
        switch model.modelStatus {
        case .installed: SunnahButton("ابدأ التسميع") { Task { await model.start() } }
        case .notInstalled, .downloading: SunnahButton("تنزيل نموذج التسميع") { Task { await model.downloadModel() } }
        case .unsupported:
            Text("التسميع غير مدعوم على هذا الجهاز").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
        }
    }

    private func color(_ s: TasmeeWordState) -> Color {
        switch s {
        case .pending: Sunnah.Colors.textSecondary.opacity(0.55)
        case .correct: Sunnah.Colors.primary
        case .wrong: Sunnah.Colors.danger
        case .skipped: Sunnah.Colors.textSecondary
        }
    }
    private func label(_ s: TasmeeWordState) -> String {
        switch s { case .pending: "لم تُقرأ"; case .correct: "صحيحة"; case .wrong: "خطأ"; case .skipped: "متجاوزة" }
    }
}

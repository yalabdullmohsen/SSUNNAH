import SwiftUI
import AVFoundation
import Combine

/// متحكّم التسميع داخل المصحف: زر الميكروفون ← موافقة تنزيل النموذج (Wi-Fi فقط) ← إذن الميكروفون ← جلسة حيّة تلوّن كلمات الصفحة نفسها.
/// المطابقة في `TasmeeSession`/`TasmeeMatcher`؛ نص القرآن يُقرأ ولا يُعدَّل.
@MainActor
public final class MushafTasmeeController: ObservableObject {
    public enum Phase: Equatable {
        case idle
        case consent            // موافقة التنزيل (الحجم + Wi-Fi فقط)
        case downloading(Double)
        case preparing
        case needsMic           // الإذن مرفوض → توجيه للإعدادات
        case listening
        case finished(TasmeeSessionReport)
        case failed(String)
    }

    @Published public private(set) var phase: Phase = .idle
    /// حالة كل كلمة بمفتاح «سورة:آية#رقم» (الكلمات التي لم تُعالَج غائبة = معلّقة).
    @Published public private(set) var states: [String: TasmeeWordState] = [:]
    @Published public private(set) var hint: String?
    /// وضع «إخفاء الآيات»: المعلّقة مخفية وتظهر الكلمة فور مطابقتها.
    @Published public var hideVerses = true { didSet { version &+= 1 } }
    /// صفحة يجب أن يتبعها القارئ (تتغيّر حين يعبر التسميع صفحة).
    @Published public private(set) var followPage: Int?
    @Published public private(set) var ref: MushafTasmeeRef?
    /// يزداد مع كل تغيّر يُغيّر رسم الصفحة (مفتاح إعادة الرسم للمُقلِّب).
    @Published public private(set) var version = 0

    /// قاعدة الخطأ: الكلمة الخاطئة تبقى مخفية بإشارة حمراء خفيفة ولا يتقدّم التتبّع حتى تُقال صحيحة.
    @Published public private(set) var offersHint = false
    /// عدد التلميحات المستخدمة في الجلسة (تُحتسب في السجل).
    public private(set) var hintsUsed = 0
    private var hintStage = 0

    public let engine: RecitationEngineControlling
    public var strictness: TasmeeStrictness = .normal
    private var session: TasmeeSession?
    private var lastFollowed = 0

    public init(engine: RecitationEngineControlling) { self.engine = engine }

    public var isActive: Bool {
        switch phase { case .listening, .preparing, .downloading: true; default: false }
    }
    public var modelBytes: Int64? { engine.modelDownloadBytes }

    /// الضغطة على الزر: تبدأ الجلسة أو تُنهيها أو تفتح الموافقة.
    public func micTapped(page: Int, ayah: String?, repo: MushafRepository, search: MushafSearch?) {
        switch phase {
        case .listening: Task { await stop() }
        case .idle, .failed, .finished, .needsMic:
            guard let search else { phase = .failed("نص المصحف لم يكتمل تحميله، حاول بعد لحظة."); return }
            let r = MushafTasmeeRef.build(repo: repo, search: search, startPage: page, pageCount: 6, fromVerse: ayah)
            guard !r.words.isEmpty else { phase = .failed("تعذّر تجهيز كلمات هذه الصفحة للتسميع."); return }
            ref = r
            if engine.modelStatus == .installed { Task { await beginWithPermission() } }
            else if engine.modelStatus == .unsupported { phase = .failed("التسميع غير مدعوم على هذا الجهاز.") }
            else { phase = .consent }
        default: break
        }
    }

    public func cancelConsent() { if phase == .consent { phase = .idle } }

    public func confirmDownload() async {
        phase = .downloading(0)
        do {
            try await engine.downloadModel { [weak self] p in Task { @MainActor in
                if case .downloading = self?.phase { self?.phase = .downloading(p) } } }
            await beginWithPermission()
        } catch { phase = .failed("تعذّر تنزيل النموذج. تأكّد من اتصال Wi-Fi ثم أعد المحاولة.") }
    }

    public func beginWithPermission() async {
        phase = .preparing
        guard await Self.requestMic() else { phase = .needsMic; return }
        await startSession()
    }

    private func startSession() async {
        guard let ref else { return }
        states = [:]; hint = nil; offersHint = false; hintsUsed = 0; hintStage = 0; lastFollowed = 0; followPage = nil; version &+= 1
        let s = TasmeeSession(engine: engine, ref: ref.words, strictness: strictness, gateOnError: true)
        s.onWord = { [weak self] e in self?.apply(e) }
        s.onHint = { [weak self] m in self?.hint = m }
        engine.onFailure = { [weak self] m in self?.phase = .failed(m) }
        session = s
        do {
            try await engine.load()
            try await s.start()
            phase = .listening
        } catch { session = nil; phase = .failed("تعذّر بدء التسميع") }
    }

    private func apply(_ e: TasmeeWordEvent) {
        states[e.id] = e.state
        hint = nil; version &+= 1
        if e.state == .wrong {
            #if os(iOS)
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            #endif
            if (e.attempts ?? 0) >= 3 { offersHint = true }
        } else if e.state == .correct {
            offersHint = false; hintStage = 0
        }
        guard let ref, e.index + 1 < ref.pages.count else { return }
        // المتابعة: حين يصبح الكلمة التالية في صفحة أبعد من الأخيرة المتابَعة.
        let nextPage = ref.pages[min(e.index + 1, ref.pages.count - 1)]
        if nextPage > lastFollowed { lastFollowed = nextPage; followPage = nextPage }
    }

    public func stop() async {
        guard let s = session else { phase = .idle; return }
        session = nil
        let report = await s.stop()
        phase = .finished(report)
    }

    /// تلميح يختاره المستخدم بعد ٣ محاولات خاطئة: أول حرف ثم الكلمة؛ يُحتسب ولا يقدّم التتبّع.
    public func requestHint() {
        guard let s = session, let ref, s.matcher.next < ref.words.count else { return }
        let word = ref.words[s.matcher.next].text
        hintStage += 1; hintsUsed += 1
        hint = hintStage == 1 ? String(word.prefix(1)) + " …" : word
    }

    public func dismissReport() { phase = .idle; states = [:]; followPage = nil; version &+= 1 }

    /// لون/ظهور الكلمة في الصفحة: nil = لا تأثير (الوضع الافتراضي).
    public func wordState(_ key: String?) -> TasmeeWordState? {
        guard isActive || { if case .finished = phase { return true }; return false }(), let key, let ref, ref.indexByKey[key] != nil else { return nil }
        return states[key] ?? .pending
    }

    static func requestMic() async -> Bool {
        #if os(iOS)
        if #available(iOS 17.0, *) {
            return await AVAudioApplication.requestRecordPermission()
        }
        return await withCheckedContinuation { c in AVAudioSession.sharedInstance().requestRecordPermission { c.resume(returning: $0) } }
        #else
        return false
        #endif
    }
}

/// طلاء كلمة المصحف أثناء التسميع.
public enum TasmeeWordPaint: Sendable { case hidden, correct, wrong, skipped, error }

extension View {
    /// مخفية = شفافة (تحجز موضعها)؛ خطأ = خلفية حمراء خفيفة؛ متجاوزة = كهرمانية مع تنبيه.
    @ViewBuilder func tasmeePainted(_ paint: TasmeeWordPaint?, radius: CGFloat) -> some View {
        switch paint {
        case .none, .some(.correct): self
        case .some(.hidden): self.opacity(0)
        case .some(.wrong):
            self.background(RoundedRectangle(cornerRadius: radius).fill(Color.red.opacity(0.18)).padding(.horizontal, -2))
                .accessibilityHint("خطأ في التلاوة")
        case .some(.error):
            // خطأ في وضع البوابة: لا تظهر الكلمة، ويبقى موضعها محجوزًا بإشارة حمراء خفيفة.
            self.opacity(0)
                .background(RoundedRectangle(cornerRadius: radius).fill(Color.red.opacity(0.22)).padding(.horizontal, -2))
                .accessibilityHint("خطأ في التلاوة")
        case .some(.skipped):
            self.background(RoundedRectangle(cornerRadius: radius).fill(Color.orange.opacity(0.22)).padding(.horizontal, -2))
                .overlay(alignment: .top) { Image(systemName: "exclamationmark.triangle.fill").font(.system(size: 8)).foregroundStyle(Color.orange).offset(y: -4) }
                .accessibilityHint("كلمة متجاوزة")
        }
    }
}

extension MushafTasmeeController {
    /// دالة طلاء لصفحة بعينها (nil حين لا جلسة، فلا يتغيّر العرض الافتراضي).
    public func paint(page: Int) -> ((Int, Int) -> TasmeeWordPaint?)? {
        guard let slots = ref?.keysByPage[page], isActive || isFinished else { return nil }
        let hide = hideVerses
        return { r, c in
            guard let key = slots[MushafWordSlot(row: r, col: c)] else { return nil }
            switch self.states[key] ?? .pending {
            case .correct: return .correct
            case .wrong: return .error
            case .skipped: return .skipped
            case .pending: return hide ? .hidden : nil
            }
        }
    }
    var isFinished: Bool { if case .finished = phase { return true }; return false }
}

/// يمرّر تغيّر المتحكّم إلى القارئ (الذي يُنشأ بلا محرك حتى تتوفر المنصّة من البيئة).
@MainActor
final class MushafTasmeeBox: ObservableObject {
    private(set) var controller: MushafTasmeeController?
    private var bag: AnyCancellable?
    func attach(_ engine: RecitationEngineControlling?) {
        guard controller == nil, let engine else { return }
        let c = MushafTasmeeController(engine: engine)
        objectWillChange.send()
        controller = c
        bag = c.objectWillChange.sink { [weak self] _ in self?.objectWillChange.send() }
    }
    var renderKey: String { controller.map { "t\($0.version)" } ?? "" }
}

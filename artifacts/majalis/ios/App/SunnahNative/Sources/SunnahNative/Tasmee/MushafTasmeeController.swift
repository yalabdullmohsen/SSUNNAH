import SwiftUI
import AVFoundation
import Combine

/// متحكّم التسميع داخل المصحف: زر الميكروفون ← موافقة تنزيل النموذج (Wi-Fi أو بيانات الجوال) ← إذن الميكروفون ← جلسة حيّة تلوّن كلمات الصفحة نفسها.
/// المطابقة في `TasmeeSession`/`TasmeeMatcher`؛ نص القرآن يُقرأ ولا يُعدَّل.
@MainActor
public final class MushafTasmeeController: ObservableObject {
    public enum Phase: Equatable {
        case idle
        case consent            // موافقة التنزيل (الحجم + نوع الاتصال)
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
    /// خيارات الوضع المختار من ورقة الأوضاع (آخر اختيار محفوظ)؛ تحدّد القناع والسجل.
    @Published public private(set) var options = TasmeeModeOptions.load()
    /// ورقة اختيار الوضع تظهر عند ضغط الميكروفون وهو خامل.
    @Published public var showModeSheet = false
    /// اهتزاز خفيف عند الخطأ؛ يُحفظ اختيار المستخدم.
    @Published public var hapticsOn = UserDefaults.standard.object(forKey: "tasmee.haptics") as? Bool ?? true {
        didSet { UserDefaults.standard.set(hapticsOn, forKey: "tasmee.haptics") }
    }
    /// مستوى الصوت الحي المنعَّم (0…1) لموجة الميكروفون؛ 0 حين لا جلسة أو لا محرك يبلّغ.
    @Published public private(set) var level: Float = 0
    /// تنعيم: صعود سريع وهبوط أبطأ حتى لا ترتجف الأعمدة.
    func ingestLevel(_ raw: Float) { level = raw > level ? raw : level * 0.7 + raw * 0.3 }
    /// صوت تنبيه قصير عند الخطأ (افتراضيًا مُغلق)؛ يُحفظ اختيار المستخدم.
    @Published public var soundOn = UserDefaults.standard.object(forKey: "tasmee.sound") as? Bool ?? false {
        didSet { UserDefaults.standard.set(soundOn, forKey: "tasmee.sound") }
    }
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
    private var startedAt = Date()
    /// سجل الجلسة المنتهية (يُحفظ في TasmeeHistoryStore ويغذّي شاشة التقرير)؛ nil إن لم تُسمَّع كلمة.
    @Published public private(set) var lastRecord: TasmeeSessionRecord?

    /// آية تُركت كلها قبل موضع القارئ؛ تظهر «تجاوزتَ الآية N» مع «ارجع إليها».
    @Published public private(set) var skippedAyah: TasmeeSkippedAyah?

    public let engine: RecitationEngineControlling
    public var strictness: TasmeeStrictness = .normal
    private var session: TasmeeSession?
    private var repeatDriver: TasmeeRepeatDriver?
    /// وضع التكرار: «القراءة n من N» للآية الجارية؛ nil خارج الوضع.
    @Published public private(set) var repeatStatus: String?
    private var lastFollowed = 0

    /// مشغّل صوت الآية لوضع التلقين (قابل للحقن في الاختبار).
    var audio: TasmeeAyahAudioPlaying
    private var savedVerse: String?

    public init(engine: RecitationEngineControlling, audio: TasmeeAyahAudioPlaying? = nil) {
        self.engine = engine
        self.audio = audio ?? TasmeeAyahPlayer()
    }

    public var isActive: Bool {
        switch phase { case .listening, .preparing, .downloading: true; default: false }
    }
    /// أدوات الجلسة (الميكروفون/الموجة/الإنهاء) تظهر أثناء الجلسة فقط؛ الصفحة الافتراضية نظيفة والدخول من أدوات المصحف.
    public var showsSessionControls: Bool {
        switch phase { case .listening, .preparing, .downloading, .needsMic, .failed: true; default: false }
    }
    public var modelBytes: Int64? { engine.modelDownloadBytes }
    public var isFailed: Bool { if case .failed = phase { true } else { false } }
    /// إغلاق رسالة الفشل: ترجع الجلسة إلى idle فيختفي الشريط وتبقى الصفحة نظيفة.
    public func dismissFailure() { if isFailed { phase = .idle } }

    /// الضغطة على الزر: خامل ← ورقة الأوضاع أولًا، ثم `start`؛ أثناء الاستماع تُنهي الجلسة.
    public func micPressed(page: Int, repo: MushafRepository, search: MushafSearch?) {
        pendingStart = (page, repo, search)
        if phase == .listening { micTapped(page: page, ayah: nil, repo: repo, search: search) } else {
            showModeSheet = true
            // تسخين: النموذج يُحمَّل أثناء اختيار المستخدم للوضع فيبدأ الاستماع فور «ابدأ»
            if engine.modelStatus == .installed { Task { await engine.prewarm() } }
        }
    }

    /// اختيار المستخدم من الورقة: يُطبَّق على الاهتزاز والصوت والإخفاء ثم تبدأ الجلسة.
    public func startWith(_ o: TasmeeModeOptions, resume: Bool = false) {
        options = o; hapticsOn = o.haptics; soundOn = o.sound; hideVerses = o.mode != .follow
        showModeSheet = false
        guard let p = pendingStart else { return }
        // الاستئناف: من أول آية لم تُتمّ (حُفظت في UserDefaults ولو أُغلق التطبيق) وفي صفحتها.
        if resume, let r = TasmeeResumePoint.load() {
            micTapped(page: r.page, ayah: r.verse, repo: p.repo, search: p.search)
        } else {
            micTapped(page: p.page, ayah: nil, repo: p.repo, search: p.search)
        }
    }
    private var pendingStart: (page: Int, repo: MushafRepository, search: MushafSearch?)?

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
        } catch { phase = .failed(((error as? LocalizedError)?.errorDescription).map { "\($0) أعد المحاولة." } ?? "تعذّر تنزيل النموذج. تأكّد من الاتصال بالإنترنت ثم أعد المحاولة.") }
    }

    public func beginWithPermission() async {
        phase = .preparing
        guard await Self.requestMic() else { phase = .needsMic; return }
        await startSession()
    }

    private func startSession() async {
        guard let ref else { return }
        states = [:]; hint = nil; skippedAyah = nil; lastRecord = nil; startedAt = Date(); offersHint = false; hintsUsed = 0; hintStage = 0; lastFollowed = 0; followPage = nil; savedVerse = nil; version &+= 1
        let s = TasmeeSession(engine: engine, ref: ref.words, strictness: strictness, gateOnError: true)
        repeatDriver = options.mode == .repeat ? TasmeeRepeatDriver(ref: ref.words, target: options.repeatTarget) : nil
        repeatStatus = repeatDriver.map { Self.repeatText(streak: 0, target: $0.counter.target) }
        s.onWord = { [weak self] e in
            guard let self else { return }
            if self.repeatDriver?.consume(e) == false { return }
            self.apply(e)
        }
        s.onBatchEnd = { [weak self] in self?.runRepeatAction() }
        s.onHint = { [weak self] m in self?.hint = m }
        engine.onFailure = { [weak self] m in self?.phase = .failed(m) }
        session = s
        do {
            try await engine.load()
            // التلقين: يُسمَع صوت القارئ للآية الأولى قبل فتح الميكروفون.
            if options.mode == .repeat, options.talqin, let v = ref.words.first.map({ Self.verseKey($0.id) }) { await audio.play(verse: v) }
            (engine as? RecitationLevelReporting)?.onLevel = { [weak self] v in Task { @MainActor in self?.ingestLevel(v) } }
            try await s.start()
            phase = .listening
        } catch { session = nil; phase = .failed("تعذّر بدء التسميع") }
    }

    static func verseKey(_ wordId: String) -> String { String(wordId.split(separator: "#").first ?? "") }

    /// وضع التلقين: يوقف الاستماع إلى أن ينتهي صوت القارئ، ثم يعود للاستماع من أول الآية.
    private func talqinPlay(verse: String, session s: TasmeeSession) {
        s.isPaused = true
        Task { [weak self, weak s] in
            await self?.audio.play(verse: verse)
            s?.isPaused = false
        }
    }

    /// حفظ نقطة الاستئناف عند تغيّر الآية الجارية (أول آية لم تُتمّ).
    private func saveResume(wordIndex i: Int) {
        guard let ref, i < ref.words.count else { return }
        let v = Self.verseKey(ref.words[i].id)
        guard v != savedVerse else { return }
        savedVerse = v
        TasmeeResumePoint(verse: v, page: ref.pages[i]).save()
    }

    static func repeatText(streak: Int, target: Int) -> String { Sunnah.digits("القراءة \(min(streak + 1, target)) من \(target)") }

    /// نهاية دفعة أحداث في وضع التكرار: أعد الآية (تُخفى كلماتها من جديد) أو انتقل لما بعدها أو أنهِ الجلسة.
    private func runRepeatAction() {
        guard let action = repeatDriver?.takeAction(), let s = session, let ref else { return }
        switch action {
        case .finish:
            repeatStatus = nil
            Task { await stop() }
        case .rewind(let to, let streak, let target):
            s.rewind(to: to)
            for w in ref.words[to...] { states[w.id] = nil }
            offersHint = false; hintStage = 0; hint = nil
            repeatStatus = Self.repeatText(streak: streak, target: target)
            version &+= 1
            if options.talqin { talqinPlay(verse: Self.verseKey(ref.words[to].id), session: s) }
        }
    }

    private func apply(_ e: TasmeeWordEvent) {
        states[e.id] = e.state
        hint = nil; version &+= 1
        if e.state == .wrong {
            #if os(iOS)
            if hapticsOn { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
            if soundOn { AudioServicesPlaySystemSound(1053) }
            #endif
            if (e.attempts ?? 0) >= 3, options.allowsHints { offersHint = true }
        } else if e.state == .correct {
            offersHint = false; hintStage = 0
        }
        refreshSkippedAyah()
        if e.state == .correct {
            // وضع التكرار: الاستئناف من آية التكرار الجارية لا من التالية قبل إتقانها.
            let at = repeatDriver?.verseStart ?? e.index + 1
            if at < (ref?.words.count ?? 0) { saveResume(wordIndex: at) } else { TasmeeResumePoint.clear(); savedVerse = nil }
        }
        guard let ref, e.index + 1 < ref.pages.count else { return }
        // المتابعة: حين يصبح الكلمة التالية في صفحة أبعد من الأخيرة المتابَعة.
        let nextPage = ref.pages[min(e.index + 1, ref.pages.count - 1)]
        if nextPage > lastFollowed { lastFollowed = nextPage; followPage = nextPage }
    }

    private func refreshSkippedAyah() {
        guard let m = session?.matcher else { skippedAyah = nil; return }
        let words = (0..<m.next).map { i -> (surah: Int, ayah: Int) in
            let sa = m.ref[i].id.split(separator: "#").first?.split(separator: ":") ?? []
            return (sa.count == 2 ? Int(sa[0]) ?? 0 : 0, sa.count == 2 ? Int(sa[1]) ?? 0 : 0)
        }
        skippedAyah = TasmeeSkippedAyahDetector.fullySkipped(words: words, states: m.state, reached: m.next).last
    }

    /// «ارجع إليها»: يعيد المطابِق إلى أول كلمة في الآية المتجاوَزة.
    public func returnToSkippedAyah() {
        guard let k = skippedAyah, let s = session, let ref,
              let to = ref.words.firstIndex(where: { $0.id.hasPrefix("\(k.surah):\(k.ayah)#") }) else { return }
        s.rewind(to: to)
        for w in ref.words[to...] { states[w.id] = nil }
        offersHint = false; hintStage = 0; hint = nil; skippedAyah = nil; version &+= 1
    }

    public func stop() async {
        guard let s = session else { phase = .idle; return }
        skippedAyah = nil
        session = nil; repeatDriver = nil; repeatStatus = nil
        audio.stop()
        (engine as? RecitationLevelReporting)?.onLevel = nil
        level = 0
        let report = await s.stop()
        lastRecord = Self.makeRecord(s.matcher, startedAt: startedAt, hints: hintsUsed, mode: options.mode)
        if let r = lastRecord { TasmeeHistoryStore.shared.append(r) }
        phase = .finished(report)
    }

    /// سجل الجلسة من حالة المطابِق: أخطاء (ولو صُحّحت) ومتجاوزات فقط؛ الصوت لا يُحفظ.
    static func makeRecord(_ m: TasmeeMatcher, startedAt: Date, hints hintsUsed: Int, mode: TasmeeMode = .recite) -> TasmeeSessionRecord? {
        let reached = m.next
        guard reached > 0 else { return nil }
        func pos(_ i: Int) -> (surah: Int, ayah: Int, word: Int)? {
            let id = m.ref[i].id
            let parts = id.split(separator: "#")
            guard parts.count == 2, let w = Int(parts[1]) else { return nil }
            let sa = parts[0].split(separator: ":")
            guard sa.count == 2, let s = Int(sa[0]), let a = Int(sa[1]) else { return nil }
            return (s, a, w)
        }
        guard let first = pos(0) else { return nil }
        // آخر آية بلغها القارئ من سورة البداية: الجلسة قد تعبر إلى سورة تالية (صفحة 604)، وأحداثها تحمل سورتها.
        guard let last = (0..<reached).reversed().lazy.compactMap(pos).first(where: { $0.surah == first.surah }) else { return nil }
        var events: [TasmeeSessionEvent] = []
        for x in m.mistakes {
            guard let p = pos(x.index) else { continue }
            events.append(TasmeeSessionEvent(surah: p.surah, ayah: p.ayah, wordIndex: p.word, kind: .wrong,
                                             said: x.said.last, expected: m.ref[x.index].text, attempts: x.said.count))
        }
        for i in 0..<reached where m.state[i] == .skipped {
            guard let p = pos(i) else { continue }
            events.append(TasmeeSessionEvent(surah: p.surah, ayah: p.ayah, wordIndex: p.word, kind: .skipped, expected: m.ref[i].text))
        }
        return TasmeeSessionRecord(startedAt: startedAt, durationSec: Date().timeIntervalSince(startedAt), mode: mode,
                                   surah: first.surah, fromAyah: first.ayah, toAyah: last.ayah, totalWords: reached,
                                   events: events, hints: hintsUsed)
    }

    /// تلميح يختاره المستخدم بعد ٣ محاولات خاطئة: أول حرف ثم الكلمة؛ يُحتسب ولا يقدّم التتبّع.
    public func requestHint() {
        guard options.allowsHints, let s = session, let ref, s.matcher.next < ref.words.count else { return }
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
public enum TasmeeWordPaint: Sendable { case hidden, faint, correct, wrong, skipped, error, current }

extension View {
    /// مخفية = شفافة (تحجز موضعها)؛ خطأ = خلفية حمراء خفيفة؛ متجاوزة = كهرمانية مع تنبيه.
    @ViewBuilder func tasmeePainted(_ paint: TasmeeWordPaint?, radius: CGFloat) -> some View {
        let hidden = paint == .hidden || paint == .error || paint == .current
        let tint: Color? = switch paint {
        case .some(.error): Color.red.opacity(0.22)
        case .some(.skipped): Color.orange.opacity(0.22)
        case .some(.current): Sunnah.Colors.primary.opacity(0.16)
        default: nil
        }
        // الكشف بنعومة ~180ms؛ الكلمة الحالية تتوهّج بإطار أخضر خفيف.
        self.opacity(hidden ? 0 : paint == .faint ? 0.28 : 1)
            .background {
                if let tint {
                    RoundedRectangle(cornerRadius: radius).fill(tint).padding(.horizontal, -2)
                        .overlay { if paint == .current { RoundedRectangle(cornerRadius: radius).stroke(Sunnah.Colors.primary.opacity(0.5), lineWidth: 1).padding(.horizontal, -2) } }
                        .shadow(color: paint == .current ? Sunnah.Colors.primary.opacity(0.35) : .clear, radius: 4)
                }
            }
            .overlay(alignment: .top) {
                if paint == .skipped { Image(systemName: "exclamationmark.triangle.fill").font(.system(size: 8)).foregroundStyle(Color.orange).offset(y: -4) }
            }
            .animation(.easeOut(duration: 0.18), value: paint)
            .accessibilityHint(paint == .error || paint == .wrong ? "خطأ في التلاوة" : paint == .skipped ? "كلمة متجاوزة" : "")
    }
}

extension MushafTasmeeController {
    /// دالة طلاء لصفحة بعينها (nil حين لا جلسة، فلا يتغيّر العرض الافتراضي).
    public func paint(page: Int) -> ((Int, Int) -> TasmeeWordPaint?)? {
        guard let slots = ref?.keysByPage[page], isActive || isFinished else { return nil }
        let hide = hideVerses
        let cur = currentKey
        let opts = options
        let counts = verseWordCounts
        return { r, c in
            guard let key = slots[MushafWordSlot(row: r, col: c)] else { return nil }
            switch self.states[key] ?? .pending {
            case .correct: return .correct
            case .wrong: return .error
            case .skipped: return .skipped
            case .pending:
                if key == cur { return .current }
                guard hide else { return nil }
                let parts = key.split(separator: "#")
                guard parts.count == 2, let pos = Int(parts[1]) else { return .hidden }
                switch opts.mask(position: pos, count: counts[String(parts[0])] ?? pos) {
                case .shown: return nil
                case .firstLetter: return .faint
                case .hidden: return .hidden
                }
            }
        }
    }
    /// الكلمة المنتظَرة الآن (تتوهّج) أثناء الاستماع فقط.
    var currentKey: String? {
        guard phase == .listening, let s = session, let ref, s.matcher.next < ref.words.count else { return nil }
        return ref.words[s.matcher.next].id
    }
    /// عدد كلمات كل آية في المرجع (لقناع «نصف الآية الأخير»).
    var verseWordCounts: [String: Int] {
        var c: [String: Int] = [:]
        for w in ref?.words ?? [] { if let v = w.id.split(separator: "#").first { c[String(v), default: 0] += 1 } }
        return c
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

import AVFoundation
import Foundation
import WhisperKit

/// نتيجة تفريغ جزئية تُرسَل إلى JS (المطابقة والكشف هناك). كل الأزمنة بالمللي ثانية من بدء الجلسة.
struct TasmeePartial {
    let seq: Int
    let text: String
    let windowStartMs: Int
    let windowEndMs: Int
    let computeMs: Int
    /// لحظة اكتمال الفك على ساعة الجلسة
    let finishedAtMs: Int
}

enum TasmeeEngineEvent {
    case partial(TasmeePartial)
    case interruption(began: Bool, shouldResume: Bool)
    case route(reason: String, input: String)
    case thermal(state: String, degraded: Bool)
    /// كلام مرصود بالـVAD لمدة ≥ 4ث متتالية والنموذج يعيد نصًا فارغًا: تلميح هادئ («لم يتضح الصوت…») دون إيقاف التسميع
    case unclearAudio(voicedSeconds: Double)
    case failure(String)
}

/// تسجيل متدفق + VAD + نافذة متحركة + WhisperKit، كلّها على الجهاز بلا شبكة وبلا إرسال صوت.
/// المطابقة والكشف في JS (src/lib/tasmee/matcher.ts)؛ هذا الصنف يرسل النص الجزئي فقط.
final class TasmeeEngine {
    struct Config {
        var hopSec = 0.5
        /// 6 ث: قياس اصطناعي (base، العتبات المعتمدة) p95 1.18 ث بدل 1.37 عند 10 ث، إنذار 1.38% وكشف 100%؛ q6: p95 1.18، إنذار 1.03% وكشف 99%
        var windowSec = 6.0
        var vadRms: Float = 0.006
        var maxSessionAudioSec = 15 * 60.0
        /// تحت الضغط الحراري: تقليل التكرار ونافذة الفك
        var degradedHopSec = 1.0
        var degradedWindowSec = 6.0
    }

    private let sampleRate = 16000.0
    private var config: Config
    private var pipe: WhisperKit?
    /// suppress_tokens من generation_config.json داخل حزمة النموذج (كما يفعل HF generate)
    private var suppressTokens: [Int] = []
    private let audioEngine = AVAudioEngine()
    private var converter: AVAudioConverter?
    private let lock = NSLock()
#if TASMEE_DIAGNOSTICS
    private var samples: [Float] = []            // صوت الجلسة (ذاكرة فقط، Debug/TestFlight): للمحاذاة اللاحقة بطوابع الكلمات
#endif
    private var keepSessionAudio = false
    private var ring: [Float] = []               // آخر windowSec
    private var sessionStart = Date()
    private var running = false
    private var loopTask: Task<Void, Never>?
    private var seq = 0
    private var promptText: String?
    private var degraded = false
    /// بداية سلسلة نبضات «كلام بلا نص» الحالية (nil = لا سلسلة)
    private var emptyVoicedSince: Date?
    private var unclearHintSent = false
    /// ثوانٍ متتالية من الكلام ثم النص الفارغ قبل التلميح
    private let unclearHintAfterSec = 4.0
    private var observers: [NSObjectProtocol] = []
    let diagnostics = TasmeeDiagnostics()
    var onEvent: ((TasmeeEngineEvent) -> Void)?

    init(config: Config = Config()) { self.config = config }

    var isRunning: Bool { running }

    // MARK: تحميل النموذج

    /// يحمّل النموذج من مجلد محلي؛ الـtokenizer داخل المجلد نفسه فلا شبكة وقت التشغيل.
    func load(modelFolder: URL) async throws {
        let cfg = WhisperKitConfig(
            modelFolder: modelFolder.path,
            tokenizerFolder: modelFolder,
            computeOptions: ModelComputeOptions(),
            verbose: false, logLevel: .none, prewarm: true, load: true, download: false
        )
        pipe = try await WhisperKit(cfg)
        if let data = try? Data(contentsOf: modelFolder.appendingPathComponent("generation_config.json")),
           let gc = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let list = gc["suppress_tokens"] as? [Int] { suppressTokens = list }
    }

    var isLoaded: Bool { pipe != nil }

    /// فحص قدرة الجهاز: فكّ نافذة صمت بطول النافذة ويُقاس الزمن. أكبر من الـhop → نموذج أصغر أو رسالة «غير مدعوم».
    func selfTest() async throws -> Double {
        guard let pipe else { throw NSError(domain: "Tasmee", code: 1, userInfo: [NSLocalizedDescriptionKey: "النموذج غير محمَّل"]) }
        let silent = [Float](repeating: 0, count: Int(config.windowSec * sampleRate))
        var best = Double.infinity
        for _ in 0..<3 {
            let t0 = Date()
            _ = try await pipe.transcribe(audioArray: silent, decodeOptions: DecodingOptions(verbose: false, task: .transcribe, language: "ar", temperature: 0, usePrefillPrompt: true, detectLanguage: false, skipSpecialTokens: true, withoutTimestamps: true, wordTimestamps: false, windowClipTime: 0, supressTokens: suppressTokens))
            best = min(best, Date().timeIntervalSince(t0) * 1000)
        }
        return best
    }

    // MARK: الجلسة

    func setPrompt(_ text: String?) { lock.lock(); promptText = text; lock.unlock() }

    func start(prompt: String?, keepSessionAudio: Bool) throws {
        guard pipe != nil else { throw NSError(domain: "Tasmee", code: 1, userInfo: [NSLocalizedDescriptionKey: "النموذج غير محمَّل"]) }
        guard !running else { return }
        self.keepSessionAudio = keepSessionAudio
        lock.lock()
#if TASMEE_DIAGNOSTICS
        samples = []
#endif
        ring = []; promptText = prompt; seq = 0; degraded = false
        emptyVoicedSince = nil; unclearHintSent = false
        lock.unlock()

        sessionStart = Date()   // قبل بدء الالتقاط: ساعة الجلسة وساعة العيّنات متطابقتان (فارق < ٥٠ms)
        try configureSession()
        try startCapture()
        running = true
        diagnostics.begin()
        observeSystem()
        loopTask = Task.detached { [weak self] in await self?.decodeLoop() }
    }

    func stop() -> TasmeeDiagnostics.Snapshot {
        running = false
        loopTask?.cancel(); loopTask = nil
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        for o in observers { NotificationCenter.default.removeObserver(o) }
        observers.removeAll()
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        return diagnostics.finish()
    }

#if TASMEE_DIAGNOSTICS
    /// صوت الجلسة المحفوظ في الذاكرة (وضع القياس فقط) — للمحاذاة اللاحقة بطوابع الكلمات. لا يُكتب إلى القرص ولا يغادر الجهاز.
    func sessionAudio() -> [Float] { lock.lock(); defer { lock.unlock() }; return samples }

    func releaseSessionAudio() { lock.lock(); samples = []; lock.unlock() }

    /// محاذاة بعد الجلسة: يفكّ كل صوت الجلسة بطوابع الكلمات لتقدير نهاية كل كلمة (لحساب التأخير الفعلي في شاشة القياس).
    func alignSession() async throws -> [(word: String, startMs: Int, endMs: Int)] {
        guard let pipe else { return [] }
        let audio = sessionAudio()
        guard !audio.isEmpty else { return [] }
        let opts = DecodingOptions(verbose: false, task: .transcribe, language: "ar", temperature: 0, usePrefillPrompt: true, detectLanguage: false, skipSpecialTokens: true, withoutTimestamps: false, wordTimestamps: true)
        let res = try await pipe.transcribe(audioArray: audio, decodeOptions: opts)
        var out: [(String, Int, Int)] = []
        for r in res { for seg in r.segments { for w in seg.words ?? [] { out.append((w.word.trimmingCharacters(in: .whitespaces), Int(w.start * 1000), Int(w.end * 1000))) } } }
        return out
    }
#endif

    // MARK: الصوت

    private func configureSession() throws {
        let s = AVAudioSession.sharedInstance()
        try s.setCategory(.playAndRecord, mode: .measurement, options: [.allowBluetooth, .duckOthers])
        try s.setPreferredSampleRate(sampleRate)
        try s.setActive(true)
    }

    private func startCapture() throws {
        let input = audioEngine.inputNode
        let inFormat = input.outputFormat(forBus: 0)
        guard let outFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: sampleRate, channels: 1, interleaved: false),
              let conv = AVAudioConverter(from: inFormat, to: outFormat) else {
            throw NSError(domain: "Tasmee", code: 2, userInfo: [NSLocalizedDescriptionKey: "تعذّر تهيئة الميكروفون"])
        }
        converter = conv
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 2048, format: inFormat) { [weak self] buffer, _ in
            guard let self, self.running || true else { return }
            let ratio = outFormat.sampleRate / inFormat.sampleRate
            let cap = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 16
            guard let out = AVAudioPCMBuffer(pcmFormat: outFormat, frameCapacity: cap) else { return }
            var supplied = false
            var err: NSError?
            conv.convert(to: out, error: &err) { _, status in
                if supplied { status.pointee = .noDataNow; return nil }
                supplied = true; status.pointee = .haveData; return buffer
            }
            guard err == nil, let ch = out.floatChannelData?[0] else { return }
            let chunk = Array(UnsafeBufferPointer(start: ch, count: Int(out.frameLength)))
            self.append(chunk)
        }
        audioEngine.prepare()
        try audioEngine.start()
    }

    private func append(_ chunk: [Float]) {
        lock.lock()
        ring.append(contentsOf: chunk)
        let maxRing = Int(max(config.windowSec, config.degradedWindowSec) * sampleRate) + Int(2 * sampleRate)
        if ring.count > maxRing { ring.removeFirst(ring.count - maxRing) }
#if TASMEE_DIAGNOSTICS
        if keepSessionAudio && samples.count < Int(config.maxSessionAudioSec * sampleRate) { samples.append(contentsOf: chunk) }
#endif
        totalFrames += chunk.count
        lock.unlock()
    }

    private var totalFrames = 0

    private func speechPresent(_ tail: ArraySlice<Float>) -> Bool {
        guard !tail.isEmpty else { return false }
        var acc: Float = 0
        for v in tail { acc += v * v }
        return (acc / Float(tail.count)).squareRoot() > config.vadRms
    }

    // MARK: حلقة الفك

    private func decodeLoop() async {
        guard let pipe else { return }
        while running && !Task.isCancelled {
            let tickStart = Date()
            let hop = degraded ? config.degradedHopSec : config.hopSec
            let windowSec = degraded ? config.degradedWindowSec : config.windowSec

            lock.lock()
            let win = Int(windowSec * sampleRate)
            let window = Array(ring.suffix(win))
            let tail = ring.suffix(Int(1.5 * sampleRate))
            let voiced = speechPresent(tail)
            let prompt = promptText
            let endFrames = totalFrames
            lock.unlock()

            if !voiced || window.count < Int(0.8 * sampleRate) {
                emptyVoicedSince = nil; unclearHintSent = false
                diagnostics.recordVadSkip()
                try? await Task.sleep(nanoseconds: UInt64(hop * 1_000_000_000))
                continue
            }

            var promptTokens: [Int]? = nil
            if let p = prompt, !p.isEmpty, let tok = pipe.tokenizer { promptTokens = tok.encode(text: " " + p) }
            let opts = DecodingOptions(
                verbose: false, task: .transcribe, language: "ar", temperature: 0,
                usePrefillPrompt: promptTokens == nil, detectLanguage: false, skipSpecialTokens: true,
                withoutTimestamps: true, wordTimestamps: false, windowClipTime: 0, promptTokens: promptTokens,
                suppressBlank: true, supressTokens: suppressTokens, compressionRatioThreshold: nil, logProbThreshold: nil,
                firstTokenLogProbThreshold: nil, noSpeechThreshold: nil
            )
            do {
                let t0 = Date()
                let res = try await pipe.transcribe(audioArray: window, decodeOptions: opts)
                let ms = Date().timeIntervalSince(t0) * 1000
                diagnostics.recordDecode(ms: ms)
                seq += 1
                let endMs = Int(Double(endFrames) / sampleRate * 1000)
                let startMs = max(0, endMs - Int(Double(window.count) / sampleRate * 1000))
                let finished = Int(Date().timeIntervalSince(sessionStart) * 1000)
                let text = res.map { $0.text }.joined(separator: " ")
                trackEmptyText(text: text)
                onEvent?(.partial(TasmeePartial(seq: seq, text: text, windowStartMs: startMs, windowEndMs: endMs, computeMs: Int(ms), finishedAtMs: finished)))
            } catch {
                onEvent?(.failure(error.localizedDescription))
            }
            let spent = Date().timeIntervalSince(tickStart)
            if spent < hop { try? await Task.sleep(nanoseconds: UInt64((hop - spent) * 1_000_000_000)) }
        }
    }

    /// «كلام بلا نص»: نبضة صوتها مسموع (VAD) أعاد النموذج لها نصًا فارغًا. تُحصى للقياس، وبعد 4ث متتالية يُرسَل تلميح مرة واحدة لكل سلسلة.
    private func trackEmptyText(text: String) {
        if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            diagnostics.recordSpeechWithoutText()
            let since = emptyVoicedSince ?? Date()
            emptyVoicedSince = since
            let voiced = Date().timeIntervalSince(since)
            if voiced >= unclearHintAfterSec, !unclearHintSent {
                unclearHintSent = true
                diagnostics.recordUnclearHint()
                onEvent?(.unclearAudio(voicedSeconds: voiced))
            }
        } else {
            emptyVoicedSince = nil; unclearHintSent = false
        }
    }

    // MARK: المقاطعات والمسار والحرارة

    private func observeSystem() {
        let nc = NotificationCenter.default
        observers.append(nc.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: nil) { [weak self] n in
            guard let self, let raw = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt, let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
            if type == .began {
                self.audioEngine.pause()
                self.onEvent?(.interruption(began: true, shouldResume: false))
            } else {
                let optRaw = n.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
                let resume = AVAudioSession.InterruptionOptions(rawValue: optRaw).contains(.shouldResume)
                if resume {
                    do { try AVAudioSession.sharedInstance().setActive(true); try self.audioEngine.start() } catch { self.onEvent?(.failure("تعذّر استئناف التسجيل بعد المقاطعة")) }
                }
                self.onEvent?(.interruption(began: false, shouldResume: resume))
            }
        })
        observers.append(nc.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: nil) { [weak self] n in
            guard let self, self.running else { return }
            let raw = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt ?? 0
            let reason = AVAudioSession.RouteChangeReason(rawValue: raw)
            let input = AVAudioSession.sharedInstance().currentRoute.inputs.first?.portName ?? "none"
            // سماعات أُزيلت/أُضيفت: تتغيّر صيغة الإدخال؛ أعد بناء الالتقاط دون إيقاف الجلسة
            if reason == .oldDeviceUnavailable || reason == .newDeviceAvailable || reason == .categoryChange {
                self.audioEngine.inputNode.removeTap(onBus: 0)
                self.audioEngine.stop()
                do { try self.startCapture() } catch { self.onEvent?(.failure("تعذّر إعادة ضبط الميكروفون بعد تغيّر السماعات")) }
            }
            self.onEvent?(.route(reason: String(raw), input: input))
        })
        observers.append(nc.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: nil, queue: nil) { [weak self] _ in
            self?.onEvent?(.failure("أُعيد ضبط خدمة الصوت؛ أعد بدء التسميع"))
        })
        observers.append(nc.addObserver(forName: ProcessInfo.thermalStateDidChangeNotification, object: nil, queue: nil) { [weak self] _ in
            guard let self else { return }
            let s = ProcessInfo.processInfo.thermalState
            self.degraded = s.rawValue >= ProcessInfo.ThermalState.serious.rawValue
            self.onEvent?(.thermal(state: TasmeeDiagnostics.thermalName(s), degraded: self.degraded))
        })
    }
}

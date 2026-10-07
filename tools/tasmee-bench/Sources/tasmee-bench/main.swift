import Foundation
import WhisperKit
import CoreML

// الاستعمال:
//  tasmee-bench --model <folder> --set <corpusSet> --rec <id> --out <json> [--hop 0.5] [--window 10]
//               [--prompt N] [--corrupt K] [--stable S] [--lookahead L]
func arg(_ name: String) -> String? {
    guard let i = CommandLine.arguments.firstIndex(of: "--\(name)"), i + 1 < CommandLine.arguments.count else { return nil }
    return CommandLine.arguments[i + 1]
}
let modelDir = arg("model")!, setDir = arg("set")!, recId = arg("rec")!, outPath = arg("out")!
let hop = Double(arg("hop") ?? "0.5")!, windowSec = Double(arg("window") ?? "10")!
let rawTokens = CommandLine.arguments.contains("--raw")
let promptN = Int(arg("prompt") ?? "0")!, corruptK = Int(arg("corrupt") ?? "0")!
var params = MatchParams()
if let s = arg("stable") { params.stableHyps = Int(s)! }
if let l = arg("lookahead") { params.lookahead = Int(l)! }

func loadWav(_ path: String) -> [Float] {
    let d = try! Data(contentsOf: URL(fileURLWithPath: path))
    let body = d.subdata(in: 44..<d.count)
    return body.withUnsafeBytes { raw in raw.bindMemory(to: Int16.self).map { Float($0) / 32768 } }
}

// suppress_tokens من generation_config.json (كما يفعل HF generate): بدونها قد يختار فك الترميز <|nospeech|> فيعيد نصًا فارغًا
var suppress: [Int] = []
if let gc = try? JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: modelDir + "/generation_config.json"))) as? [String: Any],
   let list = gc["suppress_tokens"] as? [Int] { suppress = list }
let audio = loadWav("\(setDir)/\(recId).wav")
let sr = 16000.0, duration = Double(audio.count) / sr
struct RefJSON: Decodable { let textUthmani: String }
var refTexts = try! JSONDecoder().decode([RefJSON].self, from: Data(contentsOf: URL(fileURLWithPath: "\(setDir)/ref.json"))).map { $0.textUthmani }
var corrupted: [Int] = []
if corruptK > 0 {   // استبدال كلمة كل K بكلمة من موضع بعيد: خطأ مزروع يجب ألا يُكشف «صحيحًا»
    var i = 5
    while i < refTexts.count { refTexts[i] = refTexts[(i + 17) % refTexts.count]; corrupted.append(i); i += corruptK }
}
let matcher = Matcher(ref: refTexts.map(RefWord.init), params: params)

// VAD طاقي بسيط: يتخطى فك الترميز عند صمت آخر ١٫٥ ثانية
func speechPresent(_ end: Int) -> Bool {
    let n = Int(1.5 * sr), start = max(0, end - n)
    guard end > start else { return false }
    var acc: Float = 0
    for i in start..<end { acc += audio[i] * audio[i] }
    return (acc / Float(end - start)).squareRoot() > 0.006
}

let config = WhisperKitConfig(modelFolder: modelDir, tokenizerFolder: CommandLine.arguments.contains("--tokenizer-hub") ? nil : URL(fileURLWithPath: modelDir), computeOptions: { switch arg("compute") { case "cpu": return ModelComputeOptions(melCompute: .cpuOnly, audioEncoderCompute: .cpuOnly, textDecoderCompute: .cpuOnly, prefillCompute: .cpuOnly); case "gpu": return ModelComputeOptions(melCompute: .cpuAndGPU, audioEncoderCompute: .cpuAndGPU, textDecoderCompute: .cpuAndGPU, prefillCompute: .cpuOnly); default: return ModelComputeOptions() } }(), verbose: false, logLevel: .none, prewarm: true, load: true, download: false)
let pipe = try await WhisperKit(config)

/// يمنع <|endoftext|> وفراغًا و<|nospeech|> كأول رمز مولَّد (كـbegin_suppress_tokens في HF generate):
/// يُحدَّد أول خطوة بأن آخر رمز في السياق هو <|notimestamps|> (أو آخر رمز في الـprompt الإرشادي).
final class FirstStepFilter: LogitsFiltering {
    let noTimestamps: Int; let blocked: [Int]
    init(noTimestamps: Int, blocked: [Int]) { self.noTimestamps = noTimestamps; self.blocked = blocked }
    func filterLogits(_ logits: MLMultiArray, withTokens tokens: [Int]) -> MLMultiArray {
        if tokens.last == noTimestamps { for t in blocked { logits[[0, 0, NSNumber(value: t)]] = NSNumber(value: -Float.infinity) } }
        return logits
    }
}
if CommandLine.arguments.contains("--first-step-filter"), let sp = pipe.tokenizer?.specialTokens {
    pipe.textDecoder.logitsFilters = [FirstStepFilter(noTimestamps: sp.noTimestampsToken, blocked: [sp.endToken, sp.whitespaceToken, sp.noSpeechToken])]
}

// وضع تشخيص: يكتب mel الذي يبنيه WhisperKit لمقطع (بدء/مدة بالثواني) كـfloat32 خامًا (80×3000) ثم يخرج
if let dump = arg("dump-mel") {
    let st = Int(Double(arg("start") ?? "0")! * sr), du = Int(Double(arg("dur") ?? "10")! * sr)
    let slice = Array(audio[st..<min(audio.count, st + du)])
    FileHandle.standardError.write(Data("slice \(slice.count)\n".utf8))
    guard let padded = pipe.audioProcessor.padOrTrim(fromArray: slice, startAt: 0, toLength: 480_000),
          let mel = try await pipe.featureExtractor.logMelSpectrogram(fromAudio: padded) as? MLMultiArray else { print("mel failed"); exit(1) }
    FileHandle.standardError.write(Data("mel ok \(mel.shape) \(mel.count)\n".utf8))
    var out = [Float](repeating: 0, count: mel.count)
    for i in 0..<mel.count { out[i] = mel[i].floatValue }
    out.withUnsafeBufferPointer { try! Data(buffer: $0).write(to: URL(fileURLWithPath: dump)) }
    if let pm = padded as? MLMultiArray {
        var pa = [Float](repeating: 0, count: pm.count)
        for i in 0..<pm.count { pa[i] = pm[i].floatValue }
        pa.withUnsafeBufferPointer { try! Data(buffer: $0).write(to: URL(fileURLWithPath: dump + ".audio")) }
    }
    print("mel shape", mel.shape, "count", mel.count, "dtype", mel.dataType.rawValue)
    exit(0)
}

struct DecodeLog: Codable { let audioEnd: Double; let start: Double; let computeMs: Double; let finish: Double; let text: String; let promptWords: Int }
struct WordLog: Codable { let index: Int; let state: String; let time: Double }
struct Out: Codable { let rec: String; let duration: Double; let decodes: [DecodeLog]; let words: [WordLog]; let corrupted: [Int]; let promptN: Int; let hop: Double; let window: Double; let stable: Int; let lookahead: Int; let skippedByVAD: Int }

var decodes: [DecodeLog] = [], words: [WordLog] = []
var now = hop, skipped = 0
let endTime = duration + 4.0
while now <= endTime {
    let audioEnd = min(duration, now)
    let endIdx = Int(audioEnd * sr)
    if !speechPresent(endIdx) { now += hop; skipped += 1; continue }
    let startIdx = max(0, endIdx - Int(windowSec * sr))
    var promptTokens: [Int]? = nil
    var pw = 0
    if promptN > 0, let tok = pipe.tokenizer {
        let from = matcher.next, to = min(refTexts.count, from + promptN)
        if from < to {
            let text = (from..<to).map { matcher.ref[$0].withDagger }.joined(separator: " ")
            promptTokens = tok.encode(text: " " + text)
            pw = to - from
        }
    }
    var opts = DecodingOptions(verbose: false, task: .transcribe, language: "ar", temperature: 0, usePrefillPrompt: promptTokens == nil, detectLanguage: false, skipSpecialTokens: !rawTokens, withoutTimestamps: !rawTokens, wordTimestamps: false, windowClipTime: 0, promptTokens: promptTokens, suppressBlank: true, supressTokens: suppress, compressionRatioThreshold: nil, logProbThreshold: nil, firstTokenLogProbThreshold: nil, noSpeechThreshold: nil)
    // تجارب عزل الفلاتر (الافتراضي بلا أي منها): كل علم يعيد فلترًا واحدًا
    if let v = arg("fallback") { opts.temperatureFallbackCount = Int(v)! }
    if let v = arg("prefill-cache") { opts.usePrefillCache = v == "1" }
    if CommandLine.arguments.contains("--no-suppress-blank") { opts.suppressBlank = false }
    if CommandLine.arguments.contains("--no-suppress-tokens") { opts.supressTokens = [] }
    if let v = arg("clip") { opts.windowClipTime = Float(v)! }
    if let v = arg("noSpeech") { opts.noSpeechThreshold = Float(v)! }
    if let v = arg("logProb") { opts.logProbThreshold = Float(v)! }
    if let v = arg("firstTokenLogProb") { opts.firstTokenLogProbThreshold = Float(v)! }
    if let v = arg("compression") { opts.compressionRatioThreshold = Float(v)! }
    if let v = arg("temperature") { opts.temperature = Float(v)! }
    let t0 = Date()
    let useOpts = CommandLine.arguments.contains("--defaults") ? DecodingOptions(task: .transcribe, language: "ar") : opts
    let res = try await pipe.transcribe(audioArray: Array(audio[startIdx..<endIdx]), decodeOptions: useOpts)
    let computeMs = Date().timeIntervalSince(t0) * 1000
    let text = res.map { $0.text }.joined(separator: " ")
    if CommandLine.arguments.contains("--dbg"), text.isEmpty {
        let seg = res.first?.segments.first
        let msg = "DBG results=\(res.count) segments=\(res.first?.segments.count ?? -1) tokens=\(seg?.tokens.count ?? -1) loops=\(res.first?.timings.totalDecodingLoops ?? -1) lang=\(res.first?.language ?? "?") segtext=\(seg?.text ?? "") ids=\(seg?.tokens.prefix(12).map { String($0) }.joined(separator: ",") ?? "")\n"
        FileHandle.standardError.write(Data(msg.utf8))
    }
    let finish = max(now, audioEnd) + computeMs / 1000
    decodes.append(DecodeLog(audioEnd: audioEnd, start: Double(startIdx) / sr, computeMs: computeMs, finish: finish, text: text, promptWords: pw))
    for e in matcher.ingest(text, at: finish) { words.append(WordLog(index: e.index, state: e.state.rawValue, time: e.time)) }
    now = max(finish, now + hop)
}
let out = Out(rec: recId, duration: duration, decodes: decodes, words: words, corrupted: corrupted, promptN: promptN, hop: hop, window: windowSec, stable: params.stableHyps, lookahead: params.lookahead, skippedByVAD: skipped)
let enc = JSONEncoder(); enc.outputFormatting = [.prettyPrinted]
try! enc.encode(out).write(to: URL(fileURLWithPath: outPath))
print("\(recId): decodes=\(decodes.count) revealed=\(words.filter { $0.state == "correct" }.count)/\(refTexts.count) meanCompute=\(Int(decodes.map { $0.computeMs }.reduce(0, +) / Double(max(1, decodes.count))))ms")

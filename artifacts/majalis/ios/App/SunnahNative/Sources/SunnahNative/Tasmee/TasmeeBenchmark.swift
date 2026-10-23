import Foundation

/// منصة قياس دقة التسميع: تُعيد تشغيل سجلّ النصوص الجزئية (الملتقط من `feedFile` في المحرك) على المطابِق وتقيس الدقة والإنذارات الكاذبة وزمن الكشف.
/// الهدف المعتمد: دقة ≥ 97%، إنذارات كاذبة ≤ 1%، كشف ≤ 400ms.
public struct TasmeeBenchPartial: Codable, Sendable, Equatable {
    public let text: String
    public let finishedAtMs: Double
    public init(text: String, finishedAtMs: Double) { self.text = text; self.finishedAtMs = finishedAtMs }
}

public struct TasmeeBenchReport: Sendable, Equatable {
    public let words: Int
    public let correct: Int
    public let falseErrors: Int
    /// وسيط/أقصى فارق بين نطق الكلمة (حقيقة أرضية) وصدور حدث «صحيحة».
    public let medianLatencyMs: Double
    public let p95LatencyMs: Double
    public var accuracy: Double { words == 0 ? 0 : Double(correct) / Double(words) }
    public var falseErrorRate: Double { words == 0 ? 0 : Double(falseErrors) / Double(words) }
    public var meetsTargets: Bool { accuracy >= 0.97 && falseErrorRate <= 0.01 && p95LatencyMs <= 400 }
}

public enum TasmeeBenchmark {
    /// `spokenAtMs[i]`: لحظة انتهاء نطق الكلمة i في التسجيل (من محاذاة قسرية أو تعليق يدوي)؛ فارغ ⇒ لا قياس زمن.
    /// التلاوة المرجعية صحيحة بالكامل، فكل حدث `wrong` أو `skipped` إنذار كاذب أو فوات.
    public static func run(ref: [TasmeeRefWord], partials: [TasmeeBenchPartial], spokenAtMs: [Double] = [],
                           params: TasmeeMatchParams = TasmeeStrictness.normal.params) -> TasmeeBenchReport {
        let m = TasmeeMatcher(ref: ref, params: params)
        var correctAt: [Int: Double] = [:]
        var falseErrors = 0
        for p in partials {
            for e in m.ingest(p.text, timeMs: p.finishedAtMs) {
                switch e.state {
                case .correct: correctAt[e.index] = e.timeMs
                case .wrong: falseErrors += 1
                default: break
                }
            }
        }
        var lat: [Double] = []
        for (i, t) in correctAt where i < spokenAtMs.count { lat.append(max(0, t - spokenAtMs[i])) }
        lat.sort()
        let median = lat.isEmpty ? 0 : lat[lat.count / 2]
        let p95 = lat.isEmpty ? 0 : lat[min(lat.count - 1, Int(Double(lat.count) * 0.95))]
        return TasmeeBenchReport(words: ref.count, correct: correctAt.count, falseErrors: falseErrors, medianLatencyMs: median, p95LatencyMs: p95)
    }

    /// ملف تغذية JSON للمقارنة الخارجية (مخرجات نماذج ن3):
    /// `{"ref":["كلمة",…],"partials":[{"text":"…","finishedAtMs":123}],"spokenAtMs":[…]}`
    public struct Feed: Codable, Sendable {
        public let ref: [String]
        public let partials: [TasmeeBenchPartial]
        public let spokenAtMs: [Double]?
    }

    public static func run(feedJSON: Data, params: TasmeeMatchParams = TasmeeStrictness.normal.params) throws -> TasmeeBenchReport {
        let f = try JSONDecoder().decode(Feed.self, from: feedJSON)
        let ref = f.ref.enumerated().map { TasmeeRefWord(id: "\($0.offset)", text: $0.element) }
        return run(ref: ref, partials: f.partials, spokenAtMs: f.spokenAtMs ?? [], params: params)
    }
}

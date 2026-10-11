import Foundation

/// مطابقة النتائج الجزئية للتفريغ الصوتي مع الكلمات القادمة — نسخة Swift حرفية من `src/lib/tasmee/matcher.ts`.
public enum TasmeeWordState: String, Sendable { case pending, correct, wrong, skipped }

public struct TasmeeRefWord: Sendable, Equatable {
    public let id: String
    public let text: String
    public init(id: String, text: String) { self.id = id; self.text = text }
}

public struct TasmeeWordEvent: Sendable, Equatable {
    public let index: Int
    public let id: String
    public let state: TasmeeWordState
    public let timeMs: Double
}

public struct TasmeeExtraEvent: Sendable, Equatable {
    public let afterIndex: Int
    public let heard: String
    public let timeMs: Double
}

public struct TasmeeMatchParams: Sendable, Equatable {
    public var lookahead = 5
    public var back = 4
    public var stableHyps = 1
    public var thrLong = 0.75
    public var thrMid = 0.66
    public var wrongSim = 0.4
    public var detectExtra = false
    public var extraStableHyps = 2
    public var extraMinLen = 3
    public var extraSelfCorrectSim = 0.3
    public init() {}
}

public enum TasmeeStrictness: String, CaseIterable, Sendable {
    case lenient, normal, strict

    public var label: String {
        switch self { case .lenient: "متسامح"; case .normal: "عادي"; case .strict: "دقيق" }
    }

    public var params: TasmeeMatchParams {
        var p = TasmeeMatchParams()
        switch self {
        case .lenient: p.thrLong = 0.6; p.thrMid = 0.66; p.wrongSim = 0.3
        case .normal: p.thrLong = 0.75; p.thrMid = 0.66; p.wrongSim = 0.4
        case .strict: p.thrLong = 0.85; p.thrMid = 1; p.wrongSim = 0.5; p.detectExtra = true
        }
        return p
    }
}

public final class TasmeeMatcher {
    public let ref: [TasmeeRefWord]
    public let params: TasmeeMatchParams
    private let forms: [[String]]
    public private(set) var state: [TasmeeWordState]
    public private(set) var next = 0
    private var stable: [Int: Int] = [:]
    private var extraSeen: [String: Int] = [:]
    private var extraReported = Set<String>()
    private var pendingExtras: [TasmeeExtraEvent] = []

    public init(ref: [TasmeeRefWord], params: TasmeeMatchParams = TasmeeMatchParams()) {
        self.ref = ref
        self.params = params
        self.forms = ref.map { QuranWordMatch.quranWordForms($0.text) }
        self.state = Array(repeating: .pending, count: ref.count)
    }

    public func upcomingText(_ count: Int) -> String {
        ref.dropFirst(next).prefix(count).map(\.text).joined(separator: " ")
    }

    public func reset() {
        state = Array(repeating: .pending, count: ref.count)
        next = 0
        stable.removeAll(); extraSeen.removeAll(); extraReported.removeAll(); pendingExtras = []
    }

    public func drainExtras() -> [TasmeeExtraEvent] {
        defer { pendingExtras = [] }
        return pendingExtras
    }

    private func sim(_ tok: String, _ idx: Int) -> Double { QuranWordMatch.bestWordSimilarity(tok, forms[idx]) }

    private func accepts(_ token: String, _ idx: Int) -> Bool {
        let len = min(forms[idx][0].unicodeScalars.count, token.unicodeScalars.count)
        let s = sim(token, idx)
        if len <= 2 { return s >= 0.99 }
        if len == 3 { return s >= params.thrMid }
        return s >= params.thrLong
    }

    typealias Match = (tok: Int, word: Int)

    private func detectExtras(_ toks: [String], _ matched: [Match], _ timeMs: Double) {
        var seenNow = Set<String>()
        let matchedToks = Set(matched.map(\.tok))
        var k = 0
        while k + 1 < matched.count {
            defer { k += 1 }
            let a = matched[k], b = matched[k + 1]
            if b.word != a.word + 1 || b.tok - a.tok < 2 { continue }
            for ti in (a.tok + 1)..<b.tok {
                if matchedToks.contains(ti) { continue }
                let tok = toks[ti]
                if tok.unicodeScalars.count < params.extraMinLen { continue }
                let lo = max(0, a.word - 10), hi = min(ref.count, b.word + 10)
                var similar = false
                var j = lo
                while j < hi && !similar {
                    similar = accepts(tok, j) || sim(tok, j) >= params.wrongSim + 0.2
                    j += 1
                }
                if similar { continue }
                if ti == b.tok - 1 && sim(tok, b.word) >= params.extraSelfCorrectSim { continue }
                let key = "\(a.word)|\(tok)"
                seenNow.insert(key)
                let n = (extraSeen[key] ?? 0) + 1
                extraSeen[key] = n
                if n >= params.extraStableHyps && !extraReported.contains(key) {
                    extraReported.insert(key)
                    pendingExtras.append(TasmeeExtraEvent(afterIndex: a.word, heard: tok, timeMs: timeMs))
                }
            }
        }
        for key in Array(extraSeen.keys) where !seenNow.contains(key) { extraSeen.removeValue(forKey: key) }
    }

    /// محاذاة semi-global DP: تطابق +2، استبدال/حذف −1، بداية ونهاية حرّتان.
    private func align(_ toks: [String]) -> [Match] {
        let m = toks.count
        let lo = max(0, next - m - params.back)
        let hi = min(ref.count, next + params.lookahead)
        let r = hi - lo
        if r <= 0 { return [] }
        let neg = -1_000_000_000
        var dp = Array(repeating: Array(repeating: neg, count: r + 1), count: m + 1)
        var from = Array(repeating: Array(repeating: 0, count: r + 1), count: m + 1)
        for j in 0...r { dp[0][j] = 0 }
        let acc: [[Bool]] = toks.map { t in (0..<r).map { accepts(t, lo + $0) } }
        for i in 1...m {
            for j in 0...r {
                var best = dp[i - 1][j] - 1
                var how = 2
                if j > 0 {
                    let diag = dp[i - 1][j - 1] + (acc[i - 1][j - 1] ? 2 : -1)
                    if diag > best { best = diag; how = 1 }
                    let skip = dp[i][j - 1] - 1
                    if skip > best { best = skip; how = 3 }
                }
                dp[i][j] = best
                from[i][j] = how
            }
        }
        var j = 0
        for c in 1...max(r, 1) where c <= r && dp[m][c] > dp[m][j] { j = c }
        var out: [Match] = []
        var i = m
        while i > 0 {
            let how = from[i][j]
            if how == 1 {
                if acc[i - 1][j - 1] { out.append((i - 1, lo + j - 1)) }
                i -= 1; j -= 1
            } else if how == 3 {
                j -= 1
            } else {
                i -= 1
            }
        }
        return out.reversed()
    }

    /// يستقبل نصًّا جزئيًّا ويُرجع الكلمات التي حُسمت حالتها الآن.
    public func ingest(_ text: String, timeMs: Double) -> [TasmeeWordEvent] {
        let toks = QuranWordMatch.tokenizeSpoken(text).map(\.norm)
        if toks.isEmpty || next >= ref.count { return [] }

        let matched = align(toks)
        if params.detectExtra { detectExtras(toks, matched, timeMs) }

        let candidates = Set(matched.map(\.word).filter { $0 >= next })
        for k in Array(stable.keys) where !candidates.contains(k) { stable[k] = 0 }
        for c in candidates { stable[c] = (stable[c] ?? 0) + 1 }

        let ready = candidates.filter { (stable[$0] ?? 0) >= params.stableHyps }.sorted()
        guard let j = ready.last else { return [] }

        let prevTok = matched.last(where: { $0.word < next })?.tok ?? -1
        let jTok = matched.first(where: { $0.word == j })?.tok ?? toks.count
        let matchedToks = Set(matched.map(\.tok))
        let unmatchedBetween = ((prevTok + 1)..<max(jTok, prevTok + 1)).filter { !matchedToks.contains($0) }

        var events: [TasmeeWordEvent] = []
        func push(_ index: Int, _ st: TasmeeWordState) {
            state[index] = st
            events.append(TasmeeWordEvent(index: index, id: ref[index].id, state: st, timeMs: timeMs))
        }
        var ui = 0
        for g in next..<j {
            if ready.contains(g) {
                push(g, .correct)
            } else if ui < unmatchedBetween.count && sim(toks[unmatchedBetween[ui]], g) >= params.wrongSim {
                ui += 1
                push(g, .wrong)
            } else {
                push(g, .skipped)
            }
        }
        push(j, .correct)
        next = j + 1
        stable.removeAll()
        return events
    }
}

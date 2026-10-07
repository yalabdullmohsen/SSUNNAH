import Foundation

enum WordState: String, Codable { case pending, correct, wrong, skipped }

struct RefWord {
    let display: String
    let withDagger: String
    let plain: String
    init(_ text: String) {
        display = text
        withDagger = ArabicNormalizer.normalize(text, daggerAsAlef: true)
        plain = ArabicNormalizer.normalize(text, daggerAsAlef: false)
    }
}

struct MatchParams {
    var lookahead = 5          // نافذة الكلمات القادمة (٣–٥)
    var back = 4               // كلمات سابقة تُستهلك لمحاذاة بداية النافذة
    var stableHyps = 1         // عدد النتائج الجزئية المتتالية اللازمة قبل الكشف
    var thrLong = 0.75         // طول ≥ ٤
    var thrMid = 0.66          // طول = ٣
    var wrongSim = 0.4         // أدنى تشابه لاعتبار كلمة مسموعة «خطأ» لا «متجاوزة»
}

struct WordEvent { let index: Int; let state: WordState; let time: Double }

/// يطابق النتائج الجزئية مع الكلمات القادمة؛ يكشف الكلمة فور تطابقها دون انتظار نهاية الآية.
final class Matcher {
    let ref: [RefWord]
    var params: MatchParams
    private(set) var state: [WordState]
    private(set) var next = 0
    private var stable: [Int: Int] = [:]

    init(ref: [RefWord], params: MatchParams) {
        self.ref = ref; self.params = params
        state = Array(repeating: .pending, count: ref.count)
    }

    func score(_ token: String, _ r: RefWord) -> Double {
        max(ArabicNormalizer.similarity(token, r.withDagger), ArabicNormalizer.similarity(token, r.plain))
    }

    func accepts(_ token: String, _ r: RefWord) -> Bool {
        let len = min(r.plain.count, token.count)
        let s = score(token, r)
        if len <= 2 { return s >= 0.99 }
        if len == 3 { return s >= params.thrMid }
        return s >= params.thrLong
    }

    /// محاذاة أحادية الاتجاه (semi-global DP) للكلمات المسموعة على [next-m-back, next+lookahead) — تطابق lib/tasmee/matcher.ts.
    func align(_ toks: [String]) -> [(tok: Int, word: Int)] {
        let m = toks.count
        let lo = max(0, next - m - params.back), hi = min(ref.count, next + params.lookahead)
        let r = hi - lo
        if r <= 0 { return [] }
        let NEG = -1_000_000_000
        var dp = Array(repeating: Array(repeating: NEG, count: r + 1), count: m + 1)
        var from = Array(repeating: Array(repeating: 0, count: r + 1), count: m + 1)
        for j in 0...r { dp[0][j] = 0 }
        let acc: [[Bool]] = toks.map { t in (0..<r).map { accepts(t, ref[lo + $0]) } }
        if m > 0 {
            for i in 1...m {
                for j in 0...r {
                    var best = dp[i - 1][j] - 1, how = 2
                    if j > 0 {
                        let diag = dp[i - 1][j - 1] + (acc[i - 1][j - 1] ? 2 : -1)
                        if diag > best { best = diag; how = 1 }
                        let skip = dp[i][j - 1] - 1
                        if skip > best { best = skip; how = 3 }
                    }
                    dp[i][j] = best; from[i][j] = how
                }
            }
        }
        var j = 0
        for c in 1...r where dp[m][c] > dp[m][j] { j = c }
        var out: [(tok: Int, word: Int)] = []
        var i = m
        while i > 0 {
            let how = from[i][j]
            if how == 1 { if acc[i - 1][j - 1] { out.append((i - 1, lo + j - 1)) }; i -= 1; j -= 1 }
            else if how == 3 { j -= 1 }
            else { i -= 1 }
        }
        return out.reversed()
    }

    func ingest(_ text: String, at time: Double) -> [WordEvent] {
        let toks = ArabicNormalizer.tokens(text)
        guard !toks.isEmpty, next < ref.count else { return [] }
        let matched = align(toks)
        let candidates = Set(matched.map { $0.word }.filter { $0 >= next })
        for k in Array(stable.keys) where !candidates.contains(k) { stable[k] = 0 }
        for c in candidates { stable[c, default: 0] += 1 }

        var events: [WordEvent] = []
        // اكشف أبعد كلمة مستقرة ضمن النافذة (مع معالجة ما قبلها)
        let ready = candidates.filter { stable[$0, default: 0] >= params.stableHyps }.sorted()
        guard let j = ready.last else { return [] }
        let prevTok = matched.last(where: { $0.word < next })?.tok ?? -1
        let jTok = matched.first(where: { $0.word == j })?.tok ?? toks.count
        let unmatchedBetween = toks.indices.filter { ti in ti > prevTok && ti < jTok && !matched.contains(where: { m in m.tok == ti }) }
        var gapWords = Array(next..<j)
        var ui = 0
        while !gapWords.isEmpty {
            let g = gapWords.removeFirst()
            var st = WordState.skipped
            if ready.contains(g) {
                st = .correct
            } else if ui < unmatchedBetween.count {
                let tok = toks[unmatchedBetween[ui]]
                if score(tok, ref[g]) >= params.wrongSim { st = .wrong; ui += 1 }
            }
            state[g] = st
            events.append(WordEvent(index: g, state: st, time: time))
        }
        state[j] = .correct
        events.append(WordEvent(index: j, state: .correct, time: time))
        next = j + 1
        stable.removeAll()
        return events
    }
}

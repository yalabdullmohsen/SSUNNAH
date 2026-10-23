import Foundation

/// كلمة ضعيفة بعينها (سورة:آية:ترتيب الكلمة) بتكرار متباعد؛ تعيد استعمال صناديق `TasmeeSpacing`.
public struct TasmeeWeakWord: Codable, Sendable, Equatable, Identifiable {
    public var surah: Int
    public var ayah: Int
    public var wordIndex: Int
    public var box: Int
    public var dueAt: Date
    public var misses: Int
    public var id: String { "\(surah):\(ayah):\(wordIndex)" }

    public init(surah: Int, ayah: Int, wordIndex: Int, box: Int = 0, dueAt: Date, misses: Int = 1) {
        self.surah = surah; self.ayah = ayah; self.wordIndex = wordIndex
        self.box = box; self.dueAt = dueAt; self.misses = misses
    }
}

public enum TasmeeWeakWordBank {
    /// يطبّق جلسة على البنك: كل كلمة خاطئة/متروكة/مُلمَّح لها تدخل أو تعود للصندوق 0،
    /// وكل كلمة مستحقة قيلت صوابًا بلا تلميح ترتقي (وتخرج متقنةً بعد الصندوق الأخير).
    public static func apply(_ r: TasmeeSessionRecord, to bank: [TasmeeWeakWord],
                             calendar: Calendar = .current) -> [TasmeeWeakWord] {
        var out = bank
        var failed = Set<String>()
        for e in r.events where e.kind == .wrong || e.kind == .skipped || e.usedPeek {
            let key = "\(e.surah):\(e.ayah):\(e.wordIndex)"
            guard failed.insert(key).inserted else { continue }
            if let i = out.firstIndex(where: { $0.id == key }) {
                out[i].box = 0; out[i].misses += 1
                out[i].dueAt = TasmeeSpacing.due(afterBox: 0, from: r.startedAt, calendar: calendar)
            } else {
                out.append(TasmeeWeakWord(surah: e.surah, ayah: e.ayah, wordIndex: e.wordIndex,
                                          dueAt: TasmeeSpacing.due(afterBox: 0, from: r.startedAt, calendar: calendar)))
            }
        }
        var passed = Set<String>()
        for e in r.events where e.kind == .correct && !e.usedPeek {
            let key = "\(e.surah):\(e.ayah):\(e.wordIndex)"
            if !failed.contains(key) { passed.insert(key) }
        }
        var kept: [TasmeeWeakWord] = []
        for var w in out {
            if passed.contains(w.id), w.dueAt <= r.startedAt {
                let next = w.box + 1
                if next > TasmeeSpacing.maxBox { continue }
                w.box = next
                w.dueAt = TasmeeSpacing.due(afterBox: next, from: r.startedAt, calendar: calendar)
            }
            kept.append(w)
        }
        return kept
    }

    /// الكلمات المستحقة مجمّعةً بآياتها (للتسميع الموجَّه «كلماتك الصعبة»)، الأكثر تعثرًا أولًا.
    public static func dueAyahs(_ bank: [TasmeeWeakWord], now: Date) -> [(surah: Int, ayah: Int, words: [Int])] {
        let due = bank.filter { $0.dueAt <= now }
        let grouped = Dictionary(grouping: due) { "\($0.surah):\($0.ayah)" }
        return grouped.values
            .map { ws in (surah: ws[0].surah, ayah: ws[0].ayah, words: ws.map(\.wordIndex).sorted(),
                          misses: ws.reduce(0) { $0 + $1.misses }) }
            .sorted { ($1.misses, $0.surah, $0.ayah) < ($0.misses, $1.surah, $1.ayah) }
            .map { (surah: $0.surah, ayah: $0.ayah, words: $0.words) }
    }
}

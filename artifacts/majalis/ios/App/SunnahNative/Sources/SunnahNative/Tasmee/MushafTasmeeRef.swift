import Foundation

/// مرجع التسميع لصفحات المصحف: كلمات الصفحة رموز جلايف لا نصًا، فيُؤخذ نص كل آية من `MushafSearch.ayahText` (قراءة فقط)
/// ويُقسَّم بالمسافات؛ كل كلمة غير علامة نهاية آية تقابل كلمة نصية بالترتيب. المفتاح «سورة:آية#رقم» (رقم الكلمة من 1).
public struct MushafTasmeeRef: Sendable {
    public let words: [TasmeeRefWord]
    /// صفحة كل كلمة مرجعية (للمتابعة التلقائية).
    public let pages: [Int]
    /// مفتاح الكلمة المرجعية → فهرسها.
    public let indexByKey: [String: Int]
    /// لكل صفحة: مفتاح كل كلمة (صف، عمود) → مفتاح مرجعي، للكلمات الموافِقة فقط.
    public let keysByPage: [Int: [MushafWordSlot: String]]
    /// آيات تعذّر مطابقتها (عدد كلمات الجلايف ≠ عدد كلمات النص) فتُستثنى بدل تخمين.
    public let skippedVerses: [String]

    public static func key(_ verse: String, _ i: Int) -> String { "\(verse)#\(i)" }

    /// يبني المرجع من `startPage` فصاعدًا لـ`pageCount` صفحة. `fromVerse`: ابدأ من أول كلمة في هذه الآية إن وُجدت في أول صفحة.
    public static func build(repo: MushafRepository, search: MushafSearch, startPage: Int, pageCount: Int = 2, fromVerse: String? = nil) -> MushafTasmeeRef {
        var words: [TasmeeRefWord] = [], pages: [Int] = [], byKey: [String: Int] = [:]
        var slots: [Int: [MushafWordSlot: String]] = [:], skipped: [String] = []
        var counters: [String: Int] = [:]
        var bad = Set<String>(), checked = Set<String>()
        var started = fromVerse == nil
        let last = min(Mushaf.pageCount, startPage + pageCount - 1)
        guard startPage >= 1, startPage <= last else {
            return MushafTasmeeRef(words: [], pages: [], indexByKey: [:], keysByPage: [:], skippedVerses: [])
        }
        // الآية التي تتواصل من الصفحة السابقة: تُحسب كلماتها السابقة لتتّسق الأرقام.
        if let first = firstVerse(repo: repo, page: startPage), startPage > 1,
           let prev = try? repo.page(startPage - 1), lastVerse(prev) == first {
            counters[first] = wordsBefore(repo: repo, verse: first, page: startPage)
        }
        for n in startPage...last {
            guard let page = try? repo.page(n) else { continue }
            var map: [MushafWordSlot: String] = [:]
            for (r, row) in page.rows.enumerated() where row.k == "l" {
                for (c, w) in (row.w ?? []).enumerated() where !w.isAyahEnd {
                    if !started { if w.v == fromVerse { started = true } else { continue } }
                    let i = (counters[w.v] ?? 0) + 1
                    counters[w.v] = i
                    // تُقارَن الآية كاملة (عبر الصفحات) قبل ربط أي كلمة منها؛ الفحص عند أول كلمة زائدة كان يربط ما قبلها بتخمين،
                    // ولا يكشف آية كلماتها في النص أكثر من الرسم.
                    if checked.insert(w.v).inserted, textCount(search, w.v) != glyphCount(repo: repo, verse: w.v, page: n) {
                        bad.insert(w.v); skipped.append(w.v)
                    }
                    guard !bad.contains(w.v), let text = textWord(search, w.v, i) else { continue }
                    let k = key(w.v, i)
                    byKey[k] = words.count
                    words.append(TasmeeRefWord(id: k, text: text)); pages.append(n)
                    map[MushafWordSlot(row: r, col: c)] = k
                }
            }
            slots[n] = map
        }
        return MushafTasmeeRef(words: words, pages: pages, indexByKey: byKey, keysByPage: slots, skippedVerses: skipped)
    }

    private static func textWord(_ s: MushafSearch, _ verse: String, _ i: Int) -> String? {
        guard let t = s.ayahText(verse) else { return nil }
        let ws = t.split(whereSeparator: { $0.isWhitespace })
        return i <= ws.count ? String(ws[i - 1]) : nil
    }

    private static func textCount(_ s: MushafSearch, _ verse: String) -> Int? {
        s.ayahText(verse)?.split(whereSeparator: { $0.isWhitespace }).count
    }

    private static func lineWords(_ p: MushafPage, _ verse: String) -> Int {
        p.rows.filter { $0.k == "l" }.flatMap { $0.w ?? [] }.filter { $0.v == verse && !$0.isAyahEnd }.count
    }

    /// كلمات الآية في الرسم كله: ما قبل `page` + هذه الصفحة + ما يتصل بعدها ما دامت الآية تختم الصفحة.
    private static func glyphCount(repo: MushafRepository, verse: String, page: Int) -> Int {
        var total = wordsBefore(repo: repo, verse: verse, page: page), n = page
        while n <= Mushaf.pageCount, let p = try? repo.page(n) {
            let c = lineWords(p, verse)
            total += c
            if c == 0 || lastVerse(p) != verse { break }
            n += 1
        }
        return total
    }

    private static func firstVerse(repo: MushafRepository, page n: Int) -> String? {
        (try? repo.page(n))?.rows.lazy.compactMap { $0.k == "l" ? $0.w?.first(where: { !$0.isAyahEnd })?.v : nil }.first
    }

    private static func lastVerse(_ p: MushafPage) -> String? {
        for row in p.rows.reversed() where row.k == "l" {
            if let w = row.w?.last(where: { !$0.isAyahEnd }) { return w.v }
        }
        return nil
    }

    /// كلمات الآية قبل `page` (تمشي للخلف ما دامت الآية تتصل).
    private static func wordsBefore(repo: MushafRepository, verse: String, page: Int) -> Int {
        var total = 0, n = page - 1
        while n >= 1, let p = try? repo.page(n) {
            let c = p.rows.flatMap { $0.w ?? [] }.filter { $0.v == verse && !$0.isAyahEnd }.count
            total += c
            if c == 0 || firstVerse(repo: repo, page: n) != verse { break }
            n -= 1
        }
        return total
    }
}

public struct MushafWordSlot: Hashable, Sendable {
    public let row: Int
    public let col: Int
}

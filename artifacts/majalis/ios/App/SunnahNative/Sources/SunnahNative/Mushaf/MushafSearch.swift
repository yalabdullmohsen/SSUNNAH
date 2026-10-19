import Foundation

public struct MushafJump: Equatable, Sendable {
    public let page: Int
    /// «سورة:آية» عند القفز لآية (تُظلَّل)، وإلا nil لبداية سورة.
    public let ayah: String?
    public let title: String
}

public struct MushafSearchHit: Equatable, Sendable, Identifiable {
    public var id: String { ayah }
    public let ayah: String
    public let page: Int
    public let text: String
}

/// بحث في نص Tanzil الحرفي بعد التطبيع المشترك (إزالة التشكيل وتوحيد الألف)؛ النص المعروض لا يُعدَّل.
public struct MushafSearch: Sendable {
    private struct Entry: Sendable { let ayah: String; let text: String; let norm: String }
    private let entries: [Entry]
    /// النصوص المطبَّعة متجاورة بـUTF-8 تفصل بينها «\n»؛ البحث بايتي (UTF-8 ذاتي التزامن فالتطابق البايتي = تطابق سكالارات).
    private let haystack: [UInt8]
    private let starts: [Int]
    /// فهرس ثانوي بلا ألف: الرسم العثماني يكتب «الصابرين» بألف خنجرية (تُحذف في التطبيع) فلا يطابقها إملاء المستخدم بألف كاملة.
    private let haystackNoAlif: [UInt8]
    private let startsNoAlif: [Int]
    private let ayahPage: [String: Int]
    private let byAyah: [String: String]
    private let entryByAyah: [String: Entry]
    private let tokenIndex: TokenIndex

    private struct SurahFile: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let number: Int; let ayahs: [A] }

    public init(surahDirectory: URL, ayahPage: [String: Int]) throws {
        func load(_ s: Int) throws -> SurahFile {
            try JSONDecoder().decode(SurahFile.self, from: Data(contentsOf: surahDirectory.appendingPathComponent(String(format: "surah-%03d.json", s))))
        }
        // البسملة من آية 1:1 أولًا، ثم تُحمَّل السور الباقية بالتوازي (القراءة + التطبيع هما الكلفة)؛ الترتيب محفوظ.
        let fatiha = try load(1)
        func make(_ f: SurahFile) -> [Entry] {
            f.ayahs.map { a in
                let t = QuranDisplayText.clean(a.text, surah: f.number, ayah: a.numberInSurah)   // بلا «۞» ولا بسملة مدمجة
                return Entry(ayah: "\(f.number):\(a.numberInSurah)", text: t, norm: Self.normalize(t))
            }
        }
        let lock = NSLock()
        var perSurah = [[Entry]](repeating: [], count: 115), failure: Error?
        perSurah[1] = make(fatiha)
        DispatchQueue.concurrentPerform(iterations: 113) { i in
            let n = i + 2
            do { let e = make(try load(n)); lock.lock(); perSurah[n] = e; lock.unlock() }
            catch { lock.lock(); failure = error; lock.unlock() }
        }
        if let failure { throw failure }
        let out = perSurah.flatMap { $0 }
        entries = out; self.ayahPage = ayahPage
        byAyah = Dictionary(uniqueKeysWithValues: out.map { ($0.ayah, $0.text) })
        entryByAyah = Dictionary(uniqueKeysWithValues: out.map { ($0.ayah, $0) })
        tokenIndex = TokenIndex(out.map { ($0.ayah, $0.norm) })
        var hay: [UInt8] = [], st: [Int] = []
        for e in out { st.append(hay.count); hay.append(contentsOf: e.norm.utf8); hay.append(0x0A) }
        haystack = hay; starts = st
        var hay2: [UInt8] = [], st2: [Int] = []
        for e in out { st2.append(hay2.count); hay2.append(contentsOf: Self.dropAlif(e.norm).utf8); hay2.append(0x0A) }
        haystackNoAlif = hay2; startsNoAlif = st2
    }

    static func normalize(_ text: String) -> String {
        text.split(whereSeparator: \.isWhitespace).map { QuranWordMatch.normalizeQuranWord(String($0)) }.filter { !$0.isEmpty }.joined(separator: " ")
    }

    /// نص الآية الحرفي (Tanzil) لمفتاح «سورة:آية»؛ للنسخ والمشاركة.
    public func ayahText(_ ayah: String) -> String? { byAyah[ayah] }

    static func dropAlif(_ text: String) -> String { String(text.filter { $0 != "ا" }) }

    /// بحث متسامح: العبارة الحرفية أولًا (تطابق تام)، ثم الكلمات بأي ترتيب بقواعد التسامح (انظر `TokenIndex`).
    public func search(_ query: String, limit: Int = 50) -> [MushafSearchHit] {
        let norm = Self.normalize(query)
        guard norm.count >= 2 else { return [] }
        var hits = scan(Array(norm.utf8), haystack, starts, limit)
        if hits.isEmpty {
            // لا نتيجة بالفهرس الأساس: جرّب بلا ألف (إملاء المستخدم ≠ الرسم العثماني).
            let bare = Self.dropAlif(norm)
            if bare.count >= 2 { hits = scan(Array(bare.utf8), haystackNoAlif, startsNoAlif, limit) }
        }
        let exact = Set(hits.map(\.ayah))
        guard hits.count < limit else { return hits }
        let tokens = norm.split(separator: " ").map(String.init)
        for ayah in tokenIndex.rank(tokens, excluding: exact, limit: limit - hits.count) {
            guard let e = entryByAyah[ayah] else { continue }
            hits.append(MushafSearchHit(ayah: ayah, page: ayahPage[ayah] ?? 1, text: e.text))
        }
        return hits
    }

    /// القفز المباشر: «2:255» أو «البقرة 255» أو «سورة البقرة» أو اسم سورة (تطابق تام أو بداية فريدة ≥3 أحرف).
    public static func jump(_ query: String, index: MushafIndex) -> MushafJump? {
        let q = QuranWordMatch.normalizeArabic(query)
        let parts = q.split(separator: " ").map(String.init)
        guard !parts.isEmpty else { return nil }
        func ayahTarget(_ s: Int, _ a: Int) -> MushafJump? {
            guard (1...114).contains(s), let sr = index.surahs.first(where: { $0.id == s }), (1...sr.ayahs).contains(a),
                  let page = index.ayahPage["\(s):\(a)"] else { return nil }
            return MushafJump(page: page, ayah: "\(s):\(a)", title: "\(sr.name) \(a)")
        }
        if parts.count == 1, let c = parts[0].firstIndex(of: ":") {
            let l = parts[0][..<c], r = parts[0][parts[0].index(after: c)...]
            if let s = Int(l), let a = Int(r) { return ayahTarget(s, a) }
        }
        var words = parts
        if words.first == "سوره" { words.removeFirst() }
        if words.count >= 2, let a = Int(words[words.count - 1]), let sr = surahMatch(words.dropLast().joined(separator: " "), index) {
            return ayahTarget(sr.id, a)
        }
        if words.count >= 2, words.count == 2, let s = Int(words[0]), let a = Int(words[1]) { return ayahTarget(s, a) }
        guard !words.isEmpty, words.allSatisfy({ Int($0) == nil }), let sr = surahMatch(words.joined(separator: " "), index) else { return nil }
        return MushafJump(page: sr.firstPage, ayah: nil, title: sr.name)
    }

    private static func surahKey(_ s: String) -> String {
        var k = dropAlif(QuranWordMatch.normalizeArabic(s))   // «ال» تبقى: الكلمتان تُقارَنان بنفس المفتاح
        if k.hasPrefix("سوره ") { k.removeFirst(5) }
        return k.split(separator: " ").map { w -> String in
            let x = String(w); return x.hasPrefix("ل") && x.count > 3 ? String(x.dropFirst()) : x
        }.joined(separator: " ")
    }

    private static func surahMatch(_ text: String, _ index: MushafIndex) -> MushafSurah? {
        let k = surahKey(text)
        guard k.count >= 2 else { return nil }
        if let exact = index.surahs.first(where: { surahKey($0.name) == k }) { return exact }
        guard k.count >= 3 else { return nil }
        let pre = index.surahs.filter { surahKey($0.name).hasPrefix(k) }
        return pre.count == 1 ? pre[0] : nil
    }

    private func scan(_ q: [UInt8], _ hay: [UInt8], _ st: [Int], _ limit: Int) -> [MushafSearchHit] {
        var hits: [MushafSearchHit] = []
        var from = 0
        hay.withUnsafeBufferPointer { h in
            q.withUnsafeBufferPointer { qb in
                while hits.count < limit, from < h.count, let base = h.baseAddress, let qa = qb.baseAddress {
                    guard let r = memmem(base + from, h.count - from, qa, qb.count) else { break }
                    let pos = base.distance(to: r.assumingMemoryBound(to: UInt8.self))
                    var lo = 0, hi = st.count - 1
                    while lo < hi { let mid = (lo + hi + 1) / 2; if st[mid] <= pos { lo = mid } else { hi = mid - 1 } }
                    let e = entries[lo]
                    hits.append(MushafSearchHit(ayah: e.ayah, page: ayahPage[e.ayah] ?? 1, text: e.text))
                    from = lo + 1 < st.count ? st[lo + 1] : h.count
                }
            }
        }
        return hits
    }

    /// المسح الخطي القديم (مرجع للمقارنة في الاختبارات فقط).
    func linearSearch(_ query: String, limit: Int = 50) -> [String] {
        let q = Self.normalize(query)
        guard q.count >= 2 else { return [] }
        return entries.lazy.filter { $0.norm.contains(q) }.prefix(limit).map(\.ayah)
    }
}

/// فهرس الكلمات المتسامح (يُبنى كسولًا عند أول بحث بلا عبارة حرفية). قواعد المطابقة لكل كلمة استعلام، من الأقوى:
/// 0 كلمة مطابقة تمامًا · 1 جذع مطابق (بعد حذف «ال» والسوابق و ف ب ك ل واللواحق هم/ها/كم/نا) ·
/// 2 بداية الكلمة · 3 خطأ إملائي واحد (للكلمات ≥4 أحرف). كل الكلمات مطلوبة بأي ترتيب؛ الترتيب بمجموع الدرجات.
final class TokenIndex: @unchecked Sendable {
    private let source: [(String, String)]
    private let lock = NSLock()
    private var built: [(ayah: String, words: [[[UInt16]]])]?

    init(_ source: [(String, String)]) { self.source = source }

    private static let prefixes: [Character] = ["و", "ف", "ب", "ك", "ل"]
    private static let suffixes = ["هم", "ها", "كم", "نا"]

    /// صور الكلمة: هي نفسها، بلا سابقة، بلا لاحقة، بلا الاثنين؛ كلها بلا ألف (الرسم العثماني يحذفها).
    static func variants(_ w: String) -> [[UInt16]] {
        var pres = [w]
        func strip(_ x: String) -> String? {
            if x.hasPrefix("ال"), x.count > 3 { return String(x.dropFirst(2)) }
            if x.hasPrefix("لل"), x.count > 3 { return String(x.dropFirst(2)) }
            if let f = x.first, prefixes.contains(f), x.count > 3 { return String(x.dropFirst()) }
            return nil
        }
        var cur = w
        while pres.count < 4, let n = strip(cur) { pres.append(n); cur = n }
        var all = pres
        for p in pres { for s in suffixes where p.hasSuffix(s) && p.count - s.count >= 2 { all.append(String(p.dropLast(s.count))) } }
        var seen = Set<String>(), out: [[UInt16]] = []
        for v in all {
            let b = String(v.filter { $0 != "ا" })
            if b.count >= 2, seen.insert(b).inserted { out.append(Array(b.utf16)) }
        }
        return out
    }

    private func index() -> [(ayah: String, words: [[[UInt16]]])] {
        lock.lock(); defer { lock.unlock() }
        if let b = built { return b }
        let b = source.map { (a, n) in (ayah: a, words: n.split(separator: " ").map { Self.variants(String($0)) }) }
        built = b
        return b
    }

    private static func within1(_ a: [UInt16], _ b: [UInt16]) -> Bool {
        if abs(a.count - b.count) > 1 { return false }
        var i = 0, j = 0, edits = 0
        while i < a.count, j < b.count {
            if a[i] == b[j] { i += 1; j += 1; continue }
            edits += 1; if edits > 1 { return false }
            if a.count > b.count { i += 1 } else if a.count < b.count { j += 1 } else {
                if i + 1 < a.count, j + 1 < b.count, a[i + 1] == b[j], a[i] == b[j + 1] { i += 2; j += 2 } else { i += 1; j += 1 }
            }
        }
        return edits + (a.count - i) + (b.count - j) <= 1
    }

    /// أفضل درجة لكلمة استعلام مقابل كلمة آية (nil = لا تطابق).
    private static func grade(_ q: [[UInt16]], _ w: [[UInt16]]) -> Int? {
        guard let q0 = q.first, let w0 = w.first else { return nil }
        if q0 == w0 { return 0 }
        var best: Int?
        func up(_ g: Int) { if best == nil || g < best! { best = g } }
        for qv in q {
            for wv in w {
                if qv == wv { up(1) }
                else if qv.count >= 2, wv.count > qv.count, wv.starts(with: qv) { up(2) }
                else if qv.count >= 4, within1(qv, wv) || (wv.count > qv.count && within1(qv, Array(wv.prefix(qv.count)))) { up(3) }
            }
            if best == 1 { break }
        }
        return best
    }

    func rank(_ tokens: [String], excluding: Set<String>, limit: Int) -> [String] {
        let qs = tokens.map(Self.variants).filter { !$0.isEmpty }
        guard !qs.isEmpty, limit > 0 else { return [] }
        var scored: [(Int, Int, String)] = []
        for (pos, e) in index().enumerated() where !excluding.contains(e.ayah) {
            var total = 0, ok = true
            for q in qs {
                var best: Int?
                for w in e.words { if let g = Self.grade(q, w), best == nil || g < best! { best = g; if g == 0 { break } } }
                guard let b = best else { ok = false; break }
                total += b
            }
            if ok { scored.append((total, pos, e.ayah)) }
        }
        scored.sort { $0.0 != $1.0 ? $0.0 < $1.0 : $0.1 < $1.1 }
        return scored.prefix(limit).map(\.2)
    }
}

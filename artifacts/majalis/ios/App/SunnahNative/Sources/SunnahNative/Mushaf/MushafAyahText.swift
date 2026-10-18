import SwiftUI
import Foundation

/// كلمات آية واحدة كما في صفحات المصحف (رموز QPC V2 بحرفها)، مع صفحة كل كلمة لتحديد خطها. قراءة فقط.
struct MushafAyahWord: Equatable, Sendable {
    let page: Int
    let c: String
    let isEnd: Bool
}

enum MushafAyahWords {
    private final class Box { let words: [MushafAyahWord]; init(_ w: [MushafAyahWord]) { words = w } }
    /// حدّ ذاكرة صريح: 256 آية (نحو مئات الكيلوبايت)، تُخلى تلقائيًا عند ضغط الذاكرة.
    private static let cache: NSCache<NSString, Box> = { let c = NSCache<NSString, Box>(); c.countLimit = 256; return c }()

    /// من الكاش فقط (بلا قراءة قرص): يُرسم النص فورًا دون وميض عند إعادة ظهور الخلية.
    static func cached(_ ayah: String) -> [MushafAyahWord]? { cache.object(forKey: ayah as NSString)?.words }

    /// كل كلمات الآية بترتيب القراءة؛ الآية قد تمتد إلى الصفحة التالية فتُجمع منها. nil إن غابت البيانات.
    static func load(ayah: String, repo: MushafRepository) -> [MushafAyahWord]? {
        if let hit = cache.object(forKey: ayah as NSString) { return hit.words }
        guard let start = try? repo.index().ayahPage[ayah] else { return nil }
        var out: [MushafAyahWord] = []
        var p = start
        while p <= Mushaf.pageCount, let page = try? repo.page(p) {
            let found = page.rows.flatMap { $0.w ?? [] }.filter { $0.v == ayah }
            out += found.map { MushafAyahWord(page: p, c: $0.c, isEnd: $0.isAyahEnd) }
            if out.last?.isEnd == true || found.isEmpty { break }
            p += 1
        }
        guard !out.isEmpty else { return nil }
        cache.setObject(Box(out), forKey: ayah as NSString)
        return out
    }

    /// كلمات النص مرتّبة كما في المصحف: يُسقط «۞» (علامة الحزب) و«۩» (السجدة) لأن المصحف يرسمهما زخرفةً لا كلمة،
    /// وبسملة مطلع السورة المدمجة في نص الآية 1 (4 كلمات) إن كان الفرق بالعدد هو هي بالضبط. النص نفسه لا يُعدَّل.
    static func mushafAlignedWords(ayahText: String, wordCount: Int) -> [String] {
        var raw = ayahText.split(whereSeparator: \.isWhitespace).map(String.init).filter { $0 != "\u{06DE}" && $0 != "\u{06E9}" }
        if raw.count == wordCount + 4, raw.prefix(4).map(QuranWordMatch.normalizeQuranWord) == basmalaNormalized { raw.removeFirst(4) }
        var words = raw.map { QuranWordMatch.normalizeQuranWord($0) }
        // «إِلْ يَاسِينَ» (37:130): Tanzil يفصلها كلمتين والمصحف (QPC) كلمة واحدة بجلايفين؛ نضمّهما عند الفرق بالعدد بواحد فقط.
        if words.count == wordCount + 1, let i = words.indices.dropLast().first(where: { (words[$0], words[$0 + 1]) == elYasin }) {
            words.replaceSubrange(i...(i + 1), with: [words[i] + words[i + 1]])
        }
        return words
    }
    private static let elYasin = (QuranWordMatch.normalizeQuranWord("إِلْ"), QuranWordMatch.normalizeQuranWord("يَاسِينَ"))
    private static let basmalaNormalized = "بسم الله الرحمن الرحيم".split(separator: " ").map { QuranWordMatch.normalizeQuranWord(String($0)) }

    /// فهارس (من 0، دون رمز نهاية الآية) كلمات المصحف المطابقة لاستعلام البحث، بتطبيع بحث التطبيق نفسه
    /// (يتجاهل التشكيل وأشكال الهمزة والألف). nil إن اختلف عدد كلمات النص عن عدد كلمات المصحف: لا إبراز ولا قطع للنص.
    static func matchingWords(query: String, ayahText: String, wordCount: Int) -> Set<Int>? {
        let words = mushafAlignedWords(ayahText: ayahText, wordCount: wordCount)
        guard words.count == wordCount else { return nil }
        let tokens = query.split(whereSeparator: \.isWhitespace).map { QuranWordMatch.normalizeQuranWord(String($0)) }.filter { !$0.isEmpty }
        guard !tokens.isEmpty else { return [] }
        return Set(words.indices.filter { i in tokens.contains { !words[i].isEmpty && words[i].contains($0) } })
    }
}

/// آية بخط المصحف ورسمه (QPC) لكل شاشة غير صفحة المصحف: نتائج البحث، العلامات، آية اليوم، التفسير.
/// نفس خط الصفحة ونفس قرص نهاية الآية ولون الحبر وورق المصحف، فاتحًا وداكنًا، RTL، وتكبير الخط. للقراءة فقط؛ النص حرفيًا بلا أي تعديل.
/// `highlightWords`: فهارس كلمات المصحف (دون رمز النهاية) تُظلَّل بخلفية المصحف الخضراء الخفيفة.
/// الآية الطويلة (> `collapseAbove` كلمة) تُقصّ عند حدّ كلمة حول أول كلمة مُبرَزة مع زر «المزيد».
public struct MushafAyahText: View {
    let ayah: String
    let repo: MushafRepository
    let size: CGFloat
    let highlightWords: Set<Int>
    let collapseAbove: Int
    let paper: Bool
    let plainText: String?

    @State private var words: [MushafAyahWord]?
    @State private var expanded = false
    @ScaledMetric private var scale: CGFloat = 1

    public init(ayah: String, repo: MushafRepository, size: CGFloat = 24, highlightWords: Set<Int> = [], collapseAbove: Int = 24, paper: Bool = true, plainText: String? = nil) {
        self.ayah = ayah; self.repo = repo; self.size = size; self.highlightWords = highlightWords
        self.collapseAbove = collapseAbove; self.paper = paper; self.plainText = plainText
        _words = State(initialValue: MushafAyahWords.cached(ayah))
    }

    private var fontSize: CGFloat { size * scale }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let words {
                let range = visibleRange(words)
                MushafWordFlow(spacing: fontSize * MushafMetrics.naturalGapEm, lineSpacing: fontSize * 0.55) {
                    if range.lowerBound > 0 { Text("…").font(.system(size: fontSize * 0.6)).foregroundStyle(Sunnah.Colors.mushafAccent) }
                    ForEach(Array(range), id: \.self) { i in wordView(words[i], index: i, words: words) }
                    if range.upperBound < words.count { Text("…").font(.system(size: fontSize * 0.6)).foregroundStyle(Sunnah.Colors.mushafAccent) }
                }
                if words.filter({ !$0.isEnd }).count > collapseAbove {
                    Button(expanded ? "أقل" : "المزيد") { withAnimation(.easeInOut(duration: 0.2)) { expanded.toggle() } }
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.mushafAccent)
                        .accessibilityIdentifier("mushaf.ayahText.more")
                }
            } else {
                Color.clear.frame(height: fontSize * 1.6)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(paper ? 12 : 0)
        .background { if paper { RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Sunnah.Colors.mushafPaper) } }
        .environment(\.layoutDirection, .rightToLeft)
        .task(id: ayah) { await load() }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(plainText ?? "آية \(ayah.arabicDigits)"))
        .accessibilityIdentifier("mushaf.ayahText")
    }

    private func load() async {
        let repo = repo, ayah = ayah
        let loaded = await Task.detached(priority: .userInitiated) { () -> [MushafAyahWord]? in
            guard let w = MushafAyahWords.load(ayah: ayah, repo: repo) else { return nil }
            for p in Set(w.map(\.page)) { _ = try? repo.ensureFont(page: p) }   // تسجيل كسول لخط كل صفحة تظهر آيتها
            return w
        }.value
        words = loaded
    }

    /// النطاق الظاهر: كل الكلمات، أو نافذة حول أول كلمة مُبرَزة عند الطي (تنتهي بحدّ كلمة).
    private func visibleRange(_ all: [MushafAyahWord]) -> Range<Int> {
        let textCount = all.filter { !$0.isEnd }.count
        guard !expanded, textCount > collapseAbove else { return 0..<all.count }
        let anchor = highlightWords.min() ?? 0
        let lo = max(0, min(anchor - collapseAbove / 3, textCount - collapseAbove))
        let hi = min(textCount, lo + collapseAbove)
        return lo..<(hi == textCount ? all.count : hi)
    }

    @ViewBuilder
    private func wordView(_ w: MushafAyahWord, index i: Int, words: [MushafAyahWord]) -> some View {
        let lit = !w.isEnd && highlightWords.contains(i)
        Group {
            if w.isEnd { MushafEndMark(glyph: w.c, family: Mushaf.fontFamily(page: w.page), fontSize: fontSize) }
            else { Text(w.c).lineLimit(1).fixedSize().font(.custom(Mushaf.fontFamily(page: w.page), fixedSize: fontSize)).foregroundStyle(Sunnah.Colors.mushafInk) }
        }
            .padding(.horizontal, w.isEnd ? fontSize * 0.1 : 0)
            .padding(.vertical, 1)
            .background(lit ? Sunnah.Colors.primarySoft : .clear, in: RoundedRectangle(cornerRadius: fontSize * 0.2, style: .continuous))
    }
}

/// تدفّق كلمات يلتفّ على أسطر من اليمين لليسار (RTL) ويطبّق التباعد الطبيعي للمصحف.
struct MushafWordFlow: Layout {
    var spacing: CGFloat
    var lineSpacing: CGFloat

    private func rows(_ subviews: Subviews, maxWidth: CGFloat) -> [[(i: Int, size: CGSize)]] {
        var rows: [[(Int, CGSize)]] = [[]], x: CGFloat = 0
        for (i, s) in subviews.enumerated() {
            let sz = s.sizeThatFits(.unspecified)
            if x > 0, x + sz.width > maxWidth { rows.append([]); x = 0 }
            rows[rows.count - 1].append((i, sz)); x += sz.width + spacing
        }
        return rows.map { $0.map { (i: $0.0, size: $0.1) } }
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let w = proposal.width ?? .infinity
        let rs = rows(subviews, maxWidth: w)
        let h = rs.map { $0.map(\.size.height).max() ?? 0 }.reduce(0, +) + lineSpacing * CGFloat(max(0, rs.count - 1))
        let used = rs.map { r in r.map(\.size.width).reduce(0, +) + spacing * CGFloat(max(0, r.count - 1)) }.max() ?? 0
        return CGSize(width: proposal.width ?? used, height: h)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for r in rows(subviews, maxWidth: bounds.width) {
            let rh = r.map(\.size.height).max() ?? 0
            // SwiftUI يعكس إحداثيات التخطيط أفقيًا في بيئة RTL: نضع من minX تصاعديًا فيبدأ السطر من اليمين بترتيب القراءة.
            // (الوضع من maxX كان يعكس الترتيب: أول كلمة تظهر في أقصى اليسار.)
            var x = bounds.minX
            for (i, sz) in r {
                subviews[i].place(at: CGPoint(x: x, y: y + (rh - sz.height) / 2), anchor: .topLeading, proposal: ProposedViewSize(sz))
                x += sz.width + spacing
            }
            y += rh + lineSpacing
        }
    }
}

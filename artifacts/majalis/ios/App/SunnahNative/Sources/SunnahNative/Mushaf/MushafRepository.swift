import Foundation
import CoreText

public enum MushafError: Error, Equatable { case missing(String), fontRegistration(Int) }

/// يقرأ بيانات المصحف المحزومة (`Data/mushaf`: صفحات JSON + فهرس + خطوط QPC V2 بصيغة TTF) ويسجّل خط كل صفحة عند الطلب.
/// لا شبكة ولا ويب: النص حرفيًا من بيانات الإصدار المنشور.
public final class MushafRepository: @unchecked Sendable {
    private let root: URL
    private let lock = NSLock()
    private var pages: [Int: MushafPage] = [:]
    private var pageOrder: [Int] = []
    private var layouts: [LayoutKey: MushafMetrics.Layout] = [:]
    private var layoutOrder: [LayoutKey] = []
    private var inflight: Set<Int> = []
    private let prefetchQueue = DispatchQueue(label: "mushaf.prefetch", qos: .utility)
    static let pageCacheLimit = 24, layoutCacheLimit = 24
    var cachedPageCount: Int { lock.lock(); defer { lock.unlock() }; return pages.count }
    private struct LayoutKey: Hashable { let page: Int, w: Int, h: Int }
    private var fonts: Set<Int> = []
    private var surahNameFontReady = false
    private var cachedIndex: MushafIndex?

    public init(root: URL) { self.root = root }

    public convenience init?(bundle: Bundle = .main) {
        guard let url = bundle.url(forResource: "mushaf", withExtension: nil, subdirectory: "Data") else { return nil }
        self.init(root: url)
    }

    public func index() throws -> MushafIndex {
        lock.lock(); defer { lock.unlock() }
        if let cachedIndex { return cachedIndex }
        let idx = try JSONDecoder().decode(MushafIndex.self, from: read("index.json"))
        cachedIndex = idx
        return idx
    }

    public func page(_ n: Int) throws -> MushafPage {
        let n = Mushaf.clamp(n)
        lock.lock(); defer { lock.unlock() }
        if let hit = pages[n] { return hit }
        let p = try JSONDecoder().decode(MushafPage.self, from: read(String(format: "pages/%03d.json", n)))
        pages[n] = p; pageOrder.append(n)
        if pageOrder.count > Self.pageCacheLimit { pages[pageOrder.removeFirst()] = nil }
        return p
    }

    /// توزيع الصفحة (أسطر + حجم الخط + الفراغات) من ذاكرة LRU؛ الحساب بـCore Text مرة واحدة لكل مقاس.
    /// نفس المعادلات التي كانت داخل العرض حرفيًا، فلا يتغيّر ناتج الرسم.
    func pageLayout(_ page: MushafPage, family: String, size: CGSize) -> (m: (rowHeight: Double, top: Double, rows: [MushafRow]), layout: MushafMetrics.Layout, width: CGFloat, inset: CGFloat) {
        let inset = size.width * 0.03, width = size.width - inset * 2
        let m = MushafPageLayout.metrics(for: page, height: size.height)
        let key = LayoutKey(page: page.page, w: Int((size.width * 10).rounded()), h: Int((size.height * 10).rounded()))
        lock.lock(); let hit = layouts[key]; lock.unlock()
        if let hit { return (m, hit, width, inset) }
        let l = MushafMetrics.layout(rows: m.rows, family: family, width: width, maxFont: CGFloat(m.rowHeight) * 0.8)
        lock.lock()
        if layouts[key] == nil { layoutOrder.append(key); layouts[key] = l }
        if layoutOrder.count > Self.layoutCacheLimit { layouts[layoutOrder.removeFirst()] = nil }
        lock.unlock()
        return (m, l, width, inset)
    }

    /// تحميل مسبق في الخلفية للصفحات المجاورة (خط + JSON + تخطيط) فلا يعمل الخيط الرئيسي عند التقليب.
    public func prefetch(around n: Int, radius: Int = 2, size: CGSize) {
        let targets = (-radius...radius).map { Mushaf.clamp(n + $0) }.reduce(into: [Int]()) { if !$0.contains($1) { $0.append($1) } }
        for t in targets {
            lock.lock(); let busy = !inflight.insert(t).inserted; lock.unlock()
            if busy { continue }
            prefetchQueue.async { [self] in
                defer { lock.lock(); inflight.remove(t); lock.unlock() }
                guard let family = try? ensureFont(page: t), let page = try? page(t) else { return }
                _ = pageLayout(page, family: family, size: size)
            }
        }
    }

    /// يسجّل خط الصفحة في العملية (مرة واحدة) ويُرجع اسم عائلته.
    @discardableResult
    public func ensureFont(page n: Int) throws -> String {
        let n = Mushaf.clamp(n)
        lock.lock(); defer { lock.unlock() }
        if fonts.contains(n) { return Mushaf.fontFamily(page: n) }
        let url = root.appendingPathComponent("fonts/p\(n).ttf")
        guard FileManager.default.fileExists(atPath: url.path) else { throw MushafError.missing("fonts/p\(n).ttf") }
        var err: Unmanaged<CFError>?
        if !CTFontManagerRegisterFontsForURL(url as CFURL, .process, &err) {
            // تسجيل سابق لنفس الملف ليس خطأ
            let code = err.map { CFErrorGetCode($0.takeRetainedValue()) } ?? -1
            if code != 105 { throw MushafError.fontRegistration(code) }
        }
        fonts.insert(n)
        return Mushaf.fontFamily(page: n)
    }

    /// يسجّل خط أسماء السور مرة واحدة (من الحزمة كخطوط الصفحات) ويعيد اسم العائلة.
    public func ensureSurahNameFont() throws -> String {
        lock.lock(); defer { lock.unlock() }
        if surahNameFontReady { return Mushaf.surahNameFontFamily }
        let url = root.appendingPathComponent("fonts/sura_names.ttf")
        guard FileManager.default.fileExists(atPath: url.path) else { throw MushafError.missing("fonts/sura_names.ttf") }
        var err: Unmanaged<CFError>?
        if !CTFontManagerRegisterFontsForURL(url as CFURL, .process, &err) {
            let code = err.map { CFErrorGetCode($0.takeRetainedValue()) } ?? -1
            if code != 105 { throw MushafError.fontRegistration(code) }
        }
        surahNameFontReady = true
        return Mushaf.surahNameFontFamily
    }

    private func read(_ rel: String) throws -> Data {
        let url = root.appendingPathComponent(rel)
        guard let d = try? Data(contentsOf: url) else { throw MushafError.missing(rel) }
        return d
    }
}

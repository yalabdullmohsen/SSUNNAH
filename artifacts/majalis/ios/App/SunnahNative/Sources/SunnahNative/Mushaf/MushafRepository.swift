import Foundation
import CoreText

public enum MushafError: Error, Equatable { case missing(String), fontRegistration(Int) }

/// يقرأ بيانات المصحف المحزومة (`Data/mushaf`: صفحات JSON + فهرس + خطوط QPC V2 بصيغة TTF) ويسجّل خط كل صفحة عند الطلب.
/// لا شبكة ولا ويب: النص حرفيًا من بيانات الإصدار المنشور.
public final class MushafRepository: @unchecked Sendable {
    private let root: URL
    private let lock = NSLock()
    private var pages: [Int: MushafPage] = [:]
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
        if pages.count > 12 { pages.removeAll() }
        pages[n] = p
        return p
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

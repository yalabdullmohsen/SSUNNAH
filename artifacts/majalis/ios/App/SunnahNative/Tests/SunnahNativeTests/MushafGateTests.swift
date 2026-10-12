import XCTest
import CoreText
#if canImport(CryptoKit)
import CryptoKit
#endif
@testable import SunnahNative

/// بوابة المحتوى المحمي للمصحف: تقارن ما يعرضه الكود وما يُحزَّم بالمصدر الأصلي في المستودع، وتفشل عند أي فرق.
/// البيئة: `MUSHAF_DATA=<out>/mushaf` (مخرج سكربت التصدير) و`MUSHAF_SRC=<artifacts/majalis>` (جذر المصدر).
/// دون المتغيّرين تُتخطّى (وCI/ن4 يجب أن يضبطاهما: الاختبار المتخطّى ليس بوابة ناجحة).
final class MushafGateTests: XCTestCase {
    private struct Env { let data: URL; let out: URL; let src: URL }

    private func env() throws -> Env {
        let e = ProcessInfo.processInfo.environment
        guard let d = e["MUSHAF_DATA"], let s = e["MUSHAF_SRC"] else { throw XCTSkip("MUSHAF_DATA/MUSHAF_SRC غير محددين") }
        let data = URL(fileURLWithPath: d)
        return Env(data: data, out: data.deletingLastPathComponent(), src: URL(fileURLWithPath: s))
    }

    private func pad(_ n: Int) -> String { String(format: "%03d", n) }
    private func json(_ url: URL) throws -> Any { try JSONSerialization.jsonObject(with: Data(contentsOf: url)) }

    private struct SrcWord: Equatable { let line: Int; let code: String; let key: String; let end: Bool; let id: Int }

    private func sourceWords(_ env: Env, page: Int) throws -> [SrcWord] {
        let verses = try json(env.src.appendingPathComponent("public/data/quran-v2/pages/page-\(pad(page)).json")) as! [[String: Any]]
        var out: [SrcWord] = []
        for v in verses {
            let words = v["words"] as! [[String: Any]]
            // 2:181 بلا كلمة end في المصدر: آخر كلمة فيها هي رمز العلامة فتُعلَّم كغيرها (الرمز والنص دون مساس)
            let noEnd = !words.contains { ($0["char_type_name"] as? String) == "end" }
            for (i, w) in words.enumerated() {
                out.append(SrcWord(line: w["line_number"] as! Int, code: w["code_v2"] as! String, key: v["verse_key"] as! String,
                                   end: (w["char_type_name"] as? String) == "end" || (noEnd && i == words.count - 1), id: w["id"] as! Int))
            }
        }
        return out
    }

    func testChaptersAndAyahCounts() throws {
        let env = try env(), idx = try MushafRepository(root: env.data).index()
        let ch = try json(env.src.appendingPathComponent("public/data/quran-v2/chapters.json")) as! [[String: Any]]
        XCTAssertEqual(ch.count, 114); XCTAssertEqual(idx.surahs.count, 114)
        XCTAssertEqual(ch.reduce(0) { $0 + ($1["verses_count"] as! Int) }, 6236)
        XCTAssertEqual(idx.ayahPage.count, 6236)
        for (c, s) in zip(ch, idx.surahs) {
            XCTAssertEqual(s.id, c["id"] as? Int)
            XCTAssertEqual(s.name, c["name_arabic"] as? String)
            XCTAssertEqual(s.ayahs, c["verses_count"] as? Int)
            XCTAssertEqual([s.firstPage, s.lastPage], c["pages"] as? [Int])
            for a in 1...s.ayahs { XCTAssertNotNil(idx.ayahPage["\(s.id):\(a)"], "آية ناقصة \(s.id):\(a)") }
        }
    }

    /// عدد الكلمات والترتيب وline_number وcode_v2 ومفتاح الآية وعلامة النهاية — لكل كلمة في كل صفحة.
    func testEveryPageMatchesSourceWordForWord() throws {
        let env = try env(), repo = MushafRepository(root: env.data), idx = try repo.index()
        var totalWords = 0, ends = Set<String>(), keys = Set<String>()
        for p in 1...Mushaf.pageCount {
            let raw = try sourceWords(env, page: p)  // ترتيب المصدر الأصلي (ترتيب القراءة)
            let src = raw.enumerated().sorted { ($0.element.line, $0.offset) < ($1.element.line, $1.offset) }.map(\.element)
            let page = try repo.page(p)
            XCTAssertEqual(page.page, p)
            XCTAssertEqual(page.opening, p <= 2)
            var got: [(line: Int, w: MushafWord)] = []
            var lastLine = 0
            for r in page.rows where r.k == "l" {
                let n = r.n!
                XCTAssertGreaterThan(n, lastLine, "ترتيب الأسطر صفحة \(p)"); lastLine = n
                XCTAssertTrue((1...15).contains(n), "رقم سطر خارج 1…15 صفحة \(p)")
                got += (r.w ?? []).map { (n, $0) }
            }
            XCTAssertEqual(got.count, src.count, "عدد الكلمات صفحة \(p)")
            for (g, s) in zip(got, src) {
                if g.line != s.line || g.w.c != s.code || g.w.v != s.key || g.w.isAyahEnd != s.end {
                    XCTFail("فرق صفحة \(p): مصدر \(s.line)/\(s.key)/\(s.code.unicodeScalars.map { String($0.value, radix: 16) }) مقابل \(g.line)/\(g.w.v)/\(g.w.c.unicodeScalars.map { String($0.value, radix: 16) })")
                    break
                }
            }
            // شبكة الصفحة: 15 صفًّا للصفحات العادية (الصفحتان 1–2 مركزتان بلا فراغات)
            // داخل كل سطر: ترتيب المصدر = ترتيب المعرّفات (فلا يُغيّر العرضُ ترتيبَ القراءة)
            for (_, ws) in Dictionary(grouping: raw, by: \.line) { XCTAssertEqual(ws.map(\.id), ws.map(\.id).sorted(), "ترتيب المعرّفات في سطر صفحة \(p)") }
            totalWords += got.count
            for g in got { keys.insert(g.w.v); if g.w.isAyahEnd { ends.insert(g.w.v) } }
            for (k, pg) in idx.ayahPage where pg == p { XCTAssertTrue(got.contains { $0.w.v == k }, "آية \(k) لا تظهر في صفحتها \(p)") }
        }
        XCTAssertEqual(keys.count, 6236)
        XCTAssertEqual(Set(idx.ayahPage.keys).subtracting(ends), [], "كل آية لها علامة نهاية (ومنها 2:181)")
        XCTAssertGreaterThan(totalWords, 80_000)
    }

    /// كل ملفات المصحف المُحزَّمة مطابقة بـsha256 للـMANIFEST، والمصادر في المستودع مطابقة لما سُجّل منها.
    func testShaOfBundledAndSourceFiles() throws {
        #if canImport(CryptoKit)
        let env = try env()
        func sha(_ u: URL) throws -> String { SHA256.hash(data: try Data(contentsOf: u)).map { String(format: "%02x", $0) }.joined() }
        let m = try json(env.out.appendingPathComponent("MANIFEST.json")) as! [String: Any]
        let files = (m["files"] as! [[String: Any]]).filter { ($0["path"] as! String).hasPrefix("mushaf/") }
        XCTAssertEqual(files.count, 604 + 604 + 1, "عدد ملفات المصحف في MANIFEST")
        for f in files {
            let rel = f["path"] as! String
            XCTAssertEqual(try sha(env.out.appendingPathComponent(rel)), f["sha256"] as? String, "sha256 \(rel)")
        }
        let srcs = m["mushafSources"] as! [String: String]
        XCTAssertEqual(srcs.count, 604 * 2 + 1)
        for (rel, h) in srcs { XCTAssertEqual(try sha(env.src.appendingPathComponent(rel)), h, "المصدر تغيّر: \(rel)") }
        #else
        throw XCTSkip("CryptoKit غير متاح")
        #endif
    }

    /// كل رمز في كل صفحة له جلايف حقيقي في خط تلك الصفحة (التسجيل عبر Core Text كما في التطبيق).
    func testEveryGlyphResolvesInPageFont() throws {
        let env = try env(), repo = MushafRepository(root: env.data)
        for p in 1...Mushaf.pageCount {
            let family = try repo.ensureFont(page: p)
            XCTAssertEqual(family, Mushaf.fontFamily(page: p))
            let font = CTFontCreateWithName(family as CFString, 40, nil)
            XCTAssertEqual(CTFontCopyFamilyName(font) as String, family, "الخط لم يُسجَّل صفحة \(p)")
            for r in try repo.page(p).rows where r.k == "l" {
                for w in r.w ?? [] {
                    let u = Array(w.c.utf16).filter { $0 != 0x20 }  // بعض الكلمات في المصدر تحمل مسافة فاصلة؛ ليست جلايفًا
                    var g = [CGGlyph](repeating: 0, count: u.count)
                    XCTAssertTrue(CTFontGetGlyphsForCharacters(font, u, &g, u.count) && !g.contains(0), "جلايف مفقود صفحة \(p)")
                }
            }
        }
    }
}

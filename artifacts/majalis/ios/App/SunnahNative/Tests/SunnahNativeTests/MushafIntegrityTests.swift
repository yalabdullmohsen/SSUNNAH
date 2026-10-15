import XCTest
import CryptoKit
@testable import SunnahNative

/// حارس سلامة القرآن الكامل (ن3): 604 صفحة، 6236 آية، أسطر كل صفحة، تسلسل الآيات بلا فجوة، حدود السور/الأجزاء/الأحزاب بحسب QPC،
/// وبصمة SHA-256 لنص كل صفحة (رمز الخط + النص) مقابل `Fixtures/MushafIntegrity/reference.json`.
/// يقرأ المصدر المُلتزَم `artifacts/majalis/public/data/quran-v2` فقط (يُكتشف من موضع الملف، أو `MUSHAF_SRC`)؛ لا بيانات مُصدَّرة ولا متغيّرات بيئة،
/// وغياب المصدر يُفشل الاختبار ولا يتخطّاه. يعمل على `swift test` و`xcodebuild test`.
/// قاعدة المراجع البصرية: لا يُعاد توليد reference.json (scripts/mushaf-integrity-record.py) في PR إلا ومعه صورتا قبل/بعد وسبب التغيير في الوصف وموافقة ن1.
final class MushafIntegrityTests: XCTestCase {
    private struct Word { let key: String; let pos: Int; let line: Int; let type: String; let code: String; let text: String }
    private struct Verse { let key: String; let juz: Int; let rub: Int; let words: [Word] }

    private lazy var sourceRoot: URL = {
        if let s = ProcessInfo.processInfo.environment["MUSHAF_SRC"] {
            return URL(fileURLWithPath: s).appendingPathComponent("public/data/quran-v2")
        }
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        for _ in 0..<10 {
            let c = dir.appendingPathComponent("public/data/quran-v2")
            if FileManager.default.fileExists(atPath: c.path) { return c }
            let d = dir.appendingPathComponent("artifacts/majalis/public/data/quran-v2")
            if FileManager.default.fileExists(atPath: d.path) { return d }
            dir.deleteLastPathComponent()
        }
        return URL(fileURLWithPath: "/nonexistent/quran-v2")
    }()

    private func jsonObject(_ url: URL) throws -> Any {
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path), "مصدر QPC غائب: \(url.path)")
        return try JSONSerialization.jsonObject(with: Data(contentsOf: url))
    }

    private func verses(page n: Int) throws -> [Verse] {
        let arr = try jsonObject(sourceRoot.appendingPathComponent(String(format: "pages/page-%03d.json", n))) as! [[String: Any]]
        return arr.map { v in
            let key = v["verse_key"] as! String
            let ws = (v["words"] as! [[String: Any]]).map {
                Word(key: key, pos: $0["position"] as! Int, line: $0["line_number"] as! Int, type: $0["char_type_name"] as! String,
                     code: $0["code_v2"] as! String, text: $0["text_qpc_hafs"] as! String)
            }
            return Verse(key: key, juz: v["juz_number"] as! Int, rub: v["rub_el_hizb_number"] as! Int, words: ws)
        }
    }

    private static func hex(_ s: String) -> String { s.unicodeScalars.map { String($0.value, radix: 16) }.joined(separator: "-") }

    /// الصيغة القانونية للصفحة؛ تطابق scripts/mushaf-integrity-record.py حرفيًا.
    private static func canonical(_ vs: [Verse]) -> String {
        vs.flatMap { v in v.words.map { "\($0.key)|\($0.pos)|\($0.line)|\($0.type)|\(hex($0.code))|\(hex($0.text))" } }.joined(separator: "\n")
    }

    private static func sha(_ s: String) -> String { SHA256.hash(data: Data(s.utf8)).map { String(format: "%02x", $0) }.joined() }

    private struct PageRef: Decodable { let lines: Int; let words: Int; let ayahs: Int; let sha256: String }
    private struct Ref: Decodable {
        let totalAyahs: Int; let pages: [String: PageRef]; let juzStarts: [String: [JuzStart]]; let rubStarts: [String]; let chapters: [[Int]]
        enum JuzStart: Decodable { case i(Int), s(String)
            init(from d: Decoder) throws { let c = try d.singleValueContainer(); if let i = try? c.decode(Int.self) { self = .i(i) } else { self = .s(try c.decode(String.self)) } } }
    }

    private func reference() throws -> Ref {
        let url = Bundle.module.url(forResource: "reference", withExtension: "json", subdirectory: "Fixtures/MushafIntegrity")
            ?? URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("Fixtures/MushafIntegrity/reference.json")
        return try JSONDecoder().decode(Ref.self, from: Data(contentsOf: url))
    }

    func testEveryPageMatchesReferenceFingerprint() throws {
        let ref = try reference()
        XCTAssertEqual(ref.pages.count, 604)
        var ayahs = 0
        for n in 1...604 {
            let vs = try verses(page: n)
            let r = try XCTUnwrap(ref.pages[String(n)], "لا مرجع للصفحة \(n)")
            let words = vs.flatMap(\.words)
            XCTAssertEqual(words.map(\.line).max(), r.lines, "عدد أسطر الصفحة \(n)")
            XCTAssertEqual(words.count, r.words, "عدد كلمات الصفحة \(n)")
            XCTAssertEqual(vs.count, r.ayahs, "عدد آيات الصفحة \(n)")
            XCTAssertEqual(Self.sha(Self.canonical(vs)), r.sha256, "بصمة نص الصفحة \(n) تغيّرت — حذف/إضافة/تبديل حرف")
            ayahs += vs.count
        }
        XCTAssertEqual(ayahs, 6236)
        XCTAssertEqual(ref.totalAyahs, 6236)
    }

    func testAyahNumberingIsGaplessWithinEverySurahAndBoundariesMatchChapters() throws {
        let ref = try reference()
        var seen: [Int: [Int]] = [:]
        var pagesOf: [Int: (Int, Int)] = [:]
        for n in 1...604 {
            for v in try verses(page: n) {
                let p = v.key.split(separator: ":").compactMap { Int($0) }
                seen[p[0], default: []].append(p[1])
                let cur = pagesOf[p[0]] ?? (n, n)
                pagesOf[p[0]] = (min(cur.0, n), max(cur.1, n))
            }
        }
        XCTAssertEqual(seen.count, 114)
        XCTAssertEqual(ref.chapters.count, 114)
        for c in ref.chapters {
            XCTAssertEqual(seen[c[0]], Array(1...c[1]), "ترقيم السورة \(c[0]) فيه فجوة أو تكرار أو اختلال ترتيب")
            XCTAssertEqual(pagesOf[c[0]]?.0, c[2], "أول صفحة للسورة \(c[0])")
            XCTAssertEqual(pagesOf[c[0]]?.1, c[3], "آخر صفحة للسورة \(c[0])")
        }
        XCTAssertEqual(ref.chapters.map { $0[1] }.reduce(0, +), 6236)
        // chapters.json نفسه في المصدر يوافق المرجع
        let src = try jsonObject(sourceRoot.appendingPathComponent("chapters.json")) as! [[String: Any]]
        XCTAssertEqual(src.map { [$0["id"] as! Int, $0["verses_count"] as! Int, ($0["pages"] as! [Int])[0], ($0["pages"] as! [Int])[1]] }, ref.chapters)
    }

    func testJuzAndHizbQuarterBoundariesMatchQPC() throws {
        let ref = try reference()
        var juz: [Int: (Int, String)] = [:], rub: [String] = [], lastJ = 0, lastR = 0
        for n in 1...604 {
            for v in try verses(page: n) {
                if v.juz != lastJ { lastJ = v.juz; juz[lastJ] = (n, v.key) }
                if v.rub != lastR { lastR = v.rub; rub.append(v.key) }
            }
        }
        XCTAssertEqual(juz.count, 30)
        XCTAssertEqual(rub.count, 240)
        XCTAssertEqual(rub, ref.rubStarts)
        for j in 1...30 {
            guard case .i(let page)? = ref.juzStarts[String(j)]?[0], case .s(let key)? = ref.juzStarts[String(j)]?[1] else { return XCTFail("لا مرجع للجزء \(j)") }
            XCTAssertEqual(juz[j]?.0, page, "صفحة بداية الجزء \(j)")
            XCTAssertEqual(juz[j]?.1, key, "آية بداية الجزء \(j)")
        }
        // جدول أرباع الأحزاب المضمّن في التطبيق (Tanzil) يطابق QPC عدا ربع سورة الحجر الموثّق (Tanzil 15:50 مقابل QPC 15:49)
        let app = HizbQuarters.starts.map { "\($0.surah):\($0.ayah)" }
        XCTAssertEqual(app.count, 240)
        let diff = zip(app, rub).enumerated().filter { $0.element.0 != $0.element.1 }
        XCTAssertEqual(diff.count, 1, "فروق أرباع الأحزاب غير المتوقعة: \(diff)")
        XCTAssertEqual(diff.first?.element.0, "15:50", "الجدول المضمّن (Tanzil)")
        XCTAssertEqual(diff.first?.element.1, "15:49", "QPC")
    }

    /// تحصين الحارس نفسه: أي حذف/إضافة/تبديل حرف أو كلمة أو نقل سطر يغيّر البصمة.
    func testFingerprintDetectsAnySingleCharacterOrWordChange() throws {
        for n in [1, 2, 150, 604] {
            let vs = try verses(page: n)
            let base = Self.sha(Self.canonical(vs))
            func mutated(_ f: (inout [Word]) -> Void) -> String {
                var vv = vs
                var w = vv[0].words; f(&w)
                vv[0] = Verse(key: vv[0].key, juz: vv[0].juz, rub: vv[0].rub, words: w)
                return Self.sha(Self.canonical(vv))
            }
            let w0 = vs[0].words[0]
            XCTAssertNotEqual(base, mutated { $0[0] = Word(key: w0.key, pos: w0.pos, line: w0.line, type: w0.type, code: w0.code, text: String(w0.text.dropLast())) }, "حذف حرف من النص")
            XCTAssertNotEqual(base, mutated { $0[0] = Word(key: w0.key, pos: w0.pos, line: w0.line, type: w0.type, code: w0.code, text: w0.text + "\u{0652}") }, "إضافة حرف للنص")
            XCTAssertNotEqual(base, mutated { $0[0] = Word(key: w0.key, pos: w0.pos, line: w0.line, type: w0.type, code: String(w0.code.dropLast()) + "\u{FB50}", text: w0.text) }, "تبديل رمز الخط")
            XCTAssertNotEqual(base, mutated { $0.removeLast() }, "حذف كلمة")
            XCTAssertNotEqual(base, mutated { $0[0] = Word(key: w0.key, pos: w0.pos, line: w0.line + 1, type: w0.type, code: w0.code, text: w0.text) }, "نقل كلمة لسطر آخر")
        }
    }
}

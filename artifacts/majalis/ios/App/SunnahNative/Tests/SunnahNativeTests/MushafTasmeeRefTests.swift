import XCTest
@testable import SunnahNative

/// حارس مُحوِّل كلمات المصحف إلى مرجع التسميع: لكل آية في المصحف (6236) عدد كلمات النص العثماني (بتقسيم المرجع نفسه، بلا علامات الوقف المستقلة)
/// يساوي عدد كلمات الصفحة غير علامات النهاية في مصدر QPC المُلتزَم. أي فرق يعني أن الكلمة ستُلوَّن بغير نصها، فيُفشل الاختبار.
/// المصدر `public/data/quran` و`public/data/quran-v2` (يُكتشفان من موضع الملف، أو `MUSHAF_SRC`)؛ غيابهما يُفشل ولا يتخطّى.
final class MushafTasmeeRefTests: XCTestCase {
    private lazy var dataRoot: URL = {
        if let s = ProcessInfo.processInfo.environment["MUSHAF_SRC"] { return URL(fileURLWithPath: s).appendingPathComponent("public/data") }
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        for _ in 0..<10 {
            for rel in ["public/data", "artifacts/majalis/public/data"] {
                let c = dir.appendingPathComponent(rel)
                if FileManager.default.fileExists(atPath: c.appendingPathComponent("quran-v2").path) { return c }
            }
            dir.deleteLastPathComponent()
        }
        return URL(fileURLWithPath: "/nonexistent/data")
    }()

    func testEveryVerseWordCountMatchesQPCSource() throws {
        var ayahPage: [String: Int] = [:]
        struct F: Decodable { struct A: Decodable { let numberInSurah: Int; let page: Int }; let number: Int; let ayahs: [A] }
        for s in 1...114 {
            let f = try JSONDecoder().decode(F.self, from: Data(contentsOf: dataRoot.appendingPathComponent(String(format: "quran/surah-%03d.json", s))))
            for a in f.ayahs { ayahPage["\(s):\(a.numberInSurah)"] = a.page }
        }
        let search = try MushafSearch(surahDirectory: dataRoot.appendingPathComponent("quran"), ayahPage: ayahPage)
        var counts: [String: Int] = [:]
        for n in 1...604 {
            let arr = try JSONSerialization.jsonObject(with: Data(contentsOf: dataRoot.appendingPathComponent(String(format: "quran-v2/pages/page-%03d.json", n)))) as! [[String: Any]]
            for v in arr {
                let key = v["verse_key"] as! String
                counts[key, default: 0] += (v["words"] as! [[String: Any]]).filter { ($0["char_type_name"] as! String) == "word" }.count
            }
        }
        XCTAssertEqual(counts.count, 6236)
        var bad: [String] = []
        for (k, c) in counts {
            let n = search.ayahText(k).map { MushafTasmeeRef.textWords($0).count }
            if n != c { bad.append("\(k): نص=\(n ?? -1) مصدر=\(c)") }
        }
        // آيتان معروفتان يختلف تقسيم الكلمات فيهما؛ المُحوِّل يتجاوزهما (لا تسميع فيهما) ولا يخمّن.
        let known: Set<String> = ["2:181: نص=13 مصدر=14", "37:130: نص=4 مصدر=3"]
        XCTAssertTrue(Set(bad).isSubset(of: known), "آيات جديدة يختلف عدد كلماتها: \(bad.sorted().prefix(15)) (المجموع \(bad.count))")
    }
}

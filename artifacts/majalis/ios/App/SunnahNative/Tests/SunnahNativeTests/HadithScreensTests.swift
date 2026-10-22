import XCTest
import SwiftUI
@testable import SunnahNative

final class HadithScreensTests: XCTestCase {
    func testDecodesVerifiedSahihShape() throws {
        let json = #"[{"id":"s1","title":"ت","text":"نص","hadith_number":"13","source_name":"البخاري","grade":"صحيح","authenticity_class":"sahih"}]"#
        let items = try JSONDecoder().decode([HadithItem].self, from: Data(json.utf8))
        XCTAssertEqual(items.first?.hadithNumber, "13")
        XCTAssertEqual(items.first?.sourceName, "البخاري")
    }

    func testDecodesCollectionRows() throws {
        let json = #"{"label":"x","hadiths":[{"n":1,"t":"نص","b":1,"h":1}]}"#
        let f = try JSONDecoder().decode(HadithCollectionFile.self, from: Data(json.utf8))
        XCTAssertEqual(f.hadiths.first?.n, 1)
    }

    func testNormalizeStripsDiacriticsAndUnifiesLetters() {
        XCTAssertEqual(ArabicSearch.normalize("إِنَّمَا الأَعْمَالُ"), ArabicSearch.normalize("انما الاعمال"))
    }

    // MARK: فهرس القائمة المسبق الحساب = السلوك السابق حرفيًا

    private func syntheticItems(_ n: Int) -> [HadithItem] {
        let heads = ["إنما الأعمال بالنيات", "(مَنْ) حَسُنَ إسلامُ المرء", "آمنتُ بالله ثم استقم", "ى يا أيها", "بُني الإسلام على خمس", "ة الدين النصيحة", "الحلال بيّن والحرام بيّن"]
        return (0..<n).map { i in HadithItem(id: "h\(i)", title: "", text: "\(heads[i % heads.count]) \(i * 7919 % 1000) وتتمة النص للحديث رقم \(i)") }
    }

    private func legacyRows(_ items: [HadithItem], query: String) -> [HadithItem] {
        func sortKey(_ t: String) -> String { String(ArabicSearch.normalize(t.trimmingCharacters(in: .whitespacesAndNewlines)).drop { !$0.isLetter }) }
        let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
        let f = q.isEmpty ? items : items.filter { ArabicSearch.normalize($0.displayTitle + " " + $0.text).contains(q) }
        return f.sorted { sortKey($0.displayTitle) < sortKey($1.displayTitle) }
    }

    func testListIndexMatchesLegacyOrderKeysAndSearch() {
        let items = syntheticItems(600)
        let index = HadithListIndex(items)
        for query in ["", "  ", "الاعمال", "إِنَّمَا", "رقم 17", "غير موجود"] {
            let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
            XCTAssertEqual(index.rows(matching: q).map(\.item.id), legacyRows(items, query: query).map(\.id), "query=\(query)")
        }
        let legacy = legacyRows(items, query: "")
        let legacyKeys = legacy.map { SunnahJumpIndex<EmptyView>.key(for: $0.displayTitle) }.reduce(into: [String]()) { if !$0.contains($1) { $0.append($1) } }
        XCTAssertEqual(index.keys, legacyKeys)
        var seen = Set<String>(); var ids = Set<String>()
        for r in legacy where seen.insert(SunnahJumpIndex<EmptyView>.key(for: r.displayTitle)).inserted { ids.insert(r.id) }
        XCTAssertEqual(HadithListIndex.firstRowIDs(index.rows(matching: "")), ids)
    }

    /// قياس (لا حدّ صارم): كلفة ما كان يُعاد في كل تقييم body مقابل الفهرس المحسوب مرة واحدة.
    func testListIndexPerfNumbers() {
        let items = syntheticItems(3000)
        func ms(_ f: () -> Void) -> Double { let t = Date(); f(); return Date().timeIntervalSince(t) * 1000 }
        let before = ms { _ = legacyRows(items, query: "الاعمال") }
        var index: HadithListIndex!
        let build = ms { index = HadithListIndex(items) }
        let after = ms { _ = index.rows(matching: ArabicSearch.normalize("الاعمال")) }
        print("PERF hadith-list n=3000 per-body-legacy=\(before)ms build-once=\(build)ms per-body-new=\(after)ms")
        XCTAssertLessThan(after, before)
    }
}

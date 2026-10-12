import XCTest
@testable import SunnahNative

final class ReaderDataTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T { try JSONDecoder().decode(T.self, from: Data(json.utf8)) }

    func testArbaeenOrderedWithAllParts() throws {
        let rows: [ReaderData.Arbaeen] = try decode(#"[{"id":2,"title":"ب","text":"نص٢"},{"id":1,"title":"أ","text":"نص١","explanation":"شرح","benefits":"فائدة","source":"متفق عليه","review_status":"x"}]"#)
        let items = ReaderData.arbaeen(rows)
        XCTAssertEqual(items.map(\.id), ["1", "2"])
        XCTAssertEqual(items[0].body, "نص١\n\nالشرح: شرح\n\nالفوائد: فائدة\n\nالمصدر: متفق عليه")
        XCTAssertEqual(items[1].body, "نص٢")
    }

    func testWasayaGroupsAndEmptyAmal() throws {
        let f: ReaderData.Wasaya = try decode(#"{"kabira":[{"id":1,"title":"ت","text":"ن","source":"م","benefit":"ف","category":"ق"}],"khasisa":[{"name":"لأنس","wasiyya":"و","source":"ص"}],"ummah":[{"title":"ث","text":"ن","ref":"ر"}],"amal":[{"text":"افعل"}]}"#)
        XCTAssertEqual(ReaderData.wasaya(f, group: .kabira).first?.body, "ن\n\nالفائدة: ف\n\nالمصدر: م")
        XCTAssertEqual(ReaderData.wasaya(f, group: .khasisa).first?.title, "لأنس")
        XCTAssertEqual(ReaderData.wasaya(f, group: .ummah).first?.body, "ن\n\nالمصدر: ر")
        XCTAssertEqual(ReaderData.wasaya(f, group: .amal).map(\.title), ["افعل"])
        XCTAssertEqual(ReaderData.WasayaGroup.allCases.count, 4)
    }

    func testDuasFilterByCategory() throws {
        let f: ReaderData.Duas = try decode(#"{"categories":["الكل","السفر"],"duas":[{"id":"a","title":"ا","arabic":"نص","category":"السفر","source":"م"},{"id":"b","title":"ب","arabic":"نص٢","category":"النوم"}]}"#)
        XCTAssertEqual(ReaderData.categories(f), ["الكل", "السفر"])
        XCTAssertEqual(ReaderData.duas(f, category: "الكل").count, 2)
        XCTAssertEqual(ReaderData.duas(f, category: "السفر").map(\.id), ["a"])
        XCTAssertEqual(ReaderData.duas(f, category: "السفر").first?.body, "نص\n\nالمصدر: م")
    }

    /// يتحقق من الملفات المصدَّرة فعلًا حين تكون موجودة (ios-native/Data تُولَّد محليًا).
    func testRealExportedFilesDecode() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("ios-native/Data")
        let arb = root.appendingPathComponent("hadith/arbaeen-nawawi.json")
        try XCTSkipUnless(FileManager.default.fileExists(atPath: arb.path), "بيانات غير مصدَّرة")
        XCTAssertEqual(ReaderData.arbaeen(try JSONDecoder().decode([ReaderData.Arbaeen].self, from: Data(contentsOf: arb))).count, 42)
        let w = try JSONDecoder().decode(ReaderData.Wasaya.self, from: Data(contentsOf: root.appendingPathComponent("hadith/wasaya-nabawiyya.json")))
        XCTAssertEqual([w.kabira.count, w.khasisa.count, w.ummah.count, w.amal.count], [49, 18, 16, 13])
        let d = try JSONDecoder().decode(ReaderData.Duas.self, from: Data(contentsOf: root.appendingPathComponent("adhkar/duas.json")))
        XCTAssertEqual(d.duas.count, 86)
        XCTAssertTrue(ReaderData.duas(d, category: ReaderData.allCategory).allSatisfy { $0.body?.isEmpty == false })
    }
}

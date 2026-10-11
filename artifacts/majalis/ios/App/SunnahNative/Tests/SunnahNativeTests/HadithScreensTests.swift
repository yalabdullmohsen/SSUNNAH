import XCTest
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
}

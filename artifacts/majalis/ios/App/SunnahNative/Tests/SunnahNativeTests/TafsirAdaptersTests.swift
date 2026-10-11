import XCTest
@testable import SunnahNative

final class TafsirAdaptersTests: XCTestCase {
    func testRegistryKeepsOnlyBundledWithAttribution() throws {
        let j = #"{"tafsirs":[{"id":"muyassar","name":"التفسير الميسّر","author":"مجمع الملك فهد","source":{"name":"QUL","url":"u","permission":"p"}},{"id":"ibn-kathir","name":"ابن كثير","author":"ك"}]}"#
        let reg = try JSONDecoder().decode(TafsirRegistry.self, from: Data(j.utf8))
        let av = TafsirAdapters.available(reg)
        XCTAssertEqual(av.map(\.id), ["muyassar"])
        XCTAssertEqual(TafsirAdapters.attribution(av[0]), "التفسير الميسّر — مجمع الملك فهد")
    }

    func testRowsKeepTextUntouchedAndGapsEmpty() throws {
        let q = try JSONDecoder().decode(TafsirQuranFile.self, from: Data(#"{"ayahs":[{"numberInSurah":2,"text":"ب"},{"numberInSurah":1,"text":"\#u{FEFF}أ"}]}"#.utf8))
        let t = try JSONDecoder().decode(TafsirSurahFile.self, from: Data(#"{"surah":1,"ayahs":{"1":"نص التفسير"}}"#.utf8))
        let rows = TafsirAdapters.rows(quran: q, tafsir: t)
        XCTAssertEqual(rows.map(\.number), [1, 2])
        XCTAssertEqual(rows[0].ayah, "أ")
        XCTAssertEqual(rows[0].tafsir, "نص التفسير")
        XCTAssertNil(rows[1].tafsir)
    }
}

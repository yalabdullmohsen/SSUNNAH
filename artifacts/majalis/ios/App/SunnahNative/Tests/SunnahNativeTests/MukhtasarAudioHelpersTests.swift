import XCTest
@testable import SunnahNative

/// مساعدات «المختصر الصوتي» بلا شبكة: ربط ملفات mp3 بالسور، وأسماء الأجزاء، وتجميع السور بالجزء.
final class MukhtasarAudioHelpersTests: XCTestCase {
    func testBundledNamesCoverAll114SurahsInOrder() {
        let n = MukhtasarAudio.bundledNames
        XCTAssertEqual(n.count, 114)
        XCTAssertEqual(Set(n.keys), Set(1...114))
        XCTAssertEqual(n[1], "001 Al-Fatihah الفاتحة.mp3")
        XCTAssertEqual(n[114], "114 An-Nas الناس.mp3")
        for (k, v) in n { XCTAssertTrue(v.hasPrefix(String(format: "%03d ", k)), "اسم لا يطابق رقمه: \(k) → \(v)") }
    }

    func testNamesFromMp3FiltersAndKeepsFirstDuplicate() {
        let m = MukhtasarAudio.names(fromMp3: [
            "000_intro.mp3", "001 a.mp3", "001 b.mp3", "002 B.MP3", "003 c.ogg", "115 x.mp3", "abc.mp3", "1.mp3", "114 n.mp3",
        ])
        XCTAssertEqual(m, [1: "001 a.mp3", 2: "002 B.MP3", 114: "114 n.mp3"])
    }

    func testNamesFromEmptyListIsEmpty() {
        XCTAssertTrue(MukhtasarAudio.names(fromMp3: []).isEmpty)
    }

    func testJuzTitlesAndClamping() {
        XCTAssertEqual(MukhtasarAudio.juzOrdinals.count, 30)
        XCTAssertEqual(MukhtasarAudio.juzTitle(1), "الجزء الأول")
        XCTAssertEqual(MukhtasarAudio.juzTitle(21), "الجزء الحادي والعشرون")
        XCTAssertEqual(MukhtasarAudio.juzTitle(30), "الجزء الثلاثون")
        XCTAssertEqual(MukhtasarAudio.juzTitle(0), "الجزء الأول")
        XCTAssertEqual(MukhtasarAudio.juzTitle(31), "الجزء الثلاثون")
    }

    func testGroupsSortSurahsAndGroupByStartingJuz() throws {
        // مرتّبة عمدًا بغير ترتيبها: الثالثة تبدأ في الجزء الثاني (صفحة 50 ≥ 22).
        let idx = try JSONDecoder().decode(MushafIndex.self, from: Data(#"{"surahs":[{"id":3,"name":"ج","ayahs":200,"firstPage":50,"lastPage":76,"place":"madinah","bismillahPre":true},{"id":1,"name":"أ","ayahs":7,"firstPage":1,"lastPage":1,"place":"makkah","bismillahPre":false},{"id":2,"name":"ب","ayahs":286,"firstPage":2,"lastPage":49,"place":"madinah","bismillahPre":true}],"juzStart":[1,22],"ayahPage":{}}"#.utf8))
        let g = MukhtasarAudio.groups(idx)
        XCTAssertEqual(g.map(\.juz), [1, 2])
        XCTAssertEqual(g.map { $0.surahs.map(\.id) }, [[1, 2], [3]])
    }
}

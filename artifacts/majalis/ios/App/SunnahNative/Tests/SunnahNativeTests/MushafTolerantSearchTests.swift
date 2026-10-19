import XCTest
@testable import SunnahNative

/// قواعد البحث المتسامح في المصحف، واحدة لكل اختبار، على بيانات اصطناعية صغيرة (آية لكل سورة).
final class MushafTolerantSearchTests: XCTestCase {
    private static let texts: [Int: String] = [
        1: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        2: "إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
        3: "وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ",
        4: "فَأَنجَيْنَـٰهُمْ مِّنَ ٱلْعَذَابِ ٱلْمُهِينِ",
        5: "رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا",
        6: "لَهُمْ جَنَّـٰتٌ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ",
        7: "ٱلْمُؤْمِنُونَ ٱلَّذِينَ يُقِيمُونَ ٱلصَّلَوٰةَ",
    ]
    private static var cached: (MushafSearch, MushafIndex)?

    private func make() throws -> (MushafSearch, MushafIndex) {
        if let c = Self.cached { return c }
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("tol-\(UUID())")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        for n in 1...114 {
            let t = Self.texts[n] ?? "كَلِمَةٌ"
            try "{\"number\":\(n),\"ayahs\":[{\"numberInSurah\":1,\"text\":\"\(t)\"},{\"numberInSurah\":2,\"text\":\"كَلِمَةٌ\"}]}"
                .write(to: dir.appendingPathComponent(String(format: "surah-%03d.json", n)), atomically: true, encoding: .utf8)
        }
        let names = ["الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف"]
        let surahs = (1...114).map { n -> String in
            let name = n <= names.count ? names[n - 1] : "سورة\(n)"
            return "{\"id\":\(n),\"name\":\"\(name)\",\"ayahs\":2,\"firstPage\":\(n),\"lastPage\":\(n),\"place\":\"makkah\",\"bismillahPre\":false}"
        }.joined(separator: ",")
        let pages = (1...114).flatMap { ["\"\($0):1\":\($0)", "\"\($0):2\":\($0)"] }.joined(separator: ",")
        let idx = try JSONDecoder().decode(MushafIndex.self, from: Data("{\"surahs\":[\(surahs)],\"juzStart\":[1],\"ayahPage\":{\(pages)}}".utf8))
        let s = try MushafSearch(surahDirectory: dir, ayahPage: idx.ayahPage)
        Self.cached = (s, idx)
        return (s, idx)
    }

    private func ayat(_ q: String) throws -> [String] { try make().0.search(q).map(\.ayah) }

    func testIgnoresTashkeelAndTatweel() throws {
        XCTAssertEqual(try ayat("الْحَمْدُ لِلَّهِ").first, "1:1")
        XCTAssertEqual(try ayat("الحـــمد").first, "1:1")
    }

    func testUnifiesHamzaAlifForms() throws {
        XCTAssertEqual(try ayat("انجيناهم").first, "4:1")
        XCTAssertEqual(try ayat("أنجيناهم").first, "4:1")
        XCTAssertEqual(try ayat("المومنون").first, "7:1")
        XCTAssertEqual(try ayat("المؤمنون").first, "7:1")
        XCTAssertEqual(try ayat("الانهار").first, "6:1")
    }

    func testUnifiesYaAndAlifMaqsuraAndTaMarbuta() throws {
        XCTAssertEqual(try ayat("تجري").first, "6:1")
        XCTAssertEqual(try ayat("تجرى").first, "6:1")
        XCTAssertEqual(try ayat("جنات").first, "6:1")
        XCTAssertEqual(try ayat("الصلاه").first, "7:1")
    }

    func testDaggerAlifIsIgnored() throws {
        XCTAssertEqual(try ayat("الصابرين").first, "2:1")
        XCTAssertEqual(try ayat("الصبرين").first, "2:1")
        XCTAssertEqual(try ayat("العلمين").first, "1:1")
    }

    func testIgnoresAlAndPrefixLetters() throws {
        XCTAssertEqual(try ayat("عذاب").first, "4:1")        // «العذاب» بلا ال
        XCTAssertEqual(try ayat("والعذاب").first, "4:1")     // سابقة و
        XCTAssertEqual(try ayat("بالصابرين").first, "2:1")   // سابقة بال
        XCTAssertEqual(try ayat("كالمهين").first, "4:1")     // سابقة ك
        XCTAssertEqual(try ayat("صابرين").first, "2:1")
    }

    func testIgnoresCommonSuffixes() throws {
        XCTAssertEqual(try ayat("انجيناه").first, "4:1")     // «أنجيناهم» ← ـهم
        XCTAssertEqual(try ayat("ذنوب").first, "5:1")        // «ذنوبنا» ← ـنا
        XCTAssertEqual(try ayat("تحت").first, "6:1")         // «تحتها» ← ـها
        XCTAssertEqual(try ayat("ذنوبكم").first, "5:1")      // لاحقة في الاستعلام
    }

    func testPrefixMatchOfWordStart() throws {
        XCTAssertEqual(try ayat("الصاب").first, "2:1")
        XCTAssertEqual(try ayat("مهي").first, "4:1")
    }

    func testOneTypoForFourPlusLetters() throws {
        XCTAssertEqual(try ayat("الصابرون").first, "2:1")    // ون ≠ ين
        XCTAssertEqual(try ayat("العزاب").first, "4:1")      // ز بدل ذ
        XCTAssertEqual(try ayat("المهنين").first, "4:1")     // حذف حرف
    }

    func testNoTypoToleranceForShortWords() throws {
        XCTAssertTrue(try ayat("بمع").isEmpty)               // 3 أحرف، لا مطابقة بخطأ
        XCTAssertTrue(try ayat("قخ").isEmpty)
    }

    func testMultipleWordsInAnyOrder() throws {
        XCTAssertEqual(try ayat("المهين العذاب").first, "4:1")
        XCTAssertEqual(try ayat("الصابرين الله").first, "2:1")
        XCTAssertTrue(try ayat("الصابرين العذاب").isEmpty)   // كلمتان في آيتين مختلفتين
    }

    func testExactPhraseRanksFirst() throws {
        // «ذنوبنا» عبارة حرفية في 5:1 فتسبق نتائج الجذع/البداية.
        let r = try ayat("ذنوبنا")
        XCTAssertEqual(r.first, "5:1")
        let hits = try make().0.search("العذاب المهين")
        XCTAssertEqual(hits.first?.ayah, "4:1")
    }

    func testJumpAyahByNumbers() throws {
        let idx = try make().1
        XCTAssertEqual(MushafSearch.jump("2:1", index: idx), MushafJump(page: 2, ayah: "2:1", title: "البقرة 1"))
        XCTAssertEqual(MushafSearch.jump("٢:٢", index: idx)?.ayah, "2:2")
        XCTAssertNil(MushafSearch.jump("2:9", index: idx))
        XCTAssertNil(MushafSearch.jump("200:1", index: idx))
    }

    func testJumpSurahNameAndAyah() throws {
        let idx = try make().1
        XCTAssertEqual(MushafSearch.jump("البقرة 2", index: idx)?.ayah, "2:2")
        XCTAssertEqual(MushafSearch.jump("سورة البقرة", index: idx), MushafJump(page: 2, ayah: nil, title: "البقرة"))
        XCTAssertEqual(MushafSearch.jump("بقره", index: idx)?.page, 2)        // ة/ه
        XCTAssertEqual(MushafSearch.jump("ال عمران", index: idx)?.page, 3)
        XCTAssertEqual(MushafSearch.jump("الفاتحه", index: idx)?.page, 1)
        XCTAssertNil(MushafSearch.jump("ذنوبنا", index: idx))
    }
}

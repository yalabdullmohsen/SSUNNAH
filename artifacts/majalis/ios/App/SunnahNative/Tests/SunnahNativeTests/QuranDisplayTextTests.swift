import XCTest
@testable import SunnahNative

/// قاعدة نص Tanzil المعروض: لا «۞»/«۩» ولا بسملة في أول آية 1 (عدا 1:1 فهي بسملة) في أي من السور الـ114. يحتاج `MUSHAF_DATA`.
final class QuranDisplayTextTests: XCTestCase {
    func testRuleOnSamples() {
        XCTAssertEqual(QuranDisplayText.clean("۞ إِنَّ ٱللَّهَ", surah: 2, ayah: 26), "إِنَّ ٱللَّهَ")
        XCTAssertEqual(QuranDisplayText.clean("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ", surah: 2, ayah: 1), "الٓمٓ")
        XCTAssertEqual(QuranDisplayText.clean("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", surah: 1, ayah: 1), "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "1:1 هي البسملة")
        XCTAssertEqual(QuranDisplayText.clean("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ", surah: 2, ayah: 5), "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ", "الآية غير الأولى لا تُمَسّ")
    }

    func testNoDecorationOrBasmalaInAnySurah() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let dir = URL(fileURLWithPath: dp).deletingLastPathComponent().appendingPathComponent("quran")
        struct F: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let ayahs: [A] }
        let basmala = "بسم الله الرحمن الرحيم".split(separator: " ").map { QuranWordMatch.normalizeQuranWord(String($0)) }
        var bad: [String] = []
        for s in 1...114 {
            let f = try JSONDecoder().decode(F.self, from: Data(contentsOf: dir.appendingPathComponent(String(format: "surah-%03d.json", s))))
            for a in f.ayahs {
                let t = QuranDisplayText.clean(a.text, surah: s, ayah: a.numberInSurah)
                if t.contains("\u{06DE}") || t.contains("\u{06E9}") || t.contains("\u{FEFF}") { bad.append("\(s):\(a.numberInSurah) زخرفة") }
                let w = t.split(separator: " ").map { QuranWordMatch.normalizeQuranWord(String($0)) }
                if a.numberInSurah == 1, s != 1, w.count >= 4, Array(w.prefix(4)) == basmala { bad.append("\(s):1 بسملة") }
                if t.isEmpty { bad.append("\(s):\(a.numberInSurah) فارغة") }
            }
        }
        XCTAssertTrue(bad.isEmpty, "\(bad.prefix(10))")
    }
}

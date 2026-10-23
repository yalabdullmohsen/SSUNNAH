import XCTest
@testable import SunnahNative

/// الياء الصغيرة «ۦ» داخل الكلمة تُنطق ياءً: «إِبْرَٰهِۦمَ» (15 موضعًا في البقرة) كانت تُطبَّع «ابرهم/ابراهم» فلا تبلغ
/// «إبراهيم» المسموعة عتبة الوضع الصارم (0.83 < 0.85). الختامية صلةٌ («بِهِۦ» = «به») فلا تُضاف.
final class TasmeeSmallYehFormTests: XCTestCase {
    private func best(_ heard: String, _ ref: String) -> Double {
        QuranWordMatch.bestWordSimilarity(QuranWordMatch.normalizeQuranWord(heard), QuranWordMatch.quranWordForms(ref))
    }

    func testMedialSmallYehMatchesExactly() {
        XCTAssertEqual(best("إبراهيم", "إِبْرَٰهِۦمَ"), 1)
        XCTAssertEqual(best("النبيين", "ٱلنَّبِيِّۦنَ"), 1)
        XCTAssertEqual(best("إيلافهم", "إِۦلَٰفِهِمْ"), 1)
    }

    func testFinalSmallYehStaysSilent() {
        XCTAssertEqual(best("به", "بِهِۦ"), 1)
        XCTAssertFalse(QuranWordMatch.quranWordForms("بِهِۦ").contains("بهي"))
    }

    func testWordsWithoutSmallYehKeepTheirForms() {
        XCTAssertEqual(QuranWordMatch.quranWordForms("تَبَٰرَكَ"), ["تبرك", "تبارك"])
        XCTAssertEqual(QuranWordMatch.quranWordForms("الحمد"), ["الحمد"])
    }
}

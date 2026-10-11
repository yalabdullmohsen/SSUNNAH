import XCTest
@testable import SunnahNative

final class ArabicTextTests: XCTestCase {
    private func same(_ a: String, _ b: String, _ m: String = "", line: UInt = #line) {
        XCTAssertEqual(ArabicText.normalize(a), ArabicText.normalize(b), m, line: line)
    }

    func testHamzaFormsFoldToAlef() {
        for v in ["أحمد", "إحمد", "آحمد", "احمد", "ٱحمد"] { same(v, "احمد") }
        XCTAssertTrue(ArabicText.matches("إِيمَانٌ", query: "ايمان"))
    }
    func testTaMarbutaFoldsToHa() {
        same("الصلاة", "الصلاه"); same("رحمة", "رحمه")
    }
    func testAlefMaksuraFoldsToYa() {
        same("هدى", "هدي"); same("مصطفى", "مصطفي")
    }
    func testDiacriticsAndTatweelStripped() {
        same("مُحَمَّدٌ", "محمد"); same("الــــحمد", "الحمد"); same("قُلْ هُوَ", "قل هو")
        same("اللهُ", "الله"); same("عَلَىٰ", "علي")   // الألف الخنجرية 0670
    }
    func testDigitsUnified() {
        same("الجزء ١٢", "الجزء 12"); same("الجزء ۱۲", "الجزء 12"); same("٠١٢٣٤٥٦٧٨٩", "0123456789")
        same("۰۱۲۳۴۵۶۷۸۹", "0123456789")
        XCTAssertTrue(ArabicText.matches("الباب ٣", query: "3"))
        XCTAssertTrue(ArabicText.matches("الباب 3", query: "٣"))
    }
    func testEmptyAndWhitespace() {
        XCTAssertEqual(ArabicText.normalize(""), "")
        XCTAssertEqual(ArabicText.normalize("   \n"), "")
        XCTAssertTrue(ArabicText.matches("", query: ""))
        XCTAssertTrue(ArabicText.matches("أي شيء", query: ""))
        XCTAssertTrue(ArabicText.matches("أي شيء", query: "   "))
        XCTAssertFalse(ArabicText.matches("", query: "ا"))
    }
    func testNegativesAndNonArabicUntouched() {
        XCTAssertFalse(ArabicText.matches("أركان الإيمان", query: "الزكاة"))
        XCTAssertEqual(ArabicText.normalize("Hello World"), "hello world")
    }
    func testNormalizeIsIdempotent() {
        let s = "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ ١٢ ۳"
        XCTAssertEqual(ArabicText.normalize(ArabicText.normalize(s)), ArabicText.normalize(s))
    }
}

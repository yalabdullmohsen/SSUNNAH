import XCTest
@testable import SunnahNative

final class TasmeeReportFormatTests: XCTestCase {
    func testDurationArabicDigits() {
        XCTAssertEqual(TasmeeReportFormat.duration(75), "١:١٥")
        XCTAssertEqual(TasmeeReportFormat.duration(-3), "٠:٠٠")
    }

    func testDetailVariants() {
        func ev(_ s: String?, _ x: String?) -> TasmeeSessionEvent {
            TasmeeSessionEvent(surah: 1, ayah: 2, wordIndex: 0, kind: .wrong, said: s, expected: x)
        }
        XCTAssertEqual(TasmeeReportFormat.detail(ev("أ", "ب")), "قلتَ: أ، الصواب: ب")
        XCTAssertEqual(TasmeeReportFormat.detail(ev(nil, "ب")), "الصواب: ب")
        XCTAssertEqual(TasmeeReportFormat.detail(ev(nil, nil)), "الكلمة ١")
    }

    func testGoalTitles() {
        let name: (Int) -> String = { _ in "الكهف" }
        XCTAssertEqual(TasmeeProgressFormat.goalTitle(TasmeeGoal(kind: .surahWeekly, surah: 18, weekday: 6), surahName: name), "الكهف كل يوم الجمعة")
        XCTAssertEqual(TasmeeProgressFormat.goalTitle(TasmeeGoal(kind: .dailyAyahs, dailyAyahs: 10), surahName: name), "١٠ آيات يوميًا")
        XCTAssertEqual(TasmeeProgressFormat.goalTitle(TasmeeGoal(kind: .juzReview, juz: 30), surahName: name), "مراجعة الجزء ٣٠")
    }

    func testArabicCounts() {
        XCTAssertEqual(TasmeeProgressFormat.times(1), "مرة واحدة")
        XCTAssertEqual(TasmeeProgressFormat.times(2), "مرتان")
        XCTAssertEqual(TasmeeProgressFormat.times(5), "٥ مرات")
        XCTAssertEqual(TasmeeProgressFormat.times(11), "١١ مرة")
        XCTAssertEqual(TasmeeProgressFormat.ayahs(2), "آيتان")
        XCTAssertEqual(TasmeeProgressFormat.goalTitle(TasmeeGoal(kind: .surahWeekly, weekday: 1), surahName: { _ in "x" }), "ورد أسبوعي")
        XCTAssertEqual(TasmeeProgressFormat.goalTitle(TasmeeGoal(kind: .surahWeekly, surah: 18, weekday: 2), surahName: { _ in "الكهف" }), "الكهف كل يوم الاثنين")
    }

    /// العدد فوق المئة يُعامل بآخر رقمين كـ`ArabicCount`: «١٠٣ آيات» و«١١٢ مرة» و«١٠٠ آية».
    func testCountsAboveHundredUseLastTwoDigits() {
        XCTAssertEqual(TasmeeProgressFormat.ayahs(103), "١٠٣ آيات")
        XCTAssertEqual(TasmeeProgressFormat.ayahs(110), "١١٠ آيات")
        XCTAssertEqual(TasmeeProgressFormat.ayahs(100), "١٠٠ آية")
        XCTAssertEqual(TasmeeProgressFormat.times(112), "١١٢ مرة")
        XCTAssertEqual(TasmeeProgressFormat.ayahs(10), "١٠ آيات")
        XCTAssertEqual(TasmeeProgressFormat.ayahs(1), "آية واحدة")
    }

    func testStrengthLabels() {
        XCTAssertEqual(TasmeeProgressFormat.label(.strong), "قوية")
        XCTAssertEqual(TasmeeProgressFormat.label(.needsReview), "تحتاج مراجعة")
        XCTAssertEqual(TasmeeProgressFormat.label(.untouched), "لم تُسمَّع")
    }
}

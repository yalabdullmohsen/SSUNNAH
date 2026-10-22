import XCTest
@testable import SunnahNative

/// صيغ عرض بلا محاكي: العدّ التنازلي للصلاة القادمة، وموعد مراجعة البطاقة التعليمية بعدد عربي سليم.
final class CountdownAndIntervalLabelTests: XCTestCase {
    private let latin = CharacterSet(charactersIn: "0123456789")

    // MARK: SunnahClockFormat.countdown

    func testCountdownFormatsHoursMinutesSeconds() {
        XCTAssertEqual(SunnahClockFormat.countdown(3_725), "٠١:٠٢:٠٥")
        XCTAssertEqual(SunnahClockFormat.countdown(0), "٠٠:٠٠:٠٠")
    }

    func testCountdownFloorsFractionsAndClampsNegative() {
        XCTAssertEqual(SunnahClockFormat.countdown(59.9), "٠٠:٠٠:٥٩")
        XCTAssertEqual(SunnahClockFormat.countdown(-5), "٠٠:٠٠:٠٠", "فات الوقت: لا عدّ سالب")
    }

    func testCountdownBeyondADayKeepsAllHourDigits() {
        XCTAssertEqual(SunnahClockFormat.countdown(360_000), "١٠٠:٠٠:٠٠")
    }

    // MARK: LearnFlashcardSession.intervalLabel

    private func label(_ d: Int) -> String { LearnFlashcardSession.intervalLabel(d) }

    func testNamedIntervals() {
        XCTAssertEqual(label(-3), "غدًا")
        XCTAssertEqual(label(0), "غدًا")
        XCTAssertEqual(label(1), "غدًا")
        XCTAssertEqual(label(2), "يومان")
        XCTAssertEqual(label(7), "أسبوع")
        XCTAssertEqual(label(14), "أسبوعان")
        for d in 28...31 { XCTAssertEqual(label(d), "شهر") }
    }

    func testCountedIntervalsUseArabicNumberAgreement() {
        XCTAssertEqual(label(3), "\(3.arabicDigits) أيام")
        XCTAssertEqual(label(10), "\(10.arabicDigits) أيام")
        XCTAssertEqual(label(11), "\(11.arabicDigits) يومًا")
        XCTAssertEqual(label(45), "\(45.arabicDigits) يومًا")
        XCTAssertEqual(label(100), "\(100.arabicDigits) يوم")
        XCTAssertEqual(label(102), "\(102.arabicDigits) يوم")
        XCTAssertEqual(label(105), "\(105.arabicDigits) أيام")
        XCTAssertEqual(label(150), "\(150.arabicDigits) يومًا")
    }

    func testIntervalLabelsNeverShowLatinDigits() {
        for d in -1...400 { XCTAssertNil(label(d).rangeOfCharacter(from: latin), "\(d) → \(label(d))") }
    }
}

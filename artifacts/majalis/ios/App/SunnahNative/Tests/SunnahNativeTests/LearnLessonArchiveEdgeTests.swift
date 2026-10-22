import XCTest
@testable import SunnahNative

/// حالات حدّية لأرشفة الدروس: الحد بالثانية، وأولوية تاريخ النهاية، والقيم الناقصة أو التالفة، والحالات المخفية.
final class LearnLessonArchiveEdgeTests: XCTestCase {
    private func lesson(_ json: String) throws -> LearnLesson { try JSONDecoder().decode(LearnLesson.self, from: Data(json.utf8)) }
    private func at(_ iso: String) -> Date { ISO8601DateFormatter().date(from: iso)! }

    func testEndOfDayBoundaryIsStrict() throws {
        let l = try lesson(#"{"id":"a","title":"أ","end_date":"2026-10-11"}"#)
        // نهاية اليوم 23:59:59+03:00 = 20:59:59Z.
        XCTAssertFalse(LearnLessonArchive.isArchived(l, now: at("2026-10-11T20:59:59Z")))
        XCTAssertTrue(LearnLessonArchive.isArchived(l, now: at("2026-10-11T21:00:00Z")))
    }

    func testEndDateWinsOverPastStartOfOneOffLesson() throws {
        let l = try lesson(#"{"id":"a","title":"أ","is_recurring":false,"start_date":"2026-01-01","end_date":"2026-12-31"}"#)
        XCTAssertFalse(LearnLessonArchive.isArchived(l, now: at("2026-10-11T12:00:00Z")))
    }

    func testPastStartArchivesOnlyWhenExplicitlyNotRecurring() throws {
        let unknown = try lesson(#"{"id":"a","title":"أ","start_date":"2026-01-01"}"#)
        let weekly = try lesson(#"{"id":"b","title":"ب","is_recurring":true,"start_date":"2026-01-01"}"#)
        let now = at("2026-10-11T12:00:00Z")
        XCTAssertFalse(LearnLessonArchive.isArchived(unknown, now: now))
        XCTAssertFalse(LearnLessonArchive.isArchived(weekly, now: now))
    }

    func testMalformedDatesNeverArchive() throws {
        let l = try lesson(#"{"id":"a","title":"أ","is_recurring":false,"start_date":"قريبًا","end_date":"غير محدد"}"#)
        XCTAssertNil(LearnLessonArchive.endOfDay("غير محدد"))
        XCTAssertFalse(LearnLessonArchive.isArchived(l, now: at("2030-01-01T00:00:00Z")))
    }

    func testTimestampDatesUseTheirDayPart() {
        XCTAssertEqual(LearnLessonArchive.endOfDay("2026-10-11T08:30:00Z"), at("2026-10-11T20:59:59Z"))
    }

    func testSplitHidesNonApprovedAndKeepsOrder() throws {
        let now = at("2026-10-11T12:00:00Z")
        let ls = try [
            lesson(#"{"id":"1","title":"١","status":"approved"}"#),
            lesson(#"{"id":"2","title":"٢","status":"rejected"}"#),
            lesson(#"{"id":"3","title":"٣","end_date":"2026-01-01"}"#),
            lesson(#"{"id":"4","title":"٤"}"#),
            lesson(#"{"id":"5","title":"٥","status":"pending","end_date":"2026-01-01"}"#),
            lesson(#"{"id":"6","title":"٦","status":"approved","end_date":"2025-05-05"}"#),
        ]
        let s = LearnLessonArchive.split(ls, now: now)
        XCTAssertEqual(s.active.map(\.id), ["1", "4"])
        XCTAssertEqual(s.archived.map(\.id), ["3", "6"])
    }

    func testEmptyInputSplitsToEmpty() {
        let s = LearnLessonArchive.split([], now: Date())
        XCTAssertTrue(s.active.isEmpty && s.archived.isEmpty)
    }
}

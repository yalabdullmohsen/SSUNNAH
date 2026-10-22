import XCTest
@testable import SunnahNative

/// إحصاءات المستخدم ومستواه من صفوف Supabase: حدود المستويات ونقاط الخبرة وفك المعرّفات.
final class AccountUserStatsTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T { try JSONDecoder().decode(T.self, from: Data(json.utf8)) }

    func testEveryLevelBoundary() {
        let cases: [(xp: Int, level: Int, next: Int)] = [
            (499, 1, 500), (500, 2, 1_500), (1_499, 2, 1_500), (1_500, 3, 3_000),
            (2_999, 3, 3_000), (3_000, 4, 6_000), (5_999, 4, 6_000), (6_000, 5, 6_000), (99_999, 5, 6_000),
        ]
        for c in cases {
            let l = AccountUserLevel(xp: c.xp)
            XCTAssertEqual(l.level, c.level, "xp \(c.xp)")
            XCTAssertEqual(l.nextLevelXp, c.next, "xp \(c.xp)")
            XCTAssertEqual(l.title, AccountUserLevel.titles[c.level - 1])
        }
    }

    func testFractionIsCappedAtOne() {
        XCTAssertEqual(AccountUserLevel(xp: 750).fraction, 0.5, accuracy: 1e-9)
        XCTAssertEqual(AccountUserLevel(xp: 0).fraction, 0)
        XCTAssertEqual(AccountUserLevel(xp: 6_000).fraction, 1)
        XCTAssertEqual(AccountUserLevel(xp: 99_999).fraction, 1)
    }

    func testXpRounding() {
        func xp(streak: Int = 0, tasbih: Int = 0, verses: Int = 0) -> Int {
            AccountUserLevel.xp(completedLessons: 0, booksRead: 0, streakDays: streak, tasbihLifetime: tasbih,
                                savedItems: 0, badgesEarned: 0, recitationVerses: verses)
        }
        XCTAssertEqual(xp(tasbih: 99), 0, "التسبيح يُحسب لكل مئة كاملة")
        XCTAssertEqual(xp(tasbih: 199), 2)
        XCTAssertEqual(xp(streak: 365), xp(streak: 1_000), "السلسلة تُحسب حتى سنة")
        XCTAssertEqual(xp(verses: 7), 21)
    }

    func testStatsFromRowsAndDerivedLevel() throws {
        let bookmarks: [AccountBookmarkRow] = try decode(#"[{"id":1,"content_type":"book"},{"id":"h-2","content_type":"hadith"},{"id":3,"content_type":null}]"#)
        let achievements: [AccountAchievementRow] = try decode(#"[{"achievement_key":"first_lesson","title":"أول درس"},{"achievement_key":"streak_7"}]"#)
        let registrations: [AccountRegistrationRow] = try decode(#"[{"lesson_id":10},{"lesson_id":"x"},{"lesson_id":null}]"#)
        let s = AccountUserStats(bookmarks: bookmarks, achievements: achievements, registrations: registrations)
        XCTAssertEqual(s.completedLessons, 3)
        XCTAssertEqual(s.savedItems, 3)
        XCTAssertEqual(s.booksRead, 1)
        XCTAssertEqual(s.earnedKeys, ["first_lesson", "streak_7"])
        // 3×100 + 1×200 + 3×5 + 2×50 = 615.
        XCTAssertEqual(s.level.xp, 615)
        XCTAssertEqual(s.level.level, 2)
    }

    func testEmptyStatsAreLevelOne() {
        XCTAssertEqual(AccountUserStats().level, AccountUserLevel(xp: 0))
    }

    func testAnyIDDecodesNumbersAndStringsOnly() throws {
        let ids: [AccountAnyID] = try decode(#"[42, "abc", "007"]"#)
        XCTAssertEqual(ids.map(\.value), ["42", "abc", "007"])
        XCTAssertThrowsError(try decode(#"[true]"#) as [AccountAnyID])
    }

    func testResumeRowIdCombinesTypeAndId() throws {
        let r: AccountResumeRow = try decode(#"{"content_type":"book","content_id":42,"content_title":"كتاب","content_url":"/library/42","position":{"pct":0.4}}"#)
        XCTAssertEqual(r.id, "book-42")
        XCTAssertEqual(r.position?.pct, 0.4)
        XCTAssertNil(r.position?.section)
    }
}

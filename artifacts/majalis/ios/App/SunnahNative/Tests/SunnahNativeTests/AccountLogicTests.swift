import XCTest
import SunnahPrayer
@testable import SunnahNative

/// منطق قسم «الحساب والإعدادات» النقي: القبلة، وضع المسجد، التقويم، الدروس، المستوى، الجلسة، التواصل، المقترحات.
final class AccountLogicTests: XCTestCase {
    private var utc: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "UTC")!
        c.firstWeekday = 1
        return c
    }

    private func date(_ s: String) -> Date {
        let f = ISO8601DateFormatter()
        return f.date(from: s)!
    }

    // MARK: القبلة

    func testQiblaBearingFromKuwaitPointsSouthWest() {
        // الكويت → الكعبة: نحو 224.6° (دائرة عظمى).
        XCTAssertEqual(AccountQiblaMath.bearing(latitude: 29.3759, longitude: 47.9774), 224.6, accuracy: 0.5)
    }

    func testQiblaDistanceAtKaabaIsZero() {
        XCTAssertEqual(AccountQiblaMath.distanceKm(latitude: AccountQiblaMath.kaabaLatitude, longitude: AccountQiblaMath.kaabaLongitude), 0, accuracy: 0.001)
        XCTAssertEqual(AccountQiblaMath.distanceKm(latitude: 29.3759, longitude: 47.9774), 1_204, accuracy: 5)
    }

    func testQiblaShortestDeltaWrapsAround() {
        XCTAssertEqual(AccountQiblaMath.shortestDelta(from: 350, to: 10), 20, accuracy: 0.0001)
        XCTAssertEqual(AccountQiblaMath.shortestDelta(from: 10, to: 350), -20, accuracy: 0.0001)
        XCTAssertTrue(AccountQiblaMath.isAligned(bearing: 359, heading: 1))
        XCTAssertFalse(AccountQiblaMath.isAligned(bearing: 90, heading: 95))
    }

    func testQiblaLowPassStaysInRange() {
        XCTAssertEqual(AccountQiblaMath.lowPass(previous: nil, next: 42), 42)
        let v = AccountQiblaMath.lowPass(previous: 355, next: 5, alpha: 0.5)
        XCTAssertEqual(v, 0, accuracy: 0.0001)
    }

    // MARK: وضع المسجد

    func testPrayerPhaseCountdownAndElapsed() {
        let base = date("2026-10-11T00:00:00Z")
        let slots: [(prayer: Prayer, time: Date)] = [
            (.fajr, base.addingTimeInterval(4 * 3600)), (.sunrise, base.addingTimeInterval(5 * 3600)),
            (.dhuhr, base.addingTimeInterval(11 * 3600)), (.asr, base.addingTimeInterval(14 * 3600)),
        ]
        guard case .countdown(let p, _, let remaining)? = AccountPrayerPhase.resolve(now: base.addingTimeInterval(6 * 3600), slots: slots) else {
            return XCTFail("متوقع عد تنازلي")
        }
        XCTAssertEqual(p, .dhuhr)
        XCTAssertEqual(remaining, 5 * 3600, accuracy: 0.5)

        guard case .elapsed(let e, let since, let next, _)? = AccountPrayerPhase.resolve(now: base.addingTimeInterval(11 * 3600 + 600), slots: slots) else {
            return XCTFail("متوقع «مضى على الأذان»")
        }
        XCTAssertEqual(e, .dhuhr)
        XCTAssertEqual(since, 600, accuracy: 0.5)
        XCTAssertEqual(next, .asr)

        XCTAssertNil(AccountPrayerPhase.resolve(now: base.addingTimeInterval(20 * 3600), slots: slots))
    }

    func testMosqueCountdownFormat() {
        XCTAssertEqual(AccountMosqueModeScreen.countdown(65), "01:05")
        XCTAssertEqual(AccountMosqueModeScreen.countdown(3_725), "01:02:05")
        XCTAssertEqual(AccountMosqueModeScreen.countdown(-5), "00:00")
    }

    // MARK: الدروس والتقويم

    func testLessonDecodingAndDerivedFields() throws {
        let json = #"""
        [{"id": "7", "external_key": "ext-7", "title": "شرح الأربعين", "speaker_name": "الشيخ", "day_of_week": "الإثنين",
          "lesson_time": "19:30", "audio_url": "", "live_url": "https://example.com/live.mp3", "is_recurring": null, "status": "approved"}]
        """#
        let lessons = try JSONDecoder().decode([AccountLesson].self, from: Data(json.utf8))
        let l = try XCTUnwrap(lessons.first)
        XCTAssertEqual(l.publicId, "ext-7")
        XCTAssertTrue(l.recurring)
        XCTAssertEqual(l.time, "19:30")
        XCTAssertEqual(l.playableURL?.absoluteString, "https://example.com/live.mp3")
        let event = AccountCalendarEvent(lesson: l)
        XCTAssertEqual(event.day, "الاثنين")
        XCTAssertEqual(event.path, "/lessons/ext-7")
    }

    func testActiveLessonFilter() {
        let now = date("2026-10-11T08:00:00Z")
        let lessons = [
            AccountLesson(id: "a", title: "متكرر"),
            AccountLesson(id: "b", title: "انتهى", endDate: "2026-10-01"),
            AccountLesson(id: "c", title: "قادم", startDate: "2026-10-20", isRecurring: false),
            AccountLesson(id: "d", title: "مضى", startDate: "2026-10-01", isRecurring: false),
            AccountLesson(id: "e", title: "معلّق", status: "pending"),
        ]
        XCTAssertEqual(AccountLessonFilter.active(lessons, now: now).map(\.id), ["a", "c"])
    }

    func testCalendarEventsMatchWeekdayAndDate() {
        let sunday = date("2026-10-11T12:00:00Z")
        let weekly = AccountCalendarEvent(lesson: AccountLesson(id: "w", title: "أسبوعي", dayOfWeek: "الأحد"))
        let dated = AccountCalendarEvent(lesson: AccountLesson(id: "d", title: "مؤرّخ", startDate: "2026-10-11", isRecurring: false))
        let other = AccountCalendarEvent(lesson: AccountLesson(id: "o", title: "الاثنين", dayOfWeek: "الاثنين"))
        let found = AccountCalendarMath.events(on: sunday, in: [weekly, dated, other, weekly], calendar: utc)
        XCTAssertEqual(found.map(\.id), ["w", "d"])
    }

    func testMonthGridCoversWholeWeeks() {
        let grid = AccountCalendarMath.monthGrid(for: date("2026-10-11T12:00:00Z"), calendar: utc)
        XCTAssertEqual(grid.count % 7, 0)
        XCTAssertEqual(utc.component(.weekday, from: grid[0]), 1)
    }

    func testIcsOutput() {
        let ev = AccountCalendarEvent(lesson: AccountLesson(id: "x", title: "درس", speakerName: "الشيخ", mosque: "مسجد", lessonTime: "19:30"))
        let ics = AccountCalendarMath.ics([(date: date("2026-10-11T12:00:00Z"), event: ev)], monthLabel: "أكتوبر",
                                          stamp: date("2026-10-11T00:00:00Z"), calendar: utc)
        XCTAssertTrue(ics.hasPrefix("BEGIN:VCALENDAR\r\n"))
        XCTAssertTrue(ics.contains("DTSTART;TZID=Asia/Kuwait:20261011T193000"))
        XCTAssertTrue(ics.contains("DTEND;TZID=Asia/Kuwait:20261011T203000"))
        XCTAssertTrue(ics.contains("UID:x-20261011@ssunnah.com"))
        XCTAssertTrue(ics.contains("DESCRIPTION:الشيخ | مسجد"))
        XCTAssertTrue(ics.hasSuffix("END:VCALENDAR"))
        XCTAssertEqual(AccountCalendarMath.icsTime(date("2026-10-11T12:00:00Z"), time: nil, calendar: utc), "20261011T060000")
    }

    @MainActor func testCarPlaylistKeepsApprovedAudioOnly() {
        let all = [
            AccountLesson(id: "1", title: "صوت", audioURL: "https://example.com/1.mp3"),
            AccountLesson(id: "2", title: "بلا صوت"),
            AccountLesson(id: "3", title: "معلّق", audioURL: "https://example.com/3.mp3", status: "pending"),
        ]
        XCTAssertEqual(AccountCarPlayer.playlist(from: all).map(\.id), ["1"])
    }

    // MARK: المستوى

    func testUserLevelThresholds() {
        XCTAssertEqual(AccountUserLevel(xp: 0).level, 1)
        XCTAssertEqual(AccountUserLevel(xp: 0).title, "طالب مبتدئ")
        XCTAssertEqual(AccountUserLevel(xp: 500).level, 2)
        XCTAssertEqual(AccountUserLevel(xp: 6_500).title, "مجاز")
        XCTAssertEqual(AccountUserLevel(xp: 6_500).fraction, 1)
        XCTAssertEqual(AccountUserLevel.xp(completedLessons: 2, booksRead: 1, streakDays: 400, tasbihLifetime: 250,
                                           savedItems: 3, badgesEarned: 1), 200 + 200 + 3_650 + 4 + 15 + 50)
    }

    // MARK: الجلسة

    func testSessionParsing() {
        let raw = #"{"access_token":"t","user":{"id":"u1","email":"a.b@example.com","user_metadata":{}}}"#
        let s = AccountSession.parse(raw)
        XCTAssertEqual(s?.userId, "u1")
        XCTAssertEqual(s?.displayName, "a.b")
        let legacy = #"{"currentSession":{"access_token":"t","user":{"id":"u2","user_metadata":{"full_name":"يوسف"}}}}"#
        XCTAssertEqual(AccountSession.parse(legacy)?.displayName, "يوسف")
        XCTAssertNil(AccountSession.parse(#"{"access_token":""}"#))
        XCTAssertNil(AccountSession.parse("not json"))
    }

    func testSessionFromNativeTokenAndStore() throws {
        let token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1OSIsImVtYWlsIjoieEB5LnoiLCJ1c2VyX21ldGFkYXRhIjp7ImZ1bGxfbmFtZSI6Itiz2KfYsdipIn19.sig"
        let s = AccountSession.fromToken(token, email: nil)
        XCTAssertEqual(s?.userId, "u9")
        XCTAssertEqual(s?.email, "x@y.z")
        XCTAssertEqual(s?.displayName, "سارة")
        XCTAssertNil(AccountSession.fromToken("not-a-jwt", email: nil))

        let store = InMemoryAuthStore()
        try store.setValue(token, forKey: AccountSession.tokenKey)
        try store.setValue("me@example.com", forKey: AccountSession.emailKey)
        XCTAssertEqual(AccountSession.read(from: store)?.email, "me@example.com")
        XCTAssertEqual(AccountSession.read(from: InMemoryAuthStore())?.userId, nil)
    }

    // MARK: التواصل والمقترحات

    func testContactTopicResolution() {
        XCTAssertEqual(AccountContact.resolveTopicId("rate"), "suggest")
        XCTAssertEqual(AccountContact.resolveTopicId("خطأ في حديث"), "report")
        XCTAssertEqual(AccountContact.resolveTopicId("privacy"), "privacy")
        XCTAssertNil(AccountContact.resolveTopicId("  "))
        XCTAssertEqual(AccountContact.subject(for: nil, topicParam: ""), "استفسار عام")
        let url = AccountContact.mailto(subject: "استفسار عام")
        XCTAssertEqual(url?.scheme, "mailto")
        XCTAssertTrue(url?.absoluteString.hasPrefix("mailto:info@ssunnah.com?subject=") ?? false)
    }

    func testSubmissionDraftValidation() {
        var d = AccountSubmissionDraft()
        XCTAssertFalse(d.isValid)
        d.title = "عنوان"; d.details = "تفاصيل كافية"
        XCTAssertTrue(d.isValid)
        d.type = "نوع غير معروف"
        XCTAssertFalse(d.isValid)
        d.type = "فائدة"; d.author = String(repeating: "ا", count: 201)
        XCTAssertFalse(d.isValid)
    }

    func testSubmissionSizeFormat() {
        XCTAssertEqual(AccountSubmission.formatSize(nil), "—")
        XCTAssertEqual(AccountSubmission.formatSize(0), "—")
        XCTAssertEqual(AccountSubmission.formatSize(512), "512 KB")
        XCTAssertEqual(AccountSubmission.formatSize(2_048), "2.0 MB")
    }
}

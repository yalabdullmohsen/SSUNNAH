import XCTest
@testable import SunnahNative

/// مطابقة `stripSheikhHonorifics`/`sheikhNameKey` في الويب، وتجميع مشايخ السيرة بالاسم بلا ألقاب.
final class SheikhNameTests: XCTestCase {
    func testStripsHonorificsLikeWeb() {
        XCTAssertEqual(SheikhName.stripHonorifics("الشيخ راغب السرجاني"), "راغب السرجاني")
        XCTAssertEqual(SheikhName.stripHonorifics("فضيلة الشيخ الدكتور  محمد   العريفي"), "محمد العريفي")
        XCTAssertEqual(SheikhName.stripHonorifics("الشيخة: فاطمة"), "فاطمة")
        XCTAssertEqual(SheikhName.stripHonorifics("د. عثمان الخميس"), "عثمان الخميس")
        XCTAssertEqual(SheikhName.stripHonorifics("Dr. Ahmad"), "Ahmad")
        XCTAssertEqual(SheikhName.stripHonorifics("الشيخ"), "", "لقب بلا اسم")
        XCTAssertEqual(SheikhName.stripHonorifics("شيخة الكعبي"), "شيخة الكعبي", "«شيخة» اسم لا لقب بلا مسافة بعد «الشيخ»")
        XCTAssertEqual(SheikhName.key("Dr. Ahmad"), "ahmad")
    }

    func testTeachersMergeHonorificVariants() throws {
        let json = #"[{"id":"1","title":"أ","speaker_name":"الشيخ راغب السرجاني","status":"approved"},{"id":"2","title":"ب","speaker_name":"راغب السرجاني","status":"approved"},{"id":"3","title":"ج","speaker_name":"الشيخ","status":"approved"},{"id":"4","title":"د","speaker_name":"عثمان","status":"approved"}]"#
        let rows = try JSONDecoder().decode([SirahLessonRow].self, from: Data(json.utf8))
        let links = SirahAdapters.teachers(rows)
        XCTAssertEqual(links.map(\.title), ["الشيخ راغب السرجاني", "عثمان"], "لقب بلا اسم لا يصير شيخًا")
        XCTAssertEqual(links[0].subtitle, "درسان")
        XCTAssertEqual(links[0].id, SirahAdapters.teacherSlug("راغب السرجاني"), "الرابط بالمفتاح كالويب")
        XCTAssertEqual(SirahAdapters.teacher(slug: links[0].id, rows: rows)?.subtitle, "درسان")
        XCTAssertEqual(SirahAdapters.teacher(slug: SirahAdapters.teacherSlug("الشيخ راغب السرجاني"), rows: rows)?.title, "الشيخ راغب السرجاني", "رابط قديم بالاسم الكامل يبقى يعمل")
        XCTAssertEqual(SirahAdapters.teacherChapters(rows).map(\.paragraphs.count), [2, 1])
    }
}

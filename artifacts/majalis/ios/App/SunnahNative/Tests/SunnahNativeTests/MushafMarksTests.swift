import XCTest
@testable import SunnahNative

final class MushafMarksTests: XCTestCase {
    private func store(_ d: UserDefaults? = nil) -> (MushafStore, UserDefaults) {
        let defaults = d ?? UserDefaults(suiteName: "mushaf-marks-\(UUID())")!
        return (MushafStore(defaults: defaults), defaults)
    }

    func testLegacyBookmarksMigrateToGeneral() throws {
        let d = UserDefaults(suiteName: "mushaf-marks-\(UUID())")!
        // الصيغة القديمة المخزّنة: {ayah, page, date} بلا لون.
        let legacy = #"[{"ayah":"2:255","page":42,"date":700000000}]"#
        d.set(Data(legacy.utf8), forKey: "mushaf.bookmarks")
        let st = MushafStore(defaults: d)
        XCTAssertEqual(st.bookmarks.count, 1)
        XCTAssertEqual(st.bookmarks[0].color, .general)
        XCTAssertEqual(st.bookmarks[0].ayah, "2:255")
        XCTAssertEqual(st.colors(ofAyah: "2:255"), [.general])
        XCTAssertTrue(st.isBookmarked("2:255"))
    }

    func testAddRemoveAndMultipleColorsOnSameTarget() {
        let (st, d) = store()
        st.toggleMark(.hifz, ayah: "1:2", page: 1)
        st.toggleMark(.review, ayah: "1:2", page: 1)
        XCTAssertEqual(st.colors(ofAyah: "1:2"), [.hifz, .review])      // ترتيب الألوان ثابت
        XCTAssertEqual(MushafStore(defaults: d).colors(ofAyah: "1:2"), [.hifz, .review])   // محفوظة محليًا
        st.toggleMark(.hifz, ayah: "1:2", page: 1)
        XCTAssertEqual(st.colors(ofAyah: "1:2"), [.review])
        st.toggleMark(.review, ayah: "1:2", page: 1)
        XCTAssertTrue(st.bookmarks.isEmpty)
    }

    func testPageMarksAreSeparateFromAyahMarks() {
        let (st, _) = store()
        st.toggleMark(.wird, ayah: nil, page: 12)
        st.toggleMark(.tadabbur, ayah: nil, page: 12)
        st.toggleMark(.wird, ayah: nil, page: 13)
        XCTAssertEqual(st.colors(ofPage: 12), [.wird, .tadabbur])
        XCTAssertEqual(st.colors(ofPage: 13), [.wird])
        XCTAssertFalse(st.isBookmarked("2:1"))
        st.toggleMark(.wird, ayah: nil, page: 12)
        XCTAssertEqual(st.colors(ofPage: 12), [.tadabbur])
        XCTAssertEqual(st.colors(ofPage: 13), [.wird])
    }

    func testFilterByColorAndAll() {
        var t = Date(timeIntervalSince1970: 1000)
        let d = UserDefaults(suiteName: "mushaf-marks-\(UUID())")!
        let st = MushafStore(defaults: d, now: { t += 1; return t })
        st.toggleMark(.hifz, ayah: "1:1", page: 1)
        st.toggleMark(.review, ayah: "2:5", page: 2)
        st.toggleMark(.hifz, ayah: nil, page: 3)
        XCTAssertEqual(st.marks(filter: nil).count, 3)
        XCTAssertEqual(st.marks(filter: .hifz).map(\.page), [3, 1])    // الأحدث أولًا
        XCTAssertEqual(st.marks(filter: .review).count, 1)
        XCTAssertTrue(st.marks(filter: .wird).isEmpty)
    }

    func testRemoveMarkAndLegacyToggle() {
        let (st, _) = store()
        st.toggleBookmark(ayah: "2:255", page: 42)
        XCTAssertEqual(st.colors(ofAyah: "2:255"), [.general])
        st.toggleMark(.hifz, ayah: "2:255", page: 42)
        let m = st.marks(filter: .hifz)[0]
        st.remove(m)
        XCTAssertEqual(st.colors(ofAyah: "2:255"), [.general])
        st.toggleBookmark(ayah: "2:255", page: 42)      // التوافق: يزيل كل ألوان الآية
        XCTAssertTrue(st.bookmarks.isEmpty)
    }

    func testAyahColorsOnPage() {
        let (st, _) = store()
        st.toggleMark(.hifz, ayah: "2:1", page: 2); st.toggleMark(.wird, ayah: "2:1", page: 2); st.toggleMark(.general, ayah: "2:9", page: 3)
        XCTAssertEqual(st.ayahColors(onPage: 2), ["2:1": [.wird, .hifz]])
    }
}

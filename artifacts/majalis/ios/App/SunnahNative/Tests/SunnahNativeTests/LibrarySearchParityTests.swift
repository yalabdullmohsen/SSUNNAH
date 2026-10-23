import XCTest
@testable import SunnahNative

/// تطبيع بحث المكتبة يطابق normalizeArabic في الويب الذي بُني به `norm` في public/data/search/index.json:
/// الهمزة المفردة تُحذف والترقيم مسافة. كان «الوضوء» لا يجد ما خُزّن «الوضو» (15 نتيجة بدل 22 على الفهرس الحقيقي).
final class LibrarySearchParityTests: XCTestCase {
    func testNormalizeDropsLoneHamzaAndPunctuation() {
        XCTAssertEqual(LibraryAdapters.normalize("الوضوء"), "الوضو")
        XCTAssertEqual(LibraryAdapters.normalize("الأنبياء، والرسل"), "الانبيا والرسل")
        XCTAssertEqual(LibraryAdapters.normalize("«دعاء» (السفر)؟"), "دعا السفر")
        XCTAssertEqual(LibraryAdapters.normalize("مسئول"), "مسوول")
        XCTAssertEqual(LibraryAdapters.normalize("مسؤول"), "مسوول")
        XCTAssertEqual(LibraryAdapters.normalize("کتاب"), "كتاب")
    }

    func testHamzaQueryFindsIndexNormWithoutHamza() throws {
        let index = try JSONDecoder().decode(LibrarySearchIndex.self, from: Data(#"{"version":3,"docs":[{"id":"a","kind":"adhkar","titleAr":"أذكار","href":"/adhkar/wudu","norm":"اذكار الوضو بعد الفراغ"}]}"#.utf8))
        XCTAssertEqual(LibraryAdapters.search(index, query: "الوضوء", scope: { _ in true }).map(\.id), ["a"])
        XCTAssertEqual(LibraryAdapters.search(index, query: "الوضوء،", scope: { _ in true }).map(\.id), ["a"])
    }
}

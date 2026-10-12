import XCTest
@testable import SunnahNative

@MainActor
final class QuranRouteResolveTests: XCTestCase {
    func testDetailRoutesResolve() {
        for p in ["/quran-hub/tajweed/makharij", "/quran/people/adam", "/quran/surah-stories/2", "/quran/people/%D8%A2%D8%AF%D9%85"] {
            XCTAssertNotNil(QuranSection.resolve(path: p), p)
        }
    }

    func testOtherRoutesFallThrough() {
        for p in ["/quran-hub/tajweed", "/quran/people", "/quran/surah-stories", "/quran/1", "/quran-hub/tilawa/x", "/fiqh/books/x"] {
            XCTAssertNil(QuranSection.resolve(path: p), p)
        }
    }
}

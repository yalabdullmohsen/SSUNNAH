import XCTest
@testable import SunnahNative

@MainActor
final class QuranRouteResolveTests: XCTestCase {
    func testDetailRoutesResolve() {
        for p in ["/quran-hub/tajweed/makharij", "/quran/people/adam", "/quran/surah-stories/2", "/hifz-path/c/quran", "/hifz-path/p/juz-amma", "/hifz-path/p/juz-amma/u/s114", "/quran/people/%D8%A2%D8%AF%D9%85"] {
            XCTAssertNotNil(QuranSection.resolve(path: p), p)
        }
    }

    func testOtherRoutesFallThrough() {
        for p in ["/quran-hub/tajweed", "/quran/people", "/quran/surah-stories", "/quran/1", "/hifz-path", "/hifz-path/x/y", "/hifz-path/p/a/b/c", "/quran-hub/tilawa/x", "/fiqh/books/x"] {
            XCTAssertNil(QuranSection.resolve(path: p), p)
        }
    }
}

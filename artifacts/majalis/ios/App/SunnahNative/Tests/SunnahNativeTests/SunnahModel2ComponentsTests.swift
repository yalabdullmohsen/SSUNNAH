import XCTest
import SwiftUI
@testable import SunnahNative

final class SunnahModel2ComponentsTests: XCTestCase {
    func testTileItemsKeepStableIdentityAndOrder() {
        let items = [SunnahTileItem(id: "a", title: "أ"), SunnahTileItem(id: "b", title: "ب", gold: true)]
        XCTAssertEqual(items.map(\.id), ["a", "b"])
        XCTAssertEqual(Set(items).count, 2)
    }

    func testTileTitlesDisplayArabicIndicDigits() {
        XCTAssertEqual("سورة 12".arabicDigits, "سورة ١٢")
    }

    func testChoiceOptionsKeepIDs() {
        let o = SunnahChoiceChips<Int>.Option(id: 3, title: "ثلاثة")
        XCTAssertEqual(o.id, 3)
    }
}

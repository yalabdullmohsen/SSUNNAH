import XCTest
import SwiftUI
import ImageIO
import UniformTypeIdentifiers
@testable import SunnahNative

/// لقطات المصحف على مقاسات iPad (13 بوصة): تُكتب إلى MUSHAF_SNAP_DIR فقط للفحص بالعين؛ لا مراجع ولا مقارنة.
final class MushafIPadSnapTests: XCTestCase {
    @MainActor func testRenderIPadSnapshots() throws {
        let e = ProcessInfo.processInfo.environment
        guard let p = e["MUSHAF_DATA"], let out = e["MUSHAF_SNAP_DIR"] else { throw XCTSkip("MUSHAF_DATA/MUSHAF_SNAP_DIR غير محددين") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        for (name, size) in [("ipad-portrait", CGSize(width: 1032, height: 1376)), ("ipad-landscape", CGSize(width: 1376, height: 1032))] {
            for n in [1, 2, 187, 604] {
                let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }
                    .frame(width: MushafPageLayout.canvasWidth(container: size), height: size.height).frame(width: size.width, height: size.height)
                let ir = ImageRenderer(content: view); ir.scale = 1
                let cg = try XCTUnwrap(ir.cgImage)
                let url = URL(fileURLWithPath: out).appendingPathComponent("\(name)-\(n).png")
                let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
                CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
            }
        }
    }
}

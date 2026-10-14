import XCTest
import SwiftUI
@testable import SunnahNative

#if canImport(AppKit)
import AppKit

@MainActor
final class PageCartoucheTests: XCTestCase {
    /// لقطة: الزخرفة تُرسم بنسبة المرجع (171×73)، شفافة خارج الإطار، وفيها لون الذهب والعاجي والحبر للرقم.
    func testCartoucheSnapshot() throws {
        let r = ImageRenderer(content: PageCartouche(text: "٣٠١", height: 73))
        r.scale = 1
        let cg = try XCTUnwrap(r.cgImage)
        XCTAssertEqual(cg.width, 171)
        XCTAssertEqual(cg.height, 73)
        let rep = NSBitmapImageRep(cgImage: cg)
        XCTAssertEqual(rep.colorAt(x: 0, y: 0)?.alphaComponent ?? 1, 0, accuracy: 0.01, "الزاوية يجب أن تبقى شفافة")
        var ink = 0, gold = 0, ivory = 0
        for y in 0..<cg.height { for x in 0..<cg.width {
            guard let c = rep.colorAt(x: x, y: y)?.usingColorSpace(.sRGB), c.alphaComponent > 0.9 else { continue }
            if c.redComponent < 0.35 && c.greenComponent < 0.5 { ink += 1 }
            if (0.78...0.9).contains(c.redComponent) && (0.68...0.8).contains(c.greenComponent) && c.blueComponent < 0.62 { gold += 1 }
            if c.redComponent > 0.96 && c.blueComponent > 0.89 && c.blueComponent < 0.95 { ivory += 1 }
        } }
        XCTAssertGreaterThan(ink, 80, "رقم الصفحة لم يُرسم")
        XCTAssertGreaterThan(gold, 200)
        XCTAssertGreaterThan(ivory, 2000)
        if let out = ProcessInfo.processInfo.environment["BANNER_SNAPSHOT_OUT"], let png = rep.representation(using: .png, properties: [:]) {
            try png.write(to: URL(fileURLWithPath: out).appendingPathComponent("cartouche.png"))
        }
    }
}
#endif

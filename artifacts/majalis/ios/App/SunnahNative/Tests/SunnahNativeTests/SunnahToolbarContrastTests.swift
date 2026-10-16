import SwiftUI
import XCTest
@testable import SunnahNative

/// حارس: رمز زر الشريط (أبيض) على كبسولته المصمتة بتباين ≥ 3:1 مقيسًا من بكسلات اللقطة، فاتحًا وداكنًا وXXXL.
@MainActor
final class SunnahToolbarContrastTests: XCTestCase {
    private func lum(_ r: Double, _ g: Double, _ b: Double) -> Double {
        func c(_ v: Double) -> Double { v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
    }

    private func measure(scheme: ColorScheme, size: DynamicTypeSize) throws -> Double {
        let view = SunnahToolbarGlyph { Image(systemName: "moon") }
            .padding(12).background(Color.white)   // خلفية محايدة خارج الكبسولة
            .environment(\.colorScheme, scheme).dynamicTypeSize(size)
        let r = ImageRenderer(content: view); r.scale = 3
        let cg = try XCTUnwrap(r.cgImage)
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        let ctx = try XCTUnwrap(CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        // قلب الكبسولة (وسط الصورة أفقيًا، قرب الحافة اليسرى للكبسولة) = لون الخلفية؛ أفتح بكسل داخل الوسط = الرمز.
        func rgb(_ x: Int, _ y: Int) -> (Double, Double, Double) { let i = (y * w + x) * 4; return (Double(px[i]) / 255, Double(px[i + 1]) / 255, Double(px[i + 2]) / 255) }
        let bg = rgb(Int(Double(w) * 0.22), h / 2)
        var best = bg
        for y in Int(Double(h) * 0.3)..<Int(Double(h) * 0.7) { for x in Int(Double(w) * 0.35)..<Int(Double(w) * 0.65) {
            let p = rgb(x, y); if lum(p.0, p.1, p.2) > lum(best.0, best.1, best.2) { best = p }
        } }
        let l1 = lum(best.0, best.1, best.2), l2 = lum(bg.0, bg.1, bg.2)
        return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
    }

    func testGlyphContrastAtLeast3to1() throws {
        for scheme in [ColorScheme.light, .dark] {
            for size in [DynamicTypeSize.large, .xxxLarge, .accessibility3] {
                let c = try measure(scheme: scheme, size: size)
                XCTAssertGreaterThanOrEqual(c, 3.0, "تباين رمز الشريط \(c) < 3 في \(scheme) / \(size)")
            }
        }
    }
}

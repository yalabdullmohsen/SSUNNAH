#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// حارس علامة نهاية الآية (ن3): الصفحات 1 و2 و293 و446 (الصافات) × فاتح/داكن.
/// (1) كل قطعة خضراء في متن الصفحة قطرها ≤ `maxDiscOfFont` من حجم خط النص، (2) مجموع الأخضر ≤ مساحة خلايا الزخرفة (عددها × دائرة قطرها `cellOfFont`)
/// فلا أخضر خارج الخلية، (3) تباين رقم الآية العاجي على القرص ≥ 4.5:1. `ENDMARK_REPORT_ONLY=1` يكتب اللقطات والجدول دون فحص (لقطات «قبل»).
/// `ENDMARK_SNAP_DIR` + `ENDMARK_TAG` (before/after) لمسار اللقطات. دون `MUSHAF_DATA` يُتخطّى.
final class MushafEndMarkGuardTests: XCTestCase {
    static let pages = [1, 2, 293, 446]
    /// أقصى قطر للقرص الأخضر نسبةً إلى حجم خط النص (≈ ارتفاع الحرف) — يُكتب هنا ويقرؤه سكربت الحارس.
    static let maxDiscOfFont: CGFloat = 0.75
    /// أدنى قطر للقرص (يبقى رقم الآية ثلاثي الخانات مقروءًا) ونسبة الأخضر من مساحة الصفحة (حدّان).
    static let minDiscOfFont: CGFloat = 0.62
    /// الحدّ الأدنى للأخضر يُفرض على الصفحة الكثيفة (446: 24 علامة)؛ الصفحات القليلة العلامات (1/2/293) أخضرها أقل بطبعها.
    static let minGreenPct: Double = 1.8
    static let maxGreenPct: Double = 2.5
    /// قطر خلية الزخرفة (حلقة غليف QPC المُصغَّر) نسبةً إلى حجم خط النص: 0.80em × endMarkScale 0.9.
    static let cellOfFont: CGFloat = 0.72
    static let minContrast: CGFloat = 4.5

    private func lum(_ c: UIColor, _ style: UIUserInterfaceStyle) -> CGFloat {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        c.resolvedColor(with: UITraitCollection(userInterfaceStyle: style)).getRed(&r, green: &g, blue: &b, alpha: &a)
        func f(_ v: CGFloat) -> CGFloat { v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }

    @MainActor func testEndMarkDiscIsSmallInsideCellAndReadable() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let env = ProcessInfo.processInfo.environment
        let reportOnly = env["ENDMARK_REPORT_ONLY"] == "1"
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        let size = CGSize(width: 402, height: 874), scale: CGFloat = 2
        var rows = ["| الصفحة | النمط | أخضر ٪ من الصفحة | أكبر قرص / خط | علامات | أخضر/مساحة الخلايا |", "|---|---|---|---|---|---|"]
        for style in [UIUserInterfaceStyle.light, .dark] {
            let scheme: ColorScheme = style == .dark ? .dark : .light
            for n in Self.pages {
                let page = try repo.page(n), fam = try repo.ensureFont(page: n)
                let pl = repo.pageLayout(page, family: fam, size: size)
                let fs = pl.layout.fontSize
                let markers = page.rows.flatMap { $0.w ?? [] }.filter(\.isAyahEnd).count
                let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }
                    .frame(width: size.width, height: size.height).environment(\.colorScheme, scheme)
                let ir = ImageRenderer(content: view); ir.scale = scale
                let cg = try XCTUnwrap(ir.cgImage), w = cg.width, h = cg.height
                var px = [UInt8](repeating: 0, count: w * h * 4)
                let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
                ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
                // أخضر القرص: غلبة القناة الخضراء على الأحمر والأزرق (الورق والحبر عاجيان/رماديان، فلا يلتبسان)
                // أسطر الآيات فقط (k == "l")؛ زخرفة ترويسة السورة خضراء بطبيعتها وخارج خلية العلامة
                let rowH = pl.m.rowHeight, top0 = pl.m.top, kinds = pl.m.rows.map(\.k)
                func inTextRow(_ y: Int) -> Bool { let i = Int((Double(y) / Double(scale) - top0) / rowH); return i >= 0 && i < kinds.count && kinds[i] == "l" }
                var mask = [Bool](repeating: false, count: w * h), greenAll = 0
                let top = Int(CGFloat(pl.m.top) * scale), bottom = Int(CGFloat(pl.m.top + pl.m.rowHeight * Double(pl.m.rows.count)) * scale)
                for y in 0..<h { for x in 0..<w {
                    let i = (y * w + x) * 4, r = Int(px[i]), g = Int(px[i + 1]), b = Int(px[i + 2])
                    if g - r > 22 && g - b > 6 { greenAll += 1; if y >= top && y < bottom, inTextRow(y) { mask[y * w + x] = true } }
                } }
                // قطع متصلة داخل متن الصفحة (الترويسة خارج النطاق)
                var seen = [Bool](repeating: false, count: w * h), maxDim = 0, bodyGreen = 0
                for s in 0..<(w * h) where mask[s] && !seen[s] {
                    var stack = [s], minX = w, maxX = 0, minY = h, maxY = 0, area = 0
                    seen[s] = true
                    while let c = stack.popLast() {
                        let x = c % w, y = c / w; area += 1
                        minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
                        for (dx, dy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
                            let nx = x + dx, ny = y + dy
                            if nx >= 0, nx < w, ny >= 0, ny < h, mask[ny * w + nx], !seen[ny * w + nx] { seen[ny * w + nx] = true; stack.append(ny * w + nx) }
                        }
                    }
                    bodyGreen += area
                    maxDim = max(maxDim, max(maxX - minX + 1, maxY - minY + 1))
                }
                let discOfFont = CGFloat(maxDim) / scale / fs
                let r = Self.cellOfFont * fs * scale / 2
                let cellArea = CGFloat(markers) * .pi * r * r
                let ratio = cellArea > 0 ? CGFloat(bodyGreen) / cellArea : 0
                rows.append("| \(n) | \(style == .dark ? "داكن" : "فاتح") | \(String(format: "%.3f", Double(greenAll) / Double(w * h) * 100)) | \(String(format: "%.3f", Double(discOfFont))) | \(markers) | \(String(format: "%.3f", Double(ratio))) |")
                if let dir = env["ENDMARK_SNAP_DIR"], let tag = env["ENDMARK_TAG"] {
                    let d = "\(dir)/\(tag)"; try? FileManager.default.createDirectory(atPath: d, withIntermediateDirectories: true)
                    try? UIImage(cgImage: cg, scale: scale, orientation: .up).pngData()?.write(to: URL(fileURLWithPath: "\(d)/page-\(n)-\(style == .dark ? "dark" : "light").png"))
                }
                if !reportOnly {
                    XCTAssertLessThanOrEqual(discOfFont, Self.maxDiscOfFont, "قرص أكبر من \(Self.maxDiscOfFont) من خط النص ص\(n) \(style.rawValue)")
                    XCTAssertGreaterThanOrEqual(discOfFont, Self.minDiscOfFont, "قرص أصغر من \(Self.minDiscOfFont) من خط النص ص\(n) \(style.rawValue)")
                    let pct = Double(greenAll) / Double(w * h) * 100
                    XCTAssertTrue((n != 446 || pct >= Self.minGreenPct) && pct <= Self.maxGreenPct, "نسبة الأخضر \(pct)٪ خارج [\(Self.minGreenPct), \(Self.maxGreenPct)] ص\(n) \(style.rawValue)")
                    XCTAssertLessThanOrEqual(ratio, 1.05, "أخضر خارج خلايا الزخرفة ص\(n) \(style.rawValue)")
                }
            }
            let l1 = lum(UIColor(Sunnah.Colors.mushafIvory), style), l2 = lum(UIColor(Sunnah.Colors.mushafEndDisc), style)
            let cr = (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
            rows.append("| تباين الرقم | \(style == .dark ? "داكن" : "فاتح") | \(String(format: "%.2f", Double(cr))) | | | |")
            if !reportOnly { XCTAssertGreaterThanOrEqual(cr, Self.minContrast, "تباين رقم الآية \(style.rawValue)") }
        }
        let table = rows.joined(separator: "\n"); print("ENDMARK_TABLE\n" + table)
        if let dir = env["ENDMARK_SNAP_DIR"], let tag = env["ENDMARK_TAG"] { try? table.write(toFile: "\(dir)/\(tag)/table.md", atomically: true, encoding: .utf8) }
    }
}
#endif

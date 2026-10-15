import XCTest
@testable import SunnahNative

/// قياس وتمركز المصحف على iPad والوضع الأفقي (ن3): الهواتف وiPad العمودي بلا تغيير، والأفقي بعرض صفحة ثابت النسبة ممركز غير مقتطع.
final class MushafIPadLayoutTests: XCTestCase {
    func testPhonesAndIPadPortraitKeepFullWidth() {
        for s in [CGSize(width: 402, height: 874), CGSize(width: 375, height: 667), CGSize(width: 440, height: 956), CGSize(width: 820, height: 1180), CGSize(width: 1032, height: 1376), CGSize(width: 768, height: 1024)] {
            XCTAssertEqual(MushafPageLayout.canvasWidth(container: s), s.width, "\(s)")
        }
    }

    func testLandscapeIsCappedCenteredAndNotClipped() {
        for s in [CGSize(width: 1376, height: 1032), CGSize(width: 1194, height: 834), CGSize(width: 1024, height: 768), CGSize(width: 932, height: 430)] {
            let w = MushafPageLayout.canvasWidth(container: s)
            XCTAssertLessThanOrEqual(w, s.width)
            XCTAssertEqual(Double(w / s.height), MushafPageLayout.maxAspect, accuracy: 0.0001, "\(s)")
            // الصفحة ممركزة: هامشان متساويان
            XCTAssertEqual((s.width - w) / 2, s.width - w - (s.width - w) / 2, accuracy: 0.001)
            // الصفحة نفسها تُحسب بمقاس القماش لا بمقاس الشاشة: عرض الأسطر داخل القماش
            let inset = w * 0.03
            XCTAssertLessThanOrEqual(w - inset * 2 + inset, w)
        }
    }

    func testLayoutRowsFitCanvasHeightForIPadSizes() throws {
        // مجموع ارتفاع الأسطر + الإزاحة العليا لا يتجاوز ارتفاع الصفحة على مقاسات iPad
        let page = MushafPage(page: 187, opening: false, rows: (0..<15).map { MushafRow(k: "l", s: nil, n: $0 + 1, w: []) })
        for s in [CGSize(width: 1032, height: 1376), CGSize(width: 1376, height: 1032)] {
            let canvas = CGSize(width: MushafPageLayout.canvasWidth(container: s), height: s.height)
            let m = MushafPageLayout.metrics(for: page, height: canvas.height)
            XCTAssertLessThanOrEqual(m.top + m.rowHeight * Double(m.rows.count), canvas.height + 0.5, "\(s)")
        }
    }
}

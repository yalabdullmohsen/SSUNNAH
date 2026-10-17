import XCTest
@testable import SunnahNative

final class SheetAvoidanceTests: XCTestCase {
    private func noOverlap(_ h: CGFloat, _ sheet: CGFloat, _ span: (minY: CGFloat, maxY: CGFloat), _ p: SheetAvoidance.Plan, file: StaticString = #filePath, line: UInt = #line) {
        let v = SheetAvoidance.visibleSpan(span, plan: p)
        if p.sheetOnTop { XCTAssertGreaterThanOrEqual(v.minY, sheet, file: file, line: line) }
        else { XCTAssertLessThanOrEqual(v.maxY, h - sheet, file: file, line: line) }
    }

    func testAyahAboveSheetNeedsNoChange() {
        XCTAssertEqual(SheetAvoidance.plan(pageHeight: 874, ayahMinY: 100, ayahMaxY: 200, sheetHeight: 300), .none)
    }

    func testFirstLineAyahNeverMoves() {
        let h: CGFloat = 874, top = 0.102 * h, row = 0.811 * h / 15
        XCTAssertEqual(SheetAvoidance.plan(pageHeight: h, ayahMinY: top, ayahMaxY: top + row, sheetHeight: 300), .none)
    }

    func testLastLineAyahShiftsUpWithoutOverlap() {
        let h: CGFloat = 874, row = 0.811 * h / 15, top = 0.102 * h
        let span = (minY: top + 14 * row, maxY: top + 15 * row)
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: 300)
        XCTAssertLessThan(p.dy, 0); XCTAssertEqual(p.scale, 1); noOverlap(h, 300, span, p)
    }

    func testMultiLineAyahInLowerHalfUsesTopSheetWhenShiftWouldCutHeader() {
        let h: CGFloat = 874
        let span = (minY: CGFloat(500), maxY: CGFloat(800))
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: 380)
        XCTAssertTrue(p.sheetOnTop || p.dy < 0); noOverlap(h, 380, span, p)
    }

    func testLongAyahFallsBackToScaleAnchoredTop() {
        let h: CGFloat = 874
        let span = (minY: CGFloat(100), maxY: CGFloat(760))
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: 330)
        XCTAssertLessThan(p.scale, 1); XCTAssertGreaterThanOrEqual(p.scale, SheetAvoidance.minScale); noOverlap(h, 330, span, p)
    }

    func testIPadHeightAndLargeDynamicTypeSheet() {
        let h: CGFloat = 1366, row = 0.811 * h / 15, top = 0.102 * h
        for sheet in [320 as CGFloat, 520, 640] {
            let span = (minY: top + 13 * row, maxY: top + 15 * row)
            let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheet)
            noOverlap(h, sheet, span, p)
        }
    }

    func testSurah3Ayah37StyleMultiRowSpansAllRows() {
        let s = SheetAvoidance.ayahSpan(rowIndices: [10, 11, 12], top: 89, rowHeight: 44)
        XCTAssertEqual(s?.minY, 89 + 440); XCTAssertEqual(s?.maxY, 89 + 13 * 44)
        XCTAssertNil(SheetAvoidance.ayahSpan(rowIndices: [], top: 0, rowHeight: 1))
    }

    func testDegenerateInputsAreNoOps() {
        XCTAssertEqual(SheetAvoidance.plan(pageHeight: 0, ayahMinY: 0, ayahMaxY: 10, sheetHeight: 10), .none)
        XCTAssertEqual(SheetAvoidance.plan(pageHeight: 800, ayahMinY: 10, ayahMaxY: 20, sheetHeight: 0), .none)
    }

    /// الآية في أول سطر والشريط العلوي مثبّت: تنزل الصفحة لتبقى الآية تحت الشريط وفوق البطاقة.
    func testFirstLineAyahClearsPinnedTopBar() {
        let h: CGFloat = 874, row = 0.811 * h / 15, top = 0.102 * h, bar: CGFloat = 102, sheet: CGFloat = 300
        let span = (minY: top, maxY: top + row)
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheet, barBottom: bar)
        let v = SheetAvoidance.visibleSpan(span, plan: p)
        XCTAssertGreaterThanOrEqual(v.minY, bar); XCTAssertLessThanOrEqual(v.maxY, h - sheet)
    }

    func testAyahBetweenBarAndSheetNeedsNoChange() {
        XCTAssertEqual(SheetAvoidance.plan(pageHeight: 874, ayahMinY: 200, ayahMaxY: 260, sheetHeight: 300, barBottom: 102), .none)
    }

    func testLastLineAyahClearsBarAndSheet() {
        let h: CGFloat = 874, row = 0.811 * h / 15, top = 0.102 * h, bar: CGFloat = 102, sheet: CGFloat = 300
        let span = (minY: top + 14 * row, maxY: top + 15 * row)
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheet, barBottom: bar)
        let v = SheetAvoidance.visibleSpan(span, plan: p)
        XCTAssertGreaterThanOrEqual(v.minY, bar); XCTAssertLessThanOrEqual(v.maxY, h - sheet)
    }

    /// آية طويلة لا تتسع بين الشريط والبطاقة بلا تصغير: تُصغَّر وتبقى بينهما.
    func testTallAyahScalesBetweenBarAndSheet() {
        let h: CGFloat = 874, bar: CGFloat = 102, sheet: CGFloat = 380
        let span = (minY: CGFloat(150), maxY: CGFloat(560))
        let p = SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheet, barBottom: bar)
        let v = SheetAvoidance.visibleSpan(span, plan: p)
        XCTAssertLessThan(p.scale, 1)
        XCTAssertGreaterThanOrEqual(v.minY, bar); XCTAssertLessThanOrEqual(v.maxY, h - sheet)
    }
}

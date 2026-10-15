import XCTest
@testable import SunnahNative

/// يفشل إن بقي رمز Markdown خام (##، **، - ) في النص الذي تعرضه الشاشات.
final class SunnahMarkdownTests: XCTestCase {
    private let sample = """
    آدم عليه السلام

    ## التعريف والنسب
    آدم عليه السلام — أبو البشر.

    **عن الدورة:**
    دورة علمية سنوية.

    **المتون:**
    - التحرير في أصول الفقه
    - مختصر التحرير

    1. أولًا
    2. ثانيًا

    > اقتباس مُشكَّل: «صُفِيَّ اللَّهِ»
    """

    func testSampleHasRawSyntaxBeforeRenderingAndNoneAfter() {
        XCTAssertTrue(SunnahMarkdown.hasRawSyntax(sample))
        let shown = SunnahMarkdown.renderedPlainText(sample)
        XCTAssertFalse(SunnahMarkdown.hasRawSyntax(shown), "ظهر رمز Markdown خام: \(shown)")
        XCTAssertFalse(shown.contains("##"))
        XCTAssertFalse(shown.contains("**"))
    }

    func testBlocksKindsAndLineBreaks() {
        let b = SunnahMarkdown.blocks(sample)
        XCTAssertTrue(b.contains(.heading(level: 2, text: "التعريف والنسب")))
        XCTAssertTrue(b.contains(.bullet(marker: "•", text: "مختصر التحرير")))
        XCTAssertTrue(b.contains(.bullet(marker: "2.", text: "ثانيًا")))
        XCTAssertTrue(b.contains(.quote("اقتباس مُشكَّل: «صُفِيَّ اللَّهِ»")))
        // سطرا فقرة واحدة يحتفظان بفاصل السطر
        XCTAssertEqual(SunnahMarkdown.blocks("س\nص"), [.paragraph("س\nص")])
    }

    func testDiacriticsAndPlainTextUntouched() {
        let t = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
        XCTAssertEqual(SunnahMarkdown.renderedPlainText(t), t)
    }

    func testHashInsideWordOrWithoutSpaceIsNotHeading() {
        XCTAssertEqual(SunnahMarkdown.blocks("#وسم"), [.paragraph("#وسم")])
    }
}

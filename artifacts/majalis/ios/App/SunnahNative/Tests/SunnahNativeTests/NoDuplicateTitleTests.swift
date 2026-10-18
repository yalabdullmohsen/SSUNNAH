import XCTest
@testable import SunnahNative

/// يمنع تكرار العنوان: شاشة تعرض navigationTitle(X) لا تعرض كذلك AccountHeader(title: X) ظاهرًا.
final class NoDuplicateTitleTests: XCTestCase {
    func testAccountHeaderDoesNotRepeatNavigationTitle() throws {
        let dir = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative/Sections/account")
        let files = try FileManager.default.contentsOfDirectory(atPath: dir.path).filter { $0.hasSuffix(".swift") }
        XCTAssertFalse(files.isEmpty)
        let navRx = try NSRegularExpression(pattern: #"\.(?:navigationTitle|sunnahNavTitle)\("([^"]+)"\)"#)
        let hdrRx = try NSRegularExpression(pattern: #"AccountHeader\([^\n]*?title: "([^"]+)"[^\n]*"#)
        for f in files {
            let s = try String(contentsOf: dir.appendingPathComponent(f), encoding: .utf8)
            let r = NSRange(s.startIndex..., in: s)
            let navs = Set(navRx.matches(in: s, range: r).compactMap { Range($0.range(at: 1), in: s).map { String(s[$0]) } })
            for m in hdrRx.matches(in: s, range: r) {
                guard let t = Range(m.range(at: 1), in: s).map({ String(s[$0]) }), navs.contains(t) else { continue }
                let line = String(s[Range(m.range, in: s)!])
                XCTAssertFalse(line.contains("showsTitle: true"), "\(f): العنوان «\(t)» مكرر مع شريط التنقل")
            }
        }
    }
}

/// قوالب المقال/التفصيل تعرض العنوان في المتن؛ يجب ألا يعرضه شريط التنقل كذلك.
final class NoDuplicateTemplateTitleTests: XCTestCase {
    func testBodyTitleTemplatesDoNotSetNavigationTitleToItemTitle() throws {
        let dir = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative/Templates")
        for f in ["ArticleTemplate.swift", "DetailTemplate.swift"] {
            let s = try String(contentsOf: dir.appendingPathComponent(f), encoding: .utf8)
            XCTAssertTrue(s.contains("Text(item.title)") || s.contains("DetailHero(title: item.title"), f)
            XCTAssertFalse(s.contains(".navigationTitle(item.title)") || s.contains(".sunnahNavTitle(item.title)"), "\(f): عنوان مكرر")
        }
    }
}

final class SourcesRightsTextTests: XCTestCase {
    func testRightsHeadlineIsExact() {
        XCTAssertEqual(AccountTexts.rightsHeadline, "الحقوق غير محفوظة (لوجه الله)")
        XCTAssertTrue(AccountTexts.rightsSentence.contains("غير محفوظة لوجه الله"))
    }
}

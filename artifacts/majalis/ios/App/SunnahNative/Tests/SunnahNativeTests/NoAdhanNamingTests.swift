import XCTest
@testable import SunnahNative

/// قرار المالك: لا ميزة أذان في التطبيق؛ كل ما يخص وقت الصلاة يُسمّى «تنبيهات الصلاة».
/// يفحص كل النصوص الحرفية في مصادر الحزمة (الشاشات والكتالوجات)، ويفشل إن ظهر «أذان»/«الأذان» أو adhan لمستخدم.
@MainActor
final class NoAdhanNamingTests: XCTestCase {
    /// استثناءات موثّقة بسبب ومالك. فارغة عمدًا إلا ما يفرضه الترخيص.
    /// - "adhan-js — Batoul Apps": إسناد مكتبة طرف ثالث بترخيص MIT (شرط الترخيص)، وليس ميزة أو عنوانًا.
    static let exclusions: [String] = ["adhan-js — Batoul Apps"]

    private var sourcesRoot: URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative")
    }

    /// النصوص الحرفية في سطر مع تجاهل التعليقات.
    private func literals(in line: String) -> [String] {
        let code = line.trimmingCharacters(in: .whitespaces)
        if code.hasPrefix("//") || code.hasPrefix("///") { return [] }
        var out: [String] = [], cur = "", inStr = false, esc = false
        for ch in line {
            if inStr {
                if esc { esc = false; cur.append(ch) }
                else if ch == "\\" { esc = true; cur.append(ch) }
                else if ch == "\"" { out.append(cur); cur = ""; inStr = false }
                else { cur.append(ch) }
            } else if ch == "\"" { inStr = true }
        }
        return out
    }

    /// مسار/معرّف تقني (لا يراه المستخدم): يبدأ بـ«/» أو لا مسافة فيه ولا حروف عربية، وليس رابطًا مقروءًا.
    private func isTechnical(_ s: String) -> Bool {
        if s.hasPrefix("/") || s.hasPrefix("http") { return true }
        let hasArabic = s.unicodeScalars.contains { (0x0600...0x06FF).contains($0.value) }
        return !hasArabic && !s.contains(" ")
    }

    func testNoVisibleAdhanNaming() throws {
        let files = FileManager.default.enumerator(at: sourcesRoot, includingPropertiesForKeys: nil)?
            .compactMap { $0 as? URL }.filter { $0.pathExtension == "swift" } ?? []
        XCTAssertGreaterThan(files.count, 100, "لم تُعثر مصادر الحزمة")
        let arabicStems = ["أذان", "الأذان", "الأذانات", "اذان"]
        var hits: [String] = []
        for f in files {
            let text = try String(contentsOf: f, encoding: .utf8)
            for (i, line) in text.components(separatedBy: "\n").enumerated() {
                for lit in literals(in: line) where !Self.exclusions.contains(lit) {
                    let latin = lit.range(of: "adhan", options: .caseInsensitive) != nil && !isTechnical(lit)
                    if arabicStems.contains(where: { lit.contains($0) }) || latin {
                        hits.append("\(f.lastPathComponent):\(i + 1): \(lit.prefix(80))")
                    }
                }
            }
        }
        XCTAssertTrue(hits.isEmpty, "نصوص ظاهرة للمستخدم تذكر الأذان (ممنوع بقرار المالك):\n" + hits.joined(separator: "\n"))
    }

    func testAdhanSettingsRedirectsToNotifications() {
        XCTAssertEqual(RouteResolver.redirects["adhan-settings"], "/notification-settings")
    }

    func testRetiredSubmissionTypeIsHiddenNotCrashing() throws {
        let json = #"[{"id":1,"type":"adhan","title":"قديم","status":"pending","created_at":"2025-01-01T00:00:00Z"}]"#
        let subs = try JSONDecoder().decode([AccountSubmission].self, from: Data(json.utf8))
        XCTAssertEqual(subs.count, 1)
        XCTAssertTrue(AccountSubmission.retiredTypes.contains(subs[0].type))
        XCTAssertNil(AccountSubmission.typeLabel[subs[0].type])
    }
}

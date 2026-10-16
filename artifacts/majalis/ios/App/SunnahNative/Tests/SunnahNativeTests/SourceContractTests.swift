import XCTest

/// عقد المصدر (DATA_CONTRACT.md §«كل سجل ديني يُحلّ إلى مصدر»): السجل الديني يُحلّ إلى مصدر من سجله نفسه (مفتاح مصدر/دليل في أي عمق)
/// أو يرثه من مصدر مستوى الملف. السجلات غير المحلولة تُحصى في `docs/native/source-registry.json` سقفًا لا يُرفع (ratchet):
/// أي سجل جديد بلا مصدر يفشل الاختبار، وأي انخفاض يجب تسجيله بخفض السقف (UPDATE_SOURCE_BASELINE=1 يعيد كتابته).
final class SourceContractTests: XCTestCase {
    static let sourceKeys: Set<String> = ["source", "sources", "source_url", "sourceUrl", "source_origin", "sourceOrigin", "reference", "references",
        "evidences", "evidence", "ref", "ayah", "hadith", "citation", "citations", "book", "narrator", "takhrij", "url", "link", "dalil", "proof", "proofs", "rawi", "muhaddith"]
    static let dirs = ["adhkar", "aqidah", "sirah", "fiqh", "hadith", "learn", "library", "knowledge", "tafsir", "lessons", "quran"]

    struct Registry: Codable { var exempt: [String: String]; var pending: [String: Int]; var editorial: [String: Int]? }

    /// قرار المالك (2026-10-16): السجل الموسوم origin:"editorial" («فائدة من إعداد سُنّة») بلا مصدر عمدًا (حارس G4 يمنع نسبته لمصدر)،
    /// فيُستثنى من سقف غير الموثّق ويُعدّ بسقف مستقل في `editorial` لا يزيد إلا بقرار مكتوب. شرطاه: وسم ظاهر للمستخدم (originLabel) ولا حقل مصدر.
    static func isEditorial(_ x: Any) -> Bool { ((x as? [String: Any])?["origin"] as? String) == "editorial" }

    private var repo: URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
    }

    static func resolves(_ x: Any) -> Bool {
        if let d = x as? [String: Any] {
            for (k, v) in d {
                if sourceKeys.contains(k), !isEmpty(v) { return true }
                if resolves(v) { return true }
            }
        } else if let a = x as? [Any] { return a.contains { resolves($0) } }
        return false
    }
    static func isEmpty(_ v: Any) -> Bool {
        if let s = v as? String { return s.isEmpty }
        if let a = v as? [Any] { return a.isEmpty }
        if let d = v as? [String: Any] { return d.isEmpty }
        return v is NSNull
    }

    /// يعيد [مفتاح "مسار:مصفوفة" : عدد السجلات غير المحلولة]
    func scan(registry: Registry, editorial: inout [String: Int], editorialBad: inout [String]) throws -> [String: Int] {
        let data = repo.appendingPathComponent("ios-native/Data")
        var out: [String: Int] = [:]
        for dir in Self.dirs {
            let base = data.appendingPathComponent(dir)
            guard let en = FileManager.default.enumerator(at: base, includingPropertiesForKeys: nil) else { continue }
            for case let url as URL in en where url.pathExtension == "json" {
                let rel = url.path.replacingOccurrences(of: data.path + "/", with: "")
                if dir == "quran" && url.lastPathComponent.hasPrefix("surah-") { continue }   // نص المصحف محمي
                if registry.exempt[rel] != nil { continue }
                guard let raw = try? Data(contentsOf: url), let obj = try? JSONSerialization.jsonObject(with: raw) else { continue }
                var arrays: [(String, [Any])] = []
                var fileHasSource = false
                if let a = obj as? [Any] { arrays = [("", a)] }
                else if let d = obj as? [String: Any] {
                    fileHasSource = d.contains { Self.sourceKeys.contains($0.key) && !Self.isEmpty($0.value) }
                    arrays = d.compactMap { k, v in (v as? [Any]).flatMap { $0.first is [String: Any] ? (k, $0) : nil } }
                }
                if fileHasSource { continue }   // يرثه كل سجل في الملف
                for (k, a) in arrays {
                    let (ed, rest) = (a.filter(Self.isEditorial), a.filter { !Self.isEditorial($0) })
                    if !ed.isEmpty {
                        editorial["\(rel):\(k)"] = ed.count
                        for r in ed {
                            let d = r as? [String: Any] ?? [:]
                            if ((d["originLabel"] as? String) ?? "").isEmpty || Self.resolves(r) { editorialBad.append("\(rel): \(d["id"] ?? "?")") }
                        }
                    }
                    let miss = rest.filter { ($0 is [String: Any]) && !Self.resolves($0) }.count
                    if miss > 0 { out["\(rel):\(k)"] = miss }
                }
            }
        }
        return out
    }

    func testEveryReligiousRecordResolvesToASource() throws {
        let regURL = repo.appendingPathComponent("docs/native/source-registry.json")
        let data = repo.appendingPathComponent("ios-native/Data")
        try XCTSkipIf(!FileManager.default.fileExists(atPath: data.path), "ios-native/Data غير مُولَّد (bash ios-native/scripts/prepare-data.sh)")
        let reg = try JSONDecoder().decode(Registry.self, from: Data(contentsOf: regURL))
        var editorial: [String: Int] = [:], editorialBad: [String] = []
        let found = try scan(registry: reg, editorial: &editorial, editorialBad: &editorialBad)
        if ProcessInfo.processInfo.environment["UPDATE_SOURCE_BASELINE"] == "1" {
            var r = reg; r.pending = found; r.editorial = reg.editorial ?? editorial
            let enc = JSONEncoder(); enc.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
            try enc.encode(r).write(to: regURL); return
        }
        var bad: [String] = []
        for (k, n) in found where n > (reg.pending[k] ?? 0) { bad.append("\(k): \(n) بلا مصدر (السقف \(reg.pending[k] ?? 0))") }
        for (k, n) in editorial where n > (reg.editorial?[k] ?? 0) { bad.append("\(k): \(n) تحريري (السقف \(reg.editorial?[k] ?? 0))") }
        XCTAssertTrue(editorialBad.isEmpty, "سجل تحريري بلا وسم ظاهر أو يحمل حقل مصدر: \(editorialBad.sorted().prefix(20))")
        XCTAssertTrue(bad.isEmpty, "سجلات دينية بلا مصدر: \(bad.sorted().prefix(20))")
        let stale = reg.pending.filter { (found[$0.key] ?? 0) < $0.value }.map(\.key)
        XCTAssertTrue(stale.isEmpty, "انخفض العدد فعليًا — اخفض السقف بـUPDATE_SOURCE_BASELINE=1: \(stale.sorted().prefix(20))")
    }
}

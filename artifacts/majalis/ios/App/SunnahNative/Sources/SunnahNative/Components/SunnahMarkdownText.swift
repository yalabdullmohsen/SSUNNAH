import SwiftUI

/// كتل Markdown المدعومة: عنوان (# إلى ####)، قائمة نقطية أو مرقّمة، اقتباس، فقرة. الغليظ والمائل والروابط داخل السطر تتولاها AttributedString.
public enum SunnahMarkdownBlock: Equatable {
    case heading(level: Int, text: String)
    case bullet(marker: String, text: String)
    case quote(String)
    case paragraph(String)
}

public enum SunnahMarkdown {
    /// يحلّل نصًّا إلى كتل؛ الأسطر المتتالية من الفقرة الواحدة تبقى بفواصل أسطرها. لا يعدّل حرفًا من النص العربي ولا تشكيله.
    public static func blocks(_ source: String) -> [SunnahMarkdownBlock] {
        var out: [SunnahMarkdownBlock] = []
        var para: [String] = []
        func flush() { if !para.isEmpty { out.append(.paragraph(para.joined(separator: "\n"))); para = [] } }
        for raw in source.replacingOccurrences(of: "\r\n", with: "\n").components(separatedBy: "\n") {
            let line = raw.trimmingCharacters(in: .whitespaces)
            if line.isEmpty { flush(); continue }
            if let h = heading(line) { flush(); out.append(h); continue }
            if line.hasPrefix(">") {
                flush(); out.append(.quote(String(line.dropFirst()).trimmingCharacters(in: .whitespaces))); continue
            }
            if let b = bullet(line) { flush(); out.append(b); continue }
            para.append(line)
        }
        flush()
        return out
    }

    private static func heading(_ line: String) -> SunnahMarkdownBlock? {
        let hashes = line.prefix(while: { $0 == "#" }).count
        guard (1...6).contains(hashes), line.dropFirst(hashes).first == " " else { return nil }
        return .heading(level: hashes, text: line.dropFirst(hashes).trimmingCharacters(in: .whitespaces))
    }

    private static func bullet(_ line: String) -> SunnahMarkdownBlock? {
        for p in ["- ", "* ", "• "] where line.hasPrefix(p) {
            return .bullet(marker: "•", text: String(line.dropFirst(2)).trimmingCharacters(in: .whitespaces))
        }
        let digits = line.prefix(while: { $0.isNumber })
        if !digits.isEmpty, line.dropFirst(digits.count).hasPrefix(". ") || line.dropFirst(digits.count).hasPrefix(") ") {
            return .bullet(marker: String(digits) + ".", text: String(line.dropFirst(digits.count + 2)).trimmingCharacters(in: .whitespaces))
        }
        return nil
    }

    /// أقسام للطيّ: كل قسم عنوان (مستوى ≤ 3) وما يتبعه؛ ما قبل أول عنوان «مقدمة» لا تُطوى.
    /// القسم الذي فيه نص شرعي (اقتباس، أو علامة آية/حديث/أثر/مصدر في عنوانه أو متنه) محمي: لا يُطوى ولا يُخفى أبدًا.
    public static func sections(_ source: String) -> [SunnahMarkdownSection] {
        var out: [SunnahMarkdownSection] = []
        var cur: [SunnahMarkdownBlock] = []
        var head: (Int, String)? = nil
        func close() {
            if head == nil && cur.isEmpty { return }
            out.append(SunnahMarkdownSection(id: out.count, headingLevel: head?.0, headingText: head?.1, blocks: cur))
            cur = []
        }
        for b in blocks(source) {
            if case .heading(let l, let t) = b, l <= 3 { close(); head = (l, t) } else { cur.append(b) }
        }
        close()
        // لا تُترك الصفحة كلها مطوية: إن لم يبقَ ما هو ظاهر يُفتح أول قسم قابل للطيّ.
        if !out.contains(where: { !$0.startsCollapsed }), let i = out.firstIndex(where: { $0.isCollapsible }) { out[i].forceOpen = true }
        return out
    }

    /// علامات النص الشرعي ومصدره (فحص متحفّظ: أي مطابقة تحمي القسم).
    static let protectedMarkers = ["﴿", "﴾", "﷽", "ﷺ", "رواه", "أخرجه", "متفق عليه", "قال الله", "قال تعالى", "قال رسول", "قال النبي",
                                   "رضي الله", "صلى الله عليه", "حديث", "آية", "الآية", "أثر", "سورة", "الدليل", "دليل", "المصدر", "مصادر", "المراجع", "مرجع"]

    /// تحليل داخل السطر؛ عند الفشل يُعاد النص كما هو.
    public static func inline(_ s: String) -> AttributedString {
        let o = AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace)
        return (try? AttributedString(markdown: s, options: o)) ?? AttributedString(s)
    }

    /// هل بقي في النص المعروض رمز Markdown خام؟ (عنوان في أول سطر، أو ** / __ ، أو سطر قائمة بـ- أو *). يستعمله الاختبار.
    public static func hasRawSyntax(_ s: String) -> Bool {
        if s.contains("**") || s.contains("__") { return true }
        return s.components(separatedBy: "\n").contains { l in
            let t = l.trimmingCharacters(in: .whitespaces)
            return heading(t) != nil || t.hasPrefix("- ") || t.hasPrefix("* ")
        }
    }

    /// النص الظاهر بعد العرض: كتل بلا رموزها + السطر الداخلي بلا علاماته. (نفس ما يعرضه SunnahMarkdownText.)
    public static func renderedPlainText(_ source: String) -> String {
        blocks(source).map { b -> String in
            switch b {
            case .heading(_, let t), .quote(let t), .paragraph(let t): return String(inline(t).characters)
            case .bullet(let m, let t): return m + " " + String(inline(t).characters)
            }
        }.joined(separator: "\n")
    }
}

public struct SunnahMarkdownSection: Identifiable, Equatable {
    public let id: Int
    public let headingLevel: Int?
    public let headingText: String?
    public let blocks: [SunnahMarkdownBlock]
    public var forceOpen = false

    init(id: Int, headingLevel: Int?, headingText: String?, blocks: [SunnahMarkdownBlock]) {
        self.id = id; self.headingLevel = headingLevel; self.headingText = headingText; self.blocks = blocks
    }

    var text: String { SunnahMarkdown.renderedPlainText(blocksAsSource) }
    private var blocksAsSource: String { blocks.map { b -> String in
        switch b { case .heading(_, let t), .quote(let t), .paragraph(let t): return t; case .bullet(_, let t): return t } }.joined(separator: "\n") }

    /// محمي: فيه اقتباس أو علامة نص شرعي/مصدر.
    public var isProtected: Bool {
        if blocks.contains(where: { if case .quote = $0 { return true }; return false }) { return true }
        let hay = (headingText ?? "") + "\n" + blocksAsSource
        return SunnahMarkdown.protectedMarkers.contains { hay.contains($0) }
    }
    public var isCollapsible: Bool { headingText != nil && !isProtected }
    public var isLong: Bool { text.count > 320 || blocks.count > 4 }
    /// القسم الطويل القابل للطيّ يبدأ مطويًّا؛ القصير والمحمي والمقدمة مفتوحة.
    public var startsCollapsed: Bool { isCollapsible && isLong && !forceOpen }
    var allBlocks: [SunnahMarkdownBlock] { headingText.map { [.heading(level: headingLevel ?? 2, text: $0)] + blocks } ?? blocks }
}

/// عرض نص Markdown بتشكيل عربي سليم: كل فقرة/بند عبر SunnahArabicText (تباعد أسطر نسبي وDynamic Type)، والعناوين بخط القسم.
public struct SunnahMarkdownText: View {
    private let blocks: [SunnahMarkdownBlock]
    private let style: SunnahArabicText.Style

    public init(_ source: String, style: SunnahArabicText.Style = .body) {
        self.blocks = SunnahMarkdown.blocks(source)
        self.style = style
    }

    public var body: some View { SunnahMarkdownBlocksView(blocks: blocks, style: style) }
}

/// نص Markdown بأقسام قابلة للطيّ (القوالب فقط). `key` يميّز حالة الطيّ داخل الجلسة (معرّف العنصر).
public struct SunnahSectionedMarkdown: View {
    let sections: [SunnahMarkdownSection]; let style: SunnahArabicText.Style; let key: String
    public init(_ source: String, key: String, style: SunnahArabicText.Style = .body) {
        self.sections = SunnahMarkdown.sections(source); self.style = style; self.key = key
    }
    public init(sections: [SunnahMarkdownSection], key: String, style: SunnahArabicText.Style = .body) {
        self.sections = sections; self.style = style; self.key = key
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            ForEach(sections) { SunnahSectionView(section: $0, key: key, style: style) }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

public struct SunnahSectionView: View {
    let section: SunnahMarkdownSection; let key: String; let style: SunnahArabicText.Style
    public init(section: SunnahMarkdownSection, key: String, style: SunnahArabicText.Style = .body) {
        self.section = section; self.key = key; self.style = style
    }
    public var body: some View {
        if let h = section.headingText, section.isCollapsible {
            SunnahCollapsibleSection(id: "\(key)#\(section.id)", title: h, startsCollapsed: section.startsCollapsed) {
                SunnahMarkdownBlocksView(blocks: section.blocks, style: style)
            }
        } else {
            SunnahMarkdownBlocksView(blocks: section.allBlocks, style: style)
        }
    }
}

struct SunnahMarkdownBlocksView: View {
    let blocks: [SunnahMarkdownBlock]
    let style: SunnahArabicText.Style

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            ForEach(Array(blocks.enumerated()), id: \.offset) { _, b in
                switch b {
                case .heading(let level, let t):
                    Text(SunnahMarkdown.inline(t))
                        .font(level <= 2 ? Sunnah.Typography.sectionTitle : Sunnah.Typography.body.weight(.bold))
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .accessibilityAddTraits(.isHeader)
                case .bullet(let m, let t):
                    HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s2) {
                        Text(m).font(style.font).foregroundStyle(Sunnah.Colors.primary)
                        SunnahArabicText(markdown: t, style: style).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                case .quote(let t):
                    SunnahArabicText(markdown: t, style: style).foregroundStyle(Sunnah.Colors.textSecondary)
                        .padding(.leading, Sunnah.Spacing.s3)
                        .overlay(alignment: .leading) { Rectangle().fill(Sunnah.Colors.primary.opacity(0.4)).frame(width: 3) }
                case .paragraph(let t):
                    SunnahArabicText(markdown: t, style: style).foregroundStyle(Sunnah.Colors.textPrimary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

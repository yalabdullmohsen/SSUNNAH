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

/// عرض نص Markdown بتشكيل عربي سليم: كل فقرة/بند عبر SunnahArabicText (تباعد أسطر نسبي وDynamic Type)، والعناوين بخط القسم.
public struct SunnahMarkdownText: View {
    private let blocks: [SunnahMarkdownBlock]
    private let style: SunnahArabicText.Style

    public init(_ source: String, style: SunnahArabicText.Style = .body) {
        self.blocks = SunnahMarkdown.blocks(source)
        self.style = style
    }

    public var body: some View {
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

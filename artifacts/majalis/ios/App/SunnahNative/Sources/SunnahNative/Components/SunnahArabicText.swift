import SwiftUI

/// نص عربي شرعي مشكّل (آية، حديث، دعاء، ذكر، تفسير، مقال): تباعد أسطر نسبي لحجم الخط (0.5 من الحجم، و0.6 مع تشكيل كثيف)،
/// وارتفاع غير مقصوص (`fixedSize` رأسيًا) فلا تتلاصق الأسطر ولا تُقصّ علامات التشكيل. لا `lineLimit` ولا ارتفاع ثابت.
/// اللون من المستدعي (`.foregroundStyle`). لا يُستعمل لنص المصحف نفسه (خطوط QPC في قارئ المصحف).
public struct SunnahArabicText: View {
    public enum Style {
        case body, hadith, quran, reading
        var font: Font {
            switch self {
            case .body: return Sunnah.Typography.body
            case .hadith: return Sunnah.Typography.hadith
            case .quran: return Sunnah.Typography.quran
            case .reading: return Sunnah.Typography.reading
            }
        }
        /// الحجم الأساسي ونمط Dynamic Type المقابل (يطابق Sunnah.Typography).
        var base: (size: CGFloat, relativeTo: Font.TextStyle) {
            switch self {
            case .body: return (16, .body)
            case .hadith: return (19, .body)
            case .quran: return (24, .title3)
            case .reading: return (18, .body)
            }
        }
    }

    private let text: String
    private let attributed: AttributedString?
    private let style: Style
    @ScaledMetric private var size: CGFloat

    public init(_ text: String, style: Style = .reading) {
        self.text = text
        self.attributed = nil
        self.style = style
        _size = ScaledMetric(wrappedValue: style.base.size, relativeTo: style.base.relativeTo)
    }

    /// فقرة Markdown داخل السطر (غليظ/مائل/روابط) بالتنسيق العربي نفسه.
    public init(markdown: String, style: Style = .reading) {
        self.text = markdown
        self.attributed = SunnahMarkdown.inline(markdown)
        self.style = style
        _size = ScaledMetric(wrappedValue: style.base.size, relativeTo: style.base.relativeTo)
    }

    /// كثافة التشكيل: نسبة علامات الحركات إلى الحروف.
    static func isDense(_ s: String) -> Bool {
        var marks = 0, letters = 0
        for u in s.unicodeScalars {
            switch u.value {
            case 0x064B...0x065F, 0x0670: marks += 1
            case 0x0621...0x064A: letters += 1
            default: break
            }
        }
        return letters > 0 && Double(marks) / Double(letters) > 0.5
    }

    static func lineSpacing(size: CGFloat, dense: Bool) -> CGFloat { size * (dense ? 0.6 : 0.5) }

    public var body: some View {
        Text(attributed ?? AttributedString(text))
            .font(style.font)
            .lineSpacing(Self.lineSpacing(size: size, dense: Self.isDense(text)))
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

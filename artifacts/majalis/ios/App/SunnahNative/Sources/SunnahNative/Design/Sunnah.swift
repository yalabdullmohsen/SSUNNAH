import SwiftUI

/// رموز «سُنّة» البصرية للحزمة — مطابقة لـ App/Design/SunnahTokens.swift. المصدر الوحيد للقيم في Templates/Components/Generated.
public enum Sunnah {
    public enum Spacing {
        public static let s1: CGFloat = 4, s2: CGFloat = 8, s3: CGFloat = 12, s4: CGFloat = 16
        public static let s5: CGFloat = 20, s6: CGFloat = 24, s7: CGFloat = 32
        public static let pageX: CGFloat = 16
        public static let touch: CGFloat = 44
        public static let buttonHeight: CGFloat = 52
        public static let progress: CGFloat = 8
        public static let icon: CGFloat = 24
        public static let cardMinWidth: CGFloat = 150
        public static let hairline: CGFloat = 1
    }

    public enum Radius {
        public static let small: CGFloat = 16
        public static let card: CGFloat = 26
        public static let hero: CGFloat = 28
        public static let pill: CGFloat = 999
    }

    public enum Colors {
        // السمة «أخضر عاجي» (مرجع design/Themes) — الليلي بحسب أمر 14 أكتوبر 2026. الخلفية الفاتحة أبيض مائل للأخضر بدل البيج (قرار المالك 2026-10-20).
        public static let bg = dynamic(light: 0xF1F4F1, dark: 0x0F1A15)
        public static let surface = dynamic(light: 0xFFFFFF, dark: 0x17251E)
        public static let surface2 = dynamic(light: 0xE9EFEA, dark: 0x1E2E26)
        public static let border = dynamic(light: 0xDCE5DE, dark: 0x23332B)
        public static let beige = dynamic(light: 0xEFE6D4, dark: 0x1E2E26)
        public static let primary = dynamic(light: 0x1F5C45, dark: 0x6FBE9C)
        public static let primaryStrong = dynamic(light: 0x123B2C, dark: 0x1F5C46)
        /// خلفية البطاقات الغامقة ذات النص الأبيض (الترويسة والدرج): ثابتة في الوضعين ليبقى التباين ≥ 4.5.
        public static let heroTop = dynamic(light: 0x1F5C46, dark: 0x1F5C46)
        /// حبر فوق الترويسة الخضراء (عنوان الشريط وشريط الحالة والعناوين): أبيض ثابت في الوضعين، تباينه ≥ 4.5 على `primaryStrong`.
        public static let onHero = Color.white
        /// لون `primaryStrong` محلولًا لنمط معيّن (لشريط التنقل الذي يُجبَر على النمط الداكن فتنقلب قيم dynamic).
        public static func primaryStrongResolved(dark: Bool) -> Color {
            let v: UInt32 = dark ? 0x1F5C46 : 0x123B2C
            return Color(red: Double((v >> 16) & 0xFF) / 255, green: Double((v >> 8) & 0xFF) / 255, blue: Double(v & 0xFF) / 255)
        }
        /// البطاقة الخضراء الكبيرة في النموذج ٢ (#24523F) — مسطّحة بلا تدرّج.
        public static let hero = dynamic(light: 0x24523F, dark: 0x1F5C46)
        /// خلفية أيقونة ذهبية فاتحة ونصها (النموذج ٢): #F3EBD5 / #6E5413.
        public static let goldTile = dynamic(light: 0xF3EBD5, dark: 0x3A3320)
        public static let goldInk = dynamic(light: 0x6E5413, dark: 0xD9C089)
        public static let heroBottom = dynamic(light: 0x123B2C, dark: 0x123B2C)
        /// نص فوق ذهب البطاقة الخضراء (كبسولة «بعد … س»): داكن في الوضعين، تباين ≥ ٤٫٥:١ على #D9C089.
        public static let onHeroGold = dynamic(light: 0x3B2D05, dark: 0x3B2D05)
        public static let heroGold = dynamic(light: 0xE3CE9A, dark: 0xE3CE9A)
        public static let primarySoft = dynamic(light: 0xE6EFE9, dark: 0x1B2F26)
        /// ذهبي للنصوص، وذهبي للزخرفة، وذهبي فاتح (أزرار ثانوية).
        public static let gold = dynamic(light: 0x7A5F28, dark: 0xD9C089)
        /// لون محيط صفحة المصحف (ترويسة، علامة نهاية الآية، الصفحة): أخضر هادئ؛ الداكن درجة أفتح بتباين ≥ 4.5:1.
        public static let mushafAccent = dynamic(light: 0x44705A, dark: 0x8FBFA6)
        /// قرص نهاية الآية: فاتحًا أغمق قليلًا من mushafAccent ليبلغ تباين رقم الآية العاجي ≥ 4.5:1 (كان 3.7:1)؛ الداكن كما هو (7.3:1).
        public static let mushafEndDisc = dynamic(light: 0x4A7560, dark: 0x8FBFA6)
        /// ورق صفحة المصحف (مرجع التصميم الجديد): عاجي دافئ فاتحًا، ونفس الخلفية الليلية داكنًا.
        /// قرار المالك: ورق داكن بنص فاتح وضعًا ليليًا مقبولًا؛ الفاتح يبقى #FFFBF7. اللونان رمزان صريحان.
        public static let mushafPaperLightHex: UInt32 = 0xFFFBF7
        public static let mushafPaperDarkHex: UInt32 = 0x0F1A15
        public static let mushafPaperLight = dynamic(light: mushafPaperLightHex, dark: mushafPaperLightHex)
        public static let mushafPaperDark = dynamic(light: mushafPaperDarkHex, dark: mushafPaperDarkHex)
        public static let mushafPaper = dynamic(light: mushafPaperLightHex, dark: mushafPaperDarkHex)
        /// لافتة السورة وخرطوشة الصفحة (مرجع التصميم): سلوي عاجي، سلطع أخضر، ذهبي بُنّي هادئ، حبر أخضر.
        public static let mushafIvory = dynamic(light: 0xFBF6EA, dark: 0x1A2A22)
        public static let mushafSage = dynamic(light: 0x9EB7A4, dark: 0x2F4A3B)
        /// ذهبي زخرفة لافتة السورة (أصل متجهي): #D6BE8C.
        public static let mushafGold = dynamic(light: 0xD6BE8C, dark: 0xD6BE8C)
        public static let mushafGoldBrown = dynamic(light: 0xB5A177, dark: 0xB5A177)
        public static let mushafInk = dynamic(light: 0x265440, dark: 0xCFE3D6)
        /// حبر نص المصحف كالمطبوع: أسود فاتحًا، عاجي داكنًا (قرار المالك: «نفس لون الخط» في المرجع).
        public static let mushafText = dynamic(light: 0x000000, dark: 0xEDE6D6)
        /// علامة نهاية الآية (قرار المالك 2026-10-20: هوية المصحف الخضراء بحجم المطبوع): إطار وزخارف أخضر، وحشوة خضراء فاتحة؛ الرقم بـmushafText (تباين ≥ 4.5:1).
        /// قرار المالك: إطار زخرفة رقم الآية = إطار لافتة السورة تمامًا (فاتحًا وداكنًا): اسم مستعار لـmushafAccent لا قيمة مستقلة.
        public static let mushafEndGold = mushafAccent
        /// قرار المالك (2026-10-22): داخل الزخرفة أخضر سُنّة (فاتحًا = mushafAccent نفسه، داكنًا أخضر أعمق ليتميّز عن الإطار الفاتح) ورقم الآية عاجي.
        public static let mushafEndFill = dynamic(light: 0x44705A, dark: 0x2E5944)
        /// رقم الآية داخل الزخرفة: عاجي، تباين ≥ 4.5 على الحشوة الخضراء فاتحًا وداكنًا.
        public static let mushafEndDigits = dynamic(light: 0xF6F0DE, dark: 0xF1EBDA)
        public static let goldDeco = dynamic(light: 0xB08D4A, dark: 0xD9C089)
        public static let goldSoft = dynamic(light: 0xD9C089, dark: 0x3A3320)
        public static let textPrimary = dynamic(light: 0x17241E, dark: 0xEFECE2)
        public static let textSecondary = dynamic(light: 0x5B6660, dark: 0xBDB9AA)
        public static let textOnPrimary = dynamic(light: 0xF7F4EC, dark: 0xF4F1E8)
        public static let danger = dynamic(light: 0xB0352B, dark: 0xEF8B80)
        /// مفتاح مطفأ (Toggle).
        /// «يحتاج مراجعة» في خريطة الحفظ (برتقالي).
        public static let hifzReview = dynamic(light: 0xA3510F, dark: 0xF0A25E)
        public static let switchOff = dynamic(light: 0xD8D2C4, dark: 0x2B3B33)
        /// درجات الحديث: خلفية فاتحة وحبر بتباين ≥ 4.5 (صحيح أخضر، ضعيف أحمر، موضوع برتقالي).
        public static let gradeSahihBg = dynamic(light: 0xE3F1E8, dark: 0x1B3328)
        public static let gradeSahihInk = dynamic(light: 0x1F5C45, dark: 0x8FD1B1)
        public static let gradeDaifBg = dynamic(light: 0xFAE6E3, dark: 0x3A2220)
        public static let gradeDaifInk = dynamic(light: 0x9C2B22, dark: 0xF0A59C)
        public static let gradeMawduBg = dynamic(light: 0xFBEBD6, dark: 0x3A2C18)
        public static let gradeMawduInk = dynamic(light: 0x8A4B0F, dark: 0xF0C48A)

        private static func dynamic(light: UInt32, dark: UInt32) -> Color {
            #if canImport(UIKit)
            Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
            #else
            Color(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(hex: dark) : NSColor(hex: light) })
            #endif
        }
    }

    /// حركة خفيفة تحترم «تقليل الحركة»، وارتجاج لمسي موحّد.
    public enum Motion {
        public static var reduced: Bool {
            #if canImport(UIKit)
            UIAccessibility.isReduceMotionEnabled
            #else
            false
            #endif
        }
        public static let standard = Animation.easeInOut(duration: 0.2)
    }

    @MainActor public enum Haptics {
        public static func select() {
            #if canImport(UIKit) && !os(watchOS)
            UISelectionFeedbackGenerator().selectionChanged()
            #endif
        }
        /// اكتمال (آخر عدّة في ذكر…).
        public static func success() {
            #if canImport(UIKit) && !os(watchOS)
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            #endif
        }
    }

    /// 6 مستويات فقط، مرتبطة بـ Dynamic Type.
    public enum Typography {
        public static var pageTitle: Font { AppearancePrefs.ui(.extraBold, 28, .title) }
        public static var sectionTitle: Font { AppearancePrefs.ui(.bold, 20, .title3) }
        public static var cardTitle: Font { AppearancePrefs.ui(.bold, 17, .headline) }
        public static var body: Font { AppearancePrefs.ui(.regular, 16, .body) }
        public static var secondary: Font { AppearancePrefs.ui(.regular, 14, .subheadline) }
        public static var tag: Font { AppearancePrefs.ui(.bold, 12, .caption) }
        /// نصوص شرعية بخط Amiri: الآية والحديث/الأثر (خط المصحف QPC غير مضمَّن بانتظار قرار الترخيص).
        public static let quran = Font.custom("Amiri-Regular", size: 24, relativeTo: .title3)
        /// القراءة الطويلة (أحاديث، قصص الأنبياء، شروح، مقالات): Amiri — خط نسخ كتبي احترافي (قرار المالك 2026-10-20 بدل Noto Naskh).
        public static let hadith = Font.custom("Amiri-Regular", size: 21, relativeTo: .body)
        /// قراءة الحديث بخط Amiri (قرار المالك 2026-10-20).
        public static let amiriReading = Font.custom("Amiri-Regular", size: 22, relativeTo: .title3)
        public static let reading = Font.custom("Amiri-Regular", size: 20, relativeTo: .body)
        public static let readingBold = Font.custom("Amiri-Bold", size: 20, relativeTo: .body)
    }
}

/// يُنفّذ التغيير بحركة قياسية، أو فورًا عند تفعيل «تقليل الحركة».
@discardableResult
public func sunnahAnimate<R>(_ body: () throws -> R) rethrows -> R {
    try withAnimation(Sunnah.Motion.reduced ? nil : Sunnah.Motion.standard, body)
}

public extension View {
    /// ظل البطاقة: خفيف في الفاتح، بلا ظل في الداكن (الحدّ يكفي).
    func sunnahElevation() -> some View { modifier(SunnahElevation()) }
}

private struct SunnahElevation: ViewModifier {
    @Environment(\.colorScheme) private var scheme
    func body(content: Content) -> some View {
        content.shadow(color: scheme == .dark ? .clear : .black.opacity(0.06), radius: 8, y: 2)
    }
}

#if canImport(UIKit)
private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}
#else
private extension NSColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}
#endif

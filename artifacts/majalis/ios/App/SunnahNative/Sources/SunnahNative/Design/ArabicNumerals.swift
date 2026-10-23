import Foundation

/// الدالة الوحيدة لتحويل الأرقام اللاتينية إلى الهندية (٠–٩) في نصوص الواجهة.
/// كل نص واجهي يحوي رقمًا يمرّ بها؛ يفرض ذلك `scripts/native-arabic-digits-guard.sh`.
import SunnahPrayer

public enum ArabicNumerals {

    /// يحوّل كل رقم لاتيني داخل النص ("36:1" ← "٣٦:١") ويترك ما سواه.
    public static func convert(_ s: String) -> String {
        isolateRatios(PrayerTimeFormat.arabicDigits(s))
    }

    /// قاعدة عامة للأرقام المركّبة: «١ / ٤» يُعزل اتجاهيًا (LRI…PDI) فيُقرأ بترتيبه الكتابي في RTL ولا ينعكس إلى «٤ / ١».
    static func isolateRatios(_ s: String) -> String {
        guard s.contains("/") else { return s }
        let d = "[٠-٩0-9]"
        return s.replacingOccurrences(of: "\(d)+ ?/ ?\(d)+", with: "\u{2066}$0\u{2069}", options: .regularExpression)
    }
    public static func string(_ n: Int) -> String { convert(String(n)) }
}

public extension String { var arabicDigits: String { ArabicNumerals.convert(self) } }
public extension Int { var arabicDigits: String { ArabicNumerals.string(self) } }

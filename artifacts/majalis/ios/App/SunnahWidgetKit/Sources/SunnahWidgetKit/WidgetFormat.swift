import Foundation

/// تنسيق موحّد لنصوص الودجات: أرقام هندية، ووحدات، وجمع عربي صحيح.
public enum WidgetFormat {
    private static let indic: [Character] = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

    public static func digits(_ value: Int) -> String {
        String(String(value).map { ch -> Character in
            guard let d = ch.wholeNumberValue, d >= 0, d <= 9 else { return ch }
            return indic[d]
        })
    }

    /// ١ يوم، ٢ يومان، ٣–١٠ أيام، ١١ فأكثر يومًا.
    public static func days(_ count: Int) -> String {
        let n = max(0, count)
        switch n {
        case 2: return "\(digits(n)) يومان"
        case 3...10: return "\(digits(n)) أيام"
        case 11...: return "\(digits(n)) يومًا"
        default: return "\(digits(n)) يوم"
        }
    }

    /// مدة ثابتة للعرض: «٣ س ١٢ د» أو «٤٥ د».
    public static func duration(seconds: Int) -> String {
        let minutes = max(0, seconds) / 60
        let hours = minutes / 60
        if hours > 0 { return "\(digits(hours)) س \(digits(minutes % 60)) د" }
        return "\(digits(minutes)) د"
    }
}

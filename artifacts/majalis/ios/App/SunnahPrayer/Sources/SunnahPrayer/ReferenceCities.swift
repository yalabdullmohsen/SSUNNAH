import Foundation

/// مدن مضمّنة لاختيار الموقع دون اتصال ودون إذن الموقع.
public enum ReferenceCities {
    public static let all: [PrayerLocation] = [
        city("مدينة الكويت", 29.3759, 47.9774, "Asia/Kuwait"),
        city("الجهراء", 29.3375, 47.6581, "Asia/Kuwait"),
        city("الأحمدي", 29.0769, 48.0838, "Asia/Kuwait"),
        city("مكة المكرمة", 21.4225, 39.8262, "Asia/Riyadh"),
        city("المدينة المنورة", 24.4672, 39.6111, "Asia/Riyadh"),
        city("الرياض", 24.7136, 46.6753, "Asia/Riyadh"),
        city("جدة", 21.5433, 39.1728, "Asia/Riyadh"),
        city("الدمام", 26.4207, 50.0888, "Asia/Riyadh"),
        city("بريدة", 26.3592, 43.9818, "Asia/Riyadh"),
        city("المنامة", 26.2285, 50.5860, "Asia/Bahrain"),
        city("الدوحة", 25.2854, 51.5310, "Asia/Qatar"),
        city("أبوظبي", 24.4539, 54.3773, "Asia/Dubai"),
        city("دبي", 25.2048, 55.2708, "Asia/Dubai"),
        city("مسقط", 23.5880, 58.3829, "Asia/Muscat"),
        city("عمّان", 31.9539, 35.9106, "Asia/Amman"),
        city("القدس", 31.7683, 35.2137, "Asia/Jerusalem"),
        city("دمشق", 33.5138, 36.2765, "Asia/Damascus"),
        city("بيروت", 33.8938, 35.5018, "Asia/Beirut"),
        city("بغداد", 33.3152, 44.3661, "Asia/Baghdad"),
        city("القاهرة", 30.0444, 31.2357, "Africa/Cairo"),
        city("الخرطوم", 15.5007, 32.5599, "Africa/Khartoum"),
        city("تونس", 36.8065, 10.1815, "Africa/Tunis"),
        city("الجزائر", 36.7538, 3.0588, "Africa/Algiers"),
        city("الدار البيضاء", 33.5731, -7.5898, "Africa/Casablanca"),
        city("إسطنبول", 41.0082, 28.9784, "Europe/Istanbul"),
        city("لندن", 51.5074, -0.1278, "Europe/London"),
        city("باريس", 48.8566, 2.3522, "Europe/Paris"),
        city("نيويورك", 40.7128, -74.0060, "America/New_York"),
        city("كوالالمبور", 3.1390, 101.6869, "Asia/Kuala_Lumpur"),
        city("جاكرتا", -6.2088, 106.8456, "Asia/Jakarta")
    ]

    /// بحث بالاسم بعد تطبيع الهمزات والتاء المربوطة والتشكيل.
    public static func search(_ query: String) -> [PrayerLocation] {
        let q = normalize(query)
        guard !q.isEmpty else { return all }
        return all.filter { normalize($0.label).contains(q) }
    }

    static func normalize(_ text: String) -> String {
        var s = text.trimmingCharacters(in: .whitespacesAndNewlines)
        s = s.unicodeScalars.filter { !(0x064B...0x0652).contains($0.value) && $0.value != 0x0640 }.map(String.init).joined()
        for (from, to) in [("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ة", "ه"), ("ى", "ي")] {
            s = s.replacingOccurrences(of: from, with: to)
        }
        return s
    }

    private static func city(_ label: String, _ lat: Double, _ lon: Double, _ tz: String) -> PrayerLocation {
        PrayerLocation(label: label, latitude: lat, longitude: lon, timeZoneIdentifier: tz)
    }
}

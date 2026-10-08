import Foundation

/// طرق الحساب بمعرّفات الويب نفسها (`PrayerCalcMethodId` في src/lib/prayer-calc-prefs.ts).
public enum PrayerMethod: String, Codable, CaseIterable, Sendable {
    case kuwait = "Kuwait"
    case ummAlQura = "UmmAlQura"
    case muslimWorldLeague = "MuslimWorldLeague"
    case egyptian = "Egyptian"
    case northAmerica = "NorthAmerica"
    case karachi = "Karachi"
    case dubai = "Dubai"
    case turkey = "Turkey"
    case qatar = "Qatar"
    case singapore = "Singapore"
    case tehran = "Tehran"
    case franceUOIF = "FranceUOIF"
    case moonsightingCommittee = "MoonsightingCommittee"
}

public enum PrayerMadhab: String, Codable, Sendable {
    case shafi = "Shafi"
    case hanafi = "Hanafi"
}

public enum HighLatitudeOption: String, Codable, Sendable {
    case auto
    case middleOfTheNight = "MiddleOfTheNight"
    case seventhOfTheNight = "SeventhOfTheNight"
    case twilightAngle = "TwilightAngle"
}

/// تعديل يدوي بالدقائق لكل وقت.
public struct PrayerMinuteAdjustments: Codable, Hashable, Sendable {
    public var fajr = 0, sunrise = 0, dhuhr = 0, asr = 0, maghrib = 0, isha = 0

    public init(fajr: Int = 0, sunrise: Int = 0, dhuhr: Int = 0, asr: Int = 0, maghrib: Int = 0, isha: Int = 0) {
        (self.fajr, self.sunrise, self.dhuhr, self.asr, self.maghrib, self.isha) = (fajr, sunrise, dhuhr, asr, maghrib, isha)
    }
}

/// إعدادات الحساب؛ الافتراضي مطابق للويب (الكويت، شافعي، خطوط عرض تلقائية).
public struct PrayerSettings: Codable, Hashable, Sendable {
    public var method: PrayerMethod
    public var madhab: PrayerMadhab
    public var highLatitude: HighLatitudeOption
    public var adjustments: PrayerMinuteAdjustments

    public init(
        method: PrayerMethod = .kuwait,
        madhab: PrayerMadhab = .shafi,
        highLatitude: HighLatitudeOption = .auto,
        adjustments: PrayerMinuteAdjustments = PrayerMinuteAdjustments()
    ) {
        self.method = method
        self.madhab = madhab
        self.highLatitude = highLatitude
        self.adjustments = adjustments
    }
}

/// موقع الحساب: إحداثيات ومنطقة زمنية (مستقلة عن منطقة الجهاز).
public struct PrayerLocation: Codable, Hashable, Sendable {
    public var label: String
    public var latitude: Double
    public var longitude: Double
    public var timeZoneIdentifier: String

    public init(label: String, latitude: Double, longitude: Double, timeZoneIdentifier: String) {
        self.label = label
        self.latitude = latitude
        self.longitude = longitude
        self.timeZoneIdentifier = timeZoneIdentifier
    }

    public var timeZone: TimeZone { TimeZone(identifier: timeZoneIdentifier) ?? .current }

    /// الافتراضي في الويب حين لا يُختار موقع.
    public static let kuwaitCity = PrayerLocation(label: "مدينة الكويت", latitude: 29.3759, longitude: 47.9774, timeZoneIdentifier: "Asia/Kuwait")
}

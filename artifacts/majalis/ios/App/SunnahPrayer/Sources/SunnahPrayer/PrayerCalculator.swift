import Adhan
import Foundation

public enum Prayer: String, Codable, CaseIterable, Sendable {
    case fajr, sunrise, dhuhr, asr, maghrib, isha

    public var nameAr: String {
        switch self {
        case .fajr: return "الفجر"
        case .sunrise: return "الشروق"
        case .dhuhr: return "الظهر"
        case .asr: return "العصر"
        case .maghrib: return "المغرب"
        case .isha: return "العشاء"
        }
    }

    /// الشروق وقت لا صلاة؛ يُعرض ولا يُؤذَّن له.
    public var isObligatory: Bool { self != .sunrise }
}

/// مواقيت يوم واحد في منطقة الموقع.
public struct DayPrayerTimes: Hashable, Sendable {
    /// YYYY-MM-DD في منطقة الموقع.
    public let dayKey: String
    public let times: [Prayer: Date]

    public func time(_ prayer: Prayer) -> Date { times[prayer]! }

    /// مرتبة زمنيًا.
    public var ordered: [(prayer: Prayer, time: Date)] {
        Prayer.allCases.map { ($0, time($0)) }
    }
}

public enum PrayerCalculator {
    /// مواقيت اليوم التقويمي `day` (بمكوّنات منطقة الموقع).
    public static func times(for location: PrayerLocation, day: DateComponents, settings: PrayerSettings) -> DayPrayerTimes? {
        let coordinates = Coordinates(latitude: location.latitude, longitude: location.longitude)
        var components = DateComponents()
        components.year = day.year
        components.month = day.month
        components.day = day.day
        guard let pt = PrayerTimes(coordinates: coordinates, date: components, calculationParameters: parameters(settings, coordinates)) else {
            return nil
        }
        let key = String(format: "%04d-%02d-%02d", day.year ?? 0, day.month ?? 0, day.day ?? 0)
        return DayPrayerTimes(dayKey: key, times: [
            .fajr: pt.fajr, .sunrise: pt.sunrise, .dhuhr: pt.dhuhr,
            .asr: pt.asr, .maghrib: pt.maghrib, .isha: pt.isha
        ])
    }

    /// مواقيت اليوم الذي يقع فيه `date` في منطقة الموقع.
    public static func times(for location: PrayerLocation, on date: Date, settings: PrayerSettings) -> DayPrayerTimes? {
        times(for: location, day: dayComponents(of: date, in: location.timeZone), settings: settings)
    }

    /// مواقيت `count` يومًا متتاليًا بدءًا من يوم `date` — للإشعارات والودجت.
    public static func days(for location: PrayerLocation, from date: Date, count: Int, settings: PrayerSettings) -> [DayPrayerTimes] {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = location.timeZone
        let start = calendar.startOfDay(for: date)
        return (0..<max(0, count)).compactMap { offset in
            // منتصف النهار يتجنب حواف التوقيت الصيفي.
            guard let noon = calendar.date(byAdding: DateComponents(day: offset, hour: 12), to: start) else { return nil }
            return times(for: location, on: noon, settings: settings)
        }
    }

    /// الصلاة القادمة (بلا الشروق) بعد `date`، وقد تكون فجر الغد.
    public static func next(after date: Date, location: PrayerLocation, settings: PrayerSettings) -> (prayer: Prayer, time: Date)? {
        days(for: location, from: date, count: 2, settings: settings)
            .flatMap(\.ordered)
            .first { $0.prayer.isObligatory && $0.time > date }
    }

    static func dayComponents(of date: Date, in timeZone: TimeZone) -> DateComponents {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone
        return calendar.dateComponents([.year, .month, .day], from: date)
    }

    /// مطابق لـ `resolveAdhanParams` في src/lib/prayer-calc-prefs.ts.
    static func parameters(_ settings: PrayerSettings, _ coordinates: Coordinates) -> CalculationParameters {
        var params: CalculationParameters
        switch settings.method {
        case .kuwait: params = CalculationMethod.kuwait.params
        case .ummAlQura: params = CalculationMethod.ummAlQura.params
        case .muslimWorldLeague: params = CalculationMethod.muslimWorldLeague.params
        case .egyptian: params = CalculationMethod.egyptian.params
        case .northAmerica: params = CalculationMethod.northAmerica.params
        case .karachi: params = CalculationMethod.karachi.params
        case .dubai: params = CalculationMethod.dubai.params
        case .turkey: params = CalculationMethod.turkey.params
        case .qatar: params = CalculationMethod.qatar.params
        case .singapore: params = CalculationMethod.singapore.params
        case .tehran: params = CalculationMethod.tehran.params
        case .moonsightingCommittee: params = CalculationMethod.moonsightingCommittee.params
        case .franceUOIF:
            params = CalculationMethod.other.params
            params.fajrAngle = 12
            params.ishaAngle = 12
        }
        params.madhab = settings.madhab == .hanafi ? .hanafi : .shafi
        switch settings.highLatitude {
        case .auto: params.highLatitudeRule = HighLatitudeRule.recommended(for: coordinates)
        case .middleOfTheNight: params.highLatitudeRule = .middleOfTheNight
        case .seventhOfTheNight: params.highLatitudeRule = .seventhOfTheNight
        case .twilightAngle: params.highLatitudeRule = .twilightAngle
        }
        let a = settings.adjustments
        params.adjustments = PrayerAdjustments(fajr: a.fajr, sunrise: a.sunrise, dhuhr: a.dhuhr, asr: a.asr, maghrib: a.maghrib, isha: a.isha)
        return params
    }
}

import Foundation

/// لقطة ودجت سُنّة — JSON مشترك مع طبقة React (`native-widgets/snapshot.ts`).
struct SunnahWidgetSnapshot: Codable {
    var version: Int
    var updatedAt: String
    var locale: String
    var prayer: PrayerBlock?

    struct PrayerBlock: Codable {
        var current: Slot?
        var next: Slot?
        var remainingMs: Int
        var remainingLabel: String
        var city: String
        var hijri: String?
        var gregorian: String
        var method: String
    }

    struct Slot: Codable {
        var key: String
        var nameAr: String
        var time24: String
        var timeLabel: String
    }
}

enum SunnahWidgetStore {
    static let appGroupId = "group.com.yousef.majlisilm.widgets"
    static let snapshotKey = "snapshot_v1"

    static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroupId) ?? .standard
    }

    static func loadSnapshot() -> SunnahWidgetSnapshot? {
        guard let data = defaults.data(forKey: snapshotKey) else { return nil }
        return try? JSONDecoder().decode(SunnahWidgetSnapshot.self, from: data)
    }

    static func saveSnapshotJSON(_ json: String) -> Bool {
        guard let data = json.data(using: .utf8) else { return false }
        // تحقق decode قبل الحفظ
        guard (try? JSONDecoder().decode(SunnahWidgetSnapshot.self, from: data)) != nil else { return false }
        defaults.set(data, forKey: snapshotKey)
        return true
    }
}

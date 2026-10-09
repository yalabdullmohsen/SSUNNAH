import Foundation
import WidgetKit
import os

/// Single refresh owner: validate → commit App Group → verify → reload affected kinds only.
enum SunnahWidgetRefreshCoordinator {
    private static let log = Logger(subsystem: "com.yousef.majlisilm", category: "SunnahWidgetRefresh")

    enum Domain: String {
        case prayer, calendar, adhkar, quran, mushaf, custom, home, preferences
    }

    @discardableResult
    static func commitPrayer(_ snapshot: SharedPrayerSnapshot) -> Bool {
        let ok = SunnahSharedStore.publishPrayer(snapshot)
        guard ok else { return false }
        upsertEnvelopePrayer(snapshot)
        reload(kinds: SunnahWidgetKind.prayerFamily)
        return true
    }

    @discardableResult
    static func commitEnvelope(_ envelope: SunnahWidgetEnvelope, domains: Set<Domain>) -> Bool {
        guard envelope.schemaVersion >= 1 else { return false }
        var envelope = envelope
        if envelope.prayerPayload == nil {
            // Non-prayer publishes (Adhkar/Widget Center) keep the committed prayer domain.
            envelope.prayerPayload = SunnahSharedStore.loadCanonicalPrayer()
        }
        let ok = SunnahSharedStore.publishEnvelope(envelope)
        guard ok else { return false }
        if domains.contains(.prayer), let prayer = envelope.prayerPayload {
            _ = SunnahSharedStore.publishPrayer(prayer)
        }
        guard SunnahSharedStore.loadEnvelope() != nil || envelope.prayerPayload == nil else {
            #if DEBUG
            log.error("verify failed after envelope commit")
            #endif
            return false
        }
        reload(kinds: kinds(for: domains))
        return true
    }

    static func reload(kinds: [String]) {
        var seen = Set<String>()
        for kind in kinds where seen.insert(kind).inserted {
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
    }

    static func kinds(for domains: Set<Domain>) -> [String] {
        var out: [String] = []
        if domains.contains(.prayer) { out.append(contentsOf: SunnahWidgetKind.prayerFamily) }
        if domains.contains(.calendar) { out.append(contentsOf: SunnahWidgetKind.calendarFamily) }
        if domains.contains(.adhkar) { out.append(contentsOf: SunnahWidgetKind.adhkarFamily) }
        if domains.contains(.quran) { out.append(contentsOf: SunnahWidgetKind.quranFamily) }
        if domains.contains(.mushaf) { out.append(contentsOf: SunnahWidgetKind.mushafFamily) }
        // «إنجاز اليوم» يقرأ التقدّم من نطاق home ⇒ يُعاد تحميل عائلة الأذكار.
        if domains.contains(.home) { out.append(SunnahWidgetKind.adhkarStreak) }
        if domains.contains(.preferences) {
            out.append(contentsOf: SunnahWidgetKind.allUnique)
        }
        return out
    }

    private static func upsertEnvelopePrayer(_ snapshot: SharedPrayerSnapshot) {
        var env = SunnahSharedStore.loadEnvelope() ?? SunnahWidgetEnvelope(
            schemaVersion: SunnahWidgetEnvelope.currentSchema,
            generatedAtEpochMs: snapshot.updatedAtEpochMs,
            expiresAtEpochMs: nil,
            timezoneIdentifier: snapshot.timeZoneIdentifier,
            localeIdentifier: "ar",
            prayerPayload: nil,
            calendarPayload: nil,
            adhkarPayload: nil,
            quranPayload: nil,
            mushafPayload: nil,
            customContentPayload: nil,
            preferencesPayload: nil,
            progressPayload: nil,
            contentSpotlightPayload: nil
        )
        env.schemaVersion = SunnahWidgetEnvelope.currentSchema
        env.generatedAtEpochMs = snapshot.updatedAtEpochMs
        env.timezoneIdentifier = snapshot.timeZoneIdentifier
        env.prayerPayload = snapshot
        _ = SunnahSharedStore.publishEnvelope(env)
    }
}

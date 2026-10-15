import Foundation
import WidgetKit
import SunnahNative

/// ينفّذ SharedDataPublishing فوق SunnahSharedStore (Shared/SunnahSharedData.swift) كما هو.
struct SharedDataPublisher: SharedDataPublishing {
    var isAvailable: Bool { SunnahAppGroup.defaults != nil }

    func publishProgress(dailyWirdCompleted: Int, dailyWirdTarget: Int, mushafPagesReadToday: Int) -> Bool {
        let snap = SharedProgressSnapshot(
            schemaVersion: SharedProgressSnapshot.currentSchema,
            dailyWirdCompleted: dailyWirdCompleted,
            dailyWirdTarget: dailyWirdTarget,
            mushafPagesReadToday: mushafPagesReadToday,
            updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
        )
        let ok = SunnahSharedStore.publishProgress(snap)
        if ok { WidgetCenter.shared.reloadTimelines(ofKind: SunnahWidgetKind.prayerTimes) }
        return ok
    }

    /// يدمج آخر موضع للمصحف في المغلّف دون المساس بباقي نطاقاته ثم يُحدّث ويدجت «أين توقفت».
    func publishMushafPosition(page: Int, surahNumber: Int?, surahName: String?, ayahNumber: Int?) -> Bool {
        guard (1...604).contains(page) else { return false }
        let now = Int64(Date().timeIntervalSince1970 * 1000)
        var env = SunnahSharedStore.loadEnvelope() ?? SunnahWidgetEnvelope(
            schemaVersion: SunnahWidgetEnvelope.currentSchema, generatedAtEpochMs: now, expiresAtEpochMs: nil,
            timezoneIdentifier: TimeZone.current.identifier, localeIdentifier: "ar",
            prayerPayload: nil, calendarPayload: nil, adhkarPayload: nil, quranPayload: nil, mushafPayload: nil,
            customContentPayload: nil, preferencesPayload: nil, progressPayload: nil, contentSpotlightPayload: nil)
        var m = env.mushafPayload ?? SharedMushafPayload(
            schemaVersion: SharedMushafPayload.currentSchema, hasProgress: false, hasBookmark: false, updatedAtEpochMs: now)
        m.lastPage = page; m.lastSurahNumber = surahNumber; m.lastSurahNameAr = surahName; m.lastAyahNumber = ayahNumber
        m.hasProgress = true; m.progressSource = "native"; m.journeyPercent = page * 100 / 604; m.updatedAtEpochMs = now
        env.mushafPayload = m
        env.generatedAtEpochMs = now
        let ok = SunnahSharedStore.publishEnvelope(env)
        if ok { SunnahWidgetKind.mushafFamily.forEach { WidgetCenter.shared.reloadTimelines(ofKind: $0) } }
        return ok
    }
}

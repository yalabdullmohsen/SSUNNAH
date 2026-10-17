import Foundation
import SwiftUI
import WatchConnectivity
import WatchKit
import WidgetKit

/// مخزن الساعة: يستقبل الحمولة من الآيفون ويحفظها، ويحفظ تقدّم الأذكار والمسبحة محليًا.
@MainActor
final class WatchStore: NSObject, ObservableObject {
    static let shared = WatchStore()
    static let payloadKey = WatchShared.payloadKey
    static let progressKey = WatchShared.progressKey
    /// مجموعة التطبيق المشتركة بين تطبيق الساعة وامتداد الـComplications.
    static var suite: UserDefaults { WatchShared.suite }

    @Published private(set) var payload: WatchPayload?
    @Published private(set) var progress: WatchProgress

    override init() {
        let d = Self.suite
        payload = d.data(forKey: Self.payloadKey).flatMap { try? JSONDecoder().decode(WatchPayload.self, from: $0) }
        let p = d.data(forKey: Self.progressKey).flatMap { try? JSONDecoder().decode(WatchProgress.self, from: $0) }
        progress = p ?? WatchProgress(dayKey: Self.dayKey(Date()))
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
        rollDayIfNeeded()
    }

    // MARK: التقدّم

    static func dayKey(_ d: Date) -> String {
        let c = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day], from: d)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    func rollDayIfNeeded(now: Date = Date()) {
        let k = Self.dayKey(now)
        if progress.dayKey != k { progress = WatchProgress(dayKey: k); saveProgress() }
    }

    func count(set: String, dhikr: String) -> Int { progress.counts["\(set)/\(dhikr)"] ?? 0 }

    /// يزيد عدّة واحدة (حتى `limit`) ويهتزّ؛ اهتزاز أقوى عند إكمال الذكر.
    @discardableResult
    func tick(set: String, dhikr: WatchPayload.Dhikr) -> Bool {
        rollDayIfNeeded()
        let key = "\(set)/\(dhikr.id)"
        let cur = progress.counts[key] ?? 0
        guard cur < dhikr.count else { return true }
        progress.counts[key] = cur + 1
        let done = cur + 1 >= dhikr.count
        WKInterfaceDevice.current().play(done ? .success : .click)
        saveProgress()
        return done
    }

    func tasbihTick() {
        rollDayIfNeeded()
        progress.tasbih += 1
        WKInterfaceDevice.current().play(progress.tasbih % 33 == 0 ? .notification : .click)
        saveProgress()
    }

    func tasbihReset() { progress.tasbih = 0; saveProgress() }

    /// نسبة إنجاز مجموعة (0...1).
    func fraction(of set: WatchPayload.AdhkarSet) -> Double {
        let total = set.items.reduce(0) { $0 + max(1, $1.count) }
        guard total > 0 else { return 0 }
        let done = set.items.reduce(0) { $0 + min(count(set: set.id, dhikr: $1.id), max(1, $1.count)) }
        return Double(done) / Double(total)
    }

    /// تقدّم اليوم عبر كل المجموعات.
    var dayFraction: Double {
        let sets = payload?.adhkar ?? []
        guard !sets.isEmpty else { return 0 }
        return sets.map(fraction(of:)).reduce(0, +) / Double(sets.count)
    }

    private func saveProgress() {
        if let d = try? JSONEncoder().encode(progress) { Self.suite.set(d, forKey: Self.progressKey) }
        WidgetCenter.shared.reloadAllTimelines()
    }

    #if DEBUG
    func debugSet(payload p: WatchPayload?) { payload = p }
    #endif

    fileprivate func apply(data: Data) {
        guard let p = try? JSONDecoder().decode(WatchPayload.self, from: data) else { return }
        payload = p
        Self.suite.set(data, forKey: Self.payloadKey)
        WidgetCenter.shared.reloadAllTimelines()
        Task { await WatchNotifications.reschedule(from: p) }
    }
}

extension WatchStore: WCSessionDelegate {
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let d = session.receivedApplicationContext[WatchShared.payloadKey] as? Data {
            Task { @MainActor in self.apply(data: d) }
        }
    }

    nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        if let d = applicationContext[WatchShared.payloadKey] as? Data {
            Task { @MainActor in self.apply(data: d) }
        }
    }
}

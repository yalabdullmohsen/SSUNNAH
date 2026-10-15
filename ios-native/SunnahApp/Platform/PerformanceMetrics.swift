import Foundation
import MetricKit
import os
import SunnahNative

/// قياس الأداء الحي على الأجهزة: MetricKit يسلّم حمولة يومية (إقلاع/تعليق/ذاكرة/معالج) نحفظها محليًا
/// في Application Support/metrics ونسجّل ملخصها في os_log. لا إرسال لأي خادم ولا بيانات شخصية.
final class PerformanceMetrics: NSObject, MXMetricManagerSubscriber {
    static let shared = PerformanceMetrics()
    static let log = OSLog(subsystem: "com.yousef.majlisilm", category: .pointsOfInterest)
    private let logger = Logger(subsystem: "com.yousef.majlisilm", category: "metrics")

    private let once = OnceGuard()

    /// آمن عند التكرار: التسجيل والإشارة مرة واحدة فقط.
    func start() {
        once.run {
            MXMetricManager.shared.add(self)
            os_signpost(.event, log: Self.log, name: "app.init")
        }
    }

    func didReceive(_ payloads: [MXMetricPayload]) {
        for p in payloads {
            let launch = p.applicationLaunchMetrics?.histogrammedTimeToFirstDraw.bucketEnumerator.allObjects.count ?? 0
            logger.info("metrics \(p.timeStampBegin, privacy: .public)…\(p.timeStampEnd, privacy: .public) launchBuckets=\(launch)")
            save(p.jsonRepresentation(), name: "metrics")
        }
    }

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for p in payloads { save(p.jsonRepresentation(), name: "diagnostics") }
    }

    private func save(_ json: Data, name: String) {
        guard let base = try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true) else { return }
        let dir = base.appendingPathComponent("metrics", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try? json.write(to: dir.appendingPathComponent("\(name)-\(Int(Date().timeIntervalSince1970)).json"), options: .atomic)
        // الاحتفاظ بآخر 14 ملفًا لكل نوع
        let files = ((try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? []).filter { $0.lastPathComponent.hasPrefix(name) }.sorted { $0.lastPathComponent < $1.lastPathComponent }
        for f in files.dropLast(14) { try? FileManager.default.removeItem(at: f) }
    }
}

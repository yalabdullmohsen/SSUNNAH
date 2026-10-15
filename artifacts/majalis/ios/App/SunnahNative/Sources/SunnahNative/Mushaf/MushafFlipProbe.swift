#if (DEBUG || MUSHAF_PROBE) && canImport(UIKit)
import SwiftUI
import UIKit
import os

/// قياس تقطيع تقليب المصحف داخل التطبيق (Debug فقط، ن3): يقلّب N صفحة آليًا ويقيس فواصل الإطارات عبر CADisplayLink
/// أثناء نافذة كل تقليبة، ويُصدر os_signpost (فئة mushaf-perf، اسم flip) لـInstruments، ويطبع سطر MUSHAF_HITCH.
/// التشغيل: `scripts/mushaf-flip-hitch.sh` (يمرّر `-mushafAutoFlip 50`). لا أثر في Release.
@MainActor
enum MushafFlipProbe {
    private static let log = Logger(subsystem: "com.yousef.majlisilm", category: "mushaf-perf")
    private static let signposter = OSSignposter(subsystem: "com.yousef.majlisilm", category: "mushaf-perf")

    static func runIfRequested(start: Int, set: @escaping (Int) -> Void) {
        let n = UserDefaults.standard.integer(forKey: "mushafAutoFlip")
        guard n > 0 else { return }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_500_000_000)   // استقرار أول عرض
            let sampler = FrameSampler()
            var windows: [Double] = [], ready: [Double] = []
            for i in 1...n {
                let id = signposter.makeSignpostID()
                let st = signposter.beginInterval("flip", id: id)
                let t0 = CACurrentMediaTime()
                sampler.beginWindow()
                withAnimation(.easeInOut(duration: 0.3)) { set(start + i) }
                try? await Task.sleep(nanoseconds: 450_000_000)
                let w = sampler.endWindow()
                signposter.endInterval("flip", st)
                windows.append(contentsOf: w); ready.append((CACurrentMediaTime() - t0) * 1000)
            }
            sampler.stop()
            let s = windows.sorted()
            guard !s.isEmpty else { log.notice("MUSHAF_HITCH no_frames"); return }
            let p95 = s[min(s.count - 1, Int(Double(s.count) * 0.95))]
            let over = s.filter { $0 > 20 }.count, over33 = s.filter { $0 > 33.4 }.count
            log.notice("MUSHAF_HITCH flips=\(n) frames=\(s.count) frame_p95_ms=\(p95, format: .fixed(precision: 2)) frame_max_ms=\(s.last!, format: .fixed(precision: 2)) over_20ms=\(over) over_33ms=\(over33)")
        }
    }

    /// يسجّل فاصل كل إطار (ms) داخل نافذة تقليبة فقط.
    private final class FrameSampler: NSObject {
        private var link: CADisplayLink?
        private var last: CFTimeInterval = 0
        private var open = false
        private var buf: [Double] = []
        override init() {
            super.init()
            link = CADisplayLink(target: self, selector: #selector(tick(_:)))
            link?.add(to: .main, forMode: .common)
        }
        func beginWindow() { buf = []; open = true; last = 0 }
        func endWindow() -> [Double] { open = false; return buf }
        func stop() { link?.invalidate(); link = nil }
        @objc private func tick(_ l: CADisplayLink) {
            if open, last > 0 { buf.append((l.timestamp - last) * 1000) }
            last = l.timestamp
        }
    }
}
#endif

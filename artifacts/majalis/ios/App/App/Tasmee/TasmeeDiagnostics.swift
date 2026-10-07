import Foundation
import UIKit

/// مقاييس جلسة «تسميع» للقياس على الجهاز (Debug/TestFlight فقط).
/// أخذ العيّنات (معالج/حرارة/بطارية) مُجمَّع فقط عند التعريف `TASMEE_DIAGNOSTICS`؛ بناء App Store بلا هذا التعريف
/// يحتوي نسخة مبسّطة لا تقرأ البطارية ولا خيوط المعالج ولا تُسجّل أثر الحرارة.
final class TasmeeDiagnostics {
    struct Snapshot: Codable {
        var durationSec: Double
        var decodes: Int
        var decodeMeanMs: Double
        var decodeP95Ms: Double
        var decodeMaxMs: Double
        var cpuMeanPercent: Double
        var cpuPeakPercent: Double
        var thermalStart: String
        var thermalEnd: String
        var thermalMax: String
        var thermalTrace: [ThermalPoint]
        var batteryStart: Double
        var batteryEnd: Double
        var batteryState: String
        var vadSkippedTicks: Int
        /// نوافذ سُمع فيها كلام (VAD) وعاد النموذج بنص فارغ
        var speechWithoutTextWindows: Int
        /// لحظات (ثواني من بدء الجلسة) ظهر فيها تلميح «لم يتضح الصوت»
        var unclearHintsAtSec: [Double]
        var deviceModel: String
        var osVersion: String
    }
    struct ThermalPoint: Codable { let tSec: Double; let state: String }

    static func thermalName(_ s: ProcessInfo.ThermalState) -> String {
        switch s { case .nominal: return "nominal"; case .fair: return "fair"; case .serious: return "serious"; case .critical: return "critical"; @unknown default: return "unknown" }
    }

    static func deviceModel() -> String {
        var size = 0
        sysctlbyname("hw.machine", nil, &size, nil, 0)
        var machine = [CChar](repeating: 0, count: size)
        sysctlbyname("hw.machine", &machine, &size, nil, 0)
        return String(cString: machine)
    }

#if TASMEE_DIAGNOSTICS
    private var started = Date()
    private var computeMs: [Double] = []
    private var cpuSamples: [Double] = []
    private var thermal: [ThermalPoint] = []
    private var batteryStart: Float = -1
    private var timer: Timer?
    private var vadSkipped = 0
    private var speechNoText = 0
    private var unclearHints: [Double] = []
    private var observer: NSObjectProtocol?
    private var maxThermal = ProcessInfo.ThermalState.nominal

    func begin() {
        started = Date(); computeMs = []; cpuSamples = []; thermal = []; vadSkipped = 0; speechNoText = 0; unclearHints = []
        maxThermal = ProcessInfo.processInfo.thermalState
        DispatchQueue.main.async {
            UIDevice.current.isBatteryMonitoringEnabled = true
            self.batteryStart = UIDevice.current.batteryLevel
        }
        thermal.append(ThermalPoint(tSec: 0, state: Self.thermalName(ProcessInfo.processInfo.thermalState)))
        observer = NotificationCenter.default.addObserver(forName: ProcessInfo.thermalStateDidChangeNotification, object: nil, queue: nil) { [weak self] _ in
            guard let self else { return }
            let s = ProcessInfo.processInfo.thermalState
            if s.rawValue > self.maxThermal.rawValue { self.maxThermal = s }
            self.thermal.append(ThermalPoint(tSec: Date().timeIntervalSince(self.started), state: Self.thermalName(s)))
        }
        DispatchQueue.main.async {
            self.timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
                self?.cpuSamples.append(Self.processCPUPercent())
            }
        }
    }

    func recordDecode(ms: Double) { computeMs.append(ms) }
    func recordVadSkip() { vadSkipped += 1 }
    func recordSpeechWithoutText() { speechNoText += 1 }
    func recordUnclearHint() { unclearHints.append(Date().timeIntervalSince(started)) }

    func finish() -> Snapshot {
        DispatchQueue.main.async { self.timer?.invalidate(); self.timer = nil }
        if let o = observer { NotificationCenter.default.removeObserver(o); observer = nil }
        var level: Float = -1, state = "unknown"
        let sem = DispatchSemaphore(value: 0)
        DispatchQueue.main.async {
            level = UIDevice.current.batteryLevel
            switch UIDevice.current.batteryState { case .unplugged: state = "unplugged"; case .charging: state = "charging"; case .full: state = "full"; default: state = "unknown" }
            sem.signal()
        }
        _ = sem.wait(timeout: .now() + 1)
        let sorted = computeMs.sorted()
        func pct(_ p: Double) -> Double { sorted.isEmpty ? 0 : sorted[min(sorted.count - 1, Int(Double(sorted.count) * p))] }
        let end = ProcessInfo.processInfo.thermalState
        return Snapshot(
            durationSec: Date().timeIntervalSince(started),
            decodes: computeMs.count,
            decodeMeanMs: computeMs.isEmpty ? 0 : computeMs.reduce(0, +) / Double(computeMs.count),
            decodeP95Ms: pct(0.95), decodeMaxMs: sorted.last ?? 0,
            cpuMeanPercent: cpuSamples.isEmpty ? 0 : cpuSamples.reduce(0, +) / Double(cpuSamples.count),
            cpuPeakPercent: cpuSamples.max() ?? 0,
            thermalStart: thermal.first?.state ?? "unknown", thermalEnd: Self.thermalName(end), thermalMax: Self.thermalName(maxThermal),
            thermalTrace: thermal,
            batteryStart: Double(batteryStart), batteryEnd: Double(level), batteryState: state,
            vadSkippedTicks: vadSkipped, speechWithoutTextWindows: speechNoText, unclearHintsAtSec: unclearHints,
            deviceModel: Self.deviceModel(), osVersion: UIDevice.current.systemVersion
        )
    }

    /// نسبة استهلاك المعالج للعملية الحالية (مجموع الخيوط؛ 100 = نواة كاملة).
    static func processCPUPercent() -> Double {
        var threads: thread_act_array_t?
        var count = mach_msg_type_number_t(0)
        guard task_threads(mach_task_self_, &threads, &count) == KERN_SUCCESS, let threads else { return 0 }
        var total = 0.0
        for i in 0..<Int(count) {
            var info = thread_basic_info()
            var size = mach_msg_type_number_t(THREAD_INFO_MAX)
            let kr = withUnsafeMutablePointer(to: &info) {
                $0.withMemoryRebound(to: integer_t.self, capacity: Int(size)) { thread_info(threads[i], thread_flavor_t(THREAD_BASIC_INFO), $0, &size) }
            }
            if kr == KERN_SUCCESS, info.flags & TH_FLAGS_IDLE == 0 { total += Double(info.cpu_usage) / Double(TH_USAGE_SCALE) * 100 }
        }
        vm_deallocate(mach_task_self_, vm_address_t(UInt(bitPattern: threads)), vm_size_t(Int(count) * MemoryLayout<thread_t>.stride))
        return total
    }
#else
    private var started = Date()
    private var computeMs: [Double] = []
    private var vadSkipped = 0
    private var speechNoText = 0

    func begin() { started = Date(); computeMs = []; vadSkipped = 0; speechNoText = 0 }
    func recordDecode(ms: Double) { computeMs.append(ms) }
    func recordVadSkip() { vadSkipped += 1 }
    func recordSpeechWithoutText() { speechNoText += 1 }
    func recordUnclearHint() {}

    func finish() -> Snapshot {
        Snapshot(
            durationSec: Date().timeIntervalSince(started), decodes: computeMs.count,
            decodeMeanMs: 0, decodeP95Ms: 0, decodeMaxMs: 0, cpuMeanPercent: 0, cpuPeakPercent: 0,
            thermalStart: "unknown", thermalEnd: Self.thermalName(ProcessInfo.processInfo.thermalState), thermalMax: "unknown",
            thermalTrace: [], batteryStart: -1, batteryEnd: -1, batteryState: "unknown",
            vadSkippedTicks: vadSkipped, speechWithoutTextWindows: speechNoText, unclearHintsAtSec: [], deviceModel: "", osVersion: ""
        )
    }
#endif
}

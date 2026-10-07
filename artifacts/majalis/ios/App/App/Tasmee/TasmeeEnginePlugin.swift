import Capacitor
import Foundation

/// جسر Capacitor لوضع «تسميع»: التسجيل وVAD وWhisperKit على الجهاز فقط.
/// يرسل النص الجزئي إلى JS (`tasmeePartial`) حيث تجري المطابقة والكشف. لا شبكة إلا عند تنزيل النموذج (بطلب المستخدم).
@objc(TasmeeEnginePlugin)
public class TasmeeEnginePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TasmeeEnginePlugin"
    public let jsName = "TasmeeEngine"
    public var pluginMethods: [CAPPluginMethod] {
        var m: [CAPPluginMethod] = [
            CAPPluginMethod(name: "getDeviceInfo", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "getModelStatus", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "downloadModel", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "cancelDownload", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "deleteModel", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "loadModel", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "selfTest", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "setPrompt", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        ]
        #if TASMEE_DIAGNOSTICS
        // أدوات القياس: تُجمَّع في Debug/TestFlight فقط (TASMEE_DIAGNOSTICS) ولا وجود لها في بناء App Store
        m += [
            CAPPluginMethod(name: "getBuildChannel", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "alignSession", returnType: CAPPluginReturnPromise),
            CAPPluginMethod(name: "releaseSessionAudio", returnType: CAPPluginReturnPromise),
        ]
        #endif
        return m
    }

    private let engine = TasmeeEngine()
    private var downloading = false

    override public func load() {
        engine.onEvent = { [weak self] ev in
            switch ev {
            case .partial(let p):
                self?.notifyListeners("tasmeePartial", data: [
                    "seq": p.seq, "text": p.text, "windowStartMs": p.windowStartMs, "windowEndMs": p.windowEndMs,
                    "computeMs": p.computeMs, "finishedAtMs": p.finishedAtMs,
                ])
            case .interruption(let began, let resume):
                self?.notifyListeners("tasmeeInterruption", data: ["began": began, "shouldResume": resume])
            case .route(let reason, let input):
                self?.notifyListeners("tasmeeRoute", data: ["reason": reason, "input": input])
            case .thermal(let state, let degraded):
                self?.notifyListeners("tasmeeThermal", data: ["state": state, "degraded": degraded])
            case .unclearAudio(let sec):
                self?.notifyListeners("tasmeeUnclear", data: ["voicedSeconds": sec])
            case .failure(let message):
                self?.notifyListeners("tasmeeFailure", data: ["message": message])
            }
        }
    }

    private func manifest(from call: CAPPluginCall) -> TasmeeManifest? {
        guard let json = call.getString("manifestJson"), let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(TasmeeManifest.self, from: data)
    }

#if TASMEE_DIAGNOSTICS
    /// قناة البناء: debug | testflight | appstore — شاشة القياس المخفية تعمل في الأولين فقط.
    @objc func getBuildChannel(_ call: CAPPluginCall) {
        #if DEBUG
        call.resolve(["channel": "debug"])
        #else
        let isTestFlight = Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
        call.resolve(["channel": isTestFlight ? "testflight" : "appstore"])
        #endif
    }
#endif

    @objc func getDeviceInfo(_ call: CAPPluginCall) {
        call.resolve([
            "model": TasmeeDiagnostics.deviceModel(),
            "osVersion": UIDevice.current.systemVersion,
            "physicalMemoryMB": Int(ProcessInfo.processInfo.physicalMemory / 1_048_576),
            "thermalState": TasmeeDiagnostics.thermalName(ProcessInfo.processInfo.thermalState),
            "lowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled,
            "loaded": engine.isLoaded,
            "running": engine.isRunning,
        ])
    }

    @objc func getModelStatus(_ call: CAPPluginCall) {
        guard let m = manifest(from: call) else { call.reject("manifestJson required"); return }
        let store = TasmeeModelStore.shared
        call.resolve([
            "installed": store.isInstalled(m),
            "bytesOnDisk": store.bytesOnDisk(m),
            "totalBytes": m.totalBytes,
            "downloading": downloading,
        ])
    }

    @objc func downloadModel(_ call: CAPPluginCall) {
        guard let m = manifest(from: call) else { call.reject("manifestJson required"); return }
        guard !downloading else { call.reject("التنزيل جارٍ"); return }
        downloading = true
        Task {
            defer { self.downloading = false }
            var lastEmit = Date.distantPast
            do {
                try await TasmeeModelStore.shared.download(m) { got, total in
                    // لا أكثر من ٤ أحداث/ث
                    if Date().timeIntervalSince(lastEmit) > 0.25 || got >= total {
                        lastEmit = Date()
                        self.notifyListeners("tasmeeDownloadProgress", data: ["received": got, "total": total])
                    }
                }
                call.resolve(["installed": true])
            } catch TasmeeModelError.cancelled {
                call.reject("cancelled", "cancelled")
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func cancelDownload(_ call: CAPPluginCall) { TasmeeModelStore.shared.cancel(); call.resolve() }

    @objc func deleteModel(_ call: CAPPluginCall) {
        guard let id = call.getString("modelId") else { call.reject("modelId required"); return }
        do { try TasmeeModelStore.shared.delete(id); call.resolve() } catch { call.reject(error.localizedDescription) }
    }

    @objc func loadModel(_ call: CAPPluginCall) {
        guard let m = manifest(from: call) else { call.reject("manifestJson required"); return }
        guard TasmeeModelStore.shared.isInstalled(m), let dir = try? TasmeeModelStore.shared.modelDir(m.modelId) else {
            call.reject("النموذج غير منزَّل"); return
        }
        Task {
            do { try await self.engine.load(modelFolder: dir); call.resolve(["loaded": true]) }
            catch { call.reject("تعذّر تحميل النموذج: \(error.localizedDescription)") }
        }
    }

    @objc func selfTest(_ call: CAPPluginCall) {
        Task {
            do { call.resolve(["decodeMs": try await self.engine.selfTest()]) }
            catch { call.reject(error.localizedDescription) }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        do {
            try engine.start(prompt: call.getString("prompt"), keepSessionAudio: call.getBool("keepSessionAudio") ?? false) // يُتجاهَل خارج TASMEE_DIAGNOSTICS
            call.resolve()
        } catch { call.reject(error.localizedDescription) }
    }

    @objc func setPrompt(_ call: CAPPluginCall) { engine.setPrompt(call.getString("text")); call.resolve() }

    @objc func stop(_ call: CAPPluginCall) {
        let s = engine.stop()
        call.resolve([
            "durationSec": s.durationSec, "decodes": s.decodes, "decodeMeanMs": s.decodeMeanMs, "decodeP95Ms": s.decodeP95Ms,
            "decodeMaxMs": s.decodeMaxMs, "cpuMeanPercent": s.cpuMeanPercent, "cpuPeakPercent": s.cpuPeakPercent,
            "thermalStart": s.thermalStart, "thermalEnd": s.thermalEnd, "thermalMax": s.thermalMax,
            "thermalTrace": s.thermalTrace.map { ["tSec": $0.tSec, "state": $0.state] },
            "batteryStart": s.batteryStart, "batteryEnd": s.batteryEnd, "batteryState": s.batteryState,
            "vadSkippedTicks": s.vadSkippedTicks, "speechWithoutTextWindows": s.speechWithoutTextWindows, "unclearHintsAtSec": s.unclearHintsAtSec, "deviceModel": s.deviceModel, "osVersion": s.osVersion,
        ])
    }

#if TASMEE_DIAGNOSTICS
    @objc func alignSession(_ call: CAPPluginCall) {
        Task {
            do {
                let words = try await self.engine.alignSession()
                call.resolve(["words": words.map { ["word": $0.word, "startMs": $0.startMs, "endMs": $0.endMs] }])
            } catch { call.reject(error.localizedDescription) }
        }
    }

    @objc func releaseSessionAudio(_ call: CAPPluginCall) { engine.releaseSessionAudio(); call.resolve() }
#endif
}

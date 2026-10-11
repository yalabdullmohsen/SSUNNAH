import Capacitor
import Foundation

/// تخزين تلاوات دون اتصال في Application Support — مُستثنى من iCloud backup.
@objc(MajlisOfflineAudioPlugin)
public class MajlisOfflineAudioPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MajlisOfflineAudioPlugin"
    public let jsName = "MajlisOfflineAudio"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "writeSurah", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteSurah", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteReciter", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listReciterSurahs", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSurahPlaybackUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStorageUsage", returnType: CAPPluginReturnPromise),
    ]

    private let store = OfflineAudioStore()

    private func args(_ call: CAPPluginCall, needSurah: Bool = true) -> (String, Int)? {
        guard let reciterId = call.getString("reciterId"), !reciterId.isEmpty else {
            call.reject("reciterId required")
            return nil
        }
        let surah = call.getInt("surah") ?? 0
        if needSurah, !(1...114).contains(surah) {
            call.reject("surah must be 1..114")
            return nil
        }
        return (reciterId, surah)
    }

    @objc func writeSurah(_ call: CAPPluginCall) {
        guard let (reciterId, surah) = args(call) else { return }
        guard let b64 = call.getString("dataBase64"), let data = Data(base64Encoded: b64) else {
            call.reject("dataBase64 required")
            return
        }
        do {
            let url = try store.write(data, reciterId: reciterId, surah: surah)
            call.resolve(["ok": true, "path": url.path, "bytes": data.count])
        } catch {
            call.reject("write failed: \(error.localizedDescription)", nil, error)
        }
    }

    @objc func deleteSurah(_ call: CAPPluginCall) {
        guard let (reciterId, surah) = args(call) else { return }
        do {
            try store.delete(reciterId: reciterId, surah: surah)
            call.resolve(["ok": true])
        } catch {
            call.reject("delete failed", nil, error)
        }
    }

    @objc func deleteReciter(_ call: CAPPluginCall) {
        guard let (reciterId, _) = args(call, needSurah: false) else { return }
        do {
            try store.deleteReciter(reciterId)
            call.resolve(["ok": true])
        } catch {
            call.reject("deleteReciter failed", nil, error)
        }
    }

    @objc func listReciterSurahs(_ call: CAPPluginCall) {
        guard let (reciterId, _) = args(call, needSurah: false) else { return }
        do {
            let surahs = try store.list(reciterId: reciterId).map { ["surah": $0.surah, "bytes": $0.bytes] }
            call.resolve(["surahs": surahs])
        } catch {
            call.reject("list failed", nil, error)
        }
    }

    @objc func getSurahPlaybackUrl(_ call: CAPPluginCall) {
        guard let (reciterId, surah) = args(call) else { return }
        do {
            guard let url = try store.playbackURL(reciterId: reciterId, surah: surah) else {
                call.resolve(["url": NSNull()])
                return
            }
            call.resolve(["url": url.absoluteString, "path": url.path])
        } catch {
            call.reject("lookup failed", nil, error)
        }
    }

    @objc func getStorageUsage(_ call: CAPPluginCall) {
        do {
            call.resolve(["bytes": try store.totalBytes(), "rootPath": try store.rootDir().path])
        } catch {
            call.reject("usage failed", nil, error)
        }
    }
}

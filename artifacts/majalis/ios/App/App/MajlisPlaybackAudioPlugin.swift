import Capacitor
import Foundation

/// AVAudioSession + Now Playing bridge for Capacitor WebView Quran/lesson audio.
/// - `.playback` only when JS requests continuous playback (never at cold launch)
/// - Keeps session active across background / lock so HTML5 audio is not suspended
/// - Publishes MPNowPlayingInfoCenter + MPRemoteCommandCenter for Control Center / Lock Screen
@objc(MajlisPlaybackAudioPlugin)
public class MajlisPlaybackAudioPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MajlisPlaybackAudioPlugin"
    public let jsName = "MajlisPlaybackAudio"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "enablePlayback", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "enableRecording", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "currentMode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setNowPlaying", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearNowPlaying", returnType: CAPPluginReturnPromise),
    ]

    private let session = PlaybackSessionController()

    public override func load() {
        super.load()
        session.onEvent = { [weak self] name, data in self?.notifyListeners(name, data: data) }
        session.start()
    }

    private func applyMetadata(_ call: CAPPluginCall) {
        session.setMetadata(title: call.getString("title"), artist: call.getString("artist"), album: call.getString("album"))
    }

    private func fail(_ call: CAPPluginCall, _ prefix: String, _ error: Error) {
        call.reject("\(prefix): \(error.localizedDescription)", "AUDIO_SESSION_FAILED", error)
    }

    @objc func enablePlayback(_ call: CAPPluginCall) {
        applyMetadata(call)
        do {
            try session.enablePlayback()
            call.resolve(["ok": true, "mode": session.mode.rawValue])
        } catch {
            fail(call, "تعذّر تفعيل جلسة التشغيل", error)
        }
    }

    /// Switch session for mic / speech recognition without fighting `.playback`.
    @objc func enableRecording(_ call: CAPPluginCall) {
        do {
            try session.enableRecording()
            call.resolve(["ok": true, "mode": session.mode.rawValue])
        } catch {
            fail(call, "تعذّر تفعيل جلسة التسجيل", error)
        }
    }

    @objc func deactivate(_ call: CAPPluginCall) {
        do {
            try session.deactivate()
            call.resolve(["ok": true, "mode": session.mode.rawValue])
        } catch {
            fail(call, "تعذّر إيقاف جلسة الصوت", error)
        }
    }

    @objc func currentMode(_ call: CAPPluginCall) {
        call.resolve(["mode": session.mode.rawValue])
    }

    @objc func setNowPlaying(_ call: CAPPluginCall) {
        applyMetadata(call)
        session.publishNowPlaying(
            isPlaying: call.getBool("playing") ?? (session.mode == .playback),
            elapsed: call.getDouble("elapsed"),
            duration: call.getDouble("duration"),
            rate: call.getFloat("playbackRate") ?? 1
        )
        call.resolve(["ok": true])
    }

    @objc func clearNowPlaying(_ call: CAPPluginCall) {
        session.clearNowPlaying()
        call.resolve(["ok": true])
    }
}

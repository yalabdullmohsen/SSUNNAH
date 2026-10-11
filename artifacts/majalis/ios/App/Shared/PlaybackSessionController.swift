import AVFoundation
import MediaPlayer
import UIKit

/// جلسة الصوت + «يُشغَّل الآن» + أوامر التحكم عن بُعد — نواة بلا Capacitor.
/// - `.playback` فقط عند طلب تشغيل متواصل (لا عند الإقلاع البارد)
/// - تُبقي الجلسة فعّالة في الخلفية والقفل
/// الأحداث تصل عبر `onEvent(name, payload)`: audioSessionError / remoteCommand / audioInterruption / audioRouteChange.
public final class PlaybackSessionController {
    public enum Mode: String { case inactive, playback, recording }

    public private(set) var mode: Mode = .inactive
    public var onEvent: ((String, [String: Any]) -> Void)?

    private var observers: [NSObjectProtocol] = []
    private var remoteCommandsInstalled = false
    private var title = "تلاوة القرآن"
    private var artist = "سُنّة"
    private var album = "سُنّة"

    public init() {}

    deinit { observers.forEach(NotificationCenter.default.removeObserver) }

    /// يُستدعى مرة عند الإقلاع (لا يفعّل الجلسة).
    public func start() {
        guard observers.isEmpty else { return }
        let center = NotificationCenter.default
        let session = AVAudioSession.sharedInstance()
        observers.append(center.addObserver(forName: AVAudioSession.interruptionNotification, object: session, queue: .main) { [weak self] in
            self?.handleInterruption($0)
        })
        observers.append(center.addObserver(forName: AVAudioSession.routeChangeNotification, object: session, queue: .main) { [weak self] in
            self?.handleRouteChange($0)
        })
        observers.append(center.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: nil, queue: .main) { [weak self] _ in
            self?.mode = .inactive
            self?.emit("audioSessionError", ["op": "media_services_reset", "message": "AVAudioSession media services were reset"])
        })
        let names: [Notification.Name] = [
            Notification.Name("MajlisAppDidEnterBackground"),
            Notification.Name("MajlisAppWillResignActive"),
            UIApplication.didEnterBackgroundNotification,
            UIApplication.willResignActiveNotification,
        ]
        for name in names {
            observers.append(center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                self?.reassertPlaybackIfNeeded()
            })
        }
    }

    public func setMetadata(title: String?, artist: String?, album: String?) {
        if let title, !title.isEmpty { self.title = title }
        if let artist, !artist.isEmpty { self.artist = artist }
        if let album, !album.isEmpty { self.album = album }
    }

    public func enablePlayback() throws {
        try activatePlaybackSession()
        installRemoteCommandsIfNeeded()
        UIApplication.shared.beginReceivingRemoteControlEvents()
        publishNowPlaying(isPlaying: true)
        mode = .playback
    }

    /// جلسة الميكروفون/التعرّف على الكلام دون صراع مع `.playback`.
    public func enableRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .defaultToSpeaker, .allowBluetooth])
        try session.setActive(true, options: [])
        clearNowPlaying()
        mode = .recording
    }

    public func deactivate() throws {
        clearNowPlaying()
        try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        mode = .inactive
    }

    public func publishNowPlaying(isPlaying: Bool, elapsed: Double? = nil, duration: Double? = nil, rate: Float = 1) {
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: title,
            MPMediaItemPropertyArtist: artist,
            MPMediaItemPropertyAlbumTitle: album,
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? rate : 0,
        ]
        if let elapsed { info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = elapsed }
        if let duration { info[MPMediaItemPropertyPlaybackDuration] = duration }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    public func clearNowPlaying() {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    // MARK: - داخلي

    private func emit(_ name: String, _ payload: [String: Any]) { onEvent?(name, payload) }

    private func activatePlaybackSession() throws {
        let session = AVAudioSession.sharedInstance()
        // وسائط متواصلة (تلاوة) — بلا duckOthers (للمؤثرات القصيرة فقط).
        try session.setCategory(.playback, mode: .default, options: [.allowAirPlay, .allowBluetoothA2DP])
        try session.setActive(true, options: [])
    }

    private func reassertPlaybackIfNeeded() {
        guard mode == .playback else { return }
        do {
            try activatePlaybackSession()
            publishNowPlaying(isPlaying: true)
        } catch {
            NSLog("[MajlisPlayback] background reassert failed: %@", error.localizedDescription)
            emit("audioSessionError", ["op": "background_reassert", "message": error.localizedDescription])
        }
    }

    private func installRemoteCommandsIfNeeded() {
        guard !remoteCommandsInstalled else { return }
        remoteCommandsInstalled = true
        let center = MPRemoteCommandCenter.shared()
        let commands: [(MPRemoteCommand, String)] = [
            (center.playCommand, "play"), (center.pauseCommand, "pause"),
            (center.togglePlayPauseCommand, "toggle"), (center.nextTrackCommand, "next"),
            (center.previousTrackCommand, "previous"), (center.stopCommand, "stop"),
        ]
        for (command, action) in commands {
            command.isEnabled = true
            command.addTarget { [weak self] _ in
                self?.emit("remoteCommand", ["action": action])
                return .success
            }
        }
    }

    private func handleInterruption(_ notification: Notification) {
        guard
            let info = notification.userInfo,
            let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: typeValue)
        else { return }

        var payload: [String: Any] = ["type": type == .began ? "began" : "ended", "mode": mode.rawValue]
        if type == .ended, let optionsValue = info[AVAudioSessionInterruptionOptionKey] as? UInt {
            let shouldResume = AVAudioSession.InterruptionOptions(rawValue: optionsValue).contains(.shouldResume)
            payload["shouldResume"] = shouldResume
            if shouldResume && mode == .playback {
                do {
                    try activatePlaybackSession()
                    publishNowPlaying(isPlaying: true)
                } catch {
                    NSLog("[MajlisPlayback] resume after interruption failed: %@", error.localizedDescription)
                    payload["resumeError"] = error.localizedDescription
                    emit("audioSessionError", ["op": "resume_after_interruption", "message": error.localizedDescription])
                }
            }
        }
        if type == .began { publishNowPlaying(isPlaying: false) }
        emit("audioInterruption", payload)
    }

    private func handleRouteChange(_ notification: Notification) {
        guard
            let info = notification.userInfo,
            let reasonValue = info[AVAudioSessionRouteChangeReasonKey] as? UInt,
            let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue)
        else { return }
        emit("audioRouteChange", ["reason": reason.rawValue])
    }
}

import Foundation
import SunnahNative

/// ينفّذ PlaybackSessionControlling فوق PlaybackSessionController (Shared/) كما هو.
@MainActor
final class PlaybackSessionAdapter: PlaybackSessionControlling {
    private let controller = PlaybackSessionController()
    var onRemoteCommand: ((PlaybackRemoteCommand) -> Void)?

    init() {
        controller.onEvent = { [weak self] name, payload in
            guard name == "remoteCommand",
                  let raw = payload["action"] as? String,
                  let command = PlaybackRemoteCommand(rawValue: raw) else { return }
            self?.onRemoteCommand?(command)
        }
        controller.start()
    }

    var mode: PlaybackSessionMode { PlaybackSessionMode(rawValue: controller.mode.rawValue) ?? .inactive }

    func enablePlayback(title: String?, artist: String?, album: String?) throws {
        controller.setMetadata(title: title, artist: artist, album: album)
        try controller.enablePlayback()
    }
    func enableRecording() throws { try controller.enableRecording() }
    func deactivate() throws { try controller.deactivate() }
    func updateNowPlaying(playing: Bool, elapsed: Double?, duration: Double?, rate: Float) {
        controller.publishNowPlaying(isPlaying: playing, elapsed: elapsed, duration: duration, rate: rate)
    }
    func clearNowPlaying() { controller.clearNowPlaying() }
}

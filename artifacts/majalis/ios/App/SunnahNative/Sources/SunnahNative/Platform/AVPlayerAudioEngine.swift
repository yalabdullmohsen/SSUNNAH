import Foundation
import AVFoundation

/// تنفيذ عقد `AudioPlaybackEngine` فوق AVPlayer: ربط فقط، لا يولّد صوتًا ولا يغيّر الروابط.
@MainActor
public final class AVPlayerAudioEngine: AudioPlaybackEngine {
    public private(set) var isPlaying = false { didSet { if oldValue != isPlaying { onChange?() } } }
    public private(set) var progress: Double = 0
    public var onChange: (() -> Void)?
    private let player: AVPlayer
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?

    public init(url: URL) {
        let item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)
        timeObserver = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main) { [weak self] t in
            MainActor.assumeIsolated {
                guard let self, let d = self.player.currentItem?.duration.seconds, d.isFinite, d > 0 else { return }
                self.progress = min(1, max(0, t.seconds / d))
                self.onChange?()
            }
        }
        endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.player.seek(to: .zero)
                self?.progress = 0
                self?.isPlaying = false
            }
        }
    }

    public func toggle() {
        if isPlaying { player.pause(); isPlaying = false; return }
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.playback)
        try? AVAudioSession.sharedInstance().setActive(true)
        #endif
        player.play()
        isPlaying = true
    }

    deinit {
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        player.pause()
    }
}

public enum AudioEngines {
    /// المصنع الحيّ الذي يحقنه جذر التطبيق في `\.audioEngineFactory`.
    public static let live: AudioEngineFactory = { AVPlayerAudioEngine(url: $0) }
}

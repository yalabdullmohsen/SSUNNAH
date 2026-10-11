import AVFoundation
import SunnahNative

/// مشغّل AVPlayer يحقّق AudioPlaybackEngine (عقد AudioPlayerTemplate) فوق المنفذين الموجودين:
/// OfflineAudioProviding (المحلي أولًا) وPlaybackSessionControlling (الجلسة و«يُشغَّل الآن» وأوامر القفل).
@MainActor
final class NativeAudioPlayer: AudioPlaybackEngine {
    private let player: AVPlayer
    private let session: PlaybackSessionControlling
    private let title: String?
    private let artist: String?
    private var timeObserver: Any?
    private var statusObservation: NSKeyValueObservation?
    private var endObserver: NSObjectProtocol?

    private(set) var isPlaying = false
    private(set) var progress: Double = 0
    var onChange: (() -> Void)?

    init(url: URL, title: String?, artist: String?, session: PlaybackSessionControlling) {
        player = AVPlayer(url: url)
        self.session = session
        self.title = title
        self.artist = artist
        timeObserver = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main) { [weak self] _ in
            MainActor.assumeIsolated { self?.sync() }
        }
        // يعكس الإيقاف الخارجي (مكالمة، فصل السماعة) لا ضغطات الزر فقط.
        statusObservation = player.observe(\.timeControlStatus) { [weak self] _, _ in
            DispatchQueue.main.async { self?.sync() }
        }
        endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: player.currentItem, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.player.seek(to: .zero)
                self?.sync()
            }
        }
    }

    deinit {
        player.pause()
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
    }

    func toggle() { isPlaying ? pause() : play() }

    private func play() {
        session.onRemoteCommand = { [weak self] command in self?.handle(command) }
        do { try session.enablePlayback(title: title, artist: artist, album: nil) }
        catch { NSLog("[NativeAudioPlayer] enablePlayback failed: %@", error.localizedDescription) }
        player.play()
        sync()
    }

    private func pause() {
        player.pause()
        sync()
    }

    private func handle(_ command: PlaybackRemoteCommand) {
        switch command {
        case .play: play()
        case .pause, .stop: pause()
        case .toggle: toggle()
        case .next, .previous: break
        }
    }

    private func sync() {
        let playing = player.timeControlStatus != .paused
        let elapsed = player.currentTime().seconds
        let duration = player.currentItem?.duration.seconds
        let total = (duration?.isFinite == true && duration! > 0) ? duration : nil
        let newProgress = total.map { min(1, max(0, elapsed / $0)) } ?? 0
        guard playing != isPlaying || abs(newProgress - progress) > 0.001 else { return }
        isPlaying = playing
        progress = newProgress
        if session.mode == .playback {
            session.updateNowPlaying(playing: playing, elapsed: elapsed.isFinite ? elapsed : nil, duration: total, rate: player.rate)
        }
        onChange?()
    }
}

/// توصيل الصوت الأصلي على مستوى التطبيق: جلسة واحدة، والمحلي أولًا لروابط السور الكاملة.
@MainActor
enum NativeAudio {
    static let session = PlaybackSessionAdapter()
    static let offline = OfflineAudioAdapter()
    static let reciters = SurahReciter.bundled()

    static let factory: AudioEngineFactory = { url in
        let reciter = OfflineAudioKey.match(url, in: reciters).flatMap { key in reciters.first { $0.id == key.reciterId } }
        return NativeAudioPlayer(url: offline.playableURL(for: url, reciters: reciters),
                                 title: nil, artist: reciter?.nameAr, session: session)
    }
}

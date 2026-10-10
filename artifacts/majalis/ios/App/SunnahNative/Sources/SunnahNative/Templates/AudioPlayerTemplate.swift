import SwiftUI
import AVFoundation

/// قالب 7 — مشغّل صوت: عنوان + تشغيل/إيقاف + شريط تقدّم. الصوت من audioURL في العنصر.
public struct AudioPlayerTemplate: View {
    let item: ContentItem
    public init(item: ContentItem) { self.item = item }
    public var body: some View {
        Group {
            if let url = item.audioURL { AudioPlayerBody(item: item, url: url) } else { EmptyStateView(title: "لا يوجد صوت لهذا العنصر") }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
    }
}

@MainActor
private final class AudioModel: ObservableObject {
    @Published var playing = false
    @Published var progress = 0.0
    private let player: AVPlayer
    private var observer: Any?
    init(url: URL) {
        player = AVPlayer(url: url)
        observer = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main) { [weak self] t in
            guard let self, let d = self.player.currentItem?.duration.seconds, d.isFinite, d > 0 else { return }
            MainActor.assumeIsolated { self.progress = t.seconds / d }
        }
    }
    func toggle() { playing ? player.pause() : player.play(); playing.toggle() }
    deinit { if let observer { player.removeTimeObserver(observer) } }
}

private struct AudioPlayerBody: View {
    let item: ContentItem
    @StateObject private var model: AudioModel
    init(item: ContentItem, url: URL) { self.item = item; _model = StateObject(wrappedValue: AudioModel(url: url)) }
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s5) {
            Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary).multilineTextAlignment(.center)
            ProgressView(value: model.progress).tint(Sunnah.Colors.primary)
            SunnahButton(model.playing ? "إيقاف مؤقت" : "تشغيل") { model.toggle() }
        }
        .padding(Sunnah.Spacing.pageX)
    }
}

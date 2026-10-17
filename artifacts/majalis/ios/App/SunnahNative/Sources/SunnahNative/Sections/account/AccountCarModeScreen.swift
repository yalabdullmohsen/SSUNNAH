import SwiftUI
import AVFoundation

/// مشغّل وضع السيارة: قائمة دروس صوتية بأزرار كبيرة، ويتذكّر آخر درس.
@MainActor
final class AccountCarPlayer: ObservableObject {
    @Published private(set) var lessons: [AccountLesson] = []
    @Published private(set) var index = 0
    @Published private(set) var playing = false
    private var player: AVPlayer?
    private var endObserver: NSObjectProtocol?
    private let defaults: UserDefaults

    static let lastKey = "majalis_car_last_v1"

    init(defaults: UserDefaults = .standard) { self.defaults = defaults }

    var current: AccountLesson? { lessons.indices.contains(index) ? lessons[index] : nil }

    /// دروس لها رابط صوت، بترتيبها في المصدر (حتى 50 كما في الويب)، مع استئناف آخر درس.
    func load(_ all: [AccountLesson]) {
        lessons = Self.playlist(from: all)
        if let last = defaults.string(forKey: Self.lastKey), let i = lessons.firstIndex(where: { $0.publicId == last }) { index = i }
        prepare(autoplay: false)
    }

    static func playlist(from all: [AccountLesson]) -> [AccountLesson] {
        Array(all.filter { ($0.status ?? "approved") == "approved" && $0.playableURL != nil }.prefix(50))
    }

    func toggle() {
        guard let player else { return }
        if playing { player.pause() } else { player.play() }
        playing.toggle()
    }

    func select(_ i: Int) {
        guard lessons.indices.contains(i) else { return }
        let resume = playing
        index = i
        defaults.set(lessons[i].publicId, forKey: Self.lastKey)
        prepare(autoplay: resume)
    }

    func next() { select(min(index + 1, lessons.count - 1)) }
    func previous() { select(max(index - 1, 0)) }

    func stop() {
        player?.pause()
        playing = false
    }

    private func prepare(autoplay: Bool) {
        player?.pause()
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        guard let url = current?.playableURL else { player = nil; playing = false; return }
        let item = AVPlayerItem(url: url)
        let p = AVPlayer(playerItem: item)
        player = p
        endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                if self.index < self.lessons.count - 1 { self.playing = true; self.next() } else { self.playing = false }
            }
        }
        if autoplay { p.play(); playing = true } else { playing = false }
    }
}

/// /car-mode — الاستماع أثناء القيادة: واجهة مبسطة بأزرار كبيرة وقائمة الدروس.
struct AccountCarModeScreen: View {
    @Environment(\.contentLoader) private var loader
    @Environment(\.openRoute) private var openRoute
    @StateObject private var player = AccountCarPlayer()
    @State private var phase: AccountLoadPhase<Void> = .loading

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: empty
            case .ready where player.lessons.isEmpty: empty
            case .ready: content
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("وضع السيارة")
        .task { await load() }
        .onDisappear { player.stop() }
    }

    private var empty: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            EmptyStateView(title: "لا تتوفر دروس صوتية حالياً.")
            SunnahButton("العودة للرئيسية", style: .secondary) { openRoute("/") }
        }
        .padding(Sunnah.Spacing.pageX)
    }

    private var content: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s5) {
                if let current = player.current {
                    VStack(spacing: Sunnah.Spacing.s2) {
                        Image(systemName: player.playing ? "music.note" : "mic")
                            .font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.primary)
                            .frame(minWidth: Sunnah.Spacing.touch * 2, minHeight: Sunnah.Spacing.touch * 2)
                            .background(Sunnah.Colors.primarySoft, in: Circle())
                            .accessibilityHidden(true)
                        Text(current.category ?? "درس").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                        Text(current.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            .multilineTextAlignment(.center)
                        if let speaker = current.speakerName, !speaker.isEmpty {
                            Text(speaker).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                        Text("\(player.index + 1) / \(player.lessons.count)").font(Sunnah.Typography.secondary)
                            .foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit()
                    }
                    .frame(maxWidth: .infinity)
                    .accessibilityElement(children: .combine)
                }

                HStack(spacing: Sunnah.Spacing.s6) {
                    controlButton("backward.end.fill", label: "السابق", disabled: player.index == 0) { player.previous() }
                    controlButton(player.playing ? "pause.fill" : "play.fill", label: player.playing ? "إيقاف" : "تشغيل", large: true) { player.toggle() }
                    controlButton("forward.end.fill", label: "التالي", disabled: player.index >= player.lessons.count - 1) { player.next() }
                }
                .environment(\.layoutDirection, .leftToRight)

                LazyVStack(spacing: Sunnah.Spacing.s2) {
                    ForEach(Array(player.lessons.enumerated()), id: \.element.id) { i, lesson in
                        Button { player.select(i) } label: {
                            HStack(spacing: Sunnah.Spacing.s3) {
                                Text("\(i + 1)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit()
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                    Text(lesson.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                    if let s = lesson.speakerName, !s.isEmpty {
                                        Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                    }
                                }
                                Spacer(minLength: 0)
                            }
                            .padding(Sunnah.Spacing.s3)
                            .frame(minHeight: Sunnah.Spacing.touch)
                            .background(i == player.index ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface,
                                        in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                        }
                        .buttonStyle(.plain)
                        .accessibilityAddTraits(i == player.index ? .isSelected : [])
                    }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
    }

    private func controlButton(_ icon: String, label: String, large: Bool = false, disabled: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(large ? Sunnah.Typography.pageTitle : Sunnah.Typography.sectionTitle)
                .foregroundStyle(large ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.primary)
                .frame(width: Sunnah.Spacing.touch * (large ? 2 : 1.5), height: Sunnah.Spacing.touch * (large ? 2 : 1.5))
                .background(large ? Sunnah.Colors.primary : Sunnah.Colors.primarySoft, in: Circle())
        }
        .buttonStyle(.plain)
        .disabled(disabled)
        .opacity(disabled ? 0.4 : 1)
        .accessibilityLabel(label)
    }

    @MainActor private func load() async {
        phase = .loading
        do {
            let all = try await loader.load([AccountLesson].self, from: AccountEndpoints.lessons)
            player.load(all)
            phase = .ready(())
        } catch {
            phase = .failed
        }
    }
}

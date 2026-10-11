import SwiftUI

/// عقد المشغّل: ينفّذه مشغّل ن3 الأصلي ويُحقن عبر \.audioEngineFactory؛ القالب لا يشغّل صوتًا بنفسه.
/// `onChange` يُستدعى عند تغيّر isPlaying/progress ليُحدّث القالب واجهته.
@MainActor
public protocol AudioPlaybackEngine: AnyObject {
    var isPlaying: Bool { get }
    var progress: Double { get }
    var onChange: (() -> Void)? { get set }
    func toggle()
}

public typealias AudioEngineFactory = @MainActor (URL) -> any AudioPlaybackEngine

private struct AudioEngineFactoryKey: EnvironmentKey { static let defaultValue: AudioEngineFactory? = nil }
public extension EnvironmentValues {
    /// nil = لا مشغّل محقون: يعرض القالب حالة فارغة.
    var audioEngineFactory: AudioEngineFactory? {
        get { self[AudioEngineFactoryKey.self] }
        set { self[AudioEngineFactoryKey.self] = newValue }
    }
}

/// قالب 7 — مشغّل صوت: عنوان + تشغيل/إيقاف + شريط تقدّم. الصوت من audioURL في العنصر.
public struct AudioPlayerTemplate: View {
    let item: ContentItem
    @Environment(\.audioEngineFactory) private var factory
    public init(item: ContentItem) { self.item = item }
    public var body: some View {
        Group {
            if let url = item.audioURL, let factory { AudioPlayerBody(item: item, url: url, factory: factory) }
            else { EmptyStateView(title: "لا يوجد صوت لهذا العنصر") }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
    }
}

private struct AudioPlayerBody: View {
    let item: ContentItem
    let url: URL
    let factory: AudioEngineFactory
    @State private var engine: (any AudioPlaybackEngine)?
    @State private var tick = 0
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s5) {
            Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary).multilineTextAlignment(.center)
            ProgressView(value: engine?.progress ?? 0).tint(Sunnah.Colors.primary)
            SunnahButton((engine?.isPlaying ?? false) ? "إيقاف مؤقت" : "تشغيل") { engine?.toggle() }
        }
        .padding(Sunnah.Spacing.pageX)
        .id(tick)
        .onAppear {
            guard engine == nil else { return }
            let e = factory(url)
            e.onChange = { tick += 1 }
            engine = e
        }
    }
}

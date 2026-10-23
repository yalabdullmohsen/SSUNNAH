import Foundation
import AVFoundation

/// مشغّل صوت آية واحدة لوضع التلقين (اسمع ثم سمّع). يُحقن في المتحكّم فيُختبر بلا شبكة.
@MainActor
public protocol TasmeeAyahAudioPlaying: AnyObject {
    /// يشغّل صوت القارئ للآية ويعود حين ينتهي (أو يفشل/يُلغى): الفشل لا يوقف الجلسة.
    func play(verse: String) async
    func stop()
}

/// نفس مصدر تلاوة الآيات المستعمل في الويب (everyayah، مجلد قارئ واحد)، بلا تغيير في الروابط ولا النص.
@MainActor
public final class TasmeeAyahPlayer: TasmeeAyahAudioPlaying {
    public static let folder = "Abdul_Basit_Murattal_192kbps"
    private var player: AVPlayer?
    private var observers: [NSObjectProtocol] = []
    private var cont: CheckedContinuation<Void, Never>?
    private var timeout: Task<Void, Never>?

    public init() {}

    /// `s:a` → `…/{SSS}{AAA}.mp3`؛ nil إن لم تكن الصيغة صحيحة.
    static func url(verse: String, folder: String = TasmeeAyahPlayer.folder) -> URL? {
        let p = verse.split(separator: ":")
        guard p.count == 2, let s = Int(p[0]), let a = Int(p[1]), (1...114).contains(s), a >= 1 else { return nil }
        return URL(string: String(format: "https://everyayah.com/data/%@/%03d%03d.mp3", folder, s, a))
    }

    public func play(verse: String) async {
        stop()
        guard let url = Self.url(verse: verse) else { return }
        let item = AVPlayerItem(url: url)
        let p = AVPlayer(playerItem: item)
        player = p
        await withCheckedContinuation { (c: CheckedContinuation<Void, Never>) in
            cont = c
            let nc = NotificationCenter.default
            for name in [AVPlayerItem.didPlayToEndTimeNotification, AVPlayerItem.failedToPlayToEndTimeNotification] {
                observers.append(nc.addObserver(forName: name, object: item, queue: .main) { [weak self] _ in
                    MainActor.assumeIsolated { self?.finish() }
                })
            }
            // سقف أمان: شبكة بطيئة أو ملف لا يبدأ لا يعلّق الجلسة.
            timeout = Task { [weak self] in
                try? await Task.sleep(nanoseconds: 45_000_000_000)
                if !Task.isCancelled { self?.finish() }
            }
            p.play()
        }
    }

    public func stop() { finish() }

    private func finish() {
        timeout?.cancel(); timeout = nil
        observers.forEach(NotificationCenter.default.removeObserver); observers = []
        player?.pause(); player = nil
        let c = cont; cont = nil
        c?.resume()
    }
}

/// نقطة استئناف الجلسة: آخر آية لم تُتمّ، تُحفظ في UserDefaults لتبقى بعد إغلاق التطبيق.
public struct TasmeeResumePoint: Codable, Sendable, Equatable {
    public var verse: String   // «سورة:آية»
    public var page: Int
    public var savedAt: Date
    public init(verse: String, page: Int, savedAt: Date = Date()) { self.verse = verse; self.page = page; self.savedAt = savedAt }

    public static let storageKey = "sunnah.tasmee.resume.v1"
    public static func load(_ d: UserDefaults = .standard) -> TasmeeResumePoint? {
        guard let data = d.data(forKey: storageKey), let r = try? JSONDecoder().decode(TasmeeResumePoint.self, from: data),
              r.page >= 1, r.verse.split(separator: ":").count == 2 else { return nil }
        return r
    }
    public func save(_ d: UserDefaults = .standard) { if let data = try? JSONEncoder().encode(self) { d.set(data, forKey: Self.storageKey) } }
    public static func clear(_ d: UserDefaults = .standard) { d.removeObject(forKey: storageKey) }
}

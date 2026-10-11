import Foundation

/// فلتر الكلمات الوهمية — نسخة Swift من `hallucination-guard.ts`.
/// نصّ مكرّر حرفيًا 3 نوافذ متتالية فأكثر = وهم؛ وأول نافذة بعد صمت ≥ 2.5ث تُحفظ ولا تُستعمل.
public final class HallucinationGuard {
    public static let episodeGapMs = 2500.0
    public static let repeatLimit = 3

    public enum Decision: Sendable { case use, warmup, `repeat`, hallucination }

    private var last: String?
    private var lastAtMs = -Double.infinity
    private var same = 0

    public init() {}

    public func decide(_ text: String, atMs: Double) -> Decision {
        let norm = text.split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
        let newEpisode = last == nil || atMs - lastAtMs > Self.episodeGapMs
        lastAtMs = atMs
        if newEpisode { last = norm; same = 1; return .warmup }
        if norm == last {
            same += 1
            return same >= Self.repeatLimit ? .hallucination : .repeat
        }
        last = norm; same = 1
        return .use
    }

    public func reset() { last = nil; same = 0; lastAtMs = -.infinity }
}

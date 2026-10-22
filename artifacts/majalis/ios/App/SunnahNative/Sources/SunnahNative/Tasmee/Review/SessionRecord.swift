import Foundation

/// سجل جلسة تسميع: الواجهة المشتركة بين المحرك (يكتب) وشاشات المراجعة (تقرأ). الصوت لا يُحفظ أبدًا.
public enum TasmeeMode: String, Codable, Sendable, CaseIterable { case follow, recite, graded, exam, `repeat` }

public enum TasmeeEventKind: String, Codable, Sendable { case correct, wrong, skipped, extra, tashkeelMaybe }

public struct TasmeeSessionEvent: Codable, Sendable, Equatable {
    public var surah: Int
    public var ayah: Int
    public var wordIndex: Int
    public var kind: TasmeeEventKind
    public var said: String?
    public var expected: String?
    public var attempts: Int
    public var usedPeek: Bool

    public init(surah: Int, ayah: Int, wordIndex: Int, kind: TasmeeEventKind,
                said: String? = nil, expected: String? = nil, attempts: Int = 1, usedPeek: Bool = false) {
        self.surah = surah; self.ayah = ayah; self.wordIndex = wordIndex; self.kind = kind
        self.said = said; self.expected = expected; self.attempts = attempts; self.usedPeek = usedPeek
    }

    public var isError: Bool { kind == .wrong || kind == .skipped || kind == .extra }
}

public struct TasmeeSessionRecord: Codable, Sendable, Equatable, Identifiable {
    public var id: UUID
    public var startedAt: Date
    public var durationSec: Double
    public var mode: TasmeeMode
    public var surah: Int
    public var fromAyah: Int
    public var toAyah: Int
    public var totalWords: Int
    public var events: [TasmeeSessionEvent]
    public var hints: Int

    public init(id: UUID = UUID(), startedAt: Date, durationSec: Double, mode: TasmeeMode, surah: Int,
                fromAyah: Int, toAyah: Int, totalWords: Int, events: [TasmeeSessionEvent], hints: Int = 0) {
        self.id = id; self.startedAt = startedAt; self.durationSec = durationSec; self.mode = mode
        self.surah = surah; self.fromAyah = fromAyah; self.toAyah = toAyah
        self.totalWords = totalWords; self.events = events; self.hints = hints
    }

    public func count(_ k: TasmeeEventKind) -> Int { events.filter { $0.kind == k }.count }

    /// عدد الكلمات التي أُخطئ فيها (كلمة خاطئة أو متروكة)، كل موضع مرة واحدة.
    public var errorWords: Int {
        Set(events.filter { $0.kind == .wrong || $0.kind == .skipped }.map { "\($0.ayah):\($0.wordIndex)" }).count
    }

    /// نسبة الصحة 0…1: الكلمات الخالية من خطأ أو نظرة ÷ إجمالي الكلمات. الزيادة والتشكيل المحتمل لا يُحسبان خطأً.
    public var accuracy: Double {
        guard totalWords > 0 else { return 0 }
        let bad = Set(events.filter { $0.kind == .wrong || $0.kind == .skipped || $0.usedPeek }
            .map { "\($0.ayah):\($0.wordIndex)" }).count
        return max(0, Double(totalWords - bad) / Double(totalWords))
    }

    /// الآيات التي فيها خطأ أو نظرة، مرتّبة.
    public var weakAyahs: [Int] {
        Array(Set(events.filter { $0.isError || $0.usedPeek }.map(\.ayah))).sorted()
    }

    /// الأخطاء مجمّعة بالآية (للتفصيل في التقرير).
    public func errors(inAyah a: Int) -> [TasmeeSessionEvent] {
        events.filter { $0.ayah == a && ($0.isError || $0.kind == .tashkeelMaybe) }
    }
}

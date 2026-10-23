import Foundation

/// آية تُركت كلها (كل كلماتها متجاوَزة) قبل موضع القارئ الحالي.
public struct TasmeeSkippedAyah: Equatable, Sendable {
    public let surah: Int
    public let ayah: Int

    /// نص التنبيه: «تجاوزتَ الآية ١٢».
    public var message: String { "تجاوزتَ الآية \(ayah.arabicDigits)" }
}

public enum TasmeeSkippedAyahDetector {
    /// `words[i]` موضع الكلمة i (سورة، آية)، `states[i]` حالتها، و`reached` عدد الكلمات التي بلغها القارئ.
    /// تُعاد الآيات التي كل كلماتها داخل النطاق المبلوغ ومتجاوَزة، بترتيب القراءة.
    public static func fullySkipped(words: [(surah: Int, ayah: Int)], states: [TasmeeWordState], reached: Int) -> [TasmeeSkippedAyah] {
        let n = min(reached, words.count, states.count)
        guard n > 0 else { return [] }
        var order: [String] = []
        var skipped: [String: Bool] = [:]
        var ids: [String: TasmeeSkippedAyah] = [:]
        var total: [String: Int] = [:], seen: [String: Int] = [:]
        for w in words { total["\(w.surah):\(w.ayah)", default: 0] += 1 }
        for i in 0..<n {
            let w = words[i], key = "\(w.surah):\(w.ayah)"
            if skipped[key] == nil { order.append(key); ids[key] = TasmeeSkippedAyah(surah: w.surah, ayah: w.ayah) }
            seen[key, default: 0] += 1
            skipped[key] = (skipped[key] ?? true) && states[i] == .skipped
        }
        return order.compactMap { skipped[$0] == true && seen[$0] == total[$0] ? ids[$0] : nil }
    }
}

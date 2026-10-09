import Foundation
import CryptoKit

/// مخزن نموذج «تسميع» (CoreML/WhisperKit): تنزيل أرشيف واحد (zip بلا ضغط) من GitHub Releases عند الطلب،
/// مع استكمال عند الانقطاع (Range) وتحقق SHA-256 للأرشيف ثم لكل ملف بعد الفك.
/// يُخزَّن في Application Support/Tasmee (مُستثنى من iCloud backup) — نفس أسلوب تلاوات MajlisOfflineAudio.
/// الـmanifest: docs/tasmee/model-manifest-*.json (رابط الأرشيف بوسم إصدار ثابت وحجم وSHA-256).
struct TasmeeManifest: Codable {
    struct Archive: Codable { let name: String; let size: Int64; let sha256: String; let url: String }
    struct FileEntry: Codable { let path: String; let size: Int64; let sha256: String }
    let modelId: String
    let totalBytes: Int64
    let archive: Archive
    let files: [FileEntry]
}

enum TasmeeModelError: LocalizedError {
    case badURL, badStatus(Int), checksum(String), cancelled, unzip(String), io(String), wifiRequired
    var errorDescription: String? {
        switch self {
        case .badURL: return "عنوان تنزيل النموذج غير صالح."
        case .badStatus(let c): return "تعذّر تنزيل النموذج (HTTP \(c))."
        case .checksum(let p): return "فشل التحقق من سلامة الملف: \(p)"
        case .cancelled: return "أُلغي التنزيل."
        case .unzip(let m): return "تعذّر فك أرشيف النموذج: \(m)"
        case .io(let m): return m
        case .wifiRequired: return "تنزيل نموذج التسميع يتطلب اتصال Wi-Fi. اتصل بشبكة Wi-Fi ثم أعد المحاولة."
        }
    }
}

/// فك zip غير مضغوط (method 0) عبر الدليل المركزي — بلا مكتبات. يرفض أي مسار يخرج من مجلد الوجهة (zip-slip).
enum TasmeeZip {
    static func extract(_ zip: URL, to dest: URL) throws {
        let fm = FileManager.default
        let h = try FileHandle(forReadingFrom: zip)
        defer { try? h.close() }
        let fileSize = try h.seekToEnd()
        guard fileSize >= 22 else { throw TasmeeModelError.unzip("أرشيف صغير جدًا") }
        // EOCD: بحث رجوعيًا (التعليق ≤ 65535)
        let tailLen = Int(min(fileSize, 65_557))
        try h.seek(toOffset: fileSize - UInt64(tailLen))
        let tail = try h.read(upToCount: tailLen) ?? Data()
        guard let eocd = (0...(tail.count - 22)).reversed().first(where: { u32(tail, $0) == 0x06054b50 }) else {
            throw TasmeeModelError.unzip("لا دليل مركزي")
        }
        let count = Int(u16(tail, eocd + 10)), cdSize = Int(u32(tail, eocd + 12)), cdOffset = UInt64(u32(tail, eocd + 16))
        if cdOffset == 0xFFFF_FFFF || count == 0xFFFF { throw TasmeeModelError.unzip("Zip64 غير مدعوم") }
        try h.seek(toOffset: cdOffset)
        let cd = try h.read(upToCount: cdSize) ?? Data()
        guard cd.count == cdSize else { throw TasmeeModelError.unzip("دليل مركزي ناقص") }
        var p = 0
        for _ in 0..<count {
            guard p + 46 <= cd.count, u32(cd, p) == 0x02014b50 else { throw TasmeeModelError.unzip("إدخال تالف") }
            let method = u16(cd, p + 10), csize = UInt64(u32(cd, p + 20)), usize = UInt64(u32(cd, p + 24))
            let nameLen = Int(u16(cd, p + 28)), extraLen = Int(u16(cd, p + 30)), commentLen = Int(u16(cd, p + 32))
            let localOffset = UInt64(u32(cd, p + 42))
            guard p + 46 + nameLen <= cd.count, let name = String(data: cd.subdata(in: (p + 46)..<(p + 46 + nameLen)), encoding: .utf8) else {
                throw TasmeeModelError.unzip("اسم غير صالح")
            }
            p += 46 + nameLen + extraLen + commentLen
            // zip-slip: فحص لفظي (لا يتأثر بروابط النظام الرمزية مثل /tmp → /private/tmp)
            guard !name.hasPrefix("/"), !name.contains("\\"), !name.split(separator: "/").contains("..") else {
                throw TasmeeModelError.unzip("مسار غير آمن: \(name)")
            }
            let target = dest.appendingPathComponent(name)
            if name.hasSuffix("/") { try fm.createDirectory(at: target, withIntermediateDirectories: true); continue }
            guard method == 0, csize == usize else { throw TasmeeModelError.unzip("الأرشيف يجب أن يكون بلا ضغط (zip -0)") }
            try h.seek(toOffset: localOffset)
            let lh = try h.read(upToCount: 30) ?? Data()
            guard lh.count == 30, u32(lh, 0) == 0x04034b50 else { throw TasmeeModelError.unzip("ترويسة محلية تالفة") }
            let dataStart = localOffset + 30 + UInt64(u16(lh, 26)) + UInt64(u16(lh, 28))
            try fm.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true)
            fm.createFile(atPath: target.path, contents: nil)
            let out = try FileHandle(forWritingTo: target)
            defer { try? out.close() }
            try h.seek(toOffset: dataStart)
            var left = usize
            while left > 0 {
                let chunk = try h.read(upToCount: Int(min(left, 1 << 20))) ?? Data()
                guard !chunk.isEmpty else { throw TasmeeModelError.unzip("بيانات ناقصة: \(name)") }
                try out.write(contentsOf: chunk)
                left -= UInt64(chunk.count)
            }
        }
    }

    private static func u16(_ d: Data, _ o: Int) -> UInt16 { UInt16(d[d.startIndex + o]) | UInt16(d[d.startIndex + o + 1]) << 8 }
    private static func u32(_ d: Data, _ o: Int) -> UInt32 {
        UInt32(d[d.startIndex + o]) | UInt32(d[d.startIndex + o + 1]) << 8 | UInt32(d[d.startIndex + o + 2]) << 16 | UInt32(d[d.startIndex + o + 3]) << 24
    }
}

final class TasmeeModelStore {
    static let shared = TasmeeModelStore()
    private var cancelFlag = false
    private let lock = NSLock()

    func rootDir() throws -> URL {
        guard let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            throw TasmeeModelError.io("Application Support unavailable")
        }
        var dir = base.appendingPathComponent("Tasmee", isDirectory: true)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        var v = URLResourceValues(); v.isExcludedFromBackup = true
        try dir.setResourceValues(v)
        return dir
    }

    private func safeId(_ id: String) -> String { id.replacingOccurrences(of: "/", with: "_") }
    func modelDir(_ modelId: String) throws -> URL { try rootDir().appendingPathComponent(safeId(modelId), isDirectory: true) }
    private func partURL(_ m: TasmeeManifest) throws -> URL { try rootDir().appendingPathComponent(safeId(m.modelId) + ".zip.part") }
    private func completeMarker(_ dir: URL) -> URL { dir.appendingPathComponent(".complete") }

    static func fingerprint(_ m: TasmeeManifest) -> String {
        let joined = ([m.archive.sha256] + m.files.map { "\($0.path):\($0.size):\($0.sha256)" }).joined(separator: "\n")
        return SHA256.hash(data: Data(joined.utf8)).map { String(format: "%02x", $0) }.joined()
    }

    /// مثبَّت بالكامل؟ (علامة الاكتمال تُكتب بعد التحقق من كل ملف فقط)
    func isInstalled(_ m: TasmeeManifest) -> Bool {
        guard let dir = try? modelDir(m.modelId),
              let marker = try? String(contentsOf: completeMarker(dir), encoding: .utf8) else { return false }
        return marker.trimmingCharacters(in: .whitespacesAndNewlines) == Self.fingerprint(m)
    }

    /// بايتات الأرشيف المنزَّلة حاليًا (.part) — لشريط التقدّم عند الاستكمال.
    func bytesOnDisk(_ m: TasmeeManifest) -> Int64 {
        if isInstalled(m) { return m.archive.size }
        guard let part = try? partURL(m) else { return 0 }
        return min(m.archive.size, (try? FileManager.default.attributesOfItem(atPath: part.path)[.size] as? Int64) ?? nil ?? 0)
    }

    func delete(_ modelId: String) throws {
        let dir = try modelDir(modelId)
        if FileManager.default.fileExists(atPath: dir.path) { try FileManager.default.removeItem(at: dir) }
    }

    func cancel() { lock.lock(); cancelFlag = true; lock.unlock() }
    private func resetCancel() { lock.lock(); cancelFlag = false; lock.unlock() }
    private func isCancelled() -> Bool { lock.lock(); defer { lock.unlock() }; return cancelFlag }

    /// ينزّل الأرشيف مستكملًا من `.part` (Range)، يتحقق من الحجم وSHA-256، يفكّه في مجلد مؤقت، يتحقق من كل ملف، ثم يستبدل المجلد النهائي.
    /// `progress(received, total)` بالبايت (حجم الأرشيف). إعادة المحاولة عند الانقطاع بتراجع أسّي.
    func download(_ m: TasmeeManifest, maxRetries: Int = 6, progress: @escaping (Int64, Int64) -> Void) async throws {
        guard let url = URL(string: m.archive.url), url.scheme == "https" else { throw TasmeeModelError.badURL }
        resetCancel()
        let fm = FileManager.default
        let root = try rootDir()
        let dir = try modelDir(m.modelId)
        try? fm.removeItem(at: completeMarker(dir))
        let part = try partURL(m)

        var attempt = 0
        while true {
            do {
                try await fetch(url, to: part, expected: m.archive) { progress($0, m.archive.size) }
                break
            } catch TasmeeModelError.cancelled {
                throw TasmeeModelError.cancelled
            } catch TasmeeModelError.wifiRequired {
                throw TasmeeModelError.wifiRequired   // لا إعادة على البيانات الخلوية؛ الجزء المنزَّل يُستأنف لاحقًا
            } catch TasmeeModelError.checksum(let n) {
                try? fm.removeItem(at: part)       // أرشيف تالف: يُعاد من الصفر مرة واحدة
                attempt += 1
                if attempt > 1 { throw TasmeeModelError.checksum(n) }
            } catch {
                attempt += 1
                if attempt > maxRetries { throw error }
                try await Task.sleep(nanoseconds: UInt64(min(30, 1 << attempt)) * 500_000_000)
            }
        }

        let tmp = root.appendingPathComponent(safeId(m.modelId) + ".extracting", isDirectory: true)
        try? fm.removeItem(at: tmp)
        try fm.createDirectory(at: tmp, withIntermediateDirectories: true)
        do {
            try TasmeeZip.extract(part, to: tmp)
            for f in m.files {
                let p = tmp.appendingPathComponent(f.path)
                guard Self.fileMatches(p, f) else { throw TasmeeModelError.checksum(f.path) }
            }
        } catch {
            try? fm.removeItem(at: tmp)
            throw error
        }
        try? fm.removeItem(at: dir)
        try fm.moveItem(at: tmp, to: dir)
        try? fm.removeItem(at: part)
        try Self.fingerprint(m).write(to: completeMarker(dir), atomically: true, encoding: .utf8)
        progress(m.archive.size, m.archive.size)
    }

    static func fileMatches(_ url: URL, _ f: TasmeeManifest.FileEntry) -> Bool {
        guard let size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64) ?? nil, size == f.size else { return false }
        return sha256(of: url) == f.sha256
    }

    static func sha256(of url: URL) -> String? {
        guard let h = try? FileHandle(forReadingFrom: url) else { return nil }
        defer { try? h.close() }
        var hasher = SHA256()
        while let chunk = try? h.read(upToCount: 1 << 20), !chunk.isEmpty { hasher.update(data: chunk) }
        return hasher.finalize().map { String(format: "%02x", $0) }.joined()
    }

    /// جلسة Wi-Fi فقط: لا خلوي ولا نقطة اتصال شخصية (expensive) ولا وضع البيانات المنخفضة (constrained).
    private static let wifiOnlySession: URLSession = {
        let c = URLSessionConfiguration.default
        c.allowsCellularAccess = false
        c.allowsExpensiveNetworkAccess = false
        c.allowsConstrainedNetworkAccess = false
        c.waitsForConnectivity = false
        return URLSession(configuration: c)
    }()

    private func fetch(_ url: URL, to part: URL, expected a: TasmeeManifest.Archive, onBytes: @escaping (Int64) -> Void) async throws {
        let fm = FileManager.default
        var offset = (try? fm.attributesOfItem(atPath: part.path)[.size] as? Int64) ?? nil ?? 0
        if offset > a.size { try? fm.removeItem(at: part); offset = 0 }
        if offset < a.size {
            var req = URLRequest(url: url)
            req.timeoutInterval = 30
            if offset > 0 { req.setValue("bytes=\(offset)-", forHTTPHeaderField: "Range") }
            let bytes: URLSession.AsyncBytes, resp: URLResponse
            do {
                (bytes, resp) = try await Self.wifiOnlySession.bytes(for: req)
            } catch let e as URLError where e.networkUnavailableReason != nil {
                throw TasmeeModelError.wifiRequired
            }
            guard let http = resp as? HTTPURLResponse else { throw TasmeeModelError.badStatus(0) }
            if http.statusCode == 200 && offset > 0 { try? fm.removeItem(at: part); offset = 0 }   // الخادم تجاهل Range
            else if http.statusCode != 200 && http.statusCode != 206 { throw TasmeeModelError.badStatus(http.statusCode) }
            if !fm.fileExists(atPath: part.path) { fm.createFile(atPath: part.path, contents: nil) }
            let h = try FileHandle(forWritingTo: part)
            defer { try? h.close() }
            try h.seekToEnd()
            var buf = Data(); buf.reserveCapacity(1 << 17)
            var got = offset
            for try await b in bytes {
                if isCancelled() { throw TasmeeModelError.cancelled }
                buf.append(b)
                if buf.count >= (1 << 17) { try h.write(contentsOf: buf); got += Int64(buf.count); buf.removeAll(keepingCapacity: true); onBytes(got) }
            }
            if !buf.isEmpty { try h.write(contentsOf: buf); got += Int64(buf.count); onBytes(got) }
        }
        let size = (try? fm.attributesOfItem(atPath: part.path)[.size] as? Int64) ?? nil
        guard size == a.size, Self.sha256(of: part) == a.sha256 else { throw TasmeeModelError.checksum(a.name) }
    }
}

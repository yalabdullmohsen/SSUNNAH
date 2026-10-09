import Foundation

/// وجهة داخل NavigationStack. كل شاشة لم تُحوَّل أصليًا تبقى `.web`.
public enum Route: Hashable {
    case web(path: String)

    public var path: String {
        switch self {
        case .web(let path): return path
        }
    }

    /// يوحّد المسار: يبدأ بـ`/`، بلا `/` ختامية، ويحتفظ بالاستعلام والمرساة كما هي.
    public static func normalize(_ raw: String) -> String {
        var path = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if path.isEmpty { return "/" }
        if !path.hasPrefix("/") { path = "/" + path }
        let cut = path.firstIndex { $0 == "?" || $0 == "#" } ?? path.endIndex
        var base = String(path[..<cut])
        let tail = String(path[cut...])
        while base.count > 1 && base.hasSuffix("/") { base.removeLast() }
        return base + tail
    }

    /// يحوّل رابطًا (عميقًا أو من النطاق) إلى مسار؛ nil لما هو خارج التطبيق.
    public static func path(from url: URL, hosts: Set<String> = AppHosts.web) -> String? {
        if url.scheme == AppHosts.scheme {
            // majlisilm://prayer-times → /prayer-times
            let host = url.host.map { "/" + $0 } ?? ""
            return normalize(host + url.path + query(url))
        }
        guard ["http", "https"].contains(url.scheme ?? ""), let host = url.host, hosts.contains(host) else {
            return nil
        }
        return normalize((url.path.isEmpty ? "/" : url.path) + query(url))
    }

    private static func query(_ url: URL) -> String {
        url.query.map { "?" + $0 } ?? ""
    }
}

public enum AppHosts {
    public static let scheme = "majlisilm"
    /// النطاق الحي www.ssunnah.com (majlisilm.com وapex يعيدان التوجيه إليه بـ308) — مطابق لـallowNavigation في capacitor.config.ts.
    public static let web: Set<String> = ["www.ssunnah.com", "ssunnah.com", "majlisilm.com", "www.majlisilm.com"]
}

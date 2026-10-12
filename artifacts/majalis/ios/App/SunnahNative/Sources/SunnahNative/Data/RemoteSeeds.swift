import Foundation

/// بذور محزومة لمصادر `.remote`: تُعرض عند أول تشغيل بلا إنترنت ولا كاش، ثم تحلّ محلها آخر استجابة ناجحة.
/// المسار `/data/a/b.json` ← `Data/a/b.json` (نفس بنية public/data)، و`/api/…` و`/rest/v1/…` ← `Data/seed/`.
enum RemoteSeeds {
    static func data(forPath path: String, bundle: Bundle) -> Data? {
        let clean = path.split(separator: "?", maxSplits: 1, omittingEmptySubsequences: false)
        let route = String(clean[0])
        let query = clean.count > 1 ? String(clean[1]) : ""

        if route == "/api/auto-content" {
            guard let list = file("auto-content", "Data/seed", bundle) else { return nil }
            guard let slug = param("slug", in: query) else { return list }
            return detail(slug: slug, in: list)
        }
        if route == "/rest/v1/platform_updates" { return file("platform-updates", "Data/seed", bundle) }
        if route.hasPrefix("/data/"), route.hasSuffix(".json") {
            let comps = route.dropFirst("/data/".count).dropLast(".json".count).split(separator: "/")
            guard let name = comps.last else { return nil }
            let dir = (["Data"] + comps.dropLast().map(String.init)).joined(separator: "/")
            return file(String(name), dir, bundle)
        }
        return nil
    }

    private static func file(_ name: String, _ dir: String, _ bundle: Bundle) -> Data? {
        bundle.url(forResource: name, withExtension: "json", subdirectory: dir).flatMap { try? Data(contentsOf: $0) }
    }

    private static func param(_ key: String, in query: String) -> String? {
        for pair in query.split(separator: "&") {
            let kv = pair.split(separator: "=", maxSplits: 1)
            if kv.count == 2, kv[0] == key { return String(kv[1]).removingPercentEncoding }
        }
        return nil
    }

    /// استجابة تفصيل بالـslug من قائمة البذور: `{"ok":true,"items":[],"item":{…}}`.
    private static func detail(slug: String, in list: Data) -> Data? {
        guard let obj = try? JSONSerialization.jsonObject(with: list) as? [String: Any],
              let items = obj["items"] as? [[String: Any]],
              let hit = items.first(where: { ($0["slug"] as? String) == slug }) else { return nil }
        return try? JSONSerialization.data(withJSONObject: ["ok": true, "items": [Any](), "item": hit])
    }
}

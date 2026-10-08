import Foundation

/// قرار التنقّل داخل WebScreen — منطق صرف قابل للاختبار.
public enum WebLinkDecision: Equatable {
    /// يبقى داخل الـWebView.
    case allow
    /// صفحة أخرى من الموقع: تُدفع شاشةً في المكدّس الأصلي.
    case push(path: String)
    /// خارج الموقع (روابط، بريد، هاتف): يفتحه النظام.
    case openExternally(URL)
    case cancel
}

public struct WebLinkPolicy: Sendable {
    public let baseURL: URL
    public let hosts: Set<String>

    public init(baseURL: URL = WebLinkPolicy.defaultBase, hosts: Set<String> = ["majlisilm.com", "www.majlisilm.com"]) {
        self.baseURL = baseURL
        self.hosts = hosts
    }

    public static let defaultBase = URL(string: "https://majlisilm.com")!

    /// رابط الصفحة لمسار تطبيق (`/lessons/12?x=1`).
    public func url(for path: String) -> URL {
        let trimmed = path.trimmingCharacters(in: .whitespaces)
        let normalized = trimmed.hasPrefix("/") ? trimmed : "/" + trimmed
        return URL(string: normalized, relativeTo: baseURL)?.absoluteURL ?? baseURL
    }

    /// مسار التطبيق من رابط الموقع، أو nil إن كان خارجيًا.
    public func appPath(of url: URL) -> String? {
        guard let scheme = url.scheme?.lowercased(), scheme == "https" || scheme == "http",
              let host = url.host?.lowercased(), hosts.contains(host) else { return nil }
        let path = url.path.isEmpty ? "/" : url.path
        guard let query = url.query, !query.isEmpty else { return path }
        return path + "?" + query
    }

    /// - Parameters:
    ///   - isMainFrame: الإطارات الفرعية (مشغّلات، تضمين) لا تُدفع ولا تُفتح خارجيًا.
    ///   - isUserLink: نقرة رابط حقيقية؛ التحميل الأول وإعادة التوجيه يبقيان في المكان.
    public func decide(_ url: URL, currentPath: String?, isMainFrame: Bool, isUserLink: Bool) -> WebLinkDecision {
        let scheme = url.scheme?.lowercased() ?? ""
        if ["about", "blob", "data"].contains(scheme) { return .allow }
        guard let path = appPath(of: url) else {
            if !isMainFrame && (scheme == "https" || scheme == "http") { return .allow }
            return isUserLink || isMainFrame ? .openExternally(url) : .cancel
        }
        guard isMainFrame, isUserLink else { return .allow }
        // تغيّر المرساة فقط (#) أو الصفحة نفسها: يبقى في المكان.
        if let currentPath, Self.stripFragment(currentPath) == Self.stripFragment(path) { return .allow }
        return .push(path: path)
    }

    private static func stripFragment(_ path: String) -> String {
        path.split(separator: "#", maxSplits: 1).first.map(String.init) ?? path
    }
}

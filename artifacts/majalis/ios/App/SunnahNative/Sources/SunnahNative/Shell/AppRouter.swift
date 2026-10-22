import SwiftUI

/// حالة التنقل: مكدّس واحد جذره الرئيسية (بلا شريط تبويب).
@MainActor
public final class AppRouter: ObservableObject {
    @Published public var stack: [Route] = []

    public init() {}

    /// يدفع المسار فوق الرئيسية؛ جذر الرئيسية "/" يصفّر المكدّس، ولا تكرار للوجهة نفسها.
    public func open(path raw: String) {
        let path = Route.normalize(raw)
        // الجذر يُقارن بلا استعلام/مرساة: «/?utm_source=x» رئيسية لا وجهة فوقها.
        let base = path.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? path
        if base == AppTab.home.rootPath {
            stack = []
        } else if stack.last != .web(path: path) {
            stack.append(.web(path: path))
        }
    }

    /// رابط عميق أو رابط من النطاق؛ يعيد false لما هو خارج التطبيق.
    @discardableResult
    public func open(url: URL) -> Bool {
        guard let path = Route.path(from: url) else { return false }
        open(path: path)
        return true
    }
}

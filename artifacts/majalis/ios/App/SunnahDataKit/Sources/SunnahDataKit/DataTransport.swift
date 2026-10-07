import Foundation

/// الناقل البعيد. يحقنه التطبيق بمحوّل فوق `NetworkService.getVercelData`
/// ليبقى رمز الدخول وتحديثه في مكان واحد.
public protocol DataTransport: Sendable {
    func fetch(path: String, requireAuth: Bool) async throws -> Data
}

/// ناقل من دالة؛ يكفي للربط وللاختبارات.
public struct ClosureTransport: DataTransport {
    private let body: @Sendable (String, Bool) async throws -> Data

    public init(_ body: @escaping @Sendable (String, Bool) async throws -> Data) {
        self.body = body
    }

    public func fetch(path: String, requireAuth: Bool) async throws -> Data {
        try await body(path, requireAuth)
    }
}

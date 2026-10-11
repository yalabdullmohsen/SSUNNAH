import Foundation
import SunnahNative

/// ينفّذ AuthSessionStoring فوق KeychainStore الموجود (App/Services/KeychainStore.swift) دون تغيير منطقه.
/// المفاتيح بنفس مساحة الاسم القديمة `cap.supabase.<key>` فتبقى الجلسات القائمة صالحة بعد التحديث.
struct KeychainAuthStore: AuthSessionStoring {
    private static let legacyAccount = "majlis.auth.session.v1"

    private func account(_ key: String) throws -> String {
        let k = key.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !k.isEmpty else { throw KeychainStore.KeychainError.invalidData }
        return "cap.supabase.\(k)"
    }

    func value(forKey key: String) throws -> String? {
        guard let data = try KeychainStore.get(account: account(key)) else { return nil }
        guard let s = String(data: data, encoding: .utf8) else { throw KeychainStore.KeychainError.invalidData }
        return s
    }

    func setValue(_ value: String, forKey key: String) throws {
        try KeychainStore.set(Data(value.utf8), account: account(key))
    }

    func removeValue(forKey key: String) throws { try KeychainStore.delete(account: account(key)) }
    func clearLegacySession() throws { try KeychainStore.delete(account: Self.legacyAccount) }
}

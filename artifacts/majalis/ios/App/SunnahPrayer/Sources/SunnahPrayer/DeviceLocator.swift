import CoreLocation
import Foundation

public enum DeviceLocatorError: Error, Equatable {
    case denied
    case unavailable
}

/// قراءة واحدة للموقع بدقة الكيلومتر (تكفي للمواقيت وتحفظ البطارية)، ثم اسم المكان ومنطقته الزمنية.
@MainActor
public final class DeviceLocator: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<CLLocation, Error>?

    public override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
    }

    public func currentLocation() async throws -> PrayerLocation {
        let fix = try await requestFix()
        let placemark = try? await CLGeocoder().reverseGeocodeLocation(fix, preferredLocale: Locale(identifier: "ar")).first
        let label = placemark?.locality ?? placemark?.administrativeArea ?? "موقعي الحالي"
        let timeZone = placemark?.timeZone ?? .current
        return PrayerLocation(label: label, latitude: fix.coordinate.latitude, longitude: fix.coordinate.longitude, timeZoneIdentifier: timeZone.identifier)
    }

    private func requestFix() async throws -> CLLocation {
        switch manager.authorizationStatus {
        case .denied, .restricted: throw DeviceLocatorError.denied
        default: break
        }
        continuation?.resume(throwing: CancellationError())
        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            if manager.authorizationStatus == .notDetermined {
                manager.requestWhenInUseAuthorization()
            } else {
                manager.requestLocation()
            }
        }
    }

    private func finish(_ result: Result<CLLocation, Error>) {
        continuation?.resume(with: result)
        continuation = nil
    }

    public nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        Task { @MainActor in
            guard continuation != nil else { return }
            switch status {
            case .denied, .restricted: finish(.failure(DeviceLocatorError.denied))
            case .notDetermined: break
            default: self.manager.requestLocation()
            }
        }
    }

    public nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let fix = locations.last else { return }
        Task { @MainActor in finish(.success(fix)) }
    }

    public nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in finish(.failure(DeviceLocatorError.unavailable)) }
    }
}

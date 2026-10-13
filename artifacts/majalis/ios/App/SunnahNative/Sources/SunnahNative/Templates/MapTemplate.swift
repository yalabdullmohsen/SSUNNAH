import SwiftUI
import MapKit

public struct MapPlace: Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public let latitude: Double
    public let longitude: Double
    public var route: String?
    public init(id: String, title: String, subtitle: String? = nil, latitude: Double, longitude: Double, route: String? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.latitude = latitude; self.longitude = longitude; self.route = route
    }
    /// إحداثيات صالحة فقط (تُهمل غيرها بدل انهيار الخريطة).
    public var isValid: Bool { (-90...90).contains(latitude) && (-180...180).contains(longitude) && !(latitude == 0 && longitude == 0) }
    var coordinate: CLLocationCoordinate2D { .init(latitude: latitude, longitude: longitude) }
}

/// قالب 11 — خريطة: دبابيس أماكن + بطاقة سفلية للمحدّد تفتح مساره. تحت الخريطة قائمة للوصول بلا لمس الخريطة (VoiceOver).
public struct MapTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let places: [MapPlace]
    @State private var region: MKCoordinateRegion
    @State private var selected: MapPlace?

    public init(places: [MapPlace]) {
        let valid = places.filter(\.isValid)
        self.places = valid
        _region = State(initialValue: Self.fit(valid))
    }

    static func fit(_ p: [MapPlace]) -> MKCoordinateRegion {
        guard let f = p.first else { return .init(center: .init(latitude: 24.47, longitude: 39.61), span: .init(latitudeDelta: 40, longitudeDelta: 40)) }
        let lats = p.map(\.latitude), lons = p.map(\.longitude)
        let c = CLLocationCoordinate2D(latitude: (lats.min()! + lats.max()!) / 2, longitude: (lons.min()! + lons.max()!) / 2)
        _ = f
        return .init(center: c, span: .init(latitudeDelta: max(2, (lats.max()! - lats.min()!) * 1.4), longitudeDelta: max(2, (lons.max()! - lons.min()!) * 1.4)))
    }

    public var body: some View {
        if places.isEmpty { EmptyStateView() } else {
            VStack(spacing: 0) {
                Map(coordinateRegion: $region, annotationItems: places) { place in
                    MapAnnotation(coordinate: place.coordinate) {
                        Button { selected = place } label: {
                            Image(systemName: "mappin.circle.fill").font(.title)
                                .foregroundStyle(selected == place ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                                .frame(minWidth: Sunnah.Spacing.touch, minHeight: Sunnah.Spacing.touch)
                        }
                        .accessibilityLabel(place.title)
                    }
                }
                .frame(minHeight: 240)
                if let s = selected {
                    Button { if let r = s.route { openRoute(r) } } label: { SunnahListRow(title: s.title, subtitle: s.subtitle) }
                        .buttonStyle(.plain).padding(Sunnah.Spacing.pageX).background(Sunnah.Colors.surface)
                }
                List(places) { p in
                    Button { selected = p; sunnahAnimate { region.center = p.coordinate } } label: { SunnahListRow(title: p.title, subtitle: p.subtitle) }
                        .buttonStyle(.plain).listRowBackground(Sunnah.Colors.surface)
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

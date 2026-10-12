import SwiftUI

/// /islamic-directory: مركز بثلاث بطاقات كما في IslamicDirectoryHubPage (بلا أعداد، فهي من content-counts في الويب).
public struct DirectoryHubView: View {
    public struct Entry: Identifiable, Hashable, Sendable {
        public let path: String
        public let title: String
        public let subtitle: String
        public let symbol: String
        public var id: String { path }
    }

    public static let entries: [Entry] = [
        Entry(path: "/universities", title: "دليل الجامعات والكليات الشرعية", subtitle: "برامج وأسئلة شائعة ومقارنة", symbol: "graduationcap"),
        Entry(path: "/institutions", title: "المؤسسات الإسلامية", subtitle: "مساجد ومكتبات ومراكز وهيئات", symbol: "building.columns"),
        Entry(path: "/islamic-landmarks", title: "المساجد والمشاهد", subtitle: "معالم على الخريطة عبر العصور الإسلامية", symbol: "mappin.and.ellipse"),
    ]

    public let onOpen: (String) -> Void

    public init(onOpen: @escaping (String) -> Void) {
        self.onOpen = onOpen
    }

    public var body: some View {
        ScrollView {
            LazyVStack(spacing: Sunnah.Spacing.s3) {
                ForEach(Self.entries) { e in
                    Button { onOpen(e.path) } label: {
                        SunnahCard {
                            HStack(spacing: Sunnah.Spacing.s3) {
                                Image(systemName: e.symbol).font(Sunnah.Typography.sectionTitle)
                                    .foregroundStyle(Sunnah.Colors.primary)
                                    .frame(width: Sunnah.Spacing.touch).accessibilityHidden(true)
                                SunnahListRow(title: e.title, subtitle: e.subtitle, showsChevron: true)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }.padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

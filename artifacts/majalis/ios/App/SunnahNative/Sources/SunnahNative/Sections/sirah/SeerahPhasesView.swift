import SwiftUI

/// مرحلة من /seerah كما تُصدَّر حرفيًا في sirah/seerah-phases.json (docs/native/contract/sirah.md).
public struct SeerahPhase: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let num: Int
    public let title: String
    public let year: String
    public let desc: String
    public let topics: [String]
    public let keyEvents: [String]
}

public struct SeerahPhasesView: View {
    public let phases: [SeerahPhase]

    public init(phases: [SeerahPhase]) {
        self.phases = phases
    }

    /// أي خلل في البيانات يعطي قائمة فارغة لا انهيارًا.
    public static func phases(fromJSON data: Data) -> [SeerahPhase] {
        (try? JSONDecoder().decode([SeerahPhase].self, from: data.asLatinDigitsJSON)) ?? []
    }

    public var body: some View {
        Group {
            if phases.isEmpty {
                SectionEmptyState(title: "لا توجد مراحل منشورة بعد", message: "ستظهر مراحل السيرة هنا فور توفّر بياناتها.")
            } else {
                ScrollView {
                    LazyVStack(spacing: Sunnah.Spacing.s3) {
                        ForEach(phases.sorted { $0.num < $1.num }) { p in
                            SunnahCard {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                    Text("\(p.num). \(p.title)").font(Sunnah.Typography.cardTitle)
                                        .foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                                    SunnahChip(p.year)
                                    Text(p.desc).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                    ForEach(p.keyEvents, id: \.self) {
                                        Text("• \($0)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                    }
                                }
                            }
                        }
                    }.padding(Sunnah.Spacing.pageX)
                }.background(Sunnah.Colors.bg)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}

/// حالة فارغة مرتبة مشتركة.
public struct SectionEmptyState: View {
    public let title: String
    public let message: String

    public init(title: String, message: String) {
        self.title = title
        self.message = message
    }

    public var body: some View {
        SunnahMessageState(symbol: "books.vertical", title: title, message: message)
            .screenState(.empty)
            .frame(maxHeight: .infinity)
            .background(Sunnah.Colors.bg)
    }
}

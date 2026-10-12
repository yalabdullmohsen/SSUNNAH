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
        (try? JSONDecoder().decode([SeerahPhase].self, from: data)) ?? []
    }

    public var body: some View {
        Group {
            if phases.isEmpty {
                SectionEmptyState(title: "لا توجد مراحل منشورة بعد", message: "ستظهر مراحل السيرة هنا فور توفّر بياناتها.")
            } else {
                List(phases.sorted { $0.num < $1.num }) { p in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(p.num). \(p.title)").font(.headline)
                        Text(p.year).font(.caption).foregroundStyle(.secondary)
                        Text(p.desc).font(.subheadline)
                        ForEach(p.keyEvents, id: \.self) { Text("• \($0)").font(.footnote) }
                    }
                    .padding(.vertical, 4)
                }
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
        VStack(spacing: 12) {
            Image(systemName: "books.vertical")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)
            Text(title).font(.headline)
            Text(message).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
    }
}

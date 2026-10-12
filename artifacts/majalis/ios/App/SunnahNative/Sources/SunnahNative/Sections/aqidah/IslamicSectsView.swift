import SwiftUI

/// سجل فرقة كما يُصدَّر في ios-native/Data/aqidah/islamic-sects.json (المنشور فقط).
public struct IslamicSectRecord: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let title: String
}

/// شاشة /islamic-sects. الموقع لا ينشر إلا سجلات PUBLISHED وكلها الآن NEEDS_* غير منشورة،
/// فالمصدَّر `[]` وتُعرض حالة فارغة مرتبة بدل أي محتوى غير مراجَع (docs/native/requests/n2-from-n1-exemptions.md).
public struct IslamicSectsView: View {
    public let records: [IslamicSectRecord]

    public init(records: [IslamicSectRecord]) {
        self.records = records
    }

    /// يفك JSON المُصدَّر؛ أي خلل في البيانات يعطي قائمة فارغة لا انهيارًا.
    public static func records(fromJSON data: Data) -> [IslamicSectRecord] {
        (try? JSONDecoder().decode([IslamicSectRecord].self, from: data)) ?? []
    }

    public var body: some View {
        Group {
            if records.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "books.vertical")
                        .font(.system(size: 40))
                        .foregroundStyle(.secondary)
                        .accessibilityHidden(true)
                    Text("لا توجد مواد منشورة بعد")
                        .font(.headline)
                    Text("يُنشر هذا القسم بعد اكتمال مراجعة مصادره الشرعية والتاريخية.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(24)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .accessibilityElement(children: .combine)
            } else {
                List(records) { Text($0.title) }
            }
        }
        .navigationTitle("الفرق الإسلامية")
        .environment(\.layoutDirection, .rightToLeft)
    }
}

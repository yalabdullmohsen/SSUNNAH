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
        (try? JSONDecoder().decode([IslamicSectRecord].self, from: data.asLatinDigitsJSON)) ?? []
    }

    public var body: some View {
        Group {
            if records.isEmpty {
                SectionEmptyState(title: "لا توجد مواد منشورة بعد",
                                  message: "يُنشر هذا القسم بعد اكتمال مراجعة مصادره الشرعية والتاريخية.")
            } else {
                ScrollView {
                    LazyVStack(spacing: Sunnah.Spacing.s3) {
                        ForEach(records) { r in
                            SunnahCard { Text(r.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary) }
                        }
                    }.padding(Sunnah.Spacing.pageX)
                }.background(Sunnah.Colors.bg)
            }
        }
        .sunnahNavTitle("الفرق الإسلامية")
        .environment(\.layoutDirection, .rightToLeft)
    }
}

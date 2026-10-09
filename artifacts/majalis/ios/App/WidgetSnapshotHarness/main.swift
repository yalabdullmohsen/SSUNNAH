import SwiftUI
import WidgetKit
import UIKit
import SunnahWidgetKit

struct Fam { let name: String; let f: WidgetFamily; let w: CGFloat; let h: CGFloat }
let fams: [Fam] = [
  Fam(name: "small", f: .systemSmall, w: 170, h: 170),
  Fam(name: "medium", f: .systemMedium, w: 364, h: 170),
  Fam(name: "large", f: .systemLarge, w: 364, h: 382),
  Fam(name: "rect", f: .accessoryRectangular, w: 172, h: 76),
  Fam(name: "circ", f: .accessoryCircular, w: 76, h: 76),
]

func variant(_ e: CatalogWidgetEntry, _ v: String) -> CatalogWidgetEntry {
  switch v {
  case "nodata":
    return CatalogWidgetEntry(date: e.date, presentation: .liveNoData, prayer: PrayerWidgetEntry.noDataEntry(), calendar: nil, adhkar: nil, quran: nil, mushaf: nil, custom: nil, progress: nil, content: nil, selectedCustomId: nil, isSampleData: false)
  case "long":
    var c = e.calendar
    c?.hijriMonthAr = "ربيع الآخر"; c?.hijriDay = 29; c?.hijriMonth = 4
    c?.weekdayAr = "الأربعاء"; c?.inRamadan = false
    c?.upcomingEventNameAr = "ليلة القدر"; c?.upcomingEventDays = 249; c?.daysUntilRamadan = 249
    var m = e.mushaf
    m?.lastSurahNameAr = "آل عمران"
    return CatalogWidgetEntry(date: e.date, presentation: e.presentation, prayer: e.prayer, calendar: c, adhkar: e.adhkar, quran: e.quran, mushaf: m, custom: e.custom, progress: e.progress, content: e.content, selectedCustomId: e.selectedCustomId, isSampleData: e.isSampleData)
  default: return e
  }
}

// بوابة الاقتطاع: ImageRenderer لا يرسم containerBackground، فنرسم خلفية مسطّحة ونفحص أي ملامسة
// للمحتوى لحافة الإطار (حزام 2pt، بلا الزوايا 14pt). المحتوى المقصوص بالإطار يلامس الحافة حتمًا.
// حدّها الصادق: لا تكشف الحذف بنقاط «…» داخل الإطار (تحرسه بوابة الميزانية الساكنة WidgetTextBudget).
struct EdgeFinding { let id: String; let side: String }
nonisolated(unsafe) var findings: [EdgeFinding] = []
let flat = (r: UInt8(18), g: UInt8(56), b: UInt8(49))

@MainActor func edgeContacts(_ id: String, _ fam: Fam, _ view: AnyView) {
  if fam.name == "circ" { return }
  let content = view.frame(width: fam.w, height: fam.h)
    .background(Color(red: Double(flat.r) / 255, green: Double(flat.g) / 255, blue: Double(flat.b) / 255))
  let r = ImageRenderer(content: content); r.scale = 3
  guard let cg = r.uiImage?.cgImage else { findings.append(EdgeFinding(id: id, side: "render-failed")); return }
  let w = cg.width, h = cg.height
  var px = [UInt8](repeating: 0, count: w * h * 4)
  let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
  func isInk(_ x: Int, _ y: Int) -> Bool {
    let i = (y * w + x) * 4
    return abs(Int(px[i]) - Int(flat.r)) > 24 || abs(Int(px[i + 1]) - Int(flat.g)) > 24 || abs(Int(px[i + 2]) - Int(flat.b)) > 24
  }
  let band = 6, corner = 42
  var sides = Set<String>()
  for y in 0..<h { for x in 0..<w {
    let inBand = x < band || x >= w - band || y < band || y >= h - band
    if !inBand { continue }
    if (x < corner || x >= w - corner) && (y < corner || y >= h - corner) { continue }
    if isInk(x, y) {
      sides.insert(x < band ? "يسار" : x >= w - band ? "يمين" : y < band ? "أعلى" : "أسفل")
    }
  } }
  for s in sides.sorted() { findings.append(EdgeFinding(id: id, side: s)) }
}

@MainActor func render(_ name: String, _ fam: Fam, _ scheme: ColorScheme, _ v: String, _ view: AnyView, out: String) {
  let tag = "\(name)_\(fam.name)_\(scheme == .dark ? "dark" : "light")_\(v)"
  let styled = view
    .environment(\.snapFamily, fam.f)
    .environment(\.colorScheme, scheme)
    .environment(\.layoutDirection, .rightToLeft)
  edgeContacts(tag, fam, AnyView(styled))
  let content = styled
    .frame(width: fam.w, height: fam.h)
    .background(LinearGradient(colors: [Color(red: 0.07, green: 0.22, blue: 0.19), Color(red: 0.04, green: 0.13, blue: 0.11)], startPoint: .top, endPoint: .bottom))
    .clipShape(RoundedRectangle(cornerRadius: fam.f == .accessoryRectangular || fam.f == .accessoryCircular ? 14 : 22))
  let r = ImageRenderer(content: content)
  r.scale = 3
  if let ui = r.uiImage, let d = ui.pngData() {
    try? d.write(to: URL(fileURLWithPath: "\(out)/\(tag).png"))
  }
}

@MainActor func run() {
  let out = CommandLine.arguments[1]
  try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
  let base = CatalogWidgetEntry.gallery()
  for v in ["data", "long", "nodata"] {
    let e = variant(base, v)
    let widgets: [(String, [String], (CatalogWidgetEntry) -> AnyView)] = [
      ("1-prayer-next", ["small","medium","large","rect","circ"], { AnyView(PrayerWidgetRootView(entry: $0.prayer)) }),
      ("2-prayer-all", ["large"], { AnyView(AllPrayerCatalogView(entry: $0.prayer)) }),
      ("3-date", ["small","medium","rect","circ"], { AnyView(HijriCalendarView(entry: $0)) }),
      ("4-ramadan", ["small","medium","rect"], { AnyView(RamadanCountdownView(entry: $0)) }),
      ("5-adhkar-time", ["small","medium","rect"], { AnyView(TimeAwareAdhkarView(entry: $0)) }),
      ("6-adhkar-hour", ["small","medium","rect"], { AnyView(RotatingAdhkarView(entry: $0)) }),
      ("7-achievement", ["small","medium","rect","circ"], { AnyView(AdhkarStreakView(entry: $0)) }),
      ("8-ayah-dua", ["small","medium","large","rect"], { AnyView(AyahOrDuaView(entry: $0)) }),
      ("9-mushaf", ["small","medium"], { AnyView(MushafContinueView(entry: $0)) }),
    ]
    for (n, fs, mk) in widgets {
      for f in fams where fs.contains(f.name) {
        for s in [ColorScheme.light, .dark] { render(n, f, s, v, mk(e), out: out) }
      }
    }
  }
  if findings.isEmpty { print("EDGE-OK") } else {
    for f in findings { print("EDGE-FAIL \(f.id) \(f.side)") }
    exit(1)
  }
}
MainActor.assumeIsolated { run() }

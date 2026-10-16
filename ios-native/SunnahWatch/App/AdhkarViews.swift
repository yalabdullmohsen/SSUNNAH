import SwiftUI

/// الأذكار: صباح/مساء بتقدّم اليوم، ثم مسبحة.
struct AdhkarListView: View {
    @EnvironmentObject private var store: WatchStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Gauge(value: store.dayFraction) { EmptyView() }
                            .gaugeStyle(.accessoryCircularCapacity).tint(WatchTheme.gold).frame(width: 36, height: 36)
                        Text("تقدّم اليوم").font(.footnote)
                        Spacer()
                        Text("\(Int(store.dayFraction * 100))%").font(.footnote.monospacedDigit().bold()).foregroundStyle(WatchTheme.gold)
                    }
                    .accessibilityElement(children: .combine)
                }
                ForEach(store.payload?.adhkar ?? []) { set in
                    NavigationLink(value: set.id) {
                        HStack {
                            Text(set.titleAr)
                            Spacer()
                            Text("\(Int(store.fraction(of: set) * 100))%").font(.caption.monospacedDigit()).foregroundStyle(WatchTheme.gold)
                        }
                    }
                }
                NavigationLink(value: "tasbih") {
                    Label("المسبحة", systemImage: "circle.dotted")
                }
            }
            .navigationTitle("الأذكار")
            .navigationDestination(for: String.self) { id in
                if id == "tasbih" { TasbihView() }
                else if let set = store.payload?.adhkar.first(where: { $0.id == id }) { AdhkarPagerView(set: set) }
            }
        }
    }
}

/// صفحات الأذكار: عدّ بالنقر أو بتاج الساعة الرقمي، اهتزاز عند كل عدّة وعند الإكمال.
struct AdhkarPagerView: View {
    let set: WatchPayload.AdhkarSet
    @EnvironmentObject private var store: WatchStore
    @State private var index = 0

    var body: some View {
        TabView(selection: $index) {
            ForEach(Array(set.items.enumerated()), id: \.element.id) { i, d in
                DhikrCard(setId: set.id, dhikr: d) {
                    if i + 1 < set.items.count { withAnimation { index = i + 1 } }
                }.tag(i)
            }
        }
        .tabViewStyle(.page)
        .navigationTitle(set.titleAr)
    }
}

private struct DhikrCard: View {
    let setId: String
    let dhikr: WatchPayload.Dhikr
    let onDone: () -> Void
    @EnvironmentObject private var store: WatchStore
    @State private var crown: Double = 0
    @State private var lastCrown = 0

    var body: some View {
        let n = store.count(set: setId, dhikr: dhikr.id)
        let target = max(1, dhikr.count)
        ScrollView {
            VStack(spacing: 8) {
                Text(dhikr.text).font(.body).multilineTextAlignment(.center).foregroundStyle(WatchTheme.textPrimary)
                if let s = dhikr.source { Text(s).font(.caption2).foregroundStyle(WatchTheme.textSecondary) }
                Button { bump() } label: {
                    ZStack {
                        Circle().stroke(WatchTheme.raised, lineWidth: 6)
                        Circle().trim(from: 0, to: Double(min(n, target)) / Double(target))
                            .stroke(n >= target ? WatchTheme.gold : WatchTheme.textPrimary, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                        Text("\(n)/\(target)").font(.title3.monospacedDigit().bold())
                    }
                    .frame(width: 84, height: 84)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("عدّ")
                .accessibilityValue("\(n) من \(target)")
            }
            .padding(.horizontal, 6)
        }
        .focusable()
        .digitalCrownRotation($crown, from: 0, through: 10_000, by: 1, sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: false)
        .onChange(of: crown) { _, v in
            let step = Int(v.rounded(.down))
            if step > lastCrown { for _ in 0..<(step - lastCrown) { bump() } }
            lastCrown = step
        }
    }

    private func bump() {
        if store.tick(set: setId, dhikr: dhikr) { onDone() }
    }
}

/// مسبحة: نقر أو تاج؛ اهتزاز مميّز كل 33.
struct TasbihView: View {
    @EnvironmentObject private var store: WatchStore
    @State private var crown: Double = 0
    @State private var lastCrown = 0

    var body: some View {
        VStack(spacing: 8) {
            Button { store.tasbihTick() } label: {
                Text("\(store.progress.tasbih)")
                    .font(.system(size: 52, weight: .bold, design: .rounded).monospacedDigit())
                    .frame(maxWidth: .infinity, minHeight: 80)
                    .background(WatchTheme.raised, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("المسبحة").accessibilityValue("\(store.progress.tasbih)")
            Button("تصفير", role: .destructive) { store.tasbihReset() }.font(.footnote)
        }
        .focusable()
        .digitalCrownRotation($crown, from: 0, through: 100_000, by: 1, sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: false)
        .onChange(of: crown) { _, v in
            let step = Int(v.rounded(.down))
            if step > lastCrown { for _ in 0..<(step - lastCrown) { store.tasbihTick() } }
            lastCrown = step
        }
        .navigationTitle("المسبحة")
    }
}

/**
 * شاشة قياس «تسميع» المخفية — Debug/TestFlight فقط (لا تظهر في App Store).
 * لكل جلسة: التأخير من نهاية الكلمة حتى كشفها، نسبة الكشف، استهلاك المعالج، حرارة الجهاز، البطارية في البداية والنهاية.
 * لا صوت يغادر الجهاز؛ وضع القياس يحفظ الصوت في الذاكرة فقط لمحاذاة ما بعد الجلسة ثم يُفرَّغ.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Redirect } from "wouter";
import {
  createTasmeeEngine,
  isTasmeeDiagnosticsAllowed,
  isTasmeeNativeAvailable,
  tasmeeNative,
} from "@/lib/tasmee/engine-plugin";
import { Button } from "@/components/ui/button";
import { QuranSettingsRepository } from "@/lib/mushaf-v2/QuranSettingsRepository";
import { TASMEE_SCOPE_NOTE } from "@/lib/tasmee/copy";
import { TASMEE_STRICTNESS_DESCRIPTIONS, TASMEE_STRICTNESS_LABELS, TASMEE_STRICTNESS_LEVELS, isTasmeeStrictness, type TasmeeStrictness } from "@/lib/tasmee/levels";
import { TasmeeSession, type TasmeeSessionReport } from "@/lib/tasmee/session";
import type { TasmeeRefWord } from "@/lib/tasmee/matcher";
import type { TasmeeDeviceInfo } from "@/lib/tasmee/types";

type PageWord = { char_type_name: string; position: number; text_uthmani: string; page_number: number; line_number: number };
type PageVerse = { verse_key: string; words: PageWord[] };

async function loadPageWords(page: number): Promise<TasmeeRefWord[]> {
  const res = await fetch(`/data/quran-v2/pages/page-${String(page).padStart(3, "0")}.json`);
  if (!res.ok) throw new Error(`تعذّر تحميل الصفحة ${page}`);
  const verses = (await res.json()) as PageVerse[];
  return verses.flatMap((v) =>
    v.words.filter((w) => w.char_type_name === "word").map((w) => ({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani })),
  );
}

const fmt = (n: number | undefined | null, d = 0) => (n === undefined || n === null || Number.isNaN(n) ? "—" : n.toFixed(d));

export default function TasmeeDiagnosticsPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [device, setDevice] = useState<TasmeeDeviceInfo | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string>(() => (import.meta.env.VITE_TASMEE_MANIFEST_URL as string | undefined) ?? "");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<{ received: number; total: number } | null>(null);
  const [page, setPage] = useState(562);
  const [promptWords, setPromptWords] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [strictness, setStrictness] = useState<TasmeeStrictness>(() => QuranSettingsRepository.getTasmeeStrictness());
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [hintLog, setHintLog] = useState<string[]>([]);
  const [report, setReport] = useState<TasmeeSessionReport | null>(null);
  const manifestRef = useRef<{ json: string } | null>(null);
  const sessionRef = useRef<TasmeeSession | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    void isTasmeeDiagnosticsAllowed().then(setAllowed);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void tasmeeNative.getDeviceInfo().then(setDevice).catch(() => undefined);
    return tasmeeNative.onDownloadProgress(setProgress);
  }, [allowed]);

  const fetchManifest = useCallback(async () => {
    if (!manifestUrl) throw new Error("أدخل رابط manifest النموذج (أصل إصدار GitHub)");
    const res = await fetch(manifestUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`manifest: HTTP ${res.status}`);
    manifestRef.current = { json: JSON.stringify(await res.json()) };
    return manifestRef.current;
  }, [manifestUrl]);

  const run = useCallback(async (label: string, fn: () => Promise<void>) => {
    setStatus(`${label}…`);
    try {
      await fn();
      setStatus(`${label}: تم`);
    } catch (e) {
      setStatus(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const download = () =>
    run("تنزيل النموذج", async () => {
      const m = await fetchManifest();
      await tasmeeNative.downloadModel(m.json);
    });

  const load = () =>
    run("تحميل النموذج", async () => {
      const m = manifestRef.current ?? (await fetchManifest());
      await tasmeeNative.loadModel(m.json);
      setDevice(await tasmeeNative.getDeviceInfo());
    });

  const selfTest = () =>
    run("اختبار القدرة", async () => {
      const { decodeMs } = await tasmeeNative.selfTest();
      setStatus(`زمن فك نافذة ١٠ث: ${decodeMs.toFixed(0)}ms ${decodeMs > 500 ? "— أبطأ من نبضة ٠٫٥ث: يلزم نموذج أصغر" : "— مناسب"}`);
    });

  const stop = useCallback(async () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const s = sessionRef.current;
    if (!s) return;
    setStatus("إنهاء الجلسة ومحاذاة الصوت…");
    try {
      setReport(await s.stop());
      setStatus("اكتملت الجلسة");
    } catch (e) {
      setStatus(`فشل إنهاء الجلسة: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      sessionRef.current = null;
      setRunning(false);
    }
  }, []);

  const start = () =>
    run("بدء الجلسة", async () => {
      const ref = await loadPageWords(page);
      const session = new TasmeeSession(createTasmeeEngine(), ref, { promptWords, strictness, measure: true });
      session.onWord((e) => e.state === "correct" && setRevealed((n) => n + 1));
      setHintLog([]);
      // التلميح الهادئ يُسجَّل هنا (لا يوقف الجلسة): كلام ≥ 4ث ولا نص
      session.onHint((m) => setHintLog((l) => [...l, `${new Date().toLocaleTimeString("ar")} — ${m}`]));
      sessionRef.current = session;
      setRevealed(0);
      setReport(null);
      await session.start();
      setRunning(true);
      timerRef.current = window.setTimeout(() => void stop(), minutes * 60_000);
    });

  if (allowed === null) return <p dir="rtl" style={{ padding: 16 }}>…</p>;
  if (!allowed || !isTasmeeNativeAvailable()) return <Redirect to="/" />;

  return (
    <div dir="rtl" style={{ padding: 16, display: "grid", gap: 12, maxWidth: 640, margin: "0 auto" }} data-testid="tasmee-diagnostics">
      <h1 style={{ fontSize: 20, margin: 0 }}>قياس التسميع (Debug/TestFlight)</h1>
      <p style={{ margin: 0, opacity: 0.8 }}>المعالجة على الجهاز بالكامل. لا يُرسَل صوت. الصوت في الذاكرة فقط أثناء الجلسة لمحاذاة الكلمات ثم يُفرَّغ.</p>
      <p style={{ margin: 0 }}>{TASMEE_SCOPE_NOTE}</p>
      <p style={{ margin: 0, opacity: 0.8 }}>{TASMEE_STRICTNESS_DESCRIPTIONS[strictness]}</p>
      <section>
        <strong>الجهاز:</strong>{" "}
        {device ? `${device.model} · iOS ${device.osVersion} · ${device.physicalMemoryMB}MB · حرارة ${device.thermalState}${device.lowPowerMode ? " · توفير طاقة" : ""} · نموذج ${device.loaded ? "محمَّل" : "غير محمَّل"}` : "—"}
      </section>
      <label style={{ display: "grid", gap: 4 }}>
        رابط manifest النموذج
        <input dir="ltr" value={manifestUrl} onChange={(e) => setManifestUrl(e.target.value)} placeholder="https://github.com/…/releases/download/<tag>/model-manifest-base.json" />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button type="button" variant="outline" size="sm" onClick={() => void download()} disabled={running}>تنزيل</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void tasmeeNative.cancelDownload()} disabled={running}>إلغاء التنزيل</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={running}>تحميل</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void selfTest()} disabled={running}>اختبار القدرة</Button>
      </div>
      {progress ? (
        <progress value={progress.received} max={progress.total} aria-label="تقدّم التنزيل" style={{ width: "100%" }} />
      ) : null}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label>الصفحة <input type="number" min={1} max={604} value={page} onChange={(e) => setPage(Number(e.target.value))} style={{ width: 72 }} /></label>
        <label>المدة (دقيقة) <input type="number" min={1} max={30} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={{ width: 56 }} /></label>
        <label>
          الصرامة{" "}
          <select
            value={strictness}
            onChange={(e) => {
              if (!isTasmeeStrictness(e.target.value)) return;
              QuranSettingsRepository.setTasmeeStrictness(e.target.value);
              setStrictness(e.target.value);
            }}
            disabled={running}
          >
            {TASMEE_STRICTNESS_LEVELS.map((l) => (
              <option key={l} value={l}>{TASMEE_STRICTNESS_LABELS[l]}</option>
            ))}
          </select>
        </label>
        <label>كلمات prompt <input type="number" min={0} max={8} value={promptWords} onChange={(e) => setPromptWords(Number(e.target.value))} style={{ width: 48 }} /></label>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button type="button" variant="outline" size="sm" onClick={() => void start()} disabled={running}>ابدأ الجلسة</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void stop()} disabled={!running}>أنهِ الآن</Button>
      </div>
      {running ? <p role="status">جارٍ التسجيل… كُشفت {revealed} كلمة</p> : null}
      {hintLog.length ? (
        <ul aria-label="أحداث التلميح" style={{ margin: 0, paddingInlineStart: 18, opacity: 0.85 }}>
          {hintLog.map((h) => <li key={h}>{h}</li>)}
        </ul>
      ) : null}
      {status ? <p role="status" style={{ margin: 0 }}>{status}</p> : null}
      {report ? <ReportView report={report} /> : null}
    </div>
  );
}

function ReportView({ report }: { report: TasmeeSessionReport }) {
  const d = report.diagnostics;
  const batt = d.batteryStart >= 0 && d.batteryEnd >= 0 ? `${fmt(d.batteryStart * 100)}% ← ${fmt(d.batteryEnd * 100)}% (${d.batteryState})` : "غير متاح";
  const json = JSON.stringify({ ...report, words: report.words.map(({ id, state, revealedAtMs, alignedEndMs, latencyMs }) => ({ id, state, revealedAtMs, alignedEndMs, latencyMs })) }, null, 1);
  return (
    <section style={{ display: "grid", gap: 6 }} data-testid="tasmee-report">
      <h2 style={{ fontSize: 16, margin: 0 }}>تقرير الجلسة</h2>
      <div>التأخير (نهاية الكلمة ← الكشف): {report.latency ? `وسيط ${fmt(report.latency.medianMs)}ms · p90 ${fmt(report.latency.p90Ms)}ms · p95 ${fmt(report.latency.p95Ms)}ms · ≤١ث ${fmt(report.latency.within1sPct)}%` : "غير متاح"}</div>
      <div>الكشف: {report.correct}/{report.total} صحيحة · خطأ {report.wrong} · متجاوزة {report.skipped} · نسبة كشف المنطوق {report.detectionRate === null ? "—" : `${fmt(report.detectionRate * 100, 1)}%`}</div>
      <div>فك الترميز: متوسط {fmt(d.decodeMeanMs)}ms · p95 {fmt(d.decodeP95Ms)}ms · أقصى {fmt(d.decodeMaxMs)}ms · {d.decodes} فك · تخطّي VAD {d.vadSkippedTicks}</div>
      <div>نوافذ «كلام بلا نص»: {d.speechWithoutTextWindows} من {d.decodes} فك · تلميحات «لم يتضح الصوت»: {report.unclearHints}{d.unclearHintsAtSec.length ? ` (عند ${d.unclearHintsAtSec.map((t) => fmt(t)).join("، ")}ث)` : ""}</div>
      <div>المعالج: متوسط {fmt(d.cpuMeanPercent)}% · ذروة {fmt(d.cpuPeakPercent)}% (١٠٠٪ = نواة)</div>
      <div>الحرارة: {d.thermalStart} ← {d.thermalEnd} (أعلى {d.thermalMax})</div>
      <div>البطارية: {batt}</div>
      <div>المدة {fmt(d.durationSec)}ث · {d.deviceModel} · iOS {d.osVersion}</div>
      <textarea readOnly dir="ltr" rows={8} value={json} style={{ width: "100%", fontFamily: "monospace", fontSize: 11 }} onFocus={(e) => e.currentTarget.select()} />
      <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard?.writeText(json)}>نسخ JSON</Button>
    </section>
  );
}

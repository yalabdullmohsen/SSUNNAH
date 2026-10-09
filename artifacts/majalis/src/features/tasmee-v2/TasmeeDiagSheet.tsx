import { Button } from "@/design-system/primitives";
import { Sheet } from "@/design-system/overlays";
import { bundledTasmeeManifest } from "@/lib/tasmee/model-config";
import { percentile } from "@/lib/tasmee/session";
import { T } from "./strings";
import type { TasmeeLiveStats } from "./useTasmeeEngine";

const sec = (ms: number) => (Number.isNaN(ms) ? "—" : (ms / 1000).toFixed(2));

/** ملخص قياس الجلسة لمعايير الجهاز الحقيقي — أرقام فقط، لا صوت ولا نص. */
export function summarizeLiveStats(s: TasmeeLiveStats) {
  const sorted = [...s.latenciesMs].sort((a, b) => a - b);
  const judged = s.correct + s.alerts;
  return {
    medianMs: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    alertRate: judged ? (s.alerts / judged) * 100 : 0,
  };
}

type Props = { open: boolean; onClose: () => void; onReset: () => void; stats: TasmeeLiveStats; pageNumber: number };

export function TasmeeDiagSheet({ open, onClose, onReset, stats, pageNumber }: Props) {
  const D = T.diag;
  const sum = summarizeLiveStats(stats);
  const rows: [string, string][] = [
    [D.page, String(pageNumber)],
    [D.windows, String(stats.windows)],
    [D.correct, String(stats.correct)],
    [D.alerts, String(stats.alerts)],
    [D.alertRate, `${sum.alertRate.toFixed(1)}%`],
    [D.median, `${sec(sum.medianMs)} ${D.sec}`],
    [D.p95, `${sec(sum.p95Ms)} ${D.sec}`],
    [D.model, bundledTasmeeManifest.modelId],
  ];
  return (
    <Sheet open={open} onClose={onClose} title={D.title}>
      <div className="tv2-model" dir="rtl" data-testid="tasmee-v2-diag">
        <p className="tv2-model-text">{D.howto}</p>
        <dl className="tv2-model-facts">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                <bdi className="tv2-num">{v}</bdi>
              </dd>
            </div>
          ))}
        </dl>
        <p className="tv2-model-text">{D.latencyNote}</p>
        <Button variant="secondary" block onClick={onReset}>
          {D.reset}
        </Button>
      </div>
    </Sheet>
  );
}

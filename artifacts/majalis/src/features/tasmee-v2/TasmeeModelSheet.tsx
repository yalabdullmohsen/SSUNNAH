import { Button, Notice, ProgressBar } from "@/design-system/primitives";
import { Sheet } from "@/design-system/overlays";
import { T } from "./strings";
import { modelPercent, type ModelState } from "./useTasmeeModel";

const mb = (bytes: number) => Math.max(1, Math.round(bytes / 1_000_000));

type Props = {
  open: boolean;
  state: ModelState;
  onClose: () => void;
  onDownload: () => void;
  onCancel: () => void;
  onStart: () => void;
};

/** شاشة الموافقة على تنزيل النموذج وتقدّمه: الحجم وWi-Fi والخصوصية قبل أي تنزيل. */
export function TasmeeModelSheet({ open, ...rest }: Props) {
  return (
    <Sheet
      open={open}
      onClose={rest.onClose}
      title={
        rest.state.phase === "downloading" ? T.model.downloading : T.model.title
      }
    >
      <TasmeeModelPanel {...rest} />
    </Sheet>
  );
}

export function TasmeeModelPanel({
  state,
  onClose,
  onDownload,
  onCancel,
  onStart,
}: Omit<Props, "open">) {
  const M = T.model;
  const pct = modelPercent(state);
  const busy = state.phase === "downloading";
  const progress = (
    <div className="tv2-model-progress">
      <ProgressBar value={pct} label={M.progress} />
      <p className="tv2-model-meta">
        <bdi className="tv2-num">{pct}%</bdi> ·{" "}
        <bdi className="tv2-num">{mb(state.received)}</bdi> {M.of}{" "}
        <bdi className="tv2-num">{mb(state.total)}</bdi> {M.mb}
      </p>
    </div>
  );

  return (
    <div className="tv2-model" dir="rtl">
      {state.phase === "ready" ? (
        <>
          <Notice tone="success">{M.ready}</Notice>
          <Button block onClick={onStart}>
            {M.start}
          </Button>
        </>
      ) : (
        <>
          {!busy ? <p className="tv2-model-text">{M.missing}</p> : null}
          <dl className="tv2-model-facts">
            <div>
              <dt>{M.size}</dt>
              <dd>
                <bdi className="tv2-num">{mb(state.total)}</bdi> {M.mb}
              </dd>
            </div>
          </dl>
          <p className="tv2-model-text">{M.wifi}</p>
          <p className="tv2-model-text">{M.privacy}</p>
          {busy || state.phase === "paused" ? progress : null}
          {state.phase === "paused" ? (
            <p className="tv2-model-text">{M.pausedHint}</p>
          ) : null}
          {state.phase === "error" ? (
            <Notice tone="danger">
              {state.error === "wifi" ? M.wifiRequired : M.failed}
            </Notice>
          ) : null}
          {busy ? (
            <Button variant="secondary" block onClick={onCancel}>
              {M.cancel}
            </Button>
          ) : (
            <>
              <Button
                block
                disabled={state.phase === "checking"}
                onClick={onDownload}
              >
                {state.phase === "error"
                  ? M.retry
                  : state.phase === "paused"
                    ? M.resume
                    : M.consent}
              </Button>
              <Button variant="tertiary" block onClick={onClose}>
                {M.later}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

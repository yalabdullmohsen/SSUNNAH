/**
 * Temporary RCA diagnostics for adhan early-stop.
 * Logs only — does not change scheduling or playback behavior.
 *
 * Tags: ADHAN_START | SEGMENT_START | SEGMENT_END | ADHAN_PAUSE | ADHAN_STOP |
 *       AUDIO_FOCUS_LOST | AUDIO_FOCUS_GAINED | APP_BACKGROUND | APP_FOREGROUND |
 *       NOTIFICATION_DISMISSED | ADHAN_COMPLETE
 */

export type AdhanDiagEvent =
  | "ADHAN_START"
  | "SEGMENT_START"
  | "SEGMENT_END"
  | "ADHAN_PAUSE"
  | "ADHAN_STOP"
  | "AUDIO_FOCUS_LOST"
  | "AUDIO_FOCUS_GAINED"
  | "APP_BACKGROUND"
  | "APP_FOREGROUND"
  | "NOTIFICATION_DISMISSED"
  | "ADHAN_COMPLETE";

export type AdhanDiagDetail = Record<string, unknown>;

const RING_MAX = 80;
const _ring: Array<{ t: number; event: AdhanDiagEvent; detail: AdhanDiagDetail }> = [];

/** Emit a structured console line + keep a small in-memory ring for tests/debug UI. */
export function adhanDiag(event: AdhanDiagEvent, detail: AdhanDiagDetail = {}): void {
  const entry = { t: Date.now(), event, detail };
  _ring.push(entry);
  if (_ring.length > RING_MAX) _ring.shift();
  try {
    console.info(`[ADHAN_DIAG] ${event}`, detail);
  } catch {
    /* ignore */
  }
}

export function getAdhanDiagRing(): ReadonlyArray<{
  t: number;
  event: AdhanDiagEvent;
  detail: AdhanDiagDetail;
}> {
  return _ring.slice();
}

export function clearAdhanDiagRing(): void {
  _ring.length = 0;
}

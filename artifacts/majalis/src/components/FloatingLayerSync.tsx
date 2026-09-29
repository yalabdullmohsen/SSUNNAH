import { useEffect } from "react";
import { installFloatingLayerSync } from "@/lib/floating-layer-manager";

/**
 * جذر واحد لمزامنة إزاحات الطبقات العائمة (CSS vars + suppress).
 * يُركَّب مرة في App — لا يرسم UI.
 */
export function FloatingLayerSync() {
  useEffect(() => installFloatingLayerSync(), []);
  return null;
}

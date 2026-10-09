/** علم tasmee_v2 الفعّال في الواجهة: على الويب فوري، وعلى الجهاز مغلق حتى تُحسم القناة والملف الحي. */
import { useEffect, useState } from "react";
import { isNative } from "@/lib/capacitor-utils";
import { isTasmeeV2Enabled, resolveTasmeeV2Enabled } from "@/lib/tasmee-v2/flags";

export function useTasmeeV2Enabled(): boolean {
  const [on, setOn] = useState(() => !isNative && isTasmeeV2Enabled());
  useEffect(() => {
    let alive = true;
    void resolveTasmeeV2Enabled().then((v) => alive && setOn(v));
    return () => {
      alive = false;
    };
  }, []);
  return on;
}

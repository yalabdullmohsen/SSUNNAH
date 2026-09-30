import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  usePrayerCountdownState,
  type PrayerCountdownValue,
} from "@/hooks/usePrayerCountdown";
import type { PrayerCountdown, PrayerTimesPayload } from "@/lib/prayer-times";

type PrayerDataValue = {
  data: PrayerTimesPayload | null;
  loading: boolean;
  reload: () => void;
};

/** هوية الصلاة القادمة / فترة السماح — تتغير نادرًا (ليس كل ثانية). */
export type PrayerSlotIdentity = {
  nextKey: string;
  nextName: string;
  inGrace: boolean;
};

const PrayerDataContext = createContext<PrayerDataValue | null>(null);
const PrayerCountdownLiveContext = createContext<PrayerCountdown | null>(null);
const PrayerSlotContext = createContext<PrayerSlotIdentity | null>(null);

const EMPTY_DATA: PrayerDataValue = {
  data: null,
  loading: false,
  reload: () => {},
};

function deriveSlot(cd: PrayerCountdown | null): PrayerSlotIdentity | null {
  if (!cd?.next) return null;
  return {
    nextKey: cd.next.key,
    nextName: cd.next.name,
    inGrace: cd.sinceSeconds != null,
  };
}

function sameSlot(a: PrayerSlotIdentity | null, b: PrayerSlotIdentity | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.nextKey === b.nextKey && a.nextName === b.nextName && a.inGrace === b.inGrace;
}

export function PrayerCountdownProvider({
  children,
  governorateId,
  enabled = true,
}: {
  children: ReactNode;
  governorateId?: string;
  /** عند false: لا جلب شبكة ولا عدّ ثانية — لإبقاء الإقلاع خفيفًا على الرئيسية */
  enabled?: boolean;
}) {
  const { data, countdown, loading, reload } = usePrayerCountdownState(governorateId, { enabled });
  const dataValue = useMemo(
    () => ({ data, loading, reload }),
    [data, loading, reload],
  );
  const [slot, setSlot] = useState<PrayerSlotIdentity | null>(() => deriveSlot(countdown));

  useEffect(() => {
    const next = deriveSlot(countdown);
    setSlot((prev) => (sameSlot(prev, next) ? prev : next));
  }, [countdown]);

  return (
    <PrayerDataContext.Provider value={dataValue}>
      <PrayerSlotContext.Provider value={slot}>
        <PrayerCountdownLiveContext.Provider value={countdown}>
          {children}
        </PrayerCountdownLiveContext.Provider>
      </PrayerSlotContext.Provider>
    </PrayerDataContext.Provider>
  );
}

/** بيانات المواقيت فقط — لا يُعاد الرسم كل ثانية. */
export function useSharedPrayerData(): PrayerDataValue {
  return useContext(PrayerDataContext) ?? EMPTY_DATA;
}

/** هوية القادمة/السماح — بلا نص العدّ التنازلي. */
export function useSharedPrayerSlot(): PrayerSlotIdentity | null {
  return useContext(PrayerSlotContext);
}

/** العدّ التنازلي الحي — للشريحة/قيمة العدّ فقط. */
export function useSharedPrayerCountdownLive(): PrayerCountdown | null {
  return useContext(PrayerCountdownLiveContext);
}

export function useSharedPrayerCountdown(): PrayerCountdownValue {
  const { data, loading, reload } = useSharedPrayerData();
  const countdown = useSharedPrayerCountdownLive();
  return { data, countdown, loading, reload };
}

/** نسخة مستقلة لصفحات المواقيت خارج السياق المؤجَّل. */
export function usePrayerCountdown(governorateId?: string): PrayerCountdownValue {
  return usePrayerCountdownState(governorateId);
}

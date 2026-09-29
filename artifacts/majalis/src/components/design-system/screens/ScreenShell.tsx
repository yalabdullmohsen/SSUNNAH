/**
 * غلاف شاشة موحّد — يثبت الهوية (tokens/حالات) ويسمح بتنويع التخطيط عبر النمط والكثافة.
 * الحالات عبر Loading/Empty/Error/Offline V2 (Phase 5).
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyStateV2 } from "@/components/design-system/EmptyStateV2";
import { ErrorStateV2 } from "@/components/design-system/ErrorStateV2";
import { LoadingStateV2 } from "@/components/design-system/LoadingStateV2";
import { OfflineStateV2 } from "@/components/design-system/OfflineStateV2";
import type { SsScreenDensity, SsScreenPattern } from "@/lib/ssunnah-screen-patterns";
import { ACTION, EMPTY, STATUS } from "@/lib/ui-copy";
import "@/styles/ssunnah-screen-patterns.css";
import "@/styles/app-state-v2.css";

export type ScreenShellStatus = "ready" | "loading" | "empty" | "error" | "offline";

export type ScreenShellProps = {
  pattern: SsScreenPattern;
  density?: SsScreenDensity;
  status?: ScreenShellStatus;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  children?: ReactNode;
};

export function ScreenShell({
  pattern,
  density = "regular",
  status = "ready",
  onRetry,
  emptyTitle = EMPTY.data,
  emptyDescription,
  className,
  children,
}: ScreenShellProps) {
  const offline =
    status === "offline" ||
    (status === "error" && typeof navigator !== "undefined" && navigator.onLine === false);

  return (
    <div
      className={cn(
        "ss-screen",
        `ss-screen--${pattern}`,
        `ss-screen--density-${density}`,
        className,
      )}
      data-ss-screen-pattern={pattern}
      data-ss-screen-density={density}
      dir="rtl"
    >
      {status === "loading" ? (
        <div className="ss-screen__state">
          <LoadingStateV2 skeletonLines={3} />
        </div>
      ) : null}
      {status === "empty" ? (
        <div className="ss-screen__state">
          <EmptyStateV2 title={emptyTitle} description={emptyDescription} />
        </div>
      ) : null}
      {offline ? (
        <div className="ss-screen__state">
          <OfflineStateV2 title={EMPTY.offline} retryLabel={ACTION.retry} onRetry={onRetry} />
        </div>
      ) : null}
      {status === "error" && !offline ? (
        <div className="ss-screen__state">
          <ErrorStateV2
            description={STATUS.loadError}
            retryLabel={ACTION.retry}
            onRetry={onRetry}
          />
        </div>
      ) : null}
      {status === "ready" ? children : null}
    </div>
  );
}

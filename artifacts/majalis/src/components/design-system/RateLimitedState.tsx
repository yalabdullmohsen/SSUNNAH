/**
 * 429 — منع إعادة المحاولة السريعة دون حلقة.
 */
import { useEffect, useState, type HTMLAttributes } from "react";
import { Link } from "wouter";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RateLimitedStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  /** ثوانٍ قبل تمكين إعادة المحاولة */
  cooldownSeconds?: number;
  homeHref?: string;
  homeLabel?: string;
};

export function RateLimitedState({
  title = "طلبات كثيرة جدًا",
  description = "انتظر قليلًا ثم أعد المحاولة. لا تُكرّر الضغط بسرعة.",
  retryLabel = "إعادة المحاولة",
  onRetry,
  cooldownSeconds = 8,
  homeHref = "/",
  homeLabel = "الرئيسية",
  className,
  ...rest
}: RateLimitedStateProps) {
  const [left, setLeft] = useState(Math.max(0, cooldownSeconds));

  useEffect(() => {
    setLeft(Math.max(0, cooldownSeconds));
  }, [cooldownSeconds]);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const canRetry = left <= 0 && Boolean(onRetry);

  return (
    <div
      className={cn("app-state-v2", "app-state-v2--error", className)}
      role="alert"
      data-app-state="rate-limited"
      {...rest}
    >
      <SectionTitle as="h2" className="app-state-v2__title">
        {title}
      </SectionTitle>
      <p className="app-state-v2__body">{description}</p>
      {left > 0 ? (
        <p className="app-state-v2__meta" aria-live="polite">
          يمكن المحاولة بعد {left} ث
        </p>
      ) : null}
      <div className="app-state-v2__actions">
        {onRetry ? (
          <Button
            type="button"
            variant="primary"
            className="app-state-v2__btn app-state-v2__btn--primary"
            disabled={!canRetry}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
        <Link href={homeHref} className="app-state-v2__btn">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import {
  EmptyStateV2,
  ErrorStateV2,
  LoadingStateV2,
  OfflineStateV2,
} from "@/components/design-system";

export function AdminV3Loading({ label = "تجهيز…" }: { label?: string }) {
  return (
    <LoadingStateV2
      title={label}
      className="av3-state av3-state--loading"
      skeletonLines={2}
    />
  );
}

export function AdminV3Empty({
  title = "لا يوجد محتوى هنا بعد",
  body = "سيُبنى هذا المركز في موجة لاحقة. يمكنك فتح اللوحة السابقة إن لزم.",
  action,
  ctaLabel,
  onCtaClick,
  href,
}: {
  title?: string;
  body?: string;
  /** Prefer ctaLabel / onCtaClick / href — kept for rare custom slots */
  action?: ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  href?: string;
}) {
  return (
    <div className="av3-state av3-state--empty" data-admin-state="empty">
      <EmptyStateV2
        title={title}
        description={body}
        ctaLabel={ctaLabel}
        onCtaClick={onCtaClick}
        href={href}
      />
      {action ? <div className="av3-state__action">{action}</div> : null}
    </div>
  );
}

export function AdminV3Offline() {
  return (
    <OfflineStateV2
      title="أنت غير متصل"
      description="تحقق من الشبكة ثم أعد المحاولة."
      availableHint="قد لا تعمل أدوات اللوحة دون اتصال."
      offlineCenterHref="/admin/v3"
      offlineCenterLabel="لوحة التحكم"
      className="av3-state av3-state--offline"
    />
  );
}

export function AdminV3ErrorState({
  message = "تعذّر عرض هذا الجزء.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorStateV2
      title="حدث خطأ"
      description={message}
      onRetry={onRetry}
      homeHref="/admin/v3"
      homeLabel="لوحة التحكم"
      className="av3-state av3-state--error"
    />
  );
}

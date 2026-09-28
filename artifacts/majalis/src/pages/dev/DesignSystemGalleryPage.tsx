/**
 * معرض مكوّنات التطوير فقط — لا يدخل تنقّل الإنتاج ولا يُحمَّل في production graph.
 */
import { EmptyStateV2 } from "@/components/design-system/EmptyStateV2";
import { ErrorStateV2 } from "@/components/design-system/ErrorStateV2";
import { LoadingStateV2 } from "@/components/design-system/LoadingStateV2";
import { OfflineStateV2 } from "@/components/design-system/OfflineStateV2";
import { PageContainer } from "@/components/design-system/PageContainer";
import { PageHeaderV2 } from "@/components/design-system/PageHeaderV2";
import { PrimaryButton, SecondaryButton } from "@/components/design-system/Buttons";
import "@/styles/app-state-v2.css";
import "@/styles/pages/dev-design-gallery.css";

export default function DesignSystemGalleryPage() {
  if (!import.meta.env.DEV) {
    return (
      <PageContainer>
        <EmptyStateV2 title="غير متاح" description="معرض المكوّنات متاح في وضع التطوير فقط." href="/" ctaLabel="الرئيسية" />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      <PageHeaderV2
        title="معرض نظام التصميم"
        description="تطوير داخلي — حالات المكوّنات المعتمدة"
      />
      <section aria-labelledby="ds-buttons" className="ds-gallery-section">
        <h2 id="ds-buttons">أزرار</h2>
        <div className="ds-gallery-row">
          <PrimaryButton type="button">أساسي</PrimaryButton>
          <SecondaryButton type="button">ثانوي</SecondaryButton>
        </div>
      </section>
      <section aria-labelledby="ds-states" className="ds-gallery-section">
        <h2 id="ds-states">حالات</h2>
        <div className="ds-gallery-stack">
          <LoadingStateV2 title="مثال تحميل" />
          <EmptyStateV2 title="لا نتائج" description="جرّب كلمات أخرى." />
          <ErrorStateV2 correlationId="dev-example-ref" onRetry={() => undefined} />
          <OfflineStateV2 availableHint="المصحف المحفوظ والأذكار المحمّلة تبقى متاحة." onRetry={() => undefined} />
        </div>
      </section>
    </PageContainer>
  );
}

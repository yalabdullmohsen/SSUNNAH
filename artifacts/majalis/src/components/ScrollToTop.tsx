import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyFloatingLayerCssVars,
  shouldSuppressBackgroundFloating,
} from "@/lib/floating-layer-manager";

/**
 * زر صعود صغير واضح المعنى.
 * يظهر بعد تمرير فعلي وأثناء الصعود فقط، يختفي مع Sheet/Dialog، فوق الشريط السفلي بلا تغطية للمحتوى.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* نمط iOS: يظهر فقط حين يصعد المستخدم بعد تمرير فعلي، ويختفي أثناء القراءة نزولًا
       حتى لا يغطي البطاقات. (والضغط على التبويب النشط يصعد للأعلى أيضًا — BottomNavBar.) */
    let lastY = window.scrollY;
    let goingUp = false;
    const update = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 8) {
        goingUp = y < lastY;
        lastY = y;
      }
      const scrolled = window.scrollY > 720;
      setVisible(scrolled && goingUp && !shouldSuppressBackgroundFloating());
      applyFloatingLayerCssVars();
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.visualViewport?.addEventListener("resize", update);

    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-floating-suppress", "data-audio-dock", "data-quran-mini-player"],
    });
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-state", "aria-modal", "open"],
    });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      mo.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      className="scroll-to-top"
      data-scroll-to-top="1"
      data-safe-area="1"
      aria-label="إلى الأعلى"
      title="إلى الأعلى"
      onClick={() => {
        const reduce =
          typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" className="stt-icon" />
      <span className="stt-label">أعلى</span>
    </Button>
  );
}

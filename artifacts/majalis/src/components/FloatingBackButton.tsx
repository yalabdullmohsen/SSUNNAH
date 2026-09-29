/**
 * GlobalBackControlHost — مصدر حقيقة واحد لزر الرجوع العام في سُنّة.
 * الإزاحات/الكيبورد/المشغّل من FloatingLayerManager فقط.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AppBackButton } from "@/components/common/AppBackButton";
import { BACK_CONTROL_SIZE_PX, BACK_CONTROL_GAP_PX } from "@/lib/global-back-layout";
import {
  applyFloatingLayerCssVars,
  getFloatingBottomOffset,
  installFloatingLayerSync,
  shouldSuppressBackgroundFloating,
} from "@/lib/floating-layer-manager";
import { hasInPageBackChrome, isImmersiveChromePath } from "@/lib/immersive-chrome";
import { normalizeNavPath } from "@/lib/navigation-back";
import "@/styles/sunnah-identity-chrome-nav.css";

function syncBackLayoutVars(host: HTMLElement | null) {
  if (typeof window === "undefined") return;
  applyFloatingLayerCssVars();
  const bottom = getFloatingBottomOffset("floating-back");
  const contentClearance = bottom + BACK_CONTROL_SIZE_PX + BACK_CONTROL_GAP_PX;
  document.documentElement.style.setProperty("--global-back-bottom", `${bottom}px`);
  document.documentElement.style.setProperty("--global-back-clearance", `${contentClearance}px`);
  document.documentElement.style.setProperty("--global-back-top", `0px`);
  document.documentElement.style.setProperty("--global-back-top-clearance", `0px`);
  document.documentElement.style.setProperty("--global-back-size", `${BACK_CONTROL_SIZE_PX}px`);
  document.documentElement.setAttribute("data-global-back-host", "1");
  document.documentElement.setAttribute("data-global-back-edge", "bottom");
  document.documentElement.setAttribute("data-global-back-visible", "1");
  if (host) {
    host.style.bottom = `${bottom}px`;
    host.style.top = "auto";
  }
}

/** المضيف الوحيد لزر الرجوع العام — أسفل يمين ظاهر دائمًا */
export function GlobalBackControlHost() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const path = normalizeNavPath(location);
  const hideOnHome = path === "/";
  const hideOnMushaf = isImmersiveChromePath(path);
  const hideOnAdhanSettings =
    path === "/adhan-settings" || path.startsWith("/adhan-settings/");
  /** Rule 6: prefer in-page AppBackButton — suppress unified floating host when page chrome owns back */
  const hideOnInPageAppBack = hasInPageBackChrome(path);
  const routeHide = hideOnHome || hideOnMushaf || hideOnAdhanSettings || hideOnInPageAppBack;
  const [modalHide, setModalHide] = useState(false);
  const hideBack = routeHide || modalHide;

  useEffect(() => installFloatingLayerSync(), []);

  useLayoutEffect(() => {
    if (routeHide) {
      document.documentElement.style.setProperty("--global-back-clearance", `0px`);
      document.documentElement.removeAttribute("data-global-back-visible");
      return;
    }
    const sync = () => {
      const suppress = shouldSuppressBackgroundFloating();
      setModalHide(suppress);
      if (suppress) {
        document.documentElement.removeAttribute("data-global-back-visible");
        return;
      }
      syncBackLayoutVars(hostRef.current);
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "class",
        "data-audio-dock",
        "data-quran-mini-player",
        "data-floating-suppress",
        "style",
      ],
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      mo.disconnect();
    };
  }, [routeHide]);

  useEffect(() => {
    if (hideBack) {
      document.documentElement.removeAttribute("data-global-back-visible");
      return;
    }
    document.documentElement.setAttribute("data-global-back-visible", "1");
  }, [hideBack, path]);

  if (hideBack) return null;

  return (
    <div
      ref={hostRef}
      className="global-back-control-host"
      data-global-back-control-host="1"
      data-testid="global-back-control-host"
      data-edge="bottom"
      data-visible="1"
    >
      <AppBackButton
        variant="bar"
        autoHideFloating={false}
        label="رجوع"
        aria-label="رجوع"
        className="global-back-control-host__btn"
      />
    </div>
  );
}

/** توافق مع الاسم السابق */
export function FloatingBackButton() {
  return <GlobalBackControlHost />;
}

export { FloatingBackButton as GlobalBackButton };
export { AppBackButton } from "@/components/common/AppBackButton";

/** الدائري العلوي القديم معطّل — البديل: Back FAB سفلي موحّد */
export const FLOATING_BACK_DISABLED = true as const;
export const FIXED_BACK_BAR_ENABLED = true as const;
export const UNIFIED_BACK_FAB_ENABLED = true as const;
export const GLOBAL_BACK_CONTROL_HOST = true as const;

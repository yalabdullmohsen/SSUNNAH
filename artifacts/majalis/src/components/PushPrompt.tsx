import { useEffect, useState } from "react";
import { isNative } from "@/lib/capacitor-utils";
import {
  getPushSupport,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermissionState,
} from "@/lib/push-notifications";
import { Button } from "@/components/ui/button";

export function PushPrompt() {
  const [state, setState] = useState<PushPermissionState>("unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNative) {
      setState("unsupported");
      return;
    }
    setState(getPushSupport());
    navigator.serviceWorker?.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub)),
    ).catch(() => {});
  }, []);

  // iOS/Android native: Local Notifications only — hide Web Push UI entirely.
  if (isNative || state === "unsupported") return null;

  // بلا مفتاح VAPID لا يملك المستخدم ما يفعله — لا نعرض رسالة مطوّر.
  if (state === "no-vapid") return null;

  if (state === "denied") {
    return (
      <div className="push-prompt push-prompt--warn">
        الإشعارات مرفوضة في إعدادات المتصفح. يمكنك تفعيلها يدوياً من إعدادات الموقع.
      </div>
    );
  }

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        const sub = await subscribeToPush();
        setSubscribed(!!sub);
        setState(getPushSupport());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="push-prompt">
      <div className="push-prompt__text">
        <strong>إشعارات الدروس</strong>
        <span>{subscribed ? "مفعّلة، ستصلك تذكيرات بمواعيد الدروس" : "غير مفعّلة"}</span>
      </div>
      <Button
        type="button"
        variant={subscribed ? "secondary" : "primary"}
        size="small"
        className={`push-prompt__btn${subscribed ? " push-prompt__btn--off" : ""}`}
        onClick={handleToggle}
        disabled={loading}
        loading={loading}
      >
        {subscribed ? "إيقاف" : "تفعيل"}
      </Button>
    </div>
  );
}

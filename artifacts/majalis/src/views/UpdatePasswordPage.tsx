import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase, updatePassword } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-messages";
import { Loading } from "@/components/ui-common";
import { applyPageSeo } from "@/lib/seo";
import { PasswordPolicyChecklist } from "@/components/auth/PasswordPolicyChecklist";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MISMATCH_AR,
  PASSWORD_POLICY_HINT_AR,
  validatePassword,
} from "@/lib/password-policy";
import "@/styles/pages/auth.css";
import { UtilityScreen } from "@/components/design-system/screens";

/**
 * تحديث كلمة المرور بعد رابط الاستعادة (جلسة PASSWORD_RECOVERY).
 * يُفتح من /auth/callback عند event === PASSWORD_RECOVERY.
 */
export default function UpdatePasswordPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    applyPageSeo({
      path: "/auth/update-password",
      title: "تعيين كلمة مرور جديدة | سُنّة",
      description: "عيّن كلمة مرور جديدة لحسابك في سُنّة.",
      robots: "noindex, nofollow",
    });
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const policyError = validatePassword(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== confirm) {
      setError(PASSWORD_MISMATCH_AR);
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      setOk(true);
      window.setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="login-page" dir="rtl">
        <Loading />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="login-page" dir="rtl">
        <div className="login-card">
          <h1 className="login-card__title">انتهت صلاحية الرابط</h1>
          <p className="login-card__subtitle">اطلب رابط استعادة جديدًا من صفحة الدخول.</p>
          <Link href="/login" className="login-back-link login-back-link--primary">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <UtilityScreen compose="mark">
      <div className="login-page" dir="rtl">
        <div className="login-card">
          <div className="login-card__header">
            <h1 className="login-card__title">كلمة مرور جديدة</h1>
            <p className="login-card__subtitle">{PASSWORD_POLICY_HINT_AR}</p>
          </div>
          {error ? (
            <p className="login-alert login-alert--error" role="alert">
              {error}
            </p>
          ) : null}
          {ok ? (
            <p className="login-alert" role="status">
              تم تحديث كلمة المرور. سيتم التحويل…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-field">
                <label htmlFor="new-password">كلمة المرور الجديدة</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  disabled={loading}
                  placeholder={PASSWORD_POLICY_HINT_AR}
                />
                <PasswordPolicyChecklist password={password} />
              </div>
              <div className="login-field">
                <label htmlFor="confirm-password">تأكيد كلمة المرور</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  disabled={loading}
                />
              </div>
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "حفظ…" : "حفظ كلمة المرور"}
              </button>
            </form>
          )}
        </div>
      </div>
    </UtilityScreen>
  );
}

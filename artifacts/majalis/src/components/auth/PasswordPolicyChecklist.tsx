import { evaluatePassword, PASSWORD_POLICY_HINT_AR } from "@/lib/password-policy";

type Props = {
  password: string;
  /** إظهار القائمة حتى لو كان الحقل فارغًا */
  alwaysShow?: boolean;
};

/**
 * قائمة تحقق حية لسياسة كلمة المرور — RTL، Light/Dark عبر auth.css.
 */
export function PasswordPolicyChecklist({ password, alwaysShow = true }: Props) {
  if (!alwaysShow && !password) return null;
  const { checks } = evaluatePassword(password);

  return (
    <div className="password-policy" data-testid="password-policy-checklist">
      <p className="password-policy__hint">{PASSWORD_POLICY_HINT_AR}</p>
      <ul className="password-policy__list" aria-live="polite">
        {checks.map((c) => (
          <li
            key={c.id}
            className={`password-policy__item${c.ok ? " is-ok" : ""}`}
            data-check={c.id}
            data-ok={c.ok ? "1" : "0"}
          >
            <span className="password-policy__mark" aria-hidden="true">
              {c.ok ? "✓" : "○"}
            </span>
            <span className="password-policy__label">
              <span className="password-policy__label-ar">{c.labelAr}</span>
              <span className="password-policy__label-en" dir="ltr">
                {c.labelEn}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

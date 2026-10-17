#!/usr/bin/env bash
set -uo pipefail
G="$(cd "$(dirname "$0")" && pwd)/native-sensitive-coverage.sh"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; fail=0
ok(){ echo "  ✓ $1"; }; no(){ echo "  ✗ $1"; fail=1; }
cd "$T" && git init -q -b main . && git config user.email a@b && git config user.name t
mkdir -p .github && printf '^S/Sections/[A-Za-z]*Screens\\.swift$\n' > .github/content-sensitive-paths
cat > chk.sh <<'X'
#!/usr/bin/env bash
while IFS= read -r p; do [[ "$p" =~ ^S/Sections/[A-Za-z]*Screens\.swift$ ]] && echo "$p"; done
X
mkdir -p S/Sections docs/native/shots; echo a > S/Sections/MutashabihatScreens.swift; git add -A; git commit -qm base; git update-ref refs/remotes/origin/native-app HEAD
git checkout -qb f; echo b >> S/Sections/MutashabihatScreens.swift; touch docs/native/shots/Button.png; git add -A; git commit -qm c
SENSITIVE_CHECK=$T/chk.sh GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && no "لقطة المكوّن وحدها يجب ألا تكفي" || ok "لقطة مكوّن لا تغطي الشاشة (حالة #3452)"
touch docs/native/shots/mutashabihat-home.png; git add -A; git commit -qm d
SENSITIVE_CHECK=$T/chk.sh GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && ok "لقطة باسم الشاشة تكفي" || no "اسم الشاشة"
git reset -q --hard HEAD~1; printf 'covers=MutashabihatScreens\n' > docs/native/shots/PROVENANCE.txt; git add -A; git commit -qm e
SENSITIVE_CHECK=$T/chk.sh GUARD_REPO=$T bash "$G" >/dev/null 2>&1 && ok "سطر PROVENANCE يكفي" || no "PROVENANCE"
[ $fail = 0 ] && echo "sensitive-coverage tests OK" || { echo FAILED; exit 1; }

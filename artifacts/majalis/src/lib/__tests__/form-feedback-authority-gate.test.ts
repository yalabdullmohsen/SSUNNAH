/**
 * Form + Feedback authority (Interaction PR-6).
 * node --import tsx src/lib/__tests__/form-feedback-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/FORM_FEEDBACK_AUTHORITY.md")));
const authority = readRepo("docs/design/FORM_FEEDBACK_AUTHORITY.md");
assert.match(authority, /FormLabel/);
assert.match(authority, /FieldError/);
assert.match(authority, /FormActions/);
assert.match(authority, /SearchInput/);
assert.match(authority, /EmptyStateV2/);
assert.match(authority, /NoResultsState/);
assert.match(authority, /LoadingStateV2/);
assert.match(authority, /ErrorStateV2/);
assert.match(authority, /OfflineStateV2/);
assert.match(authority, /StaleDataIndicator/);
assert.match(authority, /PermissionDeniedState/);
assert.match(authority, /RateLimitedState/);
assert.match(authority, /Empty ≠ NoResults|Empty != NoResults|Empty ≠ No results/i);
assert.match(authority, /aria-describedby/);
assert.match(authority, /window\.confirm/);
assert.match(authority, /MUSHAF_SPECIAL/);
assert.match(authority, /≥ 16px|16px/);

const fields = read("src/components/design-system/FormFields.tsx");
assert.match(fields, /export function FormLabel/);
assert.match(fields, /export function FieldDescription/);
assert.match(fields, /export function FieldError/);
assert.match(fields, /export function FormActions/);
assert.match(fields, /export function SearchInput/);
assert.match(fields, /role="alert"/);
assert.match(fields, /type="search"/);
assert.match(fields, /from "@\/components\/ui\/input"/);
assert.match(fields, /from "@\/components\/ui\/label"/);
assert.match(fields, /min-h-11/);
assert.doesNotMatch(fields, /#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(fields, /!important/);

const idx = read("src/components/design-system/index.ts");
assert.match(idx, /FormLabel/);
assert.match(idx, /FieldError/);
assert.match(idx, /FormActions/);
assert.match(idx, /SearchInput/);

const deletion = read("src/pages/account/ui/AccountDeletionView.tsx");
assert.match(deletion, /FormLabel/);
assert.match(deletion, /FieldError/);
assert.match(deletion, /FormActions/);
assert.match(deletion, /aria-describedby/);
assert.match(deletion, /LoadingStateV2/);
assert.doesNotMatch(deletion, /window\.confirm/);
assert.doesNotMatch(deletion, /<button\b/);
assert.doesNotMatch(deletion, /body\.error/);

const login = read("src/pages/account/ui/LoginView.tsx");
assert.match(login, /FormLabel/);
assert.match(login, /FieldError/);
assert.doesNotMatch(login, /window\.confirm/);
assert.doesNotMatch(login, /<button\b/);

const register = read("src/pages/account/ui/RegisterView.tsx");
assert.match(register, /LoginView/);

const settings = read("src/pages/account/ui/SettingsView.tsx");
assert.match(settings, /SearchInput/);
assert.match(settings, /FormLabel/);

assert.ok(existsSync(resolve(majalisRoot, "src/components/ui/input.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/ui/textarea.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/ui/select.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/EmptyStateV2.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/NoResultsState.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/ErrorStateV2.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/OfflineStateV2.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/StaleDataIndicator.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/PermissionDeniedState.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/components/design-system/RateLimitedState.tsx")));
assert.match(read("src/components/design-system/ErrorStateV2.tsx"), /from "@\/components\/ui\/button"/);
assert.doesNotMatch(read("src/components/design-system/ErrorStateV2.tsx"), /<button\b/);
assert.match(read("src/components/design-system/NoResultsState.tsx"), /data-app-state="no-results"/);
assert.match(read("src/components/design-system/index.ts"), /NoResultsState/);
assert.match(read("src/components/design-system/index.ts"), /StaleDataIndicator/);
assert.doesNotMatch(read("src/pages/lessons/ui/LessonsView.tsx"), /safeLocationReload/);
assert.match(read("src/pages/lessons/ui/LessonsView.tsx"), /NoResultsState/);
assert.match(read("src/pages/fiqh/ui/RulingsView.tsx"), /NoResultsState/);
assert.match(read("src/pages/account/ui/SearchView.tsx"), /NoResultsState/);
assert.match(read("src/pages/account/ui/SearchView.tsx"), /OfflineStateV2/);
assert.match(read("src/components/design-system/OfflineStateV2.tsx"), /from "@\/components\/ui\/button"/);
assert.doesNotMatch(read("src/components/design-system/OfflineStateV2.tsx"), /<button\b/);
assert.match(read("src/components/design-system/EmptyStateV2.tsx"), /from "@\/components\/ui\/button"/);
assert.doesNotMatch(read("src/components/design-system/EmptyStateV2.tsx"), /<button\b/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:form-feedback-authority"] || "", /form-feedback-authority-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:form-feedback-authority/);

console.log("form-feedback-authority-gate.test.ts: ok");

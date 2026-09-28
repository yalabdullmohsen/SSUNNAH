/**
 * عقد المحتوى — حالات الفهرسة والعرض العام.
 * التشغيل: node --import tsx src/lib/__tests__/content-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { isPublicTrusted, isSearchIndexable } from "../content-contract";

assert.equal(isSearchIndexable({ publicationStatus: "published" }), true);
assert.equal(isSearchIndexable({ publicationStatus: "draft" }), false);
assert.equal(isSearchIndexable({ publicationStatus: "archived" }), false);
assert.equal(isSearchIndexable({ publicationStatus: "UNKNOWN" }), false);
assert.equal(isSearchIndexable({ publicationStatus: "published", searchVisibility: false }), false);

assert.equal(isPublicTrusted({ publicationStatus: "published", verificationStatus: "source_verified" }), true);
assert.equal(isPublicTrusted({ publicationStatus: "published", verificationStatus: "source_missing" }), false);
assert.equal(isPublicTrusted({ publicationStatus: "published", verificationStatus: "UNKNOWN" }), false);
assert.equal(isPublicTrusted({ publicationStatus: "draft", verificationStatus: "source_verified" }), false);

console.log("content-contract-gate: ok");

import assert from "node:assert/strict";
import { formatCount, formatNumber, formatTime } from "../format";

assert.equal(formatNumber(4, undefined, "ar"), "٤");
assert.equal(formatNumber(4, undefined, "en"), "4");
assert.match(formatTime(new Date(2026, 0, 1, 4, 56), "ar"), /^[٠-٩]+:[٠-٩]{2}/);
assert.match(formatTime(new Date(2026, 0, 1, 4, 56), "en"), /^4:56/);
// لا التصاق رقم بكلمة، ولا خلط أنظمة أرقام في عبارة واحدة
assert.equal(formatCount(4, "ركعات", "ar"), "٤ ركعات");
assert.equal(/[0-9]/.test(formatCount(4, "ركعات", "ar")), false);
console.log("format.test ok");

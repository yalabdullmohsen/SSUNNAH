#!/usr/bin/env node
/** يولّد adhkar.json للشاشة الأصلية من adhkar-seed — `node --import tsx scripts/export-native-adhkar.mjs` */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNativeAdhkarBundle, NATIVE_ADHKAR_BUNDLE_PATH } from "../src/lib/native-adhkar-bundle.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(ROOT, NATIVE_ADHKAR_BUNDLE_PATH);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buildNativeAdhkarBundle());
console.log(`wrote ${NATIVE_ADHKAR_BUNDLE_PATH}`);

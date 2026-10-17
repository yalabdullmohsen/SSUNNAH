import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = (files) => {
  const d = mkdtempSync(join(tmpdir(), 'bcard-'))
  for (const [n, c] of Object.entries(files)) writeFileSync(join(d, n), c)
  return spawnSync('bash', ['scripts/native-bottom-card-guard.sh'], { env: { ...process.env, BCARD_GUARD_SRC: d }, encoding: 'utf8' })
}

test('بطاقة بلا تجنّب تفشل', () => {
  const r = run({ 'A.swift': 'SunnahBottomCard { Text("x") }' })
  assert.equal(r.status, 1); assert.match(r.stdout, /بلا sunnahAvoidsBottomCard/)
})
test('بطاقة مع تجنّب تمر', () => {
  assert.equal(run({ 'A.swift': 'ScrollView{}.sunnahAvoidsBottomCard()\nSunnahBottomCard { Text("x") }' }).status, 0)
})
test('overlay سفلي يدوي يفشل', () => {
  assert.equal(run({ 'B.swift': '.overlay(alignment: .bottom) { X() }' }).status, 1)
})

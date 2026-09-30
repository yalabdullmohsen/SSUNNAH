# Device evidence helpers (WAVE13)

Opt-in operator tools. **No production telemetry is enabled by these scripts.**

## Capture build context

```bash
node scripts/device-evidence/capture-build-context.mjs \
  --out /tmp/sunnah-device-evidence/build-context.json
```

Optional:

- `--url https://www.ssunnah.com/version.json`
- `--repo-root .`

## Validate rows

```bash
node scripts/device-evidence/validate-evidence-rows.mjs \
  --dir docs/audit/device-evidence/<date>-<sha>/rows
```

Rejects:

- `PASS` / `FAIL` without `artifactPath`
- `PASS` without `buildCommit`
- unknown `result` values
- invented auto-pass (empty actual)

## Telemetry policy

- Default OFF.
- Do not ship a production flag that uploads device QA payloads.
- Local notes only unless owner enables a future harness explicitly.
- Never log Quran text, PII, or precise location.

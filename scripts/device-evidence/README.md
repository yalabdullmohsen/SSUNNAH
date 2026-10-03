# Device evidence helpers

Opt-in operator tools. **No production telemetry is enabled by these scripts.**

## Capture build context

```bash
node scripts/device-evidence/capture-build-context.mjs \
  --out /tmp/sunnah-device-evidence/build-context.json
```

## Validate WAVE13 legacy rows

```bash
node scripts/device-evidence/validate-evidence-rows.mjs \
  --dir docs/audit/device-evidence/<date>-<sha>/rows
```

## Validate physical certification pack (T-033/T-040/AUTH/…)

```bash
node scripts/device-evidence/validate-physical-evidence-pack.mjs \
  --pack docs/audit/device-evidence/<YYYYMMDD>-<build>-<shortSha>
```

Rejects:

- PASS/FAIL without artifact file
- simulator PASS when physicalRequired
- AUTH / REQUIRES_FUTURE_BUILD_GE_56 PASS when appBuild < 56
- Build mismatch vs manifest
- forbidden results: UNKNOWN, PROBABLY_PASS, MANUAL_PASS_WITHOUT_ARTIFACT
- forbidden claim strings in notes

Empty / missing pack → exit 0 with `NO_PHYSICAL_ROWS` (DEVICE_REQUIRED).

Templates:

- `docs/audit/device-evidence/_templates/physical-manifest.template.json`
- `docs/audit/device-evidence/_templates/physical-row.template.json`

Program docs: `docs/audit/physical-cert/`

## Telemetry policy

- Default OFF.
- Never log Quran text, PII, tokens, or precise location.

# Visual Consistency Audit — Wave 1 evidence

## Conflicting sources (pre-Wave 1)

| Source | Conflict |
|---|---|
| `brand-v4.css` `--em-600 #1E5F4B` | Parallel emerald vs Foundation `#0F5C3F` |
| `brand-v4` gold `#B09A5E` | Parallel gold vs `#C9A82E` |
| Dark brand mint `#5CC095` | Separate night product feel |
| Multiple cream / surface tokens | Ivory hierarchy unclear |
| Gold as focus / links / selected | Overuse vs content |

## Wave 1 remediation (shared)

1. Documented single ivory → white → sage hierarchy on `--sf2-*`.
2. Canonical emerald scale `--sf-emerald-*` derived from Foundation primary.
3. Gold sparse tokens + `SF2_GOLD_POLICY`.
4. Full text hierarchy including on-dark / accent / warning.
5. Radius: control=XS · card=MD · feature/sheet=LG.
6. Card System V2: quieter borders, no default card shadow, icon box size, hide redundant open button.

## Explicitly deferred

Page migrations · bottom nav · drawer · prayer dark shell · lessons lessons filters · brand-v4 deletion · snapshot updates.

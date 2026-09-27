# Card System V2

## Taxonomy

| Type | Component | Rules |
|---|---|---|
| Navigation | `NavigationCardV2` | Whole card clickable; one-line desc; no nested «فتح» |
| Content | `ContentCardV2` | Title → meta → excerpt (clamp 2); overflow for secondary |
| Continue | `ContinueCardV2` | Progress + one continue action |
| Reference | (reuse `ReferenceCard` + cs2 styles later) | Source metadata only |
| Evidence | `EvidenceBlockV2` | Quotation ≠ editorial |
| Warning | `WarningBlockV2` | Scope / educational / conflict |
| Summary | `SummaryBlockV2` | Learning summary surface |
| Action | existing `ActionCard` | Report / share |

## Nesting

- Max one nested card layer; nested `[data-cs2-card]` drops shadow and uses dashed border as debug signal.
- Preview clamp allowed only when a full detail route exists.

## Calm Wave 1 polish

- Default card shadow off (`--sf2-shadow-none`); elevation via selected/focus only.
- Navigation icon box capped (`--sf2-icon-box`); no separate «فتح» button.
- Selected = surface + border + focus ring (not gold-only).

## Files

- CSS: `styles/card-system-v2.css`
- TSX: `components/design-system/CardSystemV2.tsx`
- Legacy 10-type system remains in `CardSystem.tsx` until waves migrate pages.

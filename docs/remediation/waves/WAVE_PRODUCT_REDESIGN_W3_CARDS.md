# WAVE — Product Redesign Wave 3 (Card System V2 adoption)

| Field | Value |
|---|---|
| Branch | `cursor/product-redesign-wave3-cards` |
| Depends on | #2309 Foundation · #2310 Navigation |
| Objective | Taxonomy adoption without competing card systems |

## Delivered

- `SectionEntryCard` / HubCard hosts `data-cs2-type="navigation"` + `cs2-nav__*` class bridges  
- Quran open-mushaf card tagged continue/navigation by resume state  
- Progress center mushaf resume uses `ContinueCardV2`  
- Bridge CSS in `card-system-v2.css` (no forced white surface on ink hub cards)  
- Gate: `product-redesign-wave3-cards-gate.test.ts`

## Non-claims

Full page-by-page card rewrite · Snapshot updates · Quran/Hadith text changes

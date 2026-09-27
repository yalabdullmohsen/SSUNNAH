# Accessibility Standard — redesign program

## Target

WCAG 2.2 AA + existing project Playwright contrast / on-brand gates (stricter wins).

## Required

- Text contrast, focus visible, keyboard, SR labels, heading order  
- RTL order, touch targets ≥ 44px where interactive  
- `prefers-reduced-motion` for shimmer/transitions  
- Focus not obscured by sticky/bottom chrome  
- No color-only meaning  

## Forbidden

- Lowering contrast thresholds  
- Skipping qualifying routes  
- `continue-on-error` on a11y jobs  
- Snapshot updates to hide contrast defects  

# Responsive & Safe Area Spec

## Breakpoints

Reuse existing `breakpoints.css` / product tokens — do not invent a parallel grid in Wave 1.

## Safe areas

- Bottom nav / sticky filters / ScrollToTop / sheets must use `env(safe-area-inset-*)`.  
- Content padding-bottom ≥ nav height + inset.  
- Validate on device: `DEVICE_REQUIRED`.

## Density

- Mobile: compact cards (`--sf2-space-*`).  
- Avoid half-screen filter stacks (Lessons Wave 4).

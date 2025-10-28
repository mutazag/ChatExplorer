# Research: Image pop-out (zoom & pan)

**Date**: 2025-10-28
**Feature**: Image pop-out (spec: ./spec.md)

## Decisions

1. Pan/Zoom approach
   - Decision: Implement a small in-house pan/zoom module using CSS transforms and pointer events.
   - Rationale: Keeps dependencies minimal (constitution), gives full control for accessibility and focus handling, and is straightforward to implement for required interactions (zoom, pan, reset).
   - Alternatives considered:
     - Vendor a tiny helper (MIT) — pros: quicker; cons: risk of adding dependency, may need adaptation for accessibility and small size requirement.

2. Accessibility
   - Decision: Implement a focus trap inside the lightbox, descriptive aria-labels for controls, ESC to close, and keyboard shortcuts for zoom in/out/reset.
   - Rationale: Matches constitution and ensures keyboard-only users can interact with the pop-out.

3. Mobile gesture mapping
   - Decision: Support pinch-to-zoom and single-finger drag-to-pan when zoomed. Use double-tap to reset zoom where appropriate.
   - Rationale: Aligns with common mobile patterns and provides intuitive controls for touch users.

4. Performance
   - Decision: Render the image at fit-to-viewport, use CSS transforms for zoom & pan (GPU-accelerated), and throttle wheel/pointer events with rAF.
   - Rationale: CSS transforms are performant and widely supported; rAF prevents layout thrashing.

## Next steps from research
- Implement lightbox and pan/zoom module with unit tests for state transitions.
- Validate accessibility with manual testing and automated checks.
- Test mobile pinch/drag behavior on representative devices.

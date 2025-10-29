# Research: Fix Mobile Folder Selector Visibility

**Feature**: specs/001-fix-mobile-folder-selector/spec.md
**Date**: 2025-10-30
**Scope**: Ensure a visible, accessible data set selection control on mobile and enable switching without reloads.

## Decisions and Rationale

### Decision 1: Provide a mobile-visible entry point for data set selection
- Rationale: Spec requires discoverability and operability on mobile; existing control is hidden on small viewports.
- Alternatives considered:
  - A. Persistent bottom tab bar item for “Data Sets”
    - Rejected: Adds permanent chrome, reduces vertical space; heavier redesign.
  - B. Floating action button (FAB)
    - Rejected: May overlap content; distracts; additional positioning logic across themes.
  - C. Overflow menu item or header toolbar button (Chosen)
    - Selected: Minimal layout impact, consistent with responsive patterns, easy to make accessible.

### Decision 2: Use CSS media queries and ARIA labeling
- Rationale: Keep logic client-only and theme-compatible; ensure touch target sizing and screen reader discoverability.
- Alternatives considered:
  - A. JS-driven viewport detection only
    - Rejected: Harder to maintain and test; CSS-first simpler and robust.
  - B. Separate mobile-only DOM tree
    - Rejected: Duplicates logic; risks divergence and regressions.

### Decision 3: Route selection to existing in-browser data selection logic
- Rationale: No backend; reuse existing selection and state update flows.
- Alternatives considered:
  - A. New selection store
    - Rejected: Unnecessary duplication; increases maintenance.
  - B. Soft reload/navigation
    - Rejected: Violates “no reload” requirement; worse UX.

## Implementation Notes (non-binding)
- Ensure 44×44px touch target minimum where feasible.
- Truncate long data set names with CSS while preserving full name via title/tooltip.
- Maintain control visibility across theme variants; verify contrast and focus states.

## Open Questions Resolved
- None. Spec contains no [NEEDS CLARIFICATION] markers; defaults and patterns chosen per project constitution.
# Research — Visual Themes Enhancements

Date: 2025-10-25
Branch: 001-visual-themes
Spec: ./spec.md

## Decisions

1) Theme switching (RESOLVED)
- Decision: Use CSS variables for colors; add a `data-theme="light|dark"` (or `.theme-dark`) on the root element toggled via a UI control. Default to light.
- Rationale: CSS variables make theme swap instant and maintainable without extra dependencies.
- Alternatives: Inline style swapping or full stylesheet swap — heavier and harder to maintain.

2) Left pane show/hide (RESOLVED)
- Decision: Provide a visible toggle control; hide via CSS (e.g., `[hidden]` or a collapsed grid) and update `aria-expanded` on the control.
- Rationale: Simple, accessible, and keeps DOM stable for performance.
- Alternatives: Remove/insert DOM nodes — causes layout thrash and state loss.

3) Mobile optimization (RESOLVED)
- Decision: At small viewports, default to conversation-first layout; expose a clear control to open the chat list as an overlay or slide-in.
- Rationale: Prioritizes reading area; maintains quick access to the list.
- Alternatives: Keep fixed split — wastes space and hurts readability.

4) Role-distinct bubbles (RESOLVED)
- Decision: Left-align assistant, right-align user; rounded rectangles with distinct background tokens; prepend small role icons (local assets) with accessible labels.
- Rationale: Improves scannability; aligns with common chat UIs.
- Alternatives: Neutral/undifferentiated layout — poorer readability.

5) Hover/focus/tap timestamp (RESOLVED)
- Decision: Subtle elevation on hover/focus; reveal a timestamp line beneath bubble. Keyboard and touch interactions mirror hover (focus/tap) for parity. Respect `prefers-reduced-motion`.
- Rationale: Adds context without clutter; accessible behavior beyond hover-only.
- Alternatives: Always visible timestamps — clutters UI; no reveal — hides context.

6) Accessibility & contrast (RESOLVED)
- Decision: Choose color pairs that meet WCAG AA contrast for text and critical UI; ensure visible focus rings; avoid color-only semantics.
- Rationale: Basic accessibility is mandatory per constitution.
- Alternatives: Rely on default UA styles — insufficient and inconsistent.

## Alternatives Considered

- Persisting preferences to storage: deferred; scope limits to session for simplicity.
- Using a UI framework: out of scope per constitution; vanilla meets needs.
- Animations via JS: prefer CSS transitions; honor reduced-motion.

# Implementation Plan: Image pop-out (zoom & pan)

**Branch**: `001-image-popout` | **Date**: 2025-10-28 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-image-popout/spec.md`

## Summary

Provide a client-side, accessible image lightbox for inline images in the conversation browser. The lightbox opens on image activation, fits the image to the viewport, supports zoom and pan interactions (mouse, keyboard, touch), and closes on overlay click or ESC while restoring focus. The feature will be implemented in vanilla JavaScript and CSS with a test-first approach per project constitution.

## Technical Context

**Language/Version**: JavaScript ES6+, HTML5, CSS3
**Primary Dependencies**: None (vanilla). Any helper code will be implemented in small, local modules; no external CDN or npm packages by default.
**Storage**: No persistence required. Uses in-memory state. Media assets are resolved via existing asset-resolution logic (local `data/` or http(s) as allowed by spec).
**Testing**: Browser-based unit tests (Mocha in-browser) for UI behavior and small Node-based tests for pure logic if needed. Tests must be written first per constitution.
**Target Platform**: Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Primary development/test environment: latest Chrome on Windows and mobile browsers for touch verification.
**Project Type**: Client-side web application — UI component and a small module for pan/zoom state.
**Performance Goals**: Initial pop-out render under 300ms on representative hardware for 95% of openings; smooth pan/zoom interactions aiming for 60fps where possible (subject to image decoding costs).
**Constraints**: No build step preferred; must work from local files and static hosting. Any third-party library requires justification and constitution complexity tracking.
**Scale/Scope**: UI-only feature; no new backend APIs. Works with typical chat export datasets (images up to ~10MB); large images should be handled by progressive loading or browser-native scaling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature will be implemented with only HTML, CSS, and vanilla JavaScript — no server components.
- [x] **No Database Integration**: Feature reads and renders local/static media and does not introduce DB usage.
- [x] **Minimal Dependencies**: No external libraries planned; if introduced, will document justification in complexity table.
- [x] **Test Coverage**: Tests will be written first for the lightbox state machine and UI interactions (open/close/zoom/pan/escape/backdrop click).
- [x] **File-Based Data**: Feature uses existing file-based media resolution; sample files will be documented in `data/` and `data-model.md`.
- [x] **Browser Compatibility**: Implementation will use standard Web APIs and be tested across evergreen browsers.
- [x] **UI & Branding**: UI will be responsive and follow branding rules; local logo asset will remain in header as required.

**Result**: ✅ PASS

## Project Structure (feature)

```
specs/001-image-popout/
├── plan.md              # This file (filled by /speckit.plan)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (README)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

## Phase 0: Research (deliverable: research.md)

Goals:
- Resolve any outstanding technical unknowns and trade-offs related to pan/zoom approach, accessibility considerations, and performance.
- Decide whether to use a tiny vendored helper for pan/zoom or implement in-house.

Planned research tasks:
1. Evaluate pan/zoom implementation options:
   - A) Build a small in-house pan/zoom module using CSS transforms and pointer events.
   - B) Vendor a tiny MIT-licensed helper (if it is <5KB minified and has good accessibility support).
2. Accessibility patterns: keyboard focus trap, aria labels, and keyboard shortcuts (Esc to close, +/- for zoom).
3. Mobile gesture behavior: pinch-to-zoom and two-finger pan conflicts — decide gestures mapping.

Decision: Implement a small in-house pan/zoom module (Option A) unless a vetted helper is found that provides strong accessibility and tiny footprint. Document rationale in research.md.

## Phase 1: Design & Contracts (deliverables: data-model.md, contracts/, quickstart.md)

- Data model: define UI state entity (ImageLightbox) and any persisted preferences (none currently).
- Contracts: UI-only; no network contracts required. Create `contracts/README.md` noting no external APIs.
- Quickstart: document how to test the feature locally and provide sample test data.

## Phase 2: Tasks (high-level)

- Write unit tests for lightbox state machine (open/close/zoom/pan/focus restore).
- Implement lightbox UI and pan/zoom module.
- Add keyboard and touch handlers; ensure focus trap and aria labels.
- Add integration tests (in-browser) validating acceptance scenarios.
- Cross-browser/manual mobile testing; iterate on performance.

## Risks & Mitigations

- Large image decoding could block UI: mitigate with progressive rendering and using requestAnimationFrame for transforms.
- Complex gesture conflicts on mobile: mitigate by limiting gesture mapping and testing on representative devices.

## Outputs

- `specs/001-image-popout/research.md` (Phase 0)
- `specs/001-image-popout/data-model.md` (Phase 1)
- `specs/001-image-popout/quickstart.md` (Phase 1)
- `specs/001-image-popout/contracts/` (Phase 1 - README)

*** End of plan.md

# Feature Specification: Image pop-out (zoom & pan)

**Feature Branch**: `001-image-popout`
**Created**: 2025-10-28
**Status**: Draft
**Input**: User description: "when the user clicks on an image for the image to pop out in full size with ability to zoom and pan, and when the user clicks outside the image or hits esc on the keyboard to go back to the normal view"

> NOTE: This file was created by copying the existing `001-multimodal-inline` spec and focusing the stakeholder-facing spec for the image pop-out feature. Detailed implementation notes are located in `implementation-notes.md` in the same directory.

## User Scenarios & Testing

### User Story 1 - Open image in pop-out (Priority: P1)

As a user, when I click or activate an inline image I want it to open in a full-size pop-out so I can inspect details.

Why this priority: Allows users to view details without leaving the conversation flow.

Independent Test: Click or keyboard-activate an inline image to open the pop-out; verify the overlay displays the image fit-to-viewport.

Acceptance Scenarios:
1. Given an inline image, When I click it, Then the image opens in an overlay at fit-to-viewport scale.
2. Given the overlay is open, When I click outside the image or press ESC, Then the overlay closes and focus returns to the origin element.

---

### User Story 2 - Zoom & Pan (Priority: P1)

As a user, once the image is open I want to be able to zoom and pan to inspect details.

Independent Test: Use mouse wheel, pinch on touch, and on-screen controls to zoom; verify panning by dragging when zoomed.

Acceptance Scenarios:
1. Given image open, When user zooms in, Then they can pan the image by dragging.
2. Given image open, When user resets zoom, Then image returns to fit-to-viewport scale.

## Requirements

- FR-001: Pop-out must open on image activation and present the image fit-to-viewport preserving aspect ratio.
- FR-002: Support zoom in/out and panning while preserving image fidelity.
- FR-003: Close pop-out on overlay (backdrop) click or ESC and restore focus.
- FR-004: Trap focus inside the pop-out while open and expose accessible controls with aria labels.
- FR-005: Responsive touch support: pinch-to-zoom and drag-to-pan on mobile.

## Success Criteria

- SC-001: Pop-out opens and displays the image within 300ms in 95% of measured openings on representative hardware.
- SC-002: Zoom and pan interactions succeed in 98% of test interactions across mouse, keyboard and touch.
- SC-003: Pop-out closes on overlay click or ESC and restores focus 100% of tests.

## Key Entities

- ImageLightbox: { open: boolean, src: string, scale: number, pan: { x: number, y: number }, lastFocusedElement?: Element }

## Assumptions & Dependencies

- Browsers support basic pointer events and touch/pinch gestures.
- CSS and JS will enforce max-size constraints so modal does not overflow.
 - Dependency: This feature relies on the project's safe URL scheme rules (see FR-017 in `specs/001-multimodal-inline/spec.md`) for allowed image URL schemes. Tasks include a `mediaResolver` that enforces these rules locally for the feature.

## Implementation notes

See `implementation-notes.md` in this directory for developer-focused examples and asset resolution guidance.

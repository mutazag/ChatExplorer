# Feature Specification: Media pop-out — images (zoom & pan), video, and audio

**Feature Branch**: `001-image-popout`
**Created**: 2025-10-28
**Status**: Draft
**Input**: User description: "when the user clicks on an image for the image to pop out in full size with ability to zoom and pan, and when the user clicks outside the image or hits esc on the keyboard to go back to the normal view"; extended to video and audio pop-out (no zoom/pan for audio; simple proportional sizing for video)

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

---

### User Story 3 - Video pop-out (Priority: P1)

As a user, when I click an inline video I want it to open in a pop-out with native controls sized proportionally to the viewport.

Independent Test: Click or activate a video; verify the overlay displays an HTML5 video element with controls, sized to fit the viewport while preserving the intrinsic aspect ratio (or a reasonable default like 16:9 when unknown).

Acceptance Scenarios:
1. Given an inline video, When I click it, Then the video opens in an overlay with native controls and proportional sizing.
2. Given the video pop-out is open, When I click outside the player or press ESC, Then the overlay closes and focus returns to the origin element.

---

### User Story 4 - Audio pop-out (Priority: P1)

As a user, when I click an inline audio I want a simple centered audio player pop-out with native controls; no zoom/pan expected.

Independent Test: Click or activate an audio item; verify the overlay displays an HTML5 audio element with controls, keyboard accessible, and closes on overlay click or ESC with focus restore.

Acceptance Scenarios:
1. Given an inline audio, When I click it, Then an audio player opens in an overlay with native controls.
2. Given the audio pop-out is open, When I click outside the player or press ESC, Then the overlay closes and focus returns to the origin element.

## Requirements

- FR-001: Pop-out must open on image activation and present the image fit-to-viewport preserving aspect ratio.
- FR-002: Support zoom in/out and panning while preserving image fidelity (images only).
- FR-003: Close pop-out on overlay (backdrop) click or ESC and restore focus.
- FR-004: Trap focus inside the pop-out while open and expose accessible controls with aria labels.
- FR-005: Responsive touch support: pinch-to-zoom and drag-to-pan on mobile (images only).
- FR-006: Video pop-out uses an HTML5 video element with native controls and proportional sizing to fit viewport; no custom zoom/pan.
- FR-007: Audio pop-out uses an HTML5 audio element with native controls; no zoom/pan; keyboard accessible.
- FR-008: The same close and focus-restore behavior applies to video and audio pop-outs.
- FR-009: Safe URL scheme enforcement applies to image, video, and audio sources.

## Success Criteria

- SC-001: Pop-out opens and displays the media within 300ms in 95% of measured openings on representative hardware.
- SC-002: For images, zoom and pan interactions succeed in 98% of test interactions across mouse, keyboard and touch.
- SC-003: Pop-out closes on overlay click or ESC and restores focus 100% of tests.
- SC-004: Video and audio pop-outs expose native controls and remain keyboard accessible (Tab, Space/Enter to play/pause).

## Key Entities

- ImageLightbox / MediaLightbox: { open: boolean, kind: 'image'|'video'|'audio', src: string, scale?: number, pan?: { x: number, y: number }, lastFocusedElement?: Element }

## Assumptions & Dependencies

- Browsers support basic pointer events and touch/pinch gestures.
- CSS and JS will enforce max-size constraints so modal does not overflow.
 - Dependency: This feature relies on the project's safe URL scheme rules (see FR-017 in `specs/001-multimodal-inline/spec.md`) for allowed media URL schemes. Tasks include a `mediaResolver` that enforces these rules locally for image/video/audio.

## Implementation notes

See `implementation-notes.md` in this directory for developer-focused examples and asset resolution guidance.

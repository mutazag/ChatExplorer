# Tasks: Media pop-out (images, video, audio)

**Feature**: Media pop-out — images, video, audio (spec: ./spec.md)

## Overview

This tasks file breaks the feature into small, actionable tasks organized by phase and user story. Each task follows the required checklist format and includes a clear file path to edit or create. Tasks are ordered for implementation; items marked [P] are parallelizable.

-### Summary

- Total tasks: 30
- User stories: US1 (Open image), US2 (Zoom & Pan image), US3 (Video pop-out), US4 (Audio pop-out)
- Suggested MVP: implement US1 fully (open/close, accessibility, focus restore) then US2; follow with US3 (video) and US4 (audio).

---

## Phase 1: Setup

- [x] T001 Create JS module for lightbox UI at `src/ui/imageLightbox.js`
- [x] T002 Create CSS for lightbox styling at `src/ui/imageLightbox.css`
 - [x] T003 Create unit test harness for lightbox state at `tests/unit/imageLightbox.test.html`
- [x] T004 Add integration test page `tests/integration/imageLightbox-integration.html` with sample conversation HTML referencing `data/` images
 - [x] T031 Add video test asset(s) under `tests/assets/` (e.g., `sample-video.mp4` or `.webm`, small and license-safe) and document path in harness pages
 - [x] T032 Add audio test asset(s) under `tests/assets/` (e.g., `sample-audio.mp3` or `.ogg`, small and license-safe) and document path in harness pages

## Phase 2: Foundational (blocking prerequisites)

- [x] T005 Implement ImageLightbox state model in `src/modules/imageLightboxState.js` (open/close/scale/pan/lastFocusedElement)
- [x] T006 Implement accessibility utilities in `src/utils/a11y.js` (focus trap, restoreFocus(element), setAriaLabel)
- [x] T007 Add small helper to resolve safe image URLs in `src/utils/mediaResolver.js` (enforce allowed schemes per FR-017)

## Phase 3 (US1): Open image in pop-out (Priority P1)

 - [x] T011 [US1] Write unit tests for open/close/focus-restore in `tests/unit/imageLightbox.test.html` (Mocha assertions)
- [ ] T008 [US1] Ensure global click binding is initialized and images are marked with `data-lightbox` in renderers (e.g., `src/ui/detailView.js`); calling `imageLightbox.open(src, originElement)` from the global handler
- [x] T009 [US1] Implement `open(src, originElement)` and `close()` in `src/ui/imageLightbox.js` using state model and a modal DOM container (create markup dynamically)
- [x] T010 [US1] Implement backdrop click and ESC key handler in `src/ui/imageLightbox.js` to close the modal and restore focus to `originElement`
 - [x] T012 [US1] Add basic integration test that opens an inline image and verifies overlay and focus restore at `tests/integration/imageLightbox-integration.html`

## Phase 4 (US2): Zoom & Pan (Priority P1)

- [x] T016 [US2] Write unit tests for pan/zoom state transitions in `tests/unit/imagePanZoom.test.html` (or embed in `imageLightbox.test.html`)
- [x] T013 [US2] Implement zoom controls and UI (zoom in/out/reset buttons) in `src/ui/imageLightbox.js` and style in `src/ui/imageLightbox.css`
- [x] T014 [US2] Implement pan/zoom logic using CSS transforms in `src/modules/imagePanZoom.js` (expose methods: setScale, panBy, reset)
- [x] T015 [US2] Wire pointer events (pointerdown/move/up), wheel (with sensible modifier), and touch pinch handling to `imagePanZoom` in `src/ui/imageLightbox.js`
- [x] T017 [US2] Add integration tests for zoom/pan interactions in `tests/integration/imageLightbox-integration.html` (simulate wheel and pointer events where feasible)


## Final Phase: Polish & Cross-Cutting Concerns

- [x] T018 Polish: Add keyboard shortcuts (+/- for zoom), aria-labels for controls, and ensure responsive touch sizes in `src/ui/imageLightbox.js` and `src/ui/imageLightbox.css`

## Phase 5: Measurement & Metrics

- [x] T019 Add automated performance measurement harness at `tests/perf/imageLightbox-perf.html` to measure pop-out render latency (capture time from activation to first paint of lightbox) and assert SC-001 thresholds.
- [x] T020 Add interaction success integration checks at `tests/integration/imageLightbox-metrics.html` that exercise zoom/pan flows and assert interaction success rates to help validate SC-002 and SC-003.

---

## Phase 6 (US3): Video pop-out (Priority P1)

- [x] T021 [US3] Extend `src/ui/imageLightbox.js` to support `kind: 'video'` rendering using an HTML5 `<video>` with `controls`, sized proportionally to viewport (preserve intrinsic aspect ratio; default 16:9 when unknown). Do not auto-play unless initiated by user gesture.
- [x] T022 [US3] Mark rendered videos in `src/ui/detailView.js` with `data-lightbox="true"` (similar to images); ensure safe URL resolution via `mediaResolver`.
- [x] T023 [US3] Add integration test `tests/integration/mediaLightbox-video.html` to verify open/close, proportional sizing, and focus restore; ensure test video asset from `tests/assets/` is referenced via a relative path.
- [x] T024 [US3] Add performance harness `tests/perf/mediaLightbox-video-perf.html` to measure open latency (same SC-001 threshold); ensure test video asset from `tests/assets/` is referenced via a relative path.
- [x] T025 [US3] A11y: Ensure focus trap works with the video element and that Tab order reaches native controls; document keyboard interactions in quickstart.

## Phase 7 (US4): Audio pop-out (Priority P1)

- [x] T026 [US4] Extend `src/ui/imageLightbox.js` to support `kind: 'audio'` rendering using an HTML5 `<audio>` with `controls` centered; no zoom/pan. Target a responsive width (e.g., clamp(320px, 60vw, 640px)).
- [x] T027 [US4] Mark rendered audios in `src/ui/detailView.js` with `data-lightbox="true"`; ensure safe URL resolution via `mediaResolver`.
- [x] T028 [US4] Add integration test `tests/integration/mediaLightbox-audio.html` to verify open/close and focus restore; ensure test audio asset from `tests/assets/` is referenced via a relative path.
- [x] T029 [US4] Add minimal perf check in `tests/perf/mediaLightbox-audio-perf.html` (open latency under SC-001 threshold); ensure test audio asset from `tests/assets/` is referenced via a relative path; no interaction metrics required.
- [x] T030 [US4] A11y: Verify keyboard accessibility (Tab to controls, Space/Enter to toggle play) and document in quickstart.

## Dependencies & Execution Order

1. Phase 1 (T001-T004) must run first to provide scaffolding and test harness.
2. Phase 2 (T005-T007) foundational modules must be ready before story implementation.
3. US1 (T008-T012) should be implemented next (MVP).
4. US2 (T013-T017) can be implemented after US1; many tasks (T013-T015) are interdependent.
5. Final polish (T018) runs last.

## Parallel Opportunities

- T001, T002, and T003 are parallelizable (create files) — mark T001-T003 as [P] if you want to run in parallel.
- T005 (state model) and T006 (a11y utils) can be implemented in parallel by different engineers — mark as [P] when scheduling.
- T013 (controls UI) and T014 (pan/zoom core) can be developed in parallel but require coordination for API surface.

## Task counts

- Total tasks: 30
- Setup: 4
- Foundational: 3
- US1: 5
- US2: 5
- US3: 5
- US4: 5
- Polish: 1
- Measurement: 2

## Independent test criteria (per user story)

- US1 (Open image): Clicking/activating an inline image opens modal, overlay visible; ESC/overlay closes modal and restores focus to origin element.
- US2 (Zoom & Pan image): After opening modal, user can zoom in/out, pan when zoomed, reset to fit-to-viewport; interactions work across mouse, keyboard, and touch.
- US3 (Video pop-out): Clicking/activating an inline video opens a proportional video player with native controls; ESC/overlay closes and restores focus.
- US4 (Audio pop-out): Clicking/activating an inline audio opens a centered audio player with native controls; ESC/overlay closes and restores focus.

## Suggested MVP

- Implement Phase1 + Phase2 + US1 (T001-T012) to deliver a usable lightbox with accessibility and close behavior. Then iterate on zoom/pan (US2).

## Implementation strategy

- Follow TDD for stateful modules (`imageLightboxState`, `imagePanZoom`). Start with unit tests for state transitions, then implement DOM wiring and integration tests.
- Keep modules small and focused (state vs DOM controller). Avoid external libs unless complexity justifies it; document any such choice in `specs/001-image-popout/plan.md` complexity section.

---

Generated by `/speckit.tasks` for feature `001-image-popout`
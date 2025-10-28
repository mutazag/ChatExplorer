# Tasks: Image pop-out (zoom & pan)

**Feature**: Image pop-out (spec: ./spec.md)

## Overview

This tasks file breaks the feature into small, actionable tasks organized by phase and user story. Each task follows the required checklist format and includes a clear file path to edit or create. Tasks are ordered for implementation; items marked [P] are parallelizable.

-### Summary

- Total tasks: 20
- User stories: US1 (Open pop-out), US2 (Zoom & Pan)
- Suggested MVP: implement US1 fully (open/close, accessibility, focus restore) then US2.

---

## Phase 1: Setup

- [ ] T001 Create JS module for lightbox UI at `src/ui/imageLightbox.js`
- [ ] T002 Create CSS for lightbox styling at `src/ui/imageLightbox.css`
- [ ] T003 Create unit test harness for lightbox state at `tests/unit/imageLightbox.test.html`
- [ ] T004 Add integration test page `tests/integration/imageLightbox-integration.html` with sample conversation HTML referencing `data/` images

## Phase 2: Foundational (blocking prerequisites)

- [ ] T005 Implement ImageLightbox state model in `src/modules/imageLightboxState.js` (open/close/scale/pan/lastFocusedElement)
- [ ] T006 Implement accessibility utilities in `src/utils/a11y.js` (focus trap, restoreFocus(element), setAriaLabel)
- [ ] T007 Add small helper to resolve safe image URLs in `src/utils/mediaResolver.js` (enforce allowed schemes per FR-017)

## Phase 3 (US1): Open image in pop-out (Priority P1)

- [ ] T008 [US1] Add event binding in `src/ui/inlineMedia.js` to detect image activation and call `imageLightbox.open(src, originElement)`
- [ ] T009 [US1] Implement `open(src, originElement)` and `close()` in `src/ui/imageLightbox.js` using state model and a modal DOM container (create markup dynamically)
- [ ] T010 [US1] Implement backdrop click and ESC key handler in `src/ui/imageLightbox.js` to close the modal and restore focus to `originElement`
- [ ] T011 [US1] Write unit tests for open/close/focus-restore in `tests/unit/imageLightbox.test.html` (Mocha assertions)
- [ ] T012 [US1] Add basic integration test that opens an inline image and verifies overlay and focus restore at `tests/integration/imageLightbox-integration.html`

## Phase 4 (US2): Zoom & Pan (Priority P1)

- [ ] T013 [US2] Implement zoom controls and UI (zoom in/out/reset buttons) in `src/ui/imageLightbox.js` and style in `src/ui/imageLightbox.css`
- [ ] T014 [US2] Implement pan/zoom logic using CSS transforms in `src/modules/imagePanZoom.js` (expose methods: setScale, panBy, reset)
- [ ] T015 [US2] Wire pointer events (pointerdown/move/up), wheel (with sensible modifier), and touch pinch handling to `imagePanZoom` in `src/ui/imageLightbox.js`
- [ ] T016 [US2] Write unit tests for pan/zoom state transitions in `tests/unit/imagePanZoom.test.js` (or embed in `imageLightbox.test.html`)
- [ ] T017 [US2] Add integration tests for zoom/pan interactions in `tests/integration/imageLightbox-integration.html` (simulate wheel and pointer events where feasible)


## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T018 Polish: Add keyboard shortcuts (+/- for zoom), aria-labels for controls, and ensure responsive touch sizes in `src/ui/imageLightbox.js` and `src/ui/imageLightbox.css`

## Phase 5: Measurement & Metrics

- [ ] T019 Add automated performance measurement harness at `tests/perf/imageLightbox-perf.html` to measure pop-out render latency (capture time from activation to first paint of lightbox) and assert SC-001 thresholds.
- [ ] T020 Add interaction success integration checks at `tests/integration/imageLightbox-metrics.html` that exercise zoom/pan flows and assert interaction success rates to help validate SC-002 and SC-003.

---

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

- Total tasks: 20
- Setup: 4
- Foundational: 3
- US1: 5
- US2: 5
- Polish: 1
- Measurement: 2

## Independent test criteria (per user story)

- US1 (Open pop-out): Clicking/activating an inline image opens modal, overlay visible, pressing ESC or clicking overlay closes modal and restores focus to origin element.
- US2 (Zoom & Pan): After opening modal, user can zoom in/out, pan when zoomed, reset to fit-to-viewport; interactions work across mouse, keyboard, and touch in integration tests.

## Suggested MVP

- Implement Phase1 + Phase2 + US1 (T001-T012) to deliver a usable lightbox with accessibility and close behavior. Then iterate on zoom/pan (US2).

## Implementation strategy

- Follow TDD for stateful modules (`imageLightboxState`, `imagePanZoom`). Start with unit tests for state transitions, then implement DOM wiring and integration tests.
- Keep modules small and focused (state vs DOM controller). Avoid external libs unless complexity justifies it; document any such choice in `specs/001-image-popout/plan.md` complexity section.

---

Generated by `/speckit.tasks` for feature `001-image-popout`
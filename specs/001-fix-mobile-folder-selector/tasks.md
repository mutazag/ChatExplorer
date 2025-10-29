# Tasks: Fix Mobile Folder Selector Visibility

**Input**: Design documents from `/specs/001-fix-mobile-folder-selector/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution. All functions and modules MUST have tests written BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline structure and prepare scaffolding for this feature

- [ ] T001 Verify MagTech.ai logo exists at `assets/` and is referenced in `index.html` header; add if missing
- [ ] T002 [P] Ensure mobile viewport meta tag is present and correct in `index.html`
- [ ] T003 [P] Verify in-browser test harness in `tests/index.html` supports new spec files; add loader entries if needed
- [ ] T004 [P] Create scaffolding (if missing): `src/ui/mobile/`, `src/modules/`, `tests/unit/modules/`, `tests/integration/mobile/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and state needed before any user story work

- [ ] T005 Add responsive CSS for mobile dataset control visibility and touch targets in `styles.css` (≤ 768px media query; truncation helpers)
- [ ] T006 [P] Create accessibility helpers in `src/utils/a11y.js` (apply aria-labels, focus management)
- [ ] T007 [P] Ensure eventing for `activeDataSetId` changes in `src/state/events.js` (or `src/state/` module extension)
- [ ] T008 Implement `selectDataSet(dataSetId)` in `src/modules/dataSelection.js` to update session and notify listeners (no reload)

**Checkpoint**: Foundation ready — user stories can proceed

---

## Phase 3: User Story 1 — Choose a data set on mobile (Priority: P1) 🎯 MVP

**Goal**: Mobile users can discover a visible control, choose a data set, and see conversations load for that selection

**Independent Test**: On a mobile viewport (e.g., 375×667), a visible entry point allows selecting a data set; upon selection, conversation list updates to the chosen data set

### Tests for User Story 1 (MANDATORY)

- [ ] T010 [P] [US1] Unit tests for `selectDataSet` in `tests/unit/modules/dataSelection.spec.js`
- [ ] T011 [P] [US1] Integration test for mobile discovery and selection in `tests/integration/mobile/folder-selector-choose.spec.js`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement `src/modules/dataSelection.js` (session update + event dispatch)
- [ ] T013 [P] [US1] Create mobile dataset control component in `src/ui/mobile/datasetControl.js`
- [ ] T014 [US1] Add control to DOM and bind to chooser in `index.html` and `src/app.js` (visible ≤ 768px)
- [ ] T015 [US1] Wire conversation list refresh on `activeDataSetId` change in `src/app.js`
- [ ] T016 [US1] Handle "no data sets" case gracefully in `src/ui/mobile/datasetControl.js`
- [ ] T017 [US1] Verify tests pass for US1 (run harness; fix regressions)

**Checkpoint**: US1 independently functional and testable

---

## Phase 4: User Story 2 — Switch data sets on mobile (Priority: P2)

**Goal**: Users can switch between data sets at any time, without reloads and without losing theme/layout state

**Independent Test**: With data set A active, selecting data set B updates the conversation list and keeps the control visible/usable

### Tests for User Story 2 (MANDATORY)

- [ ] T018 [P] [US2] Unit tests for idempotent selection and event emission in `tests/unit/modules/dataSelection.switch.spec.js`
- [ ] T019 [P] [US2] Integration test for switching A→B in `tests/integration/mobile/folder-selector-switch.spec.js`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Enhance `src/modules/dataSelection.js` to prevent redundant updates (same id) and debounce rapid changes
- [ ] T021 [US2] Indicate active data set in control UI (label/summary) in `src/ui/mobile/datasetControl.js`
- [ ] T022 [US2] Preserve theme/layout state across selection changes in `src/app.js`
- [ ] T023 [US2] Confirm no page reloads occur; ensure integration test asserts DOM update only

**Checkpoint**: US1 and US2 independently functional and testable

---

## Phase 5: User Story 3 — Mobile accessibility and theme integrity (Priority: P3)

**Goal**: Control is accessible via touch/keyboard with proper labeling and remains visible/readable across themes

**Independent Test**: Using keyboard/screen reader on mobile viewport, control is focusable, labeled, operable; visible across themes without occlusion

### Tests for User Story 3 (MANDATORY)

- [ ] T024 [P] [US3] Unit tests for accessibility helpers in `tests/unit/utils/a11y.spec.js`
- [ ] T025 [P] [US3] Integration tests for keyboard focus and labeling across themes in `tests/integration/mobile/folder-selector-a11y.spec.js`

### Implementation for User Story 3

- [ ] T026 [P] [US3] Apply ARIA attributes and keyboard bindings in `src/ui/mobile/datasetControl.js`
- [ ] T027 [US3] Update theme CSS to ensure contrast and layering (no occlusion) in `styles.css`
- [ ] T028 [US3] Implement truncation + tooltip for long names in `src/ui/mobile/datasetControl.js` and `styles.css`

**Checkpoint**: All stories independently functional and testable

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Update feature docs; validate `quickstart.md` and add notes to `README.md`
- [ ] T030 Code cleanup and inline documentation in `src/ui/mobile/datasetControl.js` and `src/modules/dataSelection.js`
- [ ] T031 [P] Performance audit for mobile reflows (avoid layout thrash) in `src/ui/mobile/datasetControl.js`
- [ ] T032 Browser compatibility testing (Chrome, Firefox, Safari, Edge) using `tests/index.html`
- [ ] T033 Responsive validation at 320px, 375px, 768px, 1280px widths against spec success criteria
- [ ] T034 [P] Add extra edge case tests (orientation change, high zoom, long names) in `tests/integration/mobile/`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies — can start immediately
- Foundational (Phase 2): Depends on Setup completion — BLOCKS all user stories
- User Stories (Phase 3+): Depend on Foundational completion; then proceed in priority order or in parallel (team capacity permitting)
- Polish (Final Phase): Depends on desired user stories being complete

### User Story Dependencies

- US1 (P1): Starts after Foundational; no dependency on other stories
- US2 (P2): Starts after Foundational; may integrate with US1 but remains independently testable
- US3 (P3): Starts after Foundational; may integrate with US1/US2 but remains independently testable

### Within Each User Story

- Write tests first and confirm they FAIL
- Implement modules/utilities, then UI wiring, then verify tests PASS

### Parallel Opportunities

- Setup: T002, T003, T004
- Foundational: T006, T007
- US1: T010, T011, T012, T013
- US2: T018, T019, T020
- US3: T024, T025, T026
- Polish: T029, T031, T034

---

## Parallel Example: User Story 1

```text
Run together:
- T010 Unit tests for selectDataSet (tests/unit/modules/dataSelection.spec.js)
- T011 Integration test for mobile discovery/selection (tests/integration/mobile/folder-selector-choose.spec.js)
- T012 Implement dataSelection module (src/modules/dataSelection.js)
- T013 Create mobile dataset control component (src/ui/mobile/datasetControl.js)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test US1 independently per spec success criteria

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test → Demo (MVP)
3. Add US2 → Test → Demo
4. Add US3 → Test → Demo

### Parallel Team Strategy

- After Foundational:
  - Dev A: US1
  - Dev B: US2
  - Dev C: US3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing; then keep them green
- Per Constitution Principle VIII, assistants/automation will propose commit/push/PR as a next step and will not perform them without explicit approval

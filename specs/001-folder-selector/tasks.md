# Tasks: Folder Selector (Choose dataset under /data)

Created: 2025-10-25
Status: Draft

Note: This plan follows the feature spec in `specs/001-folder-selector/spec.md` and the implementation plan in `specs/001-folder-selector/plan.md`, with discovery based on scanning subfolders under `data/` that contain `conversations.json` (no datasets.json).

## Phase 1 — Setup

- [X] T001 Create discovery module scaffold in `src/data/datasets/discovery.js`
- [X] T002 Wire feature entry in `src/features/folder/selectFolder.js` to use discovery API
- [X] T003 Ensure basic styles exist for folder list in `styles.css` (focus, hover, selected)

## Phase 2 — Foundational

- [X] T004 Implement directory index parsing for `data/` in `src/data/datasets/discovery.js`
- [X] T005 Implement validation probe for `<candidate>/conversations.json` (HEAD→GET fallback) in `src/data/datasets/discovery.js`
- [X] T006 Implement deterministic alphabetical sort of dataset names in `src/data/datasets/discovery.js`
- [X] T007 Add selection state field and getter/setter in `src/state/appState.js`

## Phase 3 — User Story 1 (P1): View Available Chat Extracts

Story goal: Users see available ChatGPT export folders found under `data/`.
Independent test criteria: With multiple subfolders under `data/`, a list renders in alphabetical order; empty state message when none.

- [X] T008 [P] [US1] Render dataset list UI in `src/features/folder/selectFolder.js`
- [X] T009 [US1] Show empty state when no valid datasets found in `src/features/folder/selectFolder.js`
- [X] T010 [P] [US1] Add ARIA roles/labels for list and items in `src/features/folder/selectFolder.js`
- [X] T011 [US1] Keyboard navigation (ArrowUp/ArrowDown/Enter) in `src/features/folder/selectFolder.js`

## Phase 4 — User Story 2 (P2): Select an Extract to Explore

Story goal: Users select a dataset; the app loads that dataset’s `conversations.json` and marks it active; switching is supported.
Independent test criteria: Clicking a dataset loads its conversations and applies a visible selected style; switching updates the view.

- [X] T012 [US2] On click/Enter, set active dataset in `src/state/appState.js`
- [X] T013 [P] [US2] Load `${path}/conversations.json` via fetch in `src/features/folder/selectFolder.js`
- [X] T014 [US2] Visual selected-state for active dataset item in `styles.css`
- [X] T015 [US2] Allow switching datasets; re-fetch and re-render in `src/features/folder/selectFolder.js`

## Phase 5 — User Story 3 (P3): Handle Invalid or Empty Extracts

Story goal: Provide clear feedback for invalid/empty datasets and allow recovery.
Independent test criteria: Selecting a folder without `conversations.json` or with malformed JSON shows an error message and preserves app stability.

- [ ] T016 [US3] Detect missing `conversations.json` and show message in `src/features/folder/selectFolder.js`
- [ ] T017 [P] [US3] Handle malformed JSON: try/catch parse with user-facing error in `src/features/folder/selectFolder.js`
- [ ] T018 [US3] Provide a retry or “choose another dataset” action in `src/features/folder/selectFolder.js`

## Final Phase — Polish & Cross-Cutting

- [ ] T019 Add unit tests for discovery (index parsing, validation, sorting) in `tests/folder-selector/listing.spec.js`
- [ ] T020 Add integration tests for selection and switching in `tests/folder-selector/loader.spec.js`
- [ ] T021 Constitution gates: verify client-only, minimal deps, UI a11y, responsive header with logo
- [ ] T022 Update docs: discovery notes and troubleshooting in `specs/001-folder-selector/quickstart.md`

## Dependencies

- Phase order: Setup → Foundational → US1 → US2 → US3 → Polish
- Story dependencies: US1 → US2 → US3

## Parallel Execution Examples

- T008 and T010 can proceed in parallel (UI rendering and ARIA labeling) after T004–T006.
- T013 (fetch conversations) can proceed in parallel with T014 (selected-state styles).
- T016 and T017 can proceed in parallel once T013 is complete.

## Implementation Strategy (MVP first)

1) MVP: Complete US1 (T004–T011) so users can see datasets and empty state.
2) Next: US2 loading path (T012–T015) to make selection functional.
3) Then: US3 error handling (T016–T018) for robustness.
4) Finally: Tests and polish (T019–T022).

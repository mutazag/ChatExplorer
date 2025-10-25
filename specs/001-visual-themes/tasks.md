---

description: "Executable task list for Visual Themes Enhancements"
---

# Tasks: Visual Themes Enhancements

Input: Design documents from `/specs/001-visual-themes/`
Prerequisites: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

Tests: Tests are REQUIRED per constitution. Prefer in-browser tests under `tests/visual-themes/`.
Organization: Tasks are grouped by user story to enable independent implementation and testing.

Format: `[ID] [P?] [Story] Description`
- [P]: Can run in parallel (different files, no dependencies)
- [USn]: User Story label (US1..US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

Purpose: Minimal prep required by multiple stories

- [ ] T001 Ensure test harness can load new specs under `tests/visual-themes/` via `tests/index.html`
- [ ] T002 [P] Add icon assets placeholders `assets/user-human.svg` and `assets/assistant-robot.svg`
- [ ] T003 [P] Add theme variable scaffolding to `styles.css` (CSS custom properties: colors, backgrounds, borders)

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: Core UI/state utilities; MUST complete before user stories

- [ ] T004 Add theme + pane fields to state: `src/state/appState.js` (theme: "light"|"dark"; leftPaneVisible: true)
- [ ] T005 [P] Create `src/ui/controls.js` with exported wiring functions: `initThemeToggle(buttonEl)`, `initPaneToggle(buttonEl)`
- [ ] T006 [P] Extend layout CSS in `styles.css` for hidden-left-pane class and responsive grid behaviors
- [ ] T007 Add root theme attribute handling (apply `data-theme` on `<html>` or `<body>`) in `src/ui/controls.js`
- [ ] T008 [P] Add reduced-motion friendly transitions in `styles.css` (respect `prefers-reduced-motion`)
- [ ] T009 [P] Add basic tests bootstrap: `tests/visual-themes/setup.spec.js` validates presence of app root and ability to mount controls

Checkpoint: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Switch themes (Priority: P1)

Goal: Toggle between light and dark themes at any time; consistent across UI.
Independent Test: Toggle button switches theme (data-theme) and updates colors.

### Tests (write first)

- [ ] T010 [P] [US1] Create test `tests/visual-themes/theme.spec.js` verifying data-theme toggles and colors change

### Implementation

- [ ] T011 [US1] Add theme toggle button to header in `index.html` with accessible label and current state
- [ ] T012 [US1] Implement `initThemeToggle` in `src/ui/controls.js` to toggle state and root `data-theme`
- [ ] T013 [US1] Define light/dark CSS variables and mappings in `styles.css` (text, background, bubble colors)
- [ ] T014 [US1] Wire initialization in `src/app.js` to call `initThemeToggle`

Checkpoint: US1 independently delivers theme switching

---

## Phase 4: User Story 2 — Show/hide left pane (Priority: P1)

Goal: Hide or show conversation list pane on demand, default visible.
Independent Test: Toggle hides/shows pane; `aria-expanded` reflects state.

### Tests (write first)

- [ ] T015 [P] [US2] Create test `tests/visual-themes/pane-toggle.spec.js` ensuring left pane collapses/expands and `aria-expanded` updates

### Implementation

- [ ] T016 [US2] Add pane toggle button to header in `index.html` with aria-controls and aria-expanded
- [ ] T017 [US2] Implement `initPaneToggle` in `src/ui/controls.js` to add/remove hidden class on left pane and sync `aria-*`
- [ ] T018 [US2] Update layout styles in `styles.css` so conversation area expands when pane hidden
- [ ] T019 [US2] Wire initialization in `src/app.js` to call `initPaneToggle`

Checkpoint: US2 independently toggles pane visibility

---

## Phase 5: User Story 3 — Mobile-optimized reading (Priority: P1)

Goal: On small viewports, conversation view takes majority space; list remains accessible.
Independent Test: At small width, conversation dominates; list accessible via control.

### Tests (write first)

- [ ] T020 [P] [US3] Create test `tests/visual-themes/mobile-layout.spec.js` asserting small-viewport class/layout applied (simulate by adding class or setting container width)

### Implementation

- [ ] T021 [US3] Add responsive CSS in `styles.css` (<= 860px): collapse list by default, expand conversation area >=60%
- [ ] T022 [US3] Ensure pane toggle reveals list as overlay/slide-in on small screens via CSS class
- [ ] T023 [US3] Update `index.html`/`src/app.js` to add an accessible control to open/close list on small screens

Checkpoint: US3 independently improves small-screen readability

---

## Phase 6: User Story 4 — Distinct message bubbles by role (Priority: P1)

Goal: Clear visual separation of roles with alignment, icons, and rounded bubbles.
Independent Test: User bubbles right-aligned with human icon; assistant left-aligned with robot icon.

### Tests (write first)

- [ ] T024 [P] [US4] Create test `tests/visual-themes/bubbles.spec.js` verifying role classes on messages and presence of icons with alt text

### Implementation

- [ ] T025 [US4] Update `src/ui/detailView.js` to render bubbles with role classes: `.msg--user` (right), `.msg--assistant` (left)
- [ ] T026 [US4] Insert icon `<img>` or inline SVG per role using `assets/user-human.svg` and `assets/assistant-robot.svg` with accessible labels
- [ ] T027 [US4] Add bubble styles in `styles.css` (rounded rectangles, distinct background tokens per role) and alignment rules

Checkpoint: US4 independently delivers role-distinct bubbles

---

## Phase 7: User Story 5 — Hover/focus/tap timestamp (Priority: P2)

Goal: Subtle elevation on hover/focus/tap and reveal timestamp beneath bubble.
Independent Test: Hover/focus/tap reveals timestamp; respects reduced motion.

### Tests (write first)

- [ ] T028 [P] [US5] Create test `tests/visual-themes/timestamps.spec.js` to verify timestamp element appears on hover/focus/tap (simulate class toggle)

### Implementation

- [ ] T029 [US5] Update `src/ui/detailView.js` to render a timestamp node per message (hidden by default)
- [ ] T030 [US5] Add CSS in `styles.css` to reveal timestamp on `.is-hovered`/`:hover`/`:focus-within` and `.is-tapped` with subtle elevation
- [ ] T031 [US5] Add event handlers: mouseenter/leave, focus/blur, and touch/click to toggle a reveal class for accessibility parity

Checkpoint: US5 independently adds contextual timestamps

---

## Phase 8: Polish & Cross-Cutting

Purpose: Finishing touches, performance, a11y, docs

- [ ] T032 [P] Contrast audit: ensure AA contrast for text and bubbles; adjust tokens in `styles.css`
- [ ] T033 [P] Focus states: ensure visible focus rings on controls and bubbles in `styles.css`
- [ ] T034 [P] Reduced motion: verify transitions respect `prefers-reduced-motion`; document in `specs/001-visual-themes/quickstart.md`
- [ ] T035 Update `specs/001-visual-themes/quickstart.md` with usage notes and known limitations
- [ ] T036 Code cleanup and small refactors across `src/ui/controls.js`, `src/ui/detailView.js`, `styles.css`

---

## Dependencies & Execution Order

### Phase Dependencies
- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks user stories
- User Stories (Phases 3–7): Depend on Foundational; can proceed independently in priority order
- Polish (Phase 8): After desired user stories complete

### User Story Dependencies
- US1 (Theme): After Foundational
- US2 (Pane): After Foundational
- US3 (Mobile layout): After Foundational
- US4 (Bubbles): After Foundational
- US5 (Timestamp reveal): After Foundational; can proceed after US4 if bubble structure needed

### Parallel Opportunities
- [P] tasks in Setup and Foundational can run concurrently
- Within each User Story, [P] tests can be authored in parallel
- US1/US2/US3/US4 can proceed in parallel after Foundational (different concerns)

---

## Implementation Strategy

### MVP First (P1 Stories)
1. Complete Phase 1–2 (Setup + Foundational)
2. Complete US1 (Theme), US2 (Pane), US3 (Mobile layout)
3. Validate and ship P1 scope

### Incremental Delivery
1. Add US4 (Bubbles) and validate independently
2. Add US5 (Timestamp reveal) and validate independently
3. Polish and cross-cutting improvements

---

## Summary & Validation
- Total tasks: 36
- Tasks per user story: US1 (5), US2 (5), US3 (5), US4 (6), US5 (4)
- Parallel opportunities: Marked with [P] across Setup, Foundational, and tests within each story
- Independent test criteria: Stated at the top of each user story section
- MVP scope: US1 + US2 + US3
- Format validation: All tasks follow `- [ ] T### [P?] [US?] Description with file path`

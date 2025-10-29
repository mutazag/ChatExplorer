---

description: "Tasks for Visual Themes – Role Icon Tooltips (US6)"
---

# Tasks: Visual Themes – Role Icon Tooltips (US6)

**Input**: Design documents from `/specs/005-visual-themes-tooltips-plan/`
**Prerequisites**: plan.md (required), spec.md (focused), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution. Write tests BEFORE implementation.

**Organization**: Tasks are grouped to enable independent implementation and testing of User Story 6.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Verify feature branch and planning artifacts exist for `005-visual-themes-tooltips-plan`
- [ ] T002 Ensure test harness is accessible in-browser under `tests/` (no new deps)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Provide deterministic metadata and utilities required by tooltips.

- [x] T010 [P] Add unit tests for middle-ellipsis utility in `tests/unit/text.truncateMiddle.test.js`
- [ ] T011 [P] Implement `truncateMiddle(str, max=40)` in `src/utils/text.js`
- [x] T012 Add unit tests for normalization meta mapping in `tests/unit/parse.meta.test.js`
- [ ] T013 Implement normalization meta enrichment in `src/data/conversations/parse.js`
  - Populate `message.meta = { nodeId, parentId?, contentType, createdTime, modelSlug? }`
  - `nodeId` from mapping key; `parentId` from mapping[parent].
  - `modelSlug` from `message.metadata.model_slug || message.metadata.default_model_slug` (assistant)

**Checkpoint**: Foundation ready – meta available in UI rendering, utility present and tested

---

## Phase 3: User Story 6 – Role icon tooltip with JSON context (Priority: P2) 🎯 MVP

**Goal**: On hover/focus of role icon, show accessible tooltip with concise JSON context.

**Independent Test**: With one user and one assistant message, hover/focus each role icon and verify tooltip content matches underlying JSON node (role, id, contentType, createdTime; parentId if present; modelSlug for assistant). Tooltip appears within 100ms and hides on blur/Esc.

### Tests for User Story 6 (MANDATORY per constitution)

- [x] T020 [US6] Integration test for tooltip show/hide + content in `tests/integration/tooltip.us6.test.js`
- [x] T021 [P] [US6] Unit test for tooltip summary builder in `tests/unit/tooltip.summary.test.js`

### Implementation for User Story 6

- [ ] T022 [P] [US6] Create tooltip module `src/ui/tooltip.js` (buildSummary, showTooltip, hideTooltip, flip if near edge)
- [ ] T023 [US6] Add tooltip styles (including reduced-motion) in `styles.css`
- [ ] T024 [US6] Update `src/ui/detailView.js` to:
  - Make role icons focusable (tabindex=0)
  - Wire hover/focus handlers to show tooltip via `aria-describedby`
  - Populate tooltip from `message.meta` (include modelSlug for assistant only)
  - Hide on blur/Esc; ensure no overlap with timestamp reveal behavior
- [ ] T025 [P] [US6] Implement middle-ellipsis usage for long values in tooltip (max ~40 chars)
- [ ] T026 [US6] Ensure tooltip placement avoids viewport clipping (flip logic in `tooltip.js`)

**Checkpoint**: User Story 6 is fully functional and independently testable

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Update `/specs/005-visual-themes-tooltips-plan/quickstart.md` with any new test notes
- [ ] T031 Verify reduced-motion preference respected (no excessive animations)
- [ ] T032 Validate ARIA announcements with a screen reader
- [ ] T033 Browser QA: Chrome, Firefox, Safari, Edge (basic smoke for tooltip)
- [ ] T034 Responsive QA: 320px, 768px, 1280px widths – tooltip readable, no horizontal scroll

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies – can start now
- Foundational (Phase 2): Blocks User Story 6
- User Story 6 (Phase 3): Depends on Foundational phase completion
- Polish (Phase 4): Depends on US6 completion

### Within User Story 6

- Tests (T020–T021) MUST be written and FAIL before implementation tasks (T022–T026)
- `src/utils/text.js` must exist before tooltip module uses it

### Parallel Opportunities

- [P] tasks can be executed in parallel when touching different files:
  - T010/T011 (utils + tests)
  - T021/T022 (tooltip unit vs module scaffolding)
  - Styling (T023) can proceed in parallel once structure is agreed

---

## Implementation Strategy

### MVP First (User Story 6 Only)

1. Complete Foundational phase (T010–T013)
2. Write integration + unit tests for tooltip (T020–T021)
3. Implement tooltip module + wire UI (T022–T026)
4. Validate and iterate

### Incremental Delivery

- Deliver US6 independently without changing other stories
- Keep code paths isolated to new meta fields and tooltip module


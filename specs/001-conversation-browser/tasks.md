# Tasks: Conversation Browser

Created: 2025-10-25
Status: Ready

Design docs: `specs/001-conversation-browser/plan.md`, `specs/001-conversation-browser/spec.md`

Notes:
- Tests are MANDATORY per constitution; write tests first for each story.
- Updated to reflect real export model: `conversation_id`, `mapping`, `current_node`, multimodal parts.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature docs present: `specs/001-conversation-browser/plan.md`, `specs/001-conversation-browser/spec.md`
- [ ] T002 [P] Ensure tests harness loads specs via `tests/index.html` (no external runner)
- [ ] T003 [P] Validate repo brand assets referenced in `index.html` (`assets/logo.svg`)

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: Normalize conversations to the real export schema and preserve performance hooks.

- [ ] T004 Add normalization tests for export schema in `tests/conversation-browser/parse.spec.js` (id=`conversation_id`, title fallback, timestamps)
- [ ] T005 [P] Extend tests for mapping→active-path reconstruction using `current_node` and `mapping` in `tests/conversation-browser/parse.spec.js`
- [ ] T006 [P] Extend tests to omit visually hidden system scaffolding; include multimodal image pointer representation (as placeholders)
- [ ] T007 Implement normalization in `src/data/conversations/parse.js`:
	- id ← `conversation_id`
	- title ← `title` || `conversation_id` || first non-system excerpt || "Untitled"
	- timestamps: `update_time` fallback `create_time`
	- messages: reconstruct active path via `current_node` walking `mapping`
	- omit visually hidden system scaffolding; collect text parts and image pointer metadata
- [ ] T008 Verify `normalizeConversationsWithWarnings` counts skipped conversations (missing `conversation_id` or irrecoverable mapping)

Checkpoint: Normalization green on tests; ready for story work.

---

## Phase 3: User Story 1 - List Conversations (Priority: P1) 🎯 MVP

Goal: Show conversations in the left pane sorted newest→oldest by `update_time` fallback `create_time`; paginate 25/page; title fallback enforced.

Independent Test: With a sample dataset using `conversation_id` and titles, verify left list shows 25 items, sorted, with correct fallbacks.

### Tests (write first)

- [ ] T009 [P] [US1] Unit: sort by `update_time`→`create_time` and paginate 25 in `tests/conversation-browser/sortPaginate.spec.js`
- [ ] T010 [P] [US1] Unit: title fallback order (`title` → `conversation_id` → first non‑system excerpt → "Untitled") in `tests/conversation-browser/listView.spec.js`
- [ ] T011 [P] [US1] Integration: list renders 25/page and selection highlight in `tests/conversation-browser/integration.spec.js`

### Implementation

- [ ] T012 [P] [US1] Ensure `src/core/sortPaginate.js` uses normalized timestamps and remains stable for missing times
- [ ] T013 [P] [US1] Update `src/ui/listView.js` to rely on new normalized shape (no dependency on raw `mapping`), enforce title fallback
- [ ] T014 [US1] Wire state in `src/state/appState.js` (page/selection unchanged) and verify list updates without reload
- [ ] T015 [US1] Confirm `src/ui/badges/statusChip.js` reflects warnings (`loaded/total/skipped`)
- [ ] T016 [US1] Verify tests pass for US1

Checkpoint: US1 independently usable and demonstrable.

---

## Phase 4: User Story 2 - View Conversation Detail (Priority: P2)

Goal: Clicking a list item shows its chronological message thread along the active path; hide system scaffolding; render multimodal placeholders.

Independent Test: Selecting a conversation shows user/assistant text in order; visually hidden system content not shown; image pointers represented as chips.

### Tests (write first)

- [ ] T017 [P] [US2] Unit: active-path reconstruction order and role labels in `tests/conversation-browser/detailView.spec.js`
- [ ] T018 [P] [US2] Unit: omit visually hidden system nodes; show multimodal placeholder chips in `tests/conversation-browser/detailView.spec.js`

### Implementation

- [ ] T019 [P] [US2] Update `src/ui/detailView.js` to consume normalized `messages[]` and render roles/timestamps
- [ ] T020 [US2] Implement placeholder UI for images (e.g., <span class="img-chip">Image</span>) with accessible label
- [ ] T021 [US2] Ensure selection updates detail pane without page reload (hash routing retained)
- [ ] T022 [US2] Verify tests pass for US2

Checkpoint: US2 independently usable.

---

## Phase 5: User Story 3 - Robustness and Large Files (Priority: P3)

Goal: Graceful errors; responsive for ≥1000 conversations; surface skipped counts.

Independent Test: Malformed entries don’t crash; status chip shows skipped; paging remains responsive.

### Tests (write first)

- [ ] T023 [P] [US3] Unit: malformed/missing `conversation_id` → skipped with warnings in `tests/conversation-browser/parse.spec.js`
- [ ] T024 [P] [US3] Performance: 1000+ conversations list render ≤1s in `tests/conversation-browser/perf.spec.js`
- [ ] T025 [P] [US3] Integration: error state for missing/malformed `conversations.json` in `tests/conversation-browser/integration.spec.js`

### Implementation

- [ ] T026 [P] [US3] Ensure `src/app.js` error live region surfaces errors without crashing
- [ ] T027 [US3] Confirm pagination controls remain responsive at scale
- [ ] T028 [US3] Verify tests pass for US3

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Documentation: Update data model notes and normalization rules in `specs/001-conversation-browser/spec.md` and `plan.md` (kept in sync)
- [ ] T030 Code cleanup: remove dead code paths related to raw `mapping` usage in UI
- [ ] T031 Accessibility: verify labels, roles, and focus order; ensure aria-live messages are concise
- [ ] T032 [P] Responsive checks at 320/768/1280 widths; adjust styles in `styles.css`

---

## Dependencies & Execution Order

Phase dependencies
- Setup → Foundational → User Stories → Polish
- User stories proceed in priority order (P1 → P2 → P3) or in parallel after Foundational

User story dependencies
- US1 (P1): none beyond Foundational
- US2 (P2): depends on Normalization (Foundational) and US1 list selection wiring
- US3 (P3): depends on Normalization; independent of US2 UI specifics

Within each story
- Write tests first and ensure they fail before implementation
- Implement modules/components; then integration; then validate tests

Parallel opportunities
- [P] tasks in Setup/Foundational can run concurrently
- US1/US2 unit tests can run in parallel; different files
- US2 rendering and US1 list work can proceed in parallel once normalization is done

---

## Implementation Strategy

MVP First (US1 only)
1. Complete Foundational normalization (T004–T008)
2. Complete US1 tests and implementation (T009–T016)
3. Validate list browsing with pagination; demo

Incremental Delivery
1. Add US2 detail rendering (T017–T022)
2. Add US3 robustness/performance (T023–T028)
3. Polish (T029–T032)

---

## Report

Output: `specs/001-conversation-browser/tasks.md`

- Total tasks: 32
- Task count per story: US1=8, US2=6, US3=6; Setup=3; Foundational=5; Polish=4
- Parallel opportunities: Marked [P] in tasks above; especially T005, T006, T009–T013, T017–T020, T023–T026, T032
- Independent test criteria: included per story sections
- MVP scope: Phase 3 (US1) only
- Format validation: All tasks follow `- [ ] T### [P?] [US?] Description with file path`

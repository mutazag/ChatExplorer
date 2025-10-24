---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution. All functions and modules MUST have tests written BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Client-side project**: `src/`, `tests/` at repository root
- Tests organized: `tests/unit/` for pure functions, `tests/integration/` for file loading + UI
- All paths shown below assume client-side structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize HTML entry point and basic CSS
- [ ] T002a Add local MagTech.ai logo to `assets/` and reference in header
- [ ] T003 [P] Configure test runner (Mocha, Jest, or similar)
- [ ] T004 [P] Setup linting (ESLint) if used

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Setup file loading utilities (Browser File API wrapper)
- [ ] T006 [P] Implement error handling framework (graceful failures)
- [ ] T007 [P] Create base UI rendering utilities (DOM helpers)
- [ ] T008 Setup data parsing foundation (JSON validation, HTML extraction)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY per constitution) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit tests for [module/function] in tests/unit/test_[name].js
- [ ] T011 [P] [US1] Integration test for [file loading/UI workflow] in tests/integration/test_[name].js

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Parser/Module] in src/modules/[name].js
- [ ] T013 [P] [US1] Create [Utility] functions in src/utils/[name].js
- [ ] T014 [US1] Implement [UI Component] in src/ui/[component].js (depends on T012, T013)
- [ ] T015 [US1] Wire up [feature] in index.html
- [ ] T016 [US1] Add error handling for edge cases
- [ ] T017 [US1] Verify all tests pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY per constitution) ⚠️

- [ ] T018 [P] [US2] Unit tests for [module/function] in tests/unit/test_[name].js
- [ ] T019 [P] [US2] Integration test for [file loading/UI workflow] in tests/integration/test_[name].js

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Parser/Module] in src/modules/[name].js
- [ ] T021 [US2] Implement [Utility] functions in src/utils/[name].js
- [ ] T022 [US2] Implement [UI Component] in src/ui/[component].js
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY per constitution) ⚠️

- [ ] T024 [P] [US3] Unit tests for [module/function] in tests/unit/test_[name].js
- [ ] T025 [P] [US3] Integration test for [file loading/UI workflow] in tests/integration/test_[name].js

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Parser/Module] in src/modules/[name].js
- [ ] T027 [US3] Implement [Utility] functions in src/utils/[name].js
- [ ] T028 [US3] Implement [UI Component] in src/ui/[component].js

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional edge case tests in tests/unit/ and tests/integration/
- [ ] TXXX Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- [ ] TXXX Responsive layout validation at 320px, 768px, 1280px widths
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for [module] in tests/unit/test_[name].js"
Task: "Integration test for [workflow] in tests/integration/test_[name].js"

# Launch all modules for User Story 1 together:
Task: "Create [Parser] in src/modules/[name].js"
Task: "Create [Utility] in src/utils/[name].js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

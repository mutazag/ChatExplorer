---

description: "Task list for CD Build Artifacts feature"
---

# Tasks: CD Build Artifacts

**Input**: Design documents from `/specs/001-cd-build-artifacts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: For this CD feature, no runtime code is changed. We will enforce validation via the workflow steps and manifest checks rather than unit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: US1/US2/US3 mapping to spec.md
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize CI/CD scaffolding and repository plumbing for artifact creation

- [x] T001 Create CD workflow skeleton at .github/workflows/cd-build-artifacts.yml
- [x] T002 Add scripts directory for CD utilities at scripts/cd/ (empty placeholder .gitkeep)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tooling and configs required across all user stories

- [x] T003 [P] Add allowlist/denylist configuration at scripts/cd/filters.json
- [x] T004 [P] Implement artifact packager at scripts/cd/build-artifacts.mjs
- [x] T005 [P] Implement manifest schema and validator at scripts/cd/validate-manifest.mjs
- [x] T006 Wire foundational steps into .github/workflows/cd-build-artifacts.yml (checkout, setup node, run packager, upload)

**Checkpoint**: Foundation ready — workflow can package a minimal artifact locally

---

## Phase 3: User Story 1 — Produce build artifact (Priority: P1) 🎯 MVP

**Goal**: Create a retained build artifact including runtime code and the data/ directory structure, excluding specs/test artifacts.

**Independent Test**: Trigger workflow on a commit; ensure one artifact is uploaded with required paths and no prohibited files.

### Implementation

- [x] T007 [P] [US1] In scripts/cd/build-artifacts.mjs: include index.html, styles.css, assets/**, src/**
- [x] T008 [P] [US1] In scripts/cd/build-artifacts.mjs: replicate data/ directory tree without content files
- [x] T009 [US1] In .github/workflows/cd-build-artifacts.yml: upload artifact with name build-artifacts-${{ github.sha }} and retention-days: 90
- [x] T010 [US1] Write manifest.json alongside artifact output (scripts/cd/build-artifacts.mjs)

**Checkpoint**: US1 artifact produced and retained; manifest present

---

## Phase 4: User Story 2 — Retain and retrieve artifact (Priority: P2)

**Goal**: Ensure artifacts are easily discoverable and retrievable with metadata (commit, timestamp, name).

**Independent Test**: List recent artifacts and download the named artifact; manifest metadata matches commit.

### Implementation

- [x] T011 [P] [US2] Add metadata fields (commit, createdAt, name) into manifest.json (scripts/cd/build-artifacts.mjs)
- [x] T012 [US2] Add job summary step to print artifact name, manifest stats, and direct download hint in .github/workflows/cd-build-artifacts.yml

**Checkpoint**: US2 discoverability proven via job summary; retrieval confirmed via Actions UI

---

## Phase 5: User Story 3 — Exclusion guarantees (Priority: P3)

**Goal**: Enforce exclusion rules and fail the build with clear reporting if prohibited files are detected.

**Independent Test**: Introduce a prohibited test file and verify workflow fails with a report listing violations.

### Implementation

- [x] T013 [P] [US3] In scripts/cd/filters.json: define deny patterns (specs/**, tests/**, .specify/**, **/*.test.*)
- [x] T014 [P] [US3] In scripts/cd/validate-manifest.mjs: assert zero prohibited paths; print violations and exit 1 on failure
- [x] T015 [US3] In .github/workflows/cd-build-artifacts.yml: add validation step after packaging to run validator against manifest.json

**Checkpoint**: US3 validation working; builds fail safely on violations

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Update specs/001-cd-build-artifacts/quickstart.md with workflow usage and retrieval notes
- [ ] T017 [P] Add README badge for CD workflow in README.md
- [ ] T018 Add optional step to publish a GitHub Release (commented) in .github/workflows/cd-build-artifacts.yml
 - [x] T016 [P] Update specs/001-cd-build-artifacts/quickstart.md with workflow usage and retrieval notes
 - [x] T017 [P] Add README badge for CD workflow in README.md
 - [x] T018 Add optional step to publish a GitHub Release (commented) in .github/workflows/cd-build-artifacts.yml

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → US1 (MVP) → US2 → US3 → Polish

### User Story Dependencies

- US1 has no dependencies beyond Foundational
- US2 depends on US1 (uses generated artifact/manifest)
- US3 depends on Foundational (validator) and integrates into workflow after packaging

### Parallel Opportunities

- T003–T005 can proceed in parallel (separate files)
- US1 tasks T007 and T008 can proceed in parallel (different code paths in the same script if coordinated)
- Polish tasks T016–T017 can proceed in parallel

---

## Implementation Strategy

### MVP First (US1 Only)
1. Complete Setup (T001–T002)
2. Complete Foundational (T003–T006)
3. Implement US1 (T007–T010)
4. Validate artifact presence and contents

### Incremental Delivery
- Add US2 discoverability (T011–T012)
- Add US3 validation/fail-fast (T013–T015)
- Polish (T016–T018)

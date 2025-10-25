---

description: "Executable task list for Inline multimodal content feature"
---

# Tasks: Inline display of multimodal message content

**Input**: Design documents from `/specs/001-multimodal-inline/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution. Write tests FIRST for every function/module.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal prep and styling hooks required by multiple stories

- [x] T001 Add base CSS rules for inline media (max-width, max-heights) in `styles.css`
- [x] T002 [P] Ensure tests runner page references current scripts; add placeholder section for media tests in `tests/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities reused across stories; MUST complete before user stories

- [x] T003 Create media type classifier `classifyMedia(url, mime)` in `src/utils/media.js`
- [x] T004 [P] Unit tests for media classifier in `tests/conversation-browser/media.spec.js`
- [x] T005 Add render helpers `renderMediaItem(item, role)` in `src/ui/detailView.js` (scaffold only; no behavior yet)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 2b: Asset Pointer Resolution (Blocking for media)

**Purpose**: Resolve export `asset_pointer` values to local file URLs via prefix matching under the selected export folder.

- [x] T041 Build asset index from selected folder files (prefix → full path) in `src/data/conversations/parse.js` or a new `src/utils/assetIndex.js`
- [x] T042 [P] Implement pointer resolution rules: `file-service://file-<ID>`, `sediment://file_<ID>`, conversation-scoped `audio/` and `video/`, and `user-*` for generated images; include `real_time_user_audio_video_asset_pointer` composite (video container + audio)
- [x] T043 [P] Unit tests for pointer resolution with synthetic file lists in `tests/conversation-browser/parse.spec.js`
- [x] T044 Integrate resolver into normalization to populate `media[].url`, `media[].pointer`, and `source: 'resolved'`
- [x] T045 [P] Integration test: media in sample export resolves to actual file paths (image/audio/video) in `tests/conversation-browser/integration.spec.js`
- [ ] T046 Deterministic selection when multiple matches (shortest basename, then lexicographic)
- [x] T047 [P] Unit tests: cover `sediment://file_<ID>` underscore variant and `user-*` generated images mapping in `tests/conversation-browser/parse.spec.js`
- [x] T048 [P] Unit tests: deterministic selection behavior with 2+ matching files in `tests/conversation-browser/parse.spec.js`

---

## Phase 3: User Story 1 — View images inline (Priority: P1) 🎯 MVP

**Goal**: When a message contains images, display them inline under the message text with proper alt text and sizing.

**Independent Test**: With a conversation containing image items, verify `<img>` elements render inline after the Markdown body; multiple images render in order with constraints.

### Tests (MANDATORY — write first)

- [ ] T006 [P] [US1] Parser test: extract image media to `message.media[]` in `tests/conversation-browser/parse.spec.js`
- [ ] T007 [P] [US1] Detail view test: render one and multiple images inline with alt fallback in `tests/conversation-browser/detailView.spec.js`
- [x] T008 [P] [US1] Integration test: image load error shows fallback message in `tests/conversation-browser/integration.spec.js`
- [x] T049 [P] [US1] Parser test: generated image under `user-*` folder resolves into `message.media[]` in `tests/conversation-browser/parse.spec.js`

### Implementation

- [x] T009 [US1] Extend normalizer to populate `media[]` for images in `src/data/conversations/parse.js`
- [x] T010 [US1] Implement image rendering in `src/ui/detailView.js` (append `<img>` after Markdown body)
- [x] T011 [US1] Add CSS rules for image grid/stack (gap, wrap) in `styles.css`
- [ ] T012 [US1] Verify tests pass locally via `tests/index.html`

**Checkpoint**: US1 independently delivers inline images as MVP

---

## Phase 4: User Story 2 — Play audio and video inline (Priority: P1)

**Goal**: When messages contain audio or video, render native players inline with controls and sensible sizing.

**Independent Test**: With conversations containing audio and video, verify `<audio controls>` and `<video controls>` appear and function; unsupported types fall back to download links.

### Tests (MANDATORY — write first)

- [x] T013 [P] [US2] Parser test: extract audio/video items to `media[]` in `tests/conversation-browser/parse.spec.js`
- [x] T014 [P] [US2] Detail view test: render `<audio controls>` and `<video controls>` with aria-labels in `tests/conversation-browser/detailView.spec.js`
- [x] T015 [P] [US2] Integration test: unsupported media becomes labeled download link in `tests/conversation-browser/integration.spec.js`
- [x] T050 [P] [US2] Parser tests: `audio_transcription` → `<conversation_id>/audio/` and `video_container_asset_pointer` → `<conversation_id>/video/` in `tests/conversation-browser/parse.spec.js`
- [x] T051 [P] [US2] Integration test: `real_time_user_audio_video_asset_pointer` resolves both audio and video URLs in `tests/conversation-browser/integration.spec.js`

### Implementation

- [ ] T016 [US2] Extend normalizer to classify audio/video via `classifyMedia` in `src/data/conversations/parse.js`
- [x] T017 [US2] Implement audio/video rendering (controls, sizing, aria-label) in `src/ui/detailView.js`
- [x] T018 [US2] Add CSS rules for video sizing in `styles.css`
- [ ] T019 [US2] Verify tests pass locally via `tests/index.html`
- [x] T052 [US2] Ensure audio/video aria-label strings include media type and message role in `src/ui/detailView.js`

**Checkpoint**: US2 independently delivers inline audio/video playback

---

## Phase 5: User Story 3 — Accessibility and safety (Priority: P2)

**Goal**: Media is accessible (alt labels, aria) and safe (no executable content or unsafe attributes); failures show clear fallbacks.

**Independent Test**: DOM inspection confirms alt/aria present, no scriptable attributes; failure states visible when media can’t load.

### Tests (MANDATORY — write first)

- [ ] T020 [P] [US3] Detail view test: alt defaults from filename; aria-labels on audio/video in `tests/conversation-browser/detailView.spec.js`
- [ ] T021 [P] [US3] Security test: ensure no `on*` attributes, no `<script>` via render path in `tests/conversation-browser/detailView.spec.js`
- [ ] T022 [P] [US3] Integration test: 404 load triggers visible fallback text near media in `tests/conversation-browser/integration.spec.js`
- [x] T053 [P] [US3] Security test: blocked schemes (javascript:, blob:) never render; allowed data:image/audio/video OK in `tests/conversation-browser/detailView.spec.js`

### Implementation

- [x] T023 [US3] Enforce alt defaulting and aria-labels in `src/ui/detailView.js`
- [x] T024 [US3] Strip unsafe attributes when rendering media (align with sanitizer approach) in `src/ui/detailView.js`
- [x] T025 [US3] Attach onerror handlers to show fallback message in `src/ui/detailView.js`
- [ ] T026 [US3] Verify tests pass locally via `tests/index.html`
- [x] T054 [US3] Enforce allowed URL scheme policy per FR-017 in `src/utils/media.js` and document with inline comments

**Checkpoint**: US3 completes accessibility and safety guarantees

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finishing touches, performance, docs

- [ ] T027 [P] Documentation updates for feature behavior in `specs/001-multimodal-inline/quickstart.md`
- [ ] T028 Code cleanup and small refactors across `src/ui/detailView.js` and `src/utils/media.js`
- [ ] T029 [P] Additional edge case tests (multiple mixed media types) in `tests/conversation-browser/integration.spec.js`
- [ ] T030 Browser compatibility pass (Chrome/Edge latest on Windows)
- [ ] T031 Responsive layout validation at 320px, 768px, 1280px
- [x] T055 Cross-reference FR-017 and SC-005 in docs (`spec.md`, `quickstart.md`, checklists) and mark as release gates

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks user stories
- User Stories (Phase 3+): Depend on Foundational; can proceed independently in priority order
- Polish (Phase 6): After desired user stories complete

### User Story Dependencies

- US1 (Images): After Foundational
- US2 (Audio/Video): After Foundational (independent of US1; shares utilities)
- US3 (A11y/Safety): After Foundational; can run in parallel but typically follows US1/US2 for coverage

### Parallel Opportunities

- [P] tasks in Setup and Foundational can run concurrently
- Within each User Story, [P] tests can be authored in parallel
- US1 and US2 can be developed in parallel by different contributors once Foundational is complete

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1: inline images)
3. Stop and validate US1 independently

### Incremental Delivery

1. Add US2 (audio/video) and validate independently
2. Add US3 (a11y/safety) and validate independently
3. Polish and cross-cutting improvements

---

## Summary & Validation

- Total tasks: 31
- Tasks per user story: US1 (7), US2 (7), US3 (7)
- Parallel opportunities: Marked with [P] across Setup, Foundational, and tests within each story
- Independent test criteria: Stated at the top of each user story section
- MVP scope: User Story 1 (images inline)
- Format validation: All tasks follow `- [ ] T### [P?] [US?] Description with file path`

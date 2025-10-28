# tasks.md — Implementation tasks for 001-markdown-messages

**Feature**: Markdown Messages — auto-linking and safe Markdown rendering  
**Branch**: `001-markdown-messages`  
**Created**: 2025-10-28

Summary: Implement a conservative auto-linker for http(s) URLs, preserve authored Markdown links, integrate with the existing Markdown -> sanitizer pipeline, add accessibility attributes for code blocks, and provide unit/integration tests.

Total tasks: 13

## Phase 1 — Setup

- [ ] T001 [P] Create helper module for auto-linking: implement skeleton `autolinkText(text)` in `src/utils/links.js`
- [ ] T002 [P] Add unit test scaffold for autolinker: `tests/unit/test_links.js` (tests: basic http/https linking, no double-wrap of markdown links)
- [ ] T003 [P] Add integration test harness page for markdown rendering: `tests/integration/markdown_render.html` (load sample messages and assert anchors and code blocks)
- [ ] T004 Integrate autolinker into Markdown pipeline: update `src/utils/markdown.js` to call `autolinkText` at the correct stage and ensure output flows to sanitizer (`renderMarkdownToSafeHtml`)

## Phase 2 — Foundational (blocking)

- [ ] T005 Update sanitizer rules to allow safe anchors and block unsafe schemes: `src/utils/sanitizer.js` (ensure `rel`, `target` attributes enforced and `javascript:`/`vbscript:`/`data:` for non-media are blocked)
- [ ] T006 Implement URL normalization & truncation helper in `src/utils/links.js` (ensure long URLs get `title`/`aria-label` while visual text can truncate)

## Phase 3 — User Story 1 (P1): Readable rich text in detail

- [ ] T007 [US1] Implement Markdown auto-linking logic for http(s) in `src/utils/links.js` (respect existing Markdown links; skip code spans/blocks)
- [ ] T008 [US1] Ensure code blocks preserve whitespace and include `aria-label="code block"`: update `src/utils/markdown.js` or rendering wrapper to add the attribute for `<pre>` blocks
- [ ] T009 [US1] Wire rendering calls in UI: verify `src/ui/detailView.js` uses `renderMarkdownToSafeHtml` and that rendered HTML is injected only after sanitization (update if necessary)

## Phase 4 — User Story 2 (P1): Safe links and sanitization

- [ ] T010 [US2] Create unit tests for unsafe input scenarios: `tests/unit/test_links_safety.js` (tests: `javascript:` link not auto-linked, `<script>` stripped, mailto/# fragment allowed)
- [ ] T011 [US2] Add integration security validation: `tests/integration/validate_sanitizer.js` (render fixtures and assert no script tags, unsafe hrefs, or event attributes remain)

## Phase 5 — User Story 3 (P2): Plain text fallback and accessibility

- [ ] T012 [US3] Implement fallback for malformed Markdown: update `src/utils/markdown.js` to escape and wrap fallback text in `<p>` and add tests in `tests/unit/test_markdown_fallback.js`
- [ ] T013 Polish & Docs: Update `specs/001-markdown-messages/quickstart.md` with commands to run the new tests and validate rendering locally

## Dependencies & Order

1. Phase 1 tasks (T001–T004) are required before Phase 2 and Phase 3 tasks that integrate the autolinker.
2. T005 (sanitizer) must be completed before final integration (T009, T011).
3. Testing tasks (T002, T003, T010, T011, T012) can be developed in parallel with implementation where they don't rely on completed APIs (mark `[P]` where safe).

## Parallel execution examples

- Example A: T001 (implement `links.js`) and T005 (update sanitizer) can be worked on in parallel by two engineers because they touch separate modules; tests T002/T010 can be authored in parallel.
- Example B: T003 (integration harness) and T008 (code block ARIA) are independent and can run in parallel.

## Independent test criteria (per story)

- US1 (T007–T009): Given sample markdown with headings, lists, inline code, fenced code blocks and plain URLs, the page renders `<h1>...`, `<ul>`, `<code>`, `<pre>` and anchors for http(s) URLs. Anchors open in a new tab when clicked.
- US2 (T010–T011): Given payloads containing `<script>`, `javascript:` hrefs, and inline event attributes, none of these appear or execute in the DOM after rendering; http(s)/mailto/# links remain functional.
- US3 (T012): Given malformed markdown or plain text, content appears as paragraphs; code blocks include `aria-label="code block"`.

## MVP suggestion

- Implement the minimal pipeline to satisfy US1 and US2 (T001–T009 and T010). US3 can be delivered immediately after (T012).

## File map for implementers

- `src/utils/links.js` — new helper for auto-linking and URL helpers
- `src/utils/markdown.js` — existing markdown rendering wrapper to update
- `src/utils/sanitizer.js` — existing sanitizer to update rules
- `src/ui/detailView.js` — integration verification (ensures sanitized HTML only)
- `tests/unit/*.js` and `tests/integration/*.js|.html` — test harness files
- `specs/001-markdown-messages/*` — docs & quickstart updates

## Format validation

- All tasks above follow the required checklist format including TaskID, optional [P], and for story tasks the [US#] label and file path references.
---

description: "Executable task list for Markdown message rendering"
---

# Tasks: Conversation detail renders Markdown messages

**Input**: Design documents from `/specs/001-markdown-messages/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution. Write tests FIRST for every function/module.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal prep required by multiple stories

- [x] T001 Ensure test harness loads current UI and utils in `tests/index.html`
- [x] T002 [P] Add basic styles for Markdown content blocks in `styles.css` (headings spacing, list indentation, code block wrapping)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core renderer/sanitizer utilities; MUST complete before user stories

- [x] T003 Create Markdown utility module `renderMarkdownToSafeHtml(text)` in `src/utils/markdown.js`
- [x] T004 [P] Unit tests for Markdown utility (inline code, bold/italic, lists, headings) in `tests/conversation-browser/markdown.spec.js`
- [x] T005 [P] Wire detail renderer to accept HTML safely (scaffold) in `src/ui/detailView.js`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Readable rich text in detail (Priority: P1) 🎯 MVP

**Goal**: Display basic Markdown (headings, lists, bold/italic, code blocks, links) so content is readable and structured.

**Independent Test**: With a message containing Markdown, verify `<strong>`, `<em>`, `<pre><code>`, `<ul>/<ol>`, and `<a>` elements render appropriately.

### Tests (MANDATORY — write first)

- [x] T006 [P] [US1] Detail view test: renders heading/bold/code/list/link in `tests/conversation-browser/detailView.spec.js`
- [x] T007 [P] [US1] Unit: fenced code block preserves whitespace in `tests/conversation-browser/markdown.spec.js`

### Implementation

- [x] T008 [US1] Implement headings/lists/inline code/bold/italic parsing in `src/utils/markdown.js`
- [x] T009 [US1] Implement fenced code block rendering `<pre><code>` in `src/utils/markdown.js`
- [x] T010 [US1] Render Markdown HTML in detail view after role label in `src/ui/detailView.js`
 - [x] T011 [US1] Verify tests pass locally via `tests/index.html`

**Checkpoint**: US1 independently delivers readable Markdown

---

## Phase 4: User Story 2 — Safe links and sanitization (Priority: P1)

**Goal**: Links work safely; app must not execute untrusted HTML or scripts.

**Independent Test**: Content with `<script>` and `javascript:` URLs does not create executable DOM; http(s) links open safely new-tab with rel set.

### Tests (MANDATORY — write first)

- [x] T012 [P] [US2] Detail view test: strip `<script>`, block `javascript:` links in `tests/conversation-browser/detailView.spec.js`
- [x] T013 [P] [US2] Unit: sanitizer allowlist and attribute stripping in `tests/conversation-browser/markdown.spec.js`

### Implementation

- [x] T014 [US2] Add allowlist sanitizer (P, BR, STRONG, EM, CODE, PRE, UL, OL, LI, A, H1–H6) in `src/utils/markdown.js`
- [x] T015 [US2] Link normalization: only http(s), mailto, #; set target and rel in `src/utils/markdown.js`
- [x] T016 [US2] Ensure detail view uses sanitized HTML only in `src/ui/detailView.js`
 - [x] T017 [US2] Verify tests pass locally via `tests/index.html`

**Checkpoint**: US2 independently guarantees safety of rendered content

---

## Phase 5: User Story 3 — Plain text fallback and accessibility (Priority: P2)

**Goal**: Plain text or malformed Markdown still renders as readable paragraphs; code blocks announced accessibly.

**Independent Test**: Plain text appears as paragraphs; `<pre>` has aria-label="code block".

### Tests (MANDATORY — write first)

- [x] T018 [P] [US3] Detail view test: plain text paragraphs and code block aria-label in `tests/conversation-browser/detailView.spec.js`
- [x] T019 [P] [US3] Unit: fallback to escaped paragraphs when parsing fails in `tests/conversation-browser/markdown.spec.js`

### Implementation

- [x] T020 [US3] Add paragraph grouping and line-break handling in `src/utils/markdown.js`
- [x] T021 [US3] Add aria-label="code block" to `<pre>` in `src/utils/markdown.js`
- [x] T022 [US3] Ensure empty/null text renders no body content in `src/ui/detailView.js`
 - [x] T023 [US3] Verify tests pass locally via `tests/index.html`

**Checkpoint**: US3 completes fallback and a11y behavior

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finishing touches, performance, docs

- [x] T024 [P] Add ordered list edge-case tests (multi-digit numbering) in `tests/conversation-browser/markdown.spec.js`
- [ ] T025 Performance spot-check: large Markdown render <16ms per message (document results) in `specs/001-markdown-messages/quickstart.md`
- [x] T026 [P] Documentation updates in `specs/001-markdown-messages/quickstart.md`
- [ ] T027 Code cleanup and small refactors across `src/utils/markdown.js` and `src/ui/detailView.js`
 - [x] T028 [P] Add GFM pipe table support (parser + sanitizer tags) with tests in `tests/conversation-browser/markdown.spec.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks user stories
- User Stories (Phase 3+): Depend on Foundational; can proceed independently in priority order
- Polish (Phase 6): After desired user stories complete

### User Story Dependencies

- US1 (Markdown rendering): After Foundational
- US2 (Sanitization): After Foundational; independent of US1 but typically follows
- US3 (Fallback & a11y): After Foundational; independent; can run in parallel

### Parallel Opportunities

- [P] tasks in Setup and Foundational can run concurrently
- Within each User Story, [P] tests can be authored in parallel
- US2 and US3 can proceed in parallel after Foundational (different concerns)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1: Markdown rendering)
3. Stop and validate US1 independently

### Incremental Delivery

1. Add US2 (sanitization) and validate independently

2. Add US3 (fallback & a11y) and validate independently

3. Polish and cross-cutting improvements

---

## Summary & Validation

- Total tasks: 27
- Tasks per user story: US1 (6), US2 (6), US3 (6)
- Parallel opportunities: Marked with [P] across Setup, Foundational, and tests within each story
- Independent test criteria: Stated at the top of each user story section
- MVP scope: User Story 1 (basic Markdown rendering)
- Format validation: All tasks follow `- [ ] T### [P?] [US?] Description with file path`

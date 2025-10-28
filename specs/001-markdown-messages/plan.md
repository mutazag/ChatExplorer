# Implementation Plan: Markdown Messages

**Branch**: `001-markdown-messages` | **Date**: 2025-10-28 | **Spec**: `spec.md`
**Input**: Feature specification from `/specs/001-markdown-messages/spec.md`

## Summary

Add safe auto-linking for plain `http(s)` URLs in message text while preserving authored Markdown links and preventing unsafe schemes. The feature integrates with the existing Markdown rendering pipeline (`renderMarkdownToSafeHtml`) and the app's sanitizer to produce accessible anchors with `target="_blank"` and safe `rel` attributes.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5  
**Primary Dependencies**: None (vanilla JS). Prefer built-in regex-based auto-linking or a small vendored library if justified.  
**Storage**: No new storage; uses existing in-memory message objects and static `data/` datasets.  
**Testing**: Browser-based unit and integration tests (Mocha or in-browser harness already present in `tests/`).  
**Target Platform**: Modern evergreen browsers (Chrome, Edge, Firefox, Safari).  
**Project Type**: Client-side web application (no backend).  
**Performance Goals**: Message render (including auto-linking) should complete under 200ms on typical hardware for standard-size messages.  
**Constraints**: No new remote dependencies without justification; maintain strict sanitizer integration to avoid XSS.  
**Scale/Scope**: Designed for ChatGPT export-sized messages; no changes to large-batch server processing are required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components.
- [x] **No Database Integration**: Feature reads from local files only, no database connections.
- [x] **Minimal Dependencies**: Feature avoids external frameworks; a small vendored auto-link helper is allowed if justified.
- [x] **Test Coverage**: Tests will be added for auto-linking and sanitization before implementation.
- [x] **File-Based Data**: No additional file formats; uses existing message JSON.
- [x] **Browser Compatibility**: Uses standard Web APIs compatible with modern browsers.
- [x] **UI & Branding**: No UI layout changes that violate the constitution; accessible anchors added per WCAG guidance.

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-markdown-messages/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md (future)
```

### Source Code (locations to change)

```text
src/
├── ui/detailView.js        # integrate auto-linking into rendering pipeline
├── utils/markdown.js       # update renderMarkdownToSafeHtml or wrapper
├── utils/sanitizer.js      # ensure sanitizer allows only safe anchors
└── tests/                  # unit and integration tests
```

**Structure Decision**: Implement feature within `src/utils/markdown.js` with small helper in `src/utils/links.js` and add tests under `tests/unit/` and `tests/integration/`.

## Complexity Tracking

No constitution violations detected; no additional complexity table required.

## Phase 0 (Research) deliverables

- `research.md`: confirm auto-link approach (regex vs small vendored lib), sanitizer integration pattern, and accessibility handling for truncation and aria-labels.

## Phase 1 (Design) deliverables

- `data-model.md`: document message entity and renderedHtml expectations.
- `quickstart.md`: developer steps to run tests and verify behavior locally.
- `contracts/`: not applicable for client-only feature; create README noting no external APIs.

## Acceptance gates (pre-implementation)

1. `research.md` completed and reviewed.
2. Unit tests defined for auto-linking behavior in `tests/unit/`.
3. Integration test created that renders a sample conversation and asserts anchors and rel/target attributes.


# Implementation Plan: Conversation detail renders Markdown messages

**Branch**: `001-markdown-messages` | **Date**: 2025-10-25 | **Spec**: specs/001-markdown-messages/spec.md
**Input**: Feature specification from `/specs/001-markdown-messages/spec.md`

**Note**: This plan follows the `/speckit.plan` workflow using the plan template.

## Summary

Render message content as sanitized Markdown in the conversation detail pane. Support a safe subset (headings, lists, bold/italic, inline and fenced code, links, paragraphs). Sanitize output via an allowlist and normalize links to http(s)/mailto/# with target="_blank" and rel="noopener noreferrer nofollow". Provide plain-text fallback and a11y (aria-label on <pre>). Fully client-side, no external dependencies.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: None (vanilla). Tests: in-browser harness under `tests/`.  
**Storage**: Local JSON exports; no persistence; static assets only.  
**Testing**: In-browser tests (unit + integration) under `tests/conversation-browser/`.  
**Target Platform**: Modern evergreen browsers (Chrome/Edge latest on Windows).  
**Project Type**: Client-side web app; DOM components in `src/ui`.  
**Performance Goals**: Render typical messages in <16ms; linear-time parsing; zero external network calls.  
**Constraints**: No backend, no external libs, no CDNs; offline-capable; a11y basics (WCAG AA).  
**Scale/Scope**: All conversations; content length can vary; subset of Markdown only (no embedded HTML).

Unknowns: None — scope and security rules are fully specified in spec; no clarifications required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Uses ONLY HTML + vanilla JavaScript, no backend/server components.
- [x] **No Database Integration**: Reads from local files only, no database connections.
- [x] **Minimal Dependencies**: Avoids frameworks/libraries; uses in-house utilities only.
- [x] **Test Coverage**: Tests are or will be written BEFORE/ALONGSIDE implementation; mandatory.
- [x] **File-Based Data**: Uses static files; format documented in spec and tests.
- [x] **Browser Compatibility**: Uses standard Web APIs compatible with modern browsers.
- [x] **UI & Branding**: Respects responsive constraints; branding remains in header.

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Client-side web application (DEFAULT for this project)
src/
├── utils/            # Utility functions (markdown, time)
├── data/             # Data parsing/normalization
└── ui/               # UI components (list/detail)

tests/
└── conversation-browser/  # Unit + integration tests for browser UI and parsing

index.html            # Main entry point
styles.css            # Styling
data/                 # Sample/test data files
```

**Structure Decision**: Client-side application with modular JavaScript organization.
All code runs in browser; no backend services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

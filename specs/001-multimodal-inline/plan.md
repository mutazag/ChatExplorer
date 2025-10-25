# Implementation Plan: Inline display of multimodal message content

**Branch**: `001-multimodal-inline` | **Date**: 2025-10-25 | **Spec**: specs/001-multimodal-inline/spec.md
**Input**: Feature specification from `/specs/001-multimodal-inline/spec.md`

**Note**: This plan follows the `.github/prompts/speckit.plan.prompt.md` workflow and is backed by the repository constitution in `.specify/memory/constitution.md`.

## Summary

Primary requirement: Render multimodal message content (images, audio, video) inline in the Conversation Browser, immediately after the message text, with accessibility and safety guarantees.

Technical approach: Vanilla JS + DOM rendering with a minimal Markdown renderer and allowlist sanitizer; media utilities for type classification and safe-src enforcement; an asset index that resolves ChatGPT export asset pointers (file-service, sediment, conversation-scoped audio/video, user-* generated images) to local relative URLs using deterministic prefix matching; UI components render <img>, <audio>, and <video> with sizing, aria labels, and explicit error fallbacks. URL schemes policy restricts media to http(s), protocol-relative, relative, and data:image/audio/video; disallows blob: and javascript:.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: None (vanilla). Tests run in-browser via the existing harness in `tests/`.  
**Storage**: Local JSON exports; static assets only; files loaded via relative paths or File API selection.  
**Testing**: In-browser harness under `tests/` (unit + integration specs for parse, media utils, detail view, integration).  
**Target Platform**: Modern evergreen browsers (Edge/Chrome latest on Windows).  
**Project Type**: Client-side web application; all logic executes in-browser; no backend.  
**Performance Goals**: Smooth UI; deterministic parsing; media rendering without jank; no console errors; pointer resolution in O(n) over file list with prefix matching.  
**Constraints**: No build step; offline-capable; no external API calls; strict allowlisted URL schemes for media; accessibility fallbacks required.  
**Scale/Scope**: Support typical ChatGPT exports (thousands of messages; hundreds of media files) under a single selected folder.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components.
- [x] **No Database Integration**: Feature reads from local files only, no database connections.
- [x] **Minimal Dependencies**: Feature avoids frameworks/libraries; tests are plain in-browser harness.
- [x] **Test Coverage**: All functions and modules have tests; new logic added with tests first where practical.
- [x] **File-Based Data**: Feature reads from static files (JSON/HTML) with documented format in `data-model.md`.
- [x] **Browser Compatibility**: Feature uses standard Web APIs compatible with modern browsers.
- [x] **UI & Branding**: UI is responsive and includes the local MagTech.ai logo under `assets/logo.svg`.

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-multimodal-inline/
├── plan.md              # This file
├── research.md          # Phase 0 research decisions (pointer resolution, schemes)
├── data-model.md        # Media entities, normalization outputs
├── quickstart.md        # How to select export folder and see media inline
├── checklists/
│   ├── requirements.md
│   └── requirements-quality.md
└── contracts/
    └── openapi.yaml
```

### Source Code (repository root)

```text
src/
├── app.js
├── core/
│   └── sortPaginate.js
├── data/
│   ├── conversations/
│   │   ├── loadConversationsFile.js
│   │   └── parse.js                 # normalization + media + pointer resolution
│   └── files/
│       └── listing.js               # file list normalization
├── ui/
│   ├── listView.js
│   ├── detailView.js                # Markdown + inline media rendering
│   └── badges/
├── utils/
│   ├── media.js                     # classifyMedia, isSafeSrc (FR-017)
│   ├── markdown.js                  # allowlist sanitizer + renderer
│   ├── assetIndex.js                # pointer parsing and resolution helpers
│   └── time.js
└── features/
    └── folder/selectFolder.js

tests/
├── index.html                       # in-browser harness
└── conversation-browser/
    ├── parse.spec.js
    ├── media.spec.js
    ├── detailView.spec.js
    ├── integration.spec.js
    └── perf.spec.js

index.html
styles.css
assets/
└── logo.svg
```

**Structure Decision**: Client-side application with modular JavaScript organization. All code runs in the browser; no backend services.

## Complexity Tracking

No violations. This feature adheres to the constitution (vanilla JS, client-only, locally stored assets, test-first, responsive UI with local logo).

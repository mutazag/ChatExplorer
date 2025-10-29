# Implementation Plan: Fix Mobile Folder Selector Visibility

**Branch**: `001-fix-mobile-folder-selector` | **Date**: 2025-10-30 | **Spec**: specs/001-fix-mobile-folder-selector/spec.md
**Input**: Feature specification from `/specs/001-fix-mobile-folder-selector/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Ensure the data set selection control is visible and usable on mobile viewports (320–768px), enabling users to choose and switch data sets without leaving mobile view. Technical approach (from research): expose a clearly visible mobile entry point (toolbar button or overflow menu item) gated by CSS media queries, ensure accessible labeling and touch target sizing, and route selection to existing in-browser data selection logic without page reloads.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (ES6+), HTML5, CSS3 (vanilla)
**Primary Dependencies**: None for runtime; in-browser test harness under `tests/`
**Storage**: Local static files (JSON/HTML) via Browser File API and relative paths
**Testing**: In-browser harness under `tests/` (unit + integration), no external runners required
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Client-side web application; all logic runs in the browser
**Performance Goals**: Smooth UI at mobile sizes; control discovery and selection ≤ 10s; no layout thrash
**Constraints**: No backend, no external APIs, minimal dependencies, offline-capable
**Scale/Scope**: Data sets typical of ChatExplorer samples; long data set names supported without layout breakage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components
- [x] **No Database Integration**: Feature reads from local files only, no database connections
- [x] **Minimal Dependencies**: Feature avoids frameworks/libraries; none added
- [x] **Test Coverage**: Tests will be authored BEFORE implementation for affected modules/UI
- [x] **File-Based Data**: Reads static files (JSON/HTML); formats documented in data-model.md
- [x] **Browser Compatibility**: Uses standard Web APIs (DOM, CSS media queries)
- [x] **UI & Branding**: UI remains responsive (320px–desktop); MagTech.ai logo remains local
- [x] **Source Control & Branching**: Work occurs on `001-fix-mobile-folder-selector`; PR targets `master`; no direct commits to `master`
- [x] **Commit & PR Consent Gate**: Assistant will propose commit/push/PR as next steps only upon approval

**Result**: ✅ PASS

Re-check after Phase 1 design: PASS (no violations introduced by research/design artifacts)

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
├── modules/           # JavaScript modules (feature-specific logic)
├── utils/            # Utility functions (shared helpers)
├── parsers/          # Data parsing (JSON, HTML extraction)
└── ui/               # UI components (DOM manipulation)

tests/
├── unit/             # Unit tests for functions/modules
└── integration/      # Integration tests (file loading, UI workflows)

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

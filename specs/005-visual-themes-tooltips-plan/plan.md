# Implementation Plan: Visual Themes – Role Icon Tooltips

**Branch**: `005-visual-themes-tooltips-plan` | **Date**: 2025-10-29 | **Spec**: `/specs/001-visual-themes/spec.md` (User Story 6)
**Input**: Feature specification from `/specs/001-visual-themes/spec.md` focusing on User Story 6 (tooltips)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement User Story 6: show a tooltip on hover/focus of the role icon with a concise, accessible
summary of the message’s JSON context from `data/newchat/conversations.json`. Enrich the
normalization pipeline with deterministic references (nodeId, parentId, contentType, createdTime,
modelSlug for assistant) and render an ARIA-associated tooltip that truncates long values and
repositions to avoid clipping. Performance target: appear within 100ms; a11y via `aria-describedby`.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (ES6+), HTML5, CSS3 (vanilla)
**Primary Dependencies**: None (vanilla); tests via in-browser harness under `tests/`
**Storage**: Local JSON files, Browser File API, Static HTML
**Testing**: In-browser harness; add unit/integration tests under `tests/`
**Target Platform**: Evergreen browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Client-side web application (no backend)
**Performance Goals**: Tooltip visible within 100ms; hide within 150ms; smooth 60fps UI
**Constraints**: No build step; offline-capable; no external API calls; no frameworks unless justified
**Scale/Scope**: Support existing datasets in repo (e.g., ~16MB conversations.json) and long metadata fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components
- [x] **No Database Integration**: Reads from local files only; no database connections
- [x] **Minimal Dependencies**: No frameworks/libraries added
- [x] **Test Coverage**: Tests will be written BEFORE implementation for new modules
- [x] **File-Based Data**: Reads from static JSON with documented format
- [x] **Browser Compatibility**: Uses standard Web APIs for modern browsers
- [x] **UI & Branding**: UI remains responsive and branded per constitution
- [x] **Source Control & Branching**: All work on `005-visual-themes-tooltips-plan`; PR targets `master`; no direct commits to `master`
- [x] **Commit & PR Consent Gate**: Will propose commit/push/PR as next steps and await explicit developer approval (Principle VIII)

**Result**: ✅ PASS | ⚠️ VIOLATIONS REQUIRE JUSTIFICATION IN COMPLEXITY TABLE

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

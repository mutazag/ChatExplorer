# Implementation Plan: Visual Themes Enhancements

**Branch**: `001-visual-themes` | **Date**: 2025-10-25 | **Spec**: specs/001-visual-themes/spec.md
**Input**: Feature specification from `/specs/001-visual-themes/spec.md`

## Summary

Introduce theme switching (light/dark), a show/hide control for the left pane, mobile-first layout adjustments to prioritize the conversation view, and distinct conversation bubbles by role with icons. Add hover/focus/tap interaction that subtly elevates a bubble and reveals its timestamp. All changes are client-only using vanilla JS and CSS (CSS variables, responsive layout), respecting accessibility (contrast, focus, reduced motion).

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: None (vanilla). Tests: in-browser harness under `tests/`.  
**Storage**: No persistence; session state only (theme, pane visibility in memory).  
**Testing**: In-browser tests (unit + integration) under `tests/`.  
**Target Platform**: Modern evergreen browsers (Chrome/Edge latest on Windows).  
**Project Type**: Client-side web application.  
**Performance Goals**: UI toggles respond in <100ms; animations at 60fps; respect prefers-reduced-motion.  
**Constraints**: No backend; offline-capable; local assets only; WCAG AA basics.  
**Scale/Scope**: UI-only enhancements; no data model or network changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components
- [x] **No Database Integration**: Feature reads from local files only, no database connections
- [x] **Minimal Dependencies**: Feature avoids frameworks/libraries
- [x] **Test Coverage**: Tests will be authored before/alongside implementation
- [x] **File-Based Data**: No new file formats; existing static files remain unchanged
- [x] **Browser Compatibility**: Uses standard Web APIs (DOM/CSS media queries)
- [x] **UI & Branding**: UI remains responsive 320px–desktop and continues to display the local logo asset

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-visual-themes/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── ui/
│   ├── detailView.js        # conversation bubbles (role styling, hover/focus/tap timestamp)
│   └── controls.js          # theme toggle and pane toggle wiring (new)
├── state/
│   └── appState.js          # transient UI state (theme, pane)
└── utils/
    └── dom.js               # small DOM helpers if needed

styles.css                   # theme variables, mobile layout, bubble styles
index.html                   # header controls (toggle buttons)
tests/
└── visual-themes/           # unit + integration tests for toggles and UI behaviors
```

**Structure Decision**: Client-side application with modular JavaScript organization. All code runs in-browser; no backend services.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |

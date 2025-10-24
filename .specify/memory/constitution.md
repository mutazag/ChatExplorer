<!--
Sync Impact Report
==================
Version: 1.0.0 → 1.1.0
Modified Principles: Added new principle VI (UI & Branding)
Added Sections: Principle VI. UI & Branding; Added UI gates to templates
Removed Sections: None
Templates Status:
  ✅ .specify/templates/plan-template.md - updated (added UI & Branding gate)
  ✅ .specify/templates/spec-template.md - reviewed (no change needed)
  ✅ .specify/templates/tasks-template.md - updated (logo + responsive tasks)
Follow-up TODOs: None
-->

# ChatGPT Browser Constitution

## Core Principles

### I. Client-Side Only Architecture

All application logic MUST execute in the browser using vanilla HTML and JavaScript.
MUST NOT use server-side processing, backend services, or external APIs.
MUST NOT integrate with databases; all data MUST be sourced from local files.
Data files MUST be loaded directly into the browser using file system access or static serving.

**Rationale**: Ensures maximum portability, zero deployment complexity, and complete user
data privacy by keeping all processing local.

### II. Minimal Dependencies

Application MUST use vanilla JavaScript and HTML without frameworks or build tools.
MUST avoid external libraries unless absolutely necessary for core functionality.
If a library is required, it MUST be justified and documented in complexity tracking.
All dependencies MUST be versioned and vendored locally (no CDN dependencies).

**Rationale**: Reduces attack surface, ensures long-term maintainability, eliminates build
complexity, and guarantees offline functionality.

### III. Test Coverage (NON-NEGOTIABLE)

All functions and modules MUST have corresponding unit tests.
Tests MUST be written BEFORE implementation (TDD mandatory).
Test files MUST be organized in a `tests/` directory mirroring the source structure.
Tests MUST run in the browser or via a simple test runner (e.g., Node.js for pure JS logic).
Every pull request MUST include tests; untested code MUST NOT be merged.

**Rationale**: Client-side applications are notoriously difficult to debug in production;
comprehensive tests ensure reliability and prevent regressions.

### IV. File-Based Data Model

Application MUST read data from static local files (JSON, HTML, or other structured formats).
MUST NOT write to files (read-only philosophy unless explicit user download/export).
File format MUST be documented in data-model.md for each feature.
File loading MUST handle errors gracefully (missing files, malformed JSON, etc.).

**Rationale**: Simplifies data management, enables version control of data, and maintains
compatibility with ChatGPT export formats.

### V. Browser Compatibility

Code MUST support modern evergreen browsers (Chrome, Firefox, Safari, Edge latest versions).
MUST use standard Web APIs (File API, Fetch API, DOM manipulation).
MUST NOT use experimental or non-standard browser features without fallbacks.
ES6+ syntax is allowed; transpilation is discouraged but acceptable if documented.

**Rationale**: Ensures broad accessibility while leveraging modern platform capabilities.

### VI. UI & Branding

UI MUST be sleek, lightweight, and responsive across screen sizes (min width 320px to desktop).
Primary screen MUST include the MagTech.ai logo in the header/top area.
Logo asset MUST be stored locally under `assets/logo.(svg|png)`; no remote/CDN usage.
Styling MUST use minimal CSS; no UI frameworks unless explicitly justified in complexity tracking.
Accessibility MUST meet WCAG AA basics: 4.5:1 color contrast, visible focus states, keyboard navigation.

**Rationale**: A responsive, branded UI improves usability and consistency, while local assets and
minimal CSS maintain performance, privacy, and long-term maintainability.

## Technology Stack Constraints

**Mandatory Technologies**:

- HTML5 for structure
- Vanilla JavaScript (ES6+) for logic
- CSS3 for styling
- Browser File API for local file access

**Prohibited Technologies**:

- Server-side frameworks (Node.js servers, PHP, Python, etc.)
- Databases (SQL, NoSQL, IndexedDB exceptions allowed if justified)
- Frontend frameworks (React, Vue, Angular) unless complexity justified
- Build tools (Webpack, Rollup) unless complexity justified
- External runtime dependencies requiring npm install or similar

**Branding Assets**:

- All branding (e.g., MagTech.ai logo) MUST be stored locally in `assets/` and referenced relatively.
- No external font or asset CDNs; vendor locally if required and justified.

**Testing Technologies**:

- Browser-based test runners preferred (e.g., Mocha, Jasmine in-browser)
- Node.js-based test runners acceptable for pure JS logic (Jest, Vitest)
- All test dependencies MUST be documented

## Development Workflow

**Feature Development Process**:

1. Specification phase: Document user stories with acceptance scenarios
2. Test-first: Write failing tests for all functions/modules
3. Implementation: Write minimal code to pass tests
4. Refactor: Clean up while keeping tests green
5. Documentation: Update README, quickstart.md, and inline comments
6. Review: Verify constitution compliance before merge

**Code Review Gates**:

- All tests MUST pass
- Test coverage MUST be 100% for new functions
- No console errors in browser
- Code MUST follow established patterns (document in style guide if needed)
- Complexity violations MUST be justified in plan.md
- UI MUST render responsively without layout breakage at 320px, 768px, and 1280px widths
- Header MUST display the MagTech.ai logo sourced from `assets/`

**Quality Standards**:

- Functions MUST be pure where possible (no side effects)
- Global state MUST be minimized and documented
- DOM manipulation MUST be isolated in dedicated modules
- Error handling MUST be explicit (no silent failures)

## Governance

This constitution supersedes all other development practices and conventions.

**Amendment Process**:

- Amendments MUST be proposed via pull request to this file
- Amendments MUST include impact analysis on existing code and templates
- Version MUST be incremented per semantic versioning rules
- LAST_AMENDED_DATE MUST be updated to amendment merge date

**Versioning Policy**:

- MAJOR: Principle removal, redefinition, or incompatible constraint changes
- MINOR: New principle added or material expansion of existing principle
- PATCH: Clarifications, typo fixes, formatting improvements

**Compliance Review**:

- All features MUST complete constitution check in plan.md before implementation
- Violations MUST be documented in complexity tracking table
- Rejected simpler alternatives MUST be explicitly stated
- Annual review of constitution alignment with project evolution

**Version**: 1.1.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25

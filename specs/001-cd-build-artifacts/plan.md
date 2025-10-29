# Implementation Plan: CD Build Artifacts

**Branch**: `001-cd-build-artifacts` | **Date**: 2025-10-29 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-cd-build-artifacts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.
## Summary

Create a CD workflow that produces a retained build artifact consisting of runtime application code
and the data/ directory structure, excluding specs and tests. The artifact includes a manifest for
audit and traceability and is retained for later deployments via GitHub Actions artifacts.
**Language/Version**: N/A for runtime changes; app remains JavaScript (ES6+), HTML5, CSS3
**Primary Dependencies**: None for app; CD uses GitHub Actions built-ins and `actions/upload-artifact@v4`
**Storage**: Static files; artifacts stored in GitHub Actions with 90-day retention (org policy may override)
**Testing**: Validation step in workflow checks inclusion/exclusion and manifest integrity
**Target Platform**: GitHub Actions `ubuntu-latest` runner
**Project Type**: Client-side web application (no backend); CD packaging only
**Performance Goals**: Artifact build completes in ≤ 5 minutes; artifact size excludes data content
**Constraints**: No build step added to app; packaging MUST NOT modify source files
**Scale/Scope**: Current repo size; large `data/` hierarchies supported as directories only
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., JavaScript ES6+, HTML5 or NEEDS CLARIFICATION]
**Primary Dependencies**: [e.g., None (vanilla), Mocha (testing only) or NEEDS CLARIFICATION]
**Storage**: [e.g., Local JSON files, Browser File API, Static HTML or NEEDS CLARIFICATION]
**Testing**: [e.g., Mocha (browser), Jest (Node.js for unit tests) or NEEDS CLARIFICATION]
**Target Platform**: [e.g., Modern browsers (Chrome, Firefox, Safari, Edge) or NEEDS CLARIFICATION]
**Project Type**: [e.g., client-side web application - determines source structure]
**Performance Goals**: [e.g., <100ms file parsing, smooth 60fps UI or NEEDS CLARIFICATION]
**Constraints**: [e.g., No build step, offline-capable, no external API calls or NEEDS CLARIFICATION]
**Scale/Scope**: [e.g., Support ChatGPT exports up to 10MB, 1000s of conversations or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components?
- [ ] **No Database Integration**: Feature reads from local files only, no database connections?
- [ ] **Minimal Dependencies**: Feature avoids frameworks/libraries OR justifies in complexity table?
- [ ] **Test Coverage**: All functions and modules will have tests written BEFORE implementation?
- [ ] **File-Based Data**: Feature reads from static files (JSON/HTML) with documented format?
- [ ] **Browser Compatibility**: Feature uses standard Web APIs compatible with modern browsers?
- [ ] **UI & Branding**: UI is responsive (320px–desktop) and includes the MagTech.ai logo from local assets?
- [ ] **Source Control & Branching**: All work for this feature occurs on a dedicated feature branch
- [x] **Client-Side Only**: Feature uses ONLY HTML + vanilla JavaScript, no backend/server components? (CD workflow only)
- [x] **No Database Integration**: Feature reads from local files only, no database connections?
- [x] **Minimal Dependencies**: Feature avoids frameworks/libraries OR justifies in complexity table? (CD uses built-in Actions)
- [x] **Test Coverage**: All functions and modules will have tests written BEFORE implementation? (Validation step enforces rules)
- [x] **File-Based Data**: Feature reads from static files (JSON/HTML) with documented format? (No runtime changes)
- [x] **Browser Compatibility**: Feature uses standard Web APIs compatible with modern browsers? (No runtime changes)
- [x] **UI & Branding**: UI is responsive (320px–desktop) and includes the MagTech.ai logo from local assets? (N/A, no UI changes)
- [x] **Source Control & Branching**: All work for this feature occurs on a dedicated feature branch
  named `[###-feature-name]` (PR targets `master`; no direct commits to `master`)?
**Project Structure**
**Structure Decision**: Client-side application with modular JavaScript organization.
All code runs in browser; no backend services.
Additional CD output (non-source): retained build artifact + manifest produced by workflow.

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

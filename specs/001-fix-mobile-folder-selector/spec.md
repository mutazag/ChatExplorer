# Feature Specification: Fix Mobile Folder Selector Visibility

**Feature Branch**: `001-fix-mobile-folder-selector`
**Created**: 2025-10-30
**Status**: Draft
**Input**: User description: "001-visual-themes, when in mobile view, the commands to select folder do not show up for user to select a data set or switch data sets."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Choose a data set on mobile (Priority: P1)

On a mobile device (small viewport), a user can discover and open a clearly visible control to choose a data set, select one, and see the app load that data set’s conversations without needing desktop view.

**Why this priority**: This unblocks mobile usage entirely by enabling first-run and core navigation on phones; without it, users cannot use the product on mobile.

**Independent Test**: Using a mobile viewport (e.g., 375×667), verify that a visible entry point (button or menu item) allows selecting a data set; upon selection, the conversation list updates to the chosen data set.

**Acceptance Scenarios**:

1. **Given** a mobile viewport ≤ 768px width and no data set selected, **When** the user taps the folder selection control, **Then** the data set chooser is shown and the user can select a data set.
2. **Given** a mobile viewport and a chosen data set, **When** the user selects a different data set, **Then** the app displays conversations for the new data set within the same session.

---

### User Story 2 - Switch data sets on mobile (Priority: P2)

A returning mobile user can switch between data sets at any time using the same visible control, without page reloads and without losing the current theme or layout state.

**Why this priority**: Enables exploration and comparison across data sets on the go; switching is a frequent action in ChatExplorer.

**Independent Test**: With one data set active, open the control and choose a different data set; confirm the UI updates to the new data set and the control remains accessible.

**Acceptance Scenarios**:

1. **Given** a mobile viewport and data set A active, **When** the user opens the control and selects data set B, **Then** conversations from data set B are shown and the control remains visible/usable.

---

### User Story 3 - Mobile accessibility and theme integrity (Priority: P3)

The folder selection control is usable with touch and keyboard, has a descriptive label for assistive technologies, and remains readable/visible across supported visual themes.

**Why this priority**: Maintains inclusive access and prevents regressions with 001-visual-themes.

**Independent Test**: Using a screen reader and keyboard on a small viewport, navigate to the control and activate it; verify sufficient contrast and that theme changes do not hide or occlude the control.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** navigating via keyboard or assistive tech, **Then** the control is focusable, labeled, and operable.
2. **Given** any supported visual theme, **When** the app loads on a mobile viewport, **Then** the control is visible and not overlapped by other UI.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Extremely small screens (≤ 320px width): control remains reachable without overlapping critical UI.
- Long data set names: selection list truncates gracefully with tooltip or wrapping without breaking layout.
- No data sets detected: control remains visible; selecting it informs the user that no data sets are available and how to proceed.
- Rapid orientation changes (portrait ⇄ landscape): control remains present and usable after reflow.
- High zoom / large text settings: control respects user scaling and remains operable.
- Modal or popover already open: opening the data set chooser does not trap focus or stack incorrectly.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a clearly visible entry point in mobile viewports (≤ 768px width) to open the data set chooser.
- **FR-002**: Users MUST be able to select an available data set from the chooser in mobile view.
- **FR-003**: System MUST switch the currently displayed conversations to the selected data set without requiring a page reload.
- **FR-004**: System MUST indicate the currently active data set in mobile view (e.g., label or summary in the control) so users can confirm selection.
- **FR-005**: The control MUST remain accessible across supported visual themes without being occluded or losing legibility.
- **FR-006**: The control MUST be operable via touch and keyboard, with a descriptive accessible name announced by assistive technologies.
- **FR-007**: The solution MUST handle cases where no data sets are available by informing the user and providing a non-blocking path to dismiss.
- **FR-008**: The mobile control MUST be present on initial load and remain reachable after orientation changes and viewport resizes.
- **FR-009**: The control MUST scale appropriately for mobile touch targets (meets standard mobile touch target guidelines) and support long data set names without breaking layout.

### Key Entities *(include if feature involves data)*

- **Data Set**: A user-selectable collection of conversations; user-visible attributes include a display name and a summary/identifier.
- **Session Context**: The in-session state of the application, including the currently active data set and selected theme.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: On mobile viewports (320–768px), 95% of users can discover the data set control and complete a selection in ≤ 10 seconds and ≤ 2 taps.
- **SC-002**: The entry point for data set selection is present and visible on 100% of tested mobile viewports (320–768px) across supported visual themes, without overlap/occlusion.
- **SC-003**: 95% first-attempt task success for “switch to another data set” in mobile usability tests.
- **SC-004**: Accessibility check passes for mobile touch targets and labeling (meets standard mobile accessibility expectations) for the control and chooser.
- **SC-005**: No regression in desktop access to data set selection (confirmed via regression checklist and smoke test).

# Data Model — Visual Themes

Date: 2025-10-25
Branch: 001-visual-themes

## UI State Entities

### PreferenceState
- theme: "light" | "dark"

### LayoutState
- leftPaneVisible: boolean
- viewportCategory: "small" | "medium" | "large"

### Message (UI)
- role: "user" | "assistant"
- text: string
- timestamp?: number | string (epoch ms or ISO; rendered human-readable)

## Validation Rules
- theme must be one of the allowed values; default "light"
- leftPaneVisible defaults to true on load
- timestamp, if present, must be parsable to a Date

## Transitions
- T001: theme toggled by user -> updates PreferenceState.theme
- T002: pane toggle -> updates LayoutState.leftPaneVisible
- T003: viewport resize -> updates LayoutState.viewportCategory (read-only mapping of width)

## Notes
- No persistence in scope; state resets on refresh
- No new external data files introduced

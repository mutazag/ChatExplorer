# Data Model: Fix Mobile Folder Selector Visibility

**Feature**: specs/001-fix-mobile-folder-selector/spec.md
**Date**: 2025-10-30

## Entities

### Data Set
- Description: A user-selectable collection of conversations.
- Fields (user-visible):
  - id (string) — stable identifier or path-like key
  - name (string) — display name; may be long
  - summary (optional string) — short description for display lists
- Validation:
  - name: non-empty string
  - id: unique across available data sets

### Session Context
- Description: In-session state for the application.
- Fields:
  - activeDataSetId (string|null) — the currently selected data set id
  - theme (string) — current visual theme identifier
  - viewportWidth (number) — latest measured viewport width (used to toggle mobile UI states)
- Rules:
  - activeDataSetId must reference an existing Data Set id (if not null)
  - Changing activeDataSetId updates the visible conversation list

## Relationships
- Session Context.activeDataSetId → Data Set.id (0..1 to 1)

## State Transitions
- Select Data Set
  - From: activeDataSetId = A or null
  - Event: user selects Data Set B
  - To: activeDataSetId = B; conversation list rendered for B
- Switch Theme (out of scope for this feature)

## File Formats
- Data sets are discovered from static `data/` directories and JSON files already present in the repository.
- Long names must be rendered with truncation without altering underlying data.

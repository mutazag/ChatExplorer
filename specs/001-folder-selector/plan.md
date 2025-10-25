# Implementation Plan: Folder Selector (Choose dataset under /data)

Branch: master | Date: 2025-10-25 | Spec: specs/001-folder-selector/spec.md

## Summary

Change the selection model from “pick any local folder” to “choose one of the subfolders under the app’s bundled data/ directory that contains conversations.json”. The app discovers datasets client-side (no datasets.json), displays each folder with a folder icon and a time label from available metadata, and loads the selected folder’s conversations.json via relative fetch.

## Technical Context

- Language: JavaScript (ES6+), HTML5, CSS3 (vanilla)
- Storage: Static assets only. Datasets live under `data/<datasetName>/` in the repo.
- Discovery: No datasets.json. Prefer parsing the static server directory index for `/data/` to list subfolders; validate each candidate by probing `<path>/conversations.json` (HEAD→GET fallback). If directory listing is unavailable, show a friendly empty state with a legacy file picker fallback.
- Validation: For each dataset, require `conversations.json` at `data/<name>/conversations.json`.
- Testing: In-browser harness (tests/folder-selector/*) covers manifest loading, listing, selection, and validation.
- Constraints: No File System Access API; no user file picker for this feature. All paths are relative and static.

## Constitution Check

- [x] Client-side only (no backend)
- [x] Minimal dependencies (none)
- [x] Tests-first (harness exists; new tests will be added)
- [x] File-based data (static JSON under /data)
- [x] Browser compatibility (standard fetch/DOM APIs)
- [x] UI & Branding (keep existing responsive header/logo)

Result: PASS

## Design

1) Dataset Discovery (no manifest)
  - Parse `/data/` directory index HTML (when exposed) to extract child folders; ignore `../` and hidden entries.
  - For each candidate `{ id, path }`, validate by probing `<path>/conversations.json`.
  - Compute `modifiedAt` for display:
    - Primary: use `Last-Modified` response header from `<path>/conversations.json` (HEAD request).
    - Fallback A: parse the directory index “Last modified” column if present.
    - Fallback B: after loading conversations for selection, compute a time label from JSON (e.g., max create_time) for subsequent renders.

2) UI Flow
  - On click of “Select Export Folder”, attempt discovery.
  - If zero candidates: render empty-state panel with guidance and a “Browse local export…” button (legacy file input).
  - If one candidate: auto-load its conversations.
  - If many: render a list with each item showing a folder icon, the folder name, and a time label derived from metadata; allow keyboard navigation and selection.

3) State
  - `SelectionState = { selectedId?: string, selectedPath?: string, selectedDataset?: { id, path, name?, modifiedAt? } }` persisted in-memory (optional: localStorage).

4) Integration with existing loader
  - Update `loadConversationsFromFiles` call sites for this feature to instead `fetch(<selectedPath>/conversations.json)`.
  - Keep other features unchanged.
  - Expose `setSelectedDataset` for UI elements needing active dataset context.

## Risks & Mitigations

- Directory index unavailable → Show empty state + legacy file picker; document how to run with a server that exposes listings.
- `Last-Modified` missing or incorrect → Fall back to index column or compute time from conversations after first load.
- Many datasets → Paginate or virtualize list if needed (non-blocking).

## Phases

1) Implement discovery (index parsing + validation probe; no manifest)
2) Build folder list UI with folder icon + time label, keyboard navigation, and selection handling
3) Load and validate `conversations.json` from selected dataset
4) Tests: discovery paths, listing with icon/time, selection, invalid dataset handling
5) Docs: update quickstart with how to add a dataset under /data and where the time label comes from

## Test Plan

- Unit:
  - Directory index parsing; validation probe; `Last-Modified` time parsing; sorting
  - Selection state update and event emission
- Integration:
  - Render dataset list with icon + time; select a dataset → conversations load
  - Invalid dataset (no conversations.json) → error message

## Deliverables

- UI listing and selection logic (existing folder selector module updated/repurposed)
- Local asset: `assets/folder.svg` for folder icon (or inline SVG)
- Tests under `tests/folder-selector/`
- Updated docs: research.md, data-model.md, quickstart.md, openapi.yaml
